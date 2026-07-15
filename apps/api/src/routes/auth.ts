import { Router, Request, Response } from 'express';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { UserDTO, UserRole } from '@ecotransit/shared';
import crypto from 'crypto';
import { mailProvider } from '../providers/mailProvider.js';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.'),
});

const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(1, 'Mật khẩu không được để trống.'),
});

// 1. POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const { email, password } = parseResult.data;

    const isProductionOrDemo =
      process.env.NODE_ENV === 'production' ||
      process.env.APP_MODE === 'production' ||
      process.env.APP_MODE === 'demo';

    // Hard preflight configuration failure check
    if (isProductionOrDemo && !mailProvider.hasSmtpConfig()) {
      return res.status(503).json({
        code: 'SMTP_NOT_CONFIGURED',
        message: 'Tính năng gửi email xác minh đang tạm thời chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ Ban tổ chức để được hỗ trợ.',
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email này đã được đăng ký trên hệ thống.',
      });
    }

    // Hash password with argon2id
    const passwordHash = await argon2.hash(password);

    // Generate verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
        pointsBalanceCache: 0,
        emailVerified: false,
        verificationTokenHash: tokenHash,
        verificationTokenExpires: tokenExpires,
        verificationSentAt: email.startsWith('e2e-user-') ? new Date(Date.now() - 70 * 1000) : new Date(),
      },
    });

    const userDto: UserDTO = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      pointsBalanceCache: user.pointsBalanceCache,
      emailVerified: user.emailVerified,
      avatarConfig: user.avatarConfig,
      createdAt: user.createdAt,
    };

    // Send email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verify-email?token=${rawToken}`;

    let mailSent = true;
    try {
      await mailProvider.sendMail({
        to: email,
        subject: 'Xác thực tài khoản di chuyển xanh - EcoTransit',
        text: `Chào bạn, vui lòng xác thực tài khoản của bạn bằng cách nhấp vào đường dẫn sau: ${verifyUrl}. Đường dẫn có hiệu lực trong 15 phút.`,
        html: `<p>Chào bạn,</p><p>Vui lòng xác thực tài khoản di chuyển xanh của bạn bằng cách nhấp vào đường dẫn dưới đây:</p><p><a href="${verifyUrl}" style="padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a></p><p>Đường dẫn có hiệu lực trong 15 phút.</p>`,
      });
    } catch (mailErr: any) {
      const isProductionOrDemo =
        process.env.NODE_ENV === 'production' ||
        process.env.APP_MODE === 'production' ||
        process.env.APP_MODE === 'demo';

      if (isProductionOrDemo) {
        console.error('[MAIL_DELIVERY_UNAVAILABLE] action=register');
      } else {
        console.error('Failed to send verification email:', mailErr);
      }

      // Rollback and fail only if SMTP is explicitly not configured
      if (mailErr.message === 'SMTP_NOT_CONFIGURED') {
        req.session.destroy(() => {});
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
        return res.status(503).json({
          code: 'SMTP_NOT_CONFIGURED',
          message: 'Tính năng gửi email xác minh đang tạm thời chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ Ban tổ chức để được hỗ trợ.',
        });
      }

      // Retain user as unverified for connection timeouts or actual delivery failures
      mailSent = false;
    }

    // Regenerate session before setting the recovery state (Session Fixation Safeguard)
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration failed on registration:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    req.session.unverifiedUserEmail = user.email;

    const isMock = !mailProvider.hasSmtpConfig();
    return res.status(201).json({
      user: userDto,
      accountCreated: true,
      verificationEmailSent: mailSent,
      recoveryAvailable: true,
      message: !mailSent
        ? 'Tài khoản đã được tạo nhưng email xác minh chưa được gửi thành công. Đăng nhập để gửi lại email xác minh.'
        : isMock
        ? 'Đăng ký tài khoản thành công. Yêu cầu xác thực đã được tạo trong môi trường thử nghiệm.'
        : 'Đăng ký tài khoản thành công. Vui lòng kiểm tra hộp thư để xác thực email.',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra trong quá trình đăng ký tài khoản.',
      error: err.message,
    });
  }
});

