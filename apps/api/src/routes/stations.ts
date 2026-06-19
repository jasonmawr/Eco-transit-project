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
  q: z.string().optional(),
});

const ParamsSchema = z.object({
  id: z.string().uuid('ID ga/trạm không hợp lệ.'),
});

// 1. GET /api/stations
router.get('/stations', async (req: Request, res: Response) => {
  try {
    const parseResult = QuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Tham số tìm kiếm không hợp lệ.',
      });
    }

    const { q } = parseResult.data;
    const stations = await prisma.station.findMany({
      orderBy: { orderNumber: 'asc' },
    });

    let filtered = stations;
    if (q) {
      const cleanQ = removeAccents(q.toLowerCase().trim());
      filtered = stations.filter((s: any) => {
        const cleanName = removeAccents(s.name.toLowerCase());
        const cleanLine = removeAccents(s.lineName.toLowerCase());
        return cleanName.includes(cleanQ) || cleanLine.includes(cleanQ);
      });
    }

    // Exclude raw database details if necessary, but returning name, lineName, orderNumber, lat, lng, facilities is good.
    const mapped = filtered.map((s: any) => ({
      id: s.id,
      name: s.name,
      lineName: s.lineName,
      orderNumber: s.orderNumber,
      lat: s.lat,
      lng: s.lng,
      facilities: s.facilities ? s.facilities.split(',') : [],
      description: s.description || '',
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch stations error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách ga/trạm.',
    });
  }
});

// 2. GET /api/stations/:id
router.get('/stations/:id', async (req: Request, res: Response) => {
  try {
    const parseResult = ParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const { id } = parseResult.data;

    const station = await prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      return res.status(404).json({
        message: 'Ga/trạm không tồn tại.',
      });
    }

    const pois = await prisma.place.findMany({
      where: { stationId: id },
    });

    const mappedPois = pois.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      lat: p.lat,
      lng: p.lng,
      address: p.address || '',
      details: p.description || '',
      featured: p.featured,
    }));

    return res.status(200).json({
      id: station.id,
      name: station.name,
      lineName: station.lineName,
      orderNumber: station.orderNumber,
      lat: station.lat,
      lng: station.lng,
      facilities: station.facilities ? station.facilities.split(',') : [],
      description: station.description || '',
      pois: mappedPois,
    });
  } catch (err: any) {
    console.error('Fetch station detail error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy chi tiết ga/trạm.',
    });
  }
});

// 3. GET /api/stations/:id/experience
router.get('/stations/:id/experience', async (req: Request, res: Response) => {
  try {
    const parseResult = ParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const { id } = parseResult.data;

    // Fetch station
    const station = await prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      return res.status(404).json({
        message: 'Ga/trạm không tồn tại.',
      });
    }

    // Fetch published places near this station
    const places = await prisma.place.findMany({
      where: {
        stationId: id,
        isPublished: true,
      },
      orderBy: { name: 'asc' },
    });

    // Available categories in the nearby places
    const categories = Array.from(new Set(places.map((p: any) => p.category)));

    // Fetch approved reviews for this station
    const stationReviews = await prisma.uGCReview.findMany({
      where: {
        stationId: id,
        status: 'approved',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate rating summary
    const totalCount = stationReviews.length;
    const averageRating =
      totalCount > 0
        ? parseFloat((stationReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalCount).toFixed(1))
        : 0;

    const mappedReviews = stationReviews.map((r: any) => ({
      id: r.id,
      displayName: r.displayName || 'Hành khách xanh',
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
    }));

    // Fetch related guides
    const guides = await prisma.guide.findMany({
      where: {
        relatedStationId: id,
        isPublished: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      station: {
        id: station.id,
        name: station.name,
        lineName: station.lineName,
        orderNumber: station.orderNumber,
        lat: station.lat,
        lng: station.lng,
        facilities: station.facilities ? station.facilities.split(',') : [],
        description: station.description || '',
      },
      places: places.map((p: any) => ({
        id: p.id,
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
      })),
      categories,
      reviewsSummary: {
        averageRating,
        totalCount,
        list: mappedReviews,
      },
      guides: guides.map((g: any) => ({
        id: g.id,
        slug: g.slug,
        title: g.title,
        excerpt: g.excerpt,
        tags: g.tags,
        createdAt: g.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('Fetch station experience error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy thông tin khám phá ga.',
    });
  }
});

export default router;
