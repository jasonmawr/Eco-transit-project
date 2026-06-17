import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';

const router = Router();

const QuerySchema = z.object({
  stationId: z.string().uuid().optional(),
  tag: z.string().optional(),
});

// 1. GET /api/guides
router.get('/guides', async (req: Request, res: Response) => {
  try {
    const parseResult = QuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Tham số truy vấn không hợp lệ.',
      });
    }

    const { stationId, tag } = parseResult.data;

    const guides = await prisma.guide.findMany({
      where: {
        isPublished: true,
        relatedStationId: stationId || undefined,
        tags: tag ? { has: tag } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = guides.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      excerpt: g.excerpt,
      tags: g.tags,
      relatedStationId: g.relatedStationId || null,
      createdAt: g.createdAt,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch guides error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách cẩm nang.',
    });
  }
});

// 2. GET /api/guides/:slug
router.get('/guides/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const guide = await prisma.guide.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        relatedStation: true,
      },
    });

    if (!guide) {
      return res.status(404).json({
        message: 'Cẩm nang không tồn tại hoặc chưa được xuất bản.',
      });
    }

    return res.status(200).json({
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      excerpt: guide.excerpt,
      content: guide.content,
      tags: guide.tags,
      relatedStationId: guide.relatedStationId || null,
      relatedStationName: guide.relatedStation?.name || null,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
    });
  } catch (err: any) {
    console.error('Fetch guide detail error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy chi tiết cẩm nang.',
    });
  }
});

export default router;
