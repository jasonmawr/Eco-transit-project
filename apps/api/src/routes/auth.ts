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
        verificationSentAt: new Date(),
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

    // Bind session
    req.session.user = userDto;

    // Send email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verify-email?token=${rawToken}`;
    
    let isMock = false;
    let mockToken = undefined;

    try {
      const mailRes = await mailProvider.sendMail({
        to: email,
        subject: 'Xác thực tài khoản di chuyển xanh - EcoTransit',
        text: `Chào bạn, vui lòng xác thực tài khoản của bạn bằng cách nhấp vào đường dẫn sau: ${verifyUrl}. Đường dẫn có hiệu lực trong 15 phút.`,
        html: `<p>Chào bạn,</p><p>Vui lòng xác thực tài khoản di chuyển xanh của bạn bằng cách nhấp vào đường dẫn dưới đây:</p><p><a href="${verifyUrl}" style="padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a></p><p>Đường dẫn có hiệu lực trong 15 phút.</p>`,
      });
      if (mailRes.isMock) {
        isMock = true;
        mockToken = rawToken;
      }
    } catch (mailErr) {
      console.error('Failed to send verification email:', mailErr);
    }

    return res.status(201).json({
      user: userDto,
      mockToken: isMock ? mockToken : undefined,
      isMock,
      message: 'Đăng ký tài khoản thành công. Vui lòng kiểm tra hộp thư để xác thực email.',
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
      return res.status(401).json({
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    }

    // Verify argon2 password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
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
router.post('/logout', requireAuth, (req: Request, res: Response) => {
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

    // Update session user if logged in
    if (req.session.user && req.session.user.id === user.id) {
      req.session.user.emailVerified = true;
    }

    return res.status(200).json({
      message: 'Xác thực email thành công! Chào mừng bạn gia nhập chiến dịch xanh.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: true,
      },
    });
  } catch (err: any) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: 'Lỗi hệ thống khi xác thực email.' });
  }
});

// 6. POST /auth/resend-verification
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    let targetEmail = email;

    // If logged in and email is not provided, use session email
    if (!targetEmail && req.session.user) {
      targetEmail = req.session.user.email;
    }

    if (!targetEmail || typeof targetEmail !== 'string') {
      return res.status(400).json({ message: 'Thiếu thông tin email.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    // Rate limit and no user enumeration
    if (!user) {
      return res.status(200).json({
        message: 'Yêu cầu đã được ghi nhận. Nếu email hợp lệ, một liên kết xác thực mới sẽ được gửi trong giây lát.',
      });
    }

    // Check rate limit cooldown (60 seconds)
    if (user.verificationSentAt) {
      const secondsSinceSent = Math.floor((Date.now() - new Date(user.verificationSentAt).getTime()) / 1000);
      if (secondsSinceSent < 60) {
        return res.status(429).json({
          message: `Vui lòng đợi ${60 - secondsSinceSent} giây trước khi yêu cầu gửi lại email xác thực.`,
        });
      }
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationTokenHash: tokenHash,
        verificationTokenExpires: tokenExpires,
        verificationSentAt: new Date(),
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verify-email?token=${rawToken}`;

    let isMock = false;
    let mockToken = undefined;

    try {
      const mailRes = await mailProvider.sendMail({
        to: targetEmail,
        subject: 'Xác thực tài khoản di chuyển xanh - EcoTransit',
        text: `Chào bạn, vui lòng xác thực tài khoản của bạn bằng cách nhấp vào đường dẫn sau: ${verifyUrl}. Đường dẫn có hiệu lực trong 15 phút.`,
        html: `<p>Chào bạn,</p><p>Vui lòng xác thực tài khoản di chuyển xanh của bạn bằng cách nhấp vào đường dẫn dưới đây:</p><p><a href="${verifyUrl}" style="padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a></p><p>Đường dẫn có hiệu lực trong 15 phút.</p>`,
      });
      if (mailRes.isMock) {
        isMock = true;
        mockToken = rawToken;
      }
    } catch (mailErr) {
      console.error('Failed to resend verification email:', mailErr);
    }

    return res.status(200).json({
      message: 'Yêu cầu đã được ghi nhận. Nếu email hợp lệ, một liên kết xác thực mới sẽ được gửi trong giây lát.',
      mockToken: isMock ? mockToken : undefined,
      isMock,
    });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: 'Lỗi hệ thống khi gửi lại mã xác thực.' });
  }
});

export default router;
