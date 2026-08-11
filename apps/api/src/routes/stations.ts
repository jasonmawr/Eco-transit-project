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
      places: places.map((p: any) => {
        // Dynamic opening hours, ticket price, and transit directions generator based on location slug
        const detailsMap: Record<string, { openingHours: string; ticketPrice: string; transitDirections: string[]; interestCount: number; isUpcoming?: boolean }> = {
          'cho-ben-thanh-market': {
            openingHours: '06:00 - 18:00 (khu ăn uống đến ~22:00)',
            ticketPrice: 'Miễn phí',
            transitDirections: ["Metro số 1 → Ga Bến Thành (đi bộ 1-3 phút là tới chợ)","Bus điện 155 / 156 → trạm Bến Thành (cách ~3-5 phút đi bộ)"],
            interestCount: 370,
            isUpcoming: false
          },
          'pho-di-bo-nguyen-hue': {
            openingHours: 'Mở tự do 24/7 (nhộn nhịp nhất từ 17:00 – 23:00)',
            ticketPrice: 'Miễn phí',
            transitDirections: ["Metro số 1 → Ga Nhà hát Thành phố → đi bộ khoảng 3–5 phút","Bus điện tuyến 155 → xuống trạm Nhà hát Thành phố","Metro số 1 → Ga Bến Thành → đi bộ theo đường Lê Lợi khoảng 8–10 phút"],
            interestCount: 980,
            isUpcoming: false
          },
          'ben-bach-dang': {
            openingHours: 'Tự do cả ngày, đẹp nhất vào sáng sớm và chiều tối',
            ticketPrice: 'Miễn phí (Waterbus: 15.000 VNĐ/lượt)',
            transitDirections: ["Metro số 1 → Ga Ba Son → đi bộ khoảng 5–10 phút","Metro số 1 → Ga Nhà hát Thành phố → đi bộ khoảng 7–10 phút","Xe buýt điện → xuống trạm gần đường Tôn Đức Thắng"],
            interestCount: 840,
            isUpcoming: false
          },
          'toa-nha-bitexco': {
            openingHours: '09:00 – 21:00 hàng ngày (Sky Deck)',
            ticketPrice: 'Khoảng 200.000 – 250.000 VNĐ/người lớn',
            transitDirections: ["Metro số 1 → Ga Nhà hát Thành phố → đi bộ 5 phút","Metro số 1 → Ga Bến Thành → đi bộ 7-8 phút"],
            interestCount: 620,
            isUpcoming: false
          },
          'cong-vien-giot-nuoc': {
            openingHours: '24/7 (Nhạc nước: 17:00-17:30 & 20:00-20:30)',
            ticketPrice: 'Miễn phí cho mọi người',
            transitDirections: ["Metro số 1 → Ga Bến Thành → Bến bus Sài Gòn → bus điện 156 (xuống Maximark Lý Thái Tổ) → Đi bộ 8-12 phút","Xe buýt số 27 → trạm Bệnh viện Nhi Đồng 1 → Đi bộ 3-5 phút"],
            interestCount: 510,
            isUpcoming: false
          },
          'daddy-cool-cong-vien-anh-sang': {
            openingHours: '17:00 – 22:30 hàng ngày',
            ticketPrice: 'Vào cửa công viên tự do / Vé trò chơi theo niêm yết',
            transitDirections: ["Metro số 1 → Ga Rạch Chiếc / Ga An Phú → đi buýt điện hoặc xe công nghệ 5-7 phút"],
            interestCount: 1120,
            isUpcoming: false
          },
          'bao-tang-my-thuat-tphcm': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Bến Thành → Đi bộ 4 phút theo đường Phó Đức Chính","Bus điện 155 / 156 → Trạm Chợ Bến Thành → Đi bộ 3 phút"],
            interestCount: 730,
            isUpcoming: true
          },
          'slay-concept-thao-dien': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Thảo Điền → Đi bộ hoặc xe máy công nghệ 3-5 phút vào đường Nguyễn Văn Hưởng"],
            interestCount: 640,
            isUpcoming: true
          },
          'van-phuc-city': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Bình Thái / Ga Thủ Đức → Chuyển xe buýt số 19 hoặc xe công nghệ 7 phút"],
            interestCount: 890,
            isUpcoming: true
          },
          'bao-tang-y-hoc-co-truyen-fito': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Bến Thành → Bus 156 / Xe công nghệ 8 phút đến đường Hoàng Dư Khương"],
            interestCount: 580,
            isUpcoming: true
          },
          'buu-dien-thanh-pho-hcm': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Nhà hát Thành phố → Đi bộ 4 phút theo đường Đồng Khởi qua Nhà thờ Đức Bà"],
            interestCount: 1050,
            isUpcoming: true
          },
          'dinh-doc-lap-saigon': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Bến Thành → Đi bộ 6 phút theo đường Lê Lợi & Nam Kỳ Khởi Nghĩa","Bus điện 155 → Trạm Dinh Độc Lập"],
            interestCount: 1180,
            isUpcoming: true
          },
          'bao-tang-ao-dai-vietnam': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Khu Công nghệ cao → Chuyển buýt tuyến 88 hoặc xe công nghệ 10 phút"],
            interestCount: 490,
            isUpcoming: true
          },
          'den-hung-thu-duc': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Bến xe Miền Đông mới → Đi bộ 7 phút theo đại lộ vào Công viên Lịch sử Dân tộc"],
            interestCount: 670,
            isUpcoming: true
          },
          'khu-du-lich-cuchi-fosaco': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Bến Thành → Bến bus Sài Gòn → Bus tuyến 79 (Bến Thành - Củ Chi) đi thẳng đến Fosaco"],
            interestCount: 430,
            isUpcoming: true
          },
          'sunny-farm-saigon': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Tân Cảng → Đi xe buýt điện hoặc xe công nghệ 6 phút theo đường Phạm Văn Đồng"],
            interestCount: 780,
            isUpcoming: true
          },
          'suoi-tien-theme-park': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Suối Tiên (đi bộ 3 phút qua cầu vượt kết nối thẳng vào cổng chính KDL)"],
            interestCount: 1250,
            isUpcoming: true
          },
          'cong-vien-bo-song-thu-duc': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Ba Son → Đi bộ qua Cầu Ba Son (Cầu Thủ Thiêm 2) 5-7 phút là tới công viên bờ sông"],
            interestCount: 920,
            isUpcoming: true
          },
          'bai-tha-dieu-thu-thiem': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Ba Son → Đi bộ qua Cầu Ba Son khoảng 7 phút đến bãi cỏ Thủ Thiêm"],
            interestCount: 710,
            isUpcoming: true
          },
          'cuc-phuong-expo-saigon': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Suối Tiên → Đi bộ 5 phút vào Khu không gian trải nghiệm sinh thái"],
            interestCount: 460,
            isUpcoming: true
          },
          'union-square-shopping-mall': {
            openingHours: '🚀 Sắp cập nhật',
            ticketPrice: '🚀 Sắp cập nhật',
            transitDirections: ["Metro số 1 → Ga Nhà hát Thành phố → Lối ra số 1 kết nối thẳng sảnh Union Square"],
            interestCount: 810,
            isUpcoming: true
          }
        };

        const extra = detailsMap[p.slug] || {
          openingHours: '08:00 - 22:00',
          ticketPrice: 'Tham khảo tại quầy',
          transitDirections: ['Đi bộ từ lối ra ga chính'],
          interestCount: 250
        };

        return {
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
          openingHours: extra.openingHours,
          ticketPrice: extra.ticketPrice,
          transitDirections: extra.transitDirections,
          interestCount: extra.interestCount,
          isUpcoming: extra.isUpcoming || p.tags?.includes('upcoming') || false
        };
      }),
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
