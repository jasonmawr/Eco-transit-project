import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';

const router = Router();

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const QuerySchema = z.object({
  stationId: z.string().uuid().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
});

// 1. GET /api/places
router.get('/places', async (req: Request, res: Response) => {
  try {
    const parseResult = QuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Tham số truy vấn không hợp lệ.',
      });
    }

    const { stationId, category, q } = parseResult.data;

    const places = await prisma.place.findMany({
      where: {
        isPublished: true,
        stationId: stationId || undefined,
        category: category || undefined,
      },
      include: {
        station: true,
      },
      orderBy: { name: 'asc' },
    });

    let filtered = places;
    if (q) {
      const cleanQ = removeAccents(q.toLowerCase().trim());
      filtered = places.filter((p: any) => {
        const cleanName = removeAccents(p.name.toLowerCase());
        const cleanShort = removeAccents(p.shortDescription.toLowerCase());
        const cleanDesc = p.description ? removeAccents(p.description.toLowerCase()) : '';
        const cleanDistrict = p.district ? removeAccents(p.district.toLowerCase()) : '';
        return (
          cleanName.includes(cleanQ) ||
          cleanShort.includes(cleanQ) ||
          cleanDesc.includes(cleanQ) ||
          cleanDistrict.includes(cleanQ)
        );
      });
    }

    const mapped = filtered.map((p: any) => ({
      id: p.id,
      stationId: p.stationId,
      stationName: p.station.name,
      stationDisplayName: `Ga ${p.station.name}`,
      slug: p.slug,
      name: p.name,
      category: p.category,
      lat: p.lat,
      lng: p.lng,
      address: p.address || '',
      shortDescription: p.shortDescription,
      description: p.description || '',
      district: p.district || '',
      walkingMinutes: p.walkingMinutes || 0,
      distanceMeters: p.distanceMeters || 0,
      priceLevel: p.priceLevel || 1,
      tags: p.tags,
      highlights: p.highlights,
      imageUrl: p.imageUrl || '',
      featured: p.featured,
      createdAt: p.createdAt,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch places error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách địa điểm.',
    });
  }
});

// 2. GET /api/places/:idOrSlug
router.get('/places/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const place = await prisma.place.findFirst({
      where: {
        isPublished: true,
        OR: [
          isUuid ? { id: idOrSlug } : undefined,
          { slug: idOrSlug },
        ].filter(Boolean) as any,
      },
      include: {
        station: true,
        reviews: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!place) {
      return res.status(404).json({
        message: 'Địa điểm không tồn tại hoặc chưa được xuất bản.',
      });
    }

    const mappedReviews = place.reviews.map((r: any) => ({
      id: r.id,
      displayName: r.displayName || 'Bạn đồng hành xanh',
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      id: place.id,
      stationId: place.stationId,
      stationName: place.station.name,
      stationDisplayName: `Ga ${place.station.name}`,
      slug: place.slug,
      name: place.name,
      category: place.category,
      lat: place.lat,
      lng: place.lng,
      address: place.address || '',
      shortDescription: place.shortDescription,
      description: place.description || '',
      district: place.district || '',
      walkingMinutes: place.walkingMinutes || 0,
      distanceMeters: place.distanceMeters || 0,
      priceLevel: place.priceLevel || 1,
      tags: place.tags,
      highlights: place.highlights,
      imageUrl: place.imageUrl || '',
      featured: place.featured,
      createdAt: place.createdAt,
      reviews: mappedReviews,
    });
  } catch (err: any) {
    console.error('Fetch place detail error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy chi tiết địa điểm.',
    });
  }
});

export default router;