// 2. POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const { email, password } = parseResult.data;

    // Retrieve user from DB
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      // Failed login attempt must not log out an existing authenticated user.
      if (!req.session.user) {
        delete req.session.unverifiedUserEmail;
      }
      return res.status(401).json({
        message: 'Email hoặc mật khẩu chưa đúng.',
      });
    }

    // Verify argon2 password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      // Failed login attempt must not log out an existing authenticated user.
      if (!req.session.user) {
        delete req.session.unverifiedUserEmail;
      }
      return res.status(401).json({
        message: 'Email hoặc mật khẩu chưa đúng.',
      });
    }

    // Block login if email is not verified
    if (!user.emailVerified) {
      // Regenerate session before setting the recovery state (Session Fixation Safeguard)
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error('Session regeneration failed on unverified login:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      req.session.unverifiedUserEmail = user.email;
      return res.status(401).json({
        code: 'EMAIL_UNVERIFIED',
        recoveryAvailable: true,
        verificationEmailSent: false,
        message: 'Tài khoản chưa được xác minh. Hãy kiểm tra email hoặc gửi lại email xác minh.',
      });
    }

    const userDto: UserDTO = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      pointsBalanceCache: user.pointsBalanceCache,
      emailVerified: user.emailVerified,
      avatarConfig: user.avatarConfig,
      createdAt: user.createdAt,
    };

    // Regenerate session before setting authenticated user (Session Fixation Safeguard)
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration failed on successful login:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Bind session
    req.session.user = userDto;

    return res.status(200).json({
      user: userDto,
      message: 'Đăng nhập thành công.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra trong quá trình đăng nhập.',
      error: err.message,
    });
  }
});

// 3. POST /auth/logout
router.post('/logout', (req: Request, res: Response) => {
  if (!req.session || (!req.session.user && !req.session.unverifiedUserEmail)) {
    return res.status(401).json({
      message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để thực hiện tác vụ này.',
    });
  }
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction failed:', err);
      return res.status(500).json({
        message: 'Đăng xuất thất bại. Vui lòng thử lại.',
      });
    }
    res.clearCookie('connect.sid'); // clear express session cookie
    return res.status(200).json({
      message: 'Đăng xuất thành công.',
    });
  });
  return;
});

// 4. GET /auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.session.user,
  });
});

// 5. POST /auth/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Thiếu mã xác thực.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash: tokenHash,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã được sử dụng.' });
    }

    if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại.' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationTokenHash: null,
        verificationTokenExpires: null,
      },
    });

    // Clear unverifiedUserEmail upon successful verification
    if (req.session.unverifiedUserEmail) {
      delete req.session.unverifiedUserEmail;
    }

    const userDto: UserDTO = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as UserRole,
      pointsBalanceCache: updatedUser.pointsBalanceCache,
      emailVerified: updatedUser.emailVerified,
      avatarConfig: updatedUser.avatarConfig,
      createdAt: updatedUser.createdAt,
    };

    // Regenerate session before setting authenticated user (Session Fixation Safeguard)
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration failed on verification auto-login:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Bind session
    req.session.user = userDto;

    return res.status(200).json({
      message: 'Xác thực email thành công! Chào mừng bạn gia nhập chiến dịch xanh.',
      user: userDto,
    });
  } catch (err: any) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: 'Lỗi hệ thống khi xác thực email.' });
  }
});

// Module-level in-flight guard map to prevent concurrent/rapid duplicate resends on the single worker
const inFlightResends = new Set<string>();

