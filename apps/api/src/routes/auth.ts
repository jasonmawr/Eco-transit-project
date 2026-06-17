import { Router, Request, Response } from 'express';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { UserDTO, UserRole } from '@ecotransit/shared';

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

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
        pointsBalanceCache: 0,
      },
    });

    const userDto: UserDTO = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      pointsBalanceCache: user.pointsBalanceCache,
      createdAt: user.createdAt,
    };

    // Bind session
    req.session.user = userDto;

    return res.status(201).json({
      user: userDto,
      message: 'Đăng ký tài khoản thành công.',
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

export default router;
