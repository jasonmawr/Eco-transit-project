import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

const GetQuerySchema = z.object({
  placeId: z.string().uuid().optional(),
  stationId: z.string().uuid().optional(),
});

const PostBodySchema = z.object({
  placeId: z.string().uuid().optional(),
  stationId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5, 'Đánh giá phải từ 1 đến 5 sao.'),
  content: z.string().min(10, 'Nội dung nhận xét phải có ít nhất 10 ký tự.'),
  displayName: z.string().max(50, 'Tên hiển thị tối đa 50 ký tự.').optional(),
});

// 1. GET /api/reviews
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const parseResult = GetQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Tham số truy vấn không hợp lệ.',
      });
    }

    const { placeId, stationId } = parseResult.data;

    if (!placeId && !stationId) {
      return res.status(400).json({
        message: 'Phải truyền vào placeId hoặc stationId để lọc đánh giá.',
      });
    }

    const reviews = await prisma.uGCReview.findMany({
      where: {
        status: 'approved',
        placeId: placeId || undefined,
        stationId: stationId || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = reviews.map((r) => ({
      id: r.id,
      displayName: r.displayName?.trim() || 'Hành khách xanh',
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch reviews error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách đánh giá.',
    });
  }
});

// 2. POST /api/reviews
router.post('/reviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const parseResult = PostBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const { placeId, stationId, rating, content, displayName } = parseResult.data;

    if (!placeId && !stationId) {
      return res.status(400).json({
        message: 'Đánh giá phải thuộc về một ga tàu hoặc một địa điểm POI.',
      });
    }

    // Verify target exists
    if (placeId) {
      const placeExists = await prisma.place.findUnique({
        where: { id: placeId },
      });
      if (!placeExists) {
        return res.status(400).json({
          message: 'Địa điểm được đánh giá không tồn tại.',
        });
      }
    }

    if (stationId) {
      const stationExists = await prisma.station.findUnique({
        where: { id: stationId },
      });
      if (!stationExists) {
        return res.status(400).json({
          message: 'Ga tàu được đánh giá không tồn tại.',
        });
      }
    }

    // Validate HTML tags to prevent XSS
    const htmlTagRegex = /<\/?[a-zA-Z][\s\S]*?>/;
    if ((displayName && htmlTagRegex.test(displayName)) || htmlTagRegex.test(content)) {
      return res.status(400).json({
        message: 'Nội dung đầu vào không được chứa thẻ HTML.',
      });
    }

    const cleanDisplayName = displayName?.trim() || '';
    const cleanContent = content.trim();

    // Get session user
    const sessionUser = req.session.user;
    if (!sessionUser) {
      return res.status(401).json({
        message: 'Không tìm thấy thông tin phiên đăng nhập.',
      });
    }

    const newReview = await prisma.uGCReview.create({
      data: {
        userId: sessionUser.id,
        placeId: placeId || null,
        stationId: stationId || null,
        rating,
        content: cleanContent,
        displayName: cleanDisplayName || null,
        status: 'pending', // Default is pending
      },
    });

    return res.status(201).json({
      message: 'Đánh giá của bạn đã được gửi thành công và đang chờ kiểm duyệt.',
      review: {
        id: newReview.id,
        displayName: newReview.displayName || 'Hành khách xanh',
        rating: newReview.rating,
        content: newReview.content,
        createdAt: newReview.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Create review error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi tạo đánh giá mới.',
    });
  }
});

export default router;