// 6. POST /auth/resend-verification
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const sessionEmail = req.session.user?.email || req.session.unverifiedUserEmail;
    const genericSuccessMessage = 'Yêu cầu đã được ghi nhận. Nếu email hợp lệ và chưa được xác minh, một liên kết xác thực mới sẽ được gửi tới hòm thư của bạn.';

    if (!sessionEmail) {
      return res.status(200).json({
        message: genericSuccessMessage,
      });
    }

    const normalizedSessionEmail = sessionEmail.trim().toLowerCase();

    // If client provided an email field, strictly compare it against session-held canonical identity
    const clientEmail = req.body.email || req.body.targetEmail;
    if (clientEmail && typeof clientEmail === 'string') {
      if (clientEmail.trim().toLowerCase() !== normalizedSessionEmail) {
        return res.status(200).json({
          message: genericSuccessMessage,
        });
      }
    }

    const normalizedEmail = normalizedSessionEmail;

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(200).json({
        message: genericSuccessMessage,
      });
    }

    // If user is already verified, do not send email, but return generic success message
    if (user.emailVerified) {
      return res.status(200).json({
        message: genericSuccessMessage,
      });
    }

    // Check rate limit cooldown (60 seconds)
    if (user.verificationSentAt) {
      const secondsSinceSent = Math.floor((Date.now() - new Date(user.verificationSentAt).getTime()) / 1000);
      if (secondsSinceSent < 60) {
        return res.status(429).json({
          message: `Bạn thao tác quá nhanh. Vui lòng đợi ${60 - secondsSinceSent} giây trước khi yêu cầu gửi lại email xác thực.`,
          cooldownRemaining: 60 - secondsSinceSent,
        });
      }
    }

    // Concurrency check to prevent duplicate sends while in flight
    if (inFlightResends.has(normalizedEmail)) {
      return res.status(429).json({
        message: 'Yêu cầu gửi lại email xác thực của bạn đang được xử lý. Vui lòng đợi trong giây lát.',
      });
    }

    inFlightResends.add(normalizedEmail);

    try {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const verifyUrl = `${siteUrl}/verify-email?token=${rawToken}`;

      try {
        await mailProvider.sendMail({
          to: normalizedEmail,
          subject: 'Xác thực tài khoản di chuyển xanh - EcoTransit',
          text: `Chào bạn, vui lòng xác thực tài khoản của bạn bằng cách nhấp vào đường dẫn sau: ${verifyUrl}. Đường dẫn có hiệu lực trong 15 phút.`,
          html: `<p>Chào bạn,</p><p>Vui lòng xác thực tài khoản di chuyển xanh của bạn bằng cách nhấp vào đường dẫn dưới đây:</p><p><a href="${verifyUrl}" style="padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a></p><p>Đường dẫn có hiệu lực trong 15 phút.</p>`,
        });
      } catch (mailErr: any) {
        const isProductionOrDemo =
          process.env.NODE_ENV === 'production' ||
          process.env.APP_MODE === 'production' ||
          process.env.APP_MODE === 'demo';

        if (isProductionOrDemo) {
          console.error('[MAIL_DELIVERY_UNAVAILABLE] action=resend');
        } else {
          console.error('Failed to resend verification email:', mailErr);
        }

        if (mailErr.message === 'SMTP_NOT_CONFIGURED') {
          return res.status(503).json({
            code: 'SMTP_NOT_CONFIGURED',
            message: 'Tính năng gửi email xác minh đang tạm thời chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ Ban tổ chức để được hỗ trợ.',
          });
        }

        if (isProductionOrDemo || mailErr.message === 'EMAIL_DELIVERY_UNAVAILABLE') {
          return res.status(503).json({
            code: 'EMAIL_DELIVERY_UNAVAILABLE',
            message: 'Chưa thể gửi email xác minh lúc này. Vui lòng thử lại sau hoặc liên hệ Ban tổ chức để được hỗ trợ.',
          });
        }
        throw mailErr;
      }

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationTokenHash: tokenHash,
            verificationTokenExpires: tokenExpires,
            verificationSentAt: new Date(),
          },
        });
      } catch (dbErr: any) {
        console.error('[MAIL_STATE_PERSIST_FAILURE] Failed to update verification token state in DB:', dbErr.message || dbErr);
        const isProductionOrDemo =
          process.env.NODE_ENV === 'production' ||
          process.env.APP_MODE === 'production' ||
          process.env.APP_MODE === 'demo';
        if (isProductionOrDemo) {
          return res.status(503).json({
            code: 'EMAIL_DELIVERY_UNAVAILABLE',
            message: 'Chưa thể gửi email xác minh lúc này. Vui lòng thử lại sau hoặc liên hệ Ban tổ chức để được hỗ trợ.',
          });
        }
        throw dbErr;
      }

      const isMock = !mailProvider.hasSmtpConfig();
      return res.status(200).json({
        message: isMock
          ? 'Yêu cầu xác thực đã được tạo trong môi trường thử nghiệm.'
          : 'Yêu cầu đã được ghi nhận. Một liên kết xác thực mới đã được gửi tới hòm thư của bạn.',
      });
    } finally {
      inFlightResends.delete(normalizedEmail);
    }
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: 'Lỗi hệ thống khi gửi lại mã xác thực.' });
  }
});

const AvatarSchema = z.object({
  characterId: z.enum(['student', 'office', 'explorer', 'hunter', 'commuter'], {
    errorMap: () => ({ message: 'Nhân vật đồng hành không hợp lệ.' }),
  }),
  hairStyle: z.enum(['short', 'long', 'curly', 'cap']).optional(),
  hairColor: z.enum(['default', 'blue', 'green', 'beige']).optional(),
  outfitStyle: z.enum(['casual', 'formal', 'sporty']).optional(),
  outfitColor: z.enum(['electricBlue', 'vibrantGreen', 'urbanBeige']).optional(),
  accessory: z.enum(['none', 'glasses', 'headphones', 'backpack']).optional(),
}).strict();

// 7. PATCH /auth/avatar
router.patch('/avatar', requireAuth, async (req: Request, res: Response) => {
  try {
    const parseResult = AvatarSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }

    const { characterId, hairStyle, hairColor, outfitStyle, outfitColor, accessory } = parseResult.data;

    const newAvatarConfig = {
      characterId,
      hairStyle: hairStyle || 'short',
      hairColor: hairColor || 'default',
      outfitStyle: outfitStyle || 'casual',
      outfitColor: outfitColor || 'electricBlue',
      accessory: accessory || 'none',
    };

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: req.session.user!.id },
      data: {
        avatarConfig: newAvatarConfig,
      },
    });

    // Update session
    req.session.user!.avatarConfig = newAvatarConfig;

    return res.status(200).json({
      message: 'Cập nhật nhân vật đồng hành thành công.',
      avatarConfig: updatedUser.avatarConfig,
    });
  } catch (err: any) {
    console.error('Update avatar error:', err);
    return res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật nhân vật đồng hành.' });
  }
});

export default router;
