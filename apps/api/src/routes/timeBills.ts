import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import crypto from 'crypto';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

const ESTIMATE_DISCLAIMER = 'Các chỉ số xanh là ước tính demo cho chiến dịch, không thay thế dữ liệu đo đạc thực tế.';

const htmlTagRegex = /<\/?[a-zA-Z][\s\S]*?>/;

const CreateTimeBillSchema = z.object({
  originLabel: z.string({ required_error: 'Thiếu điểm xuất phát.' }),
  destinationLabel: z.string({ required_error: 'Thiếu điểm đến.' }),
  routeTitle: z.string().optional().nullable(),
  durationMinutes: z.number({ required_error: 'Thiếu thời gian di chuyển.' }).int().min(1, 'Thời gian di chuyển phải từ 1 đến 1440 phút.').max(1440, 'Thời gian di chuyển phải từ 1 đến 1440 phút.'),
  walkingMinutes: z.number().int().nonnegative().optional().nullable(),
  transferCount: z.number().int().nonnegative().optional().nullable(),
  distanceKm: z.number().nonnegative().optional().nullable(),
  weatherSummary: z.string().optional().nullable(),
  preferenceSummary: z.string().optional().nullable(),
  routeSnapshot: z.any().optional(),
  nickname: z.string().max(30, 'Biệt danh tối đa 30 ký tự.').optional().nullable(),
  moment: z.string().max(55, 'Khoảnh khắc tối đa 55 ký tự.').optional().nullable(),
  luckyNumber: z.number().int().min(1, 'Con số may mắn phải từ 1 đến 999.').max(999, 'Con số may mắn phải từ 1 đến 999.').optional().nullable(),
});

function checkHtmlRecursive(obj: any): boolean {
  if (typeof obj === 'string') {
    return htmlTagRegex.test(obj);
  }
  if (Array.isArray(obj)) {
    return obj.some(checkHtmlRecursive);
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some(checkHtmlRecursive);
  }
  return false;
}

const headlines = [
  'Lướt Khói Chạm Xanh cùng EcoTransit 🌿',
  'Hành trình xanh cứu rỗi hành tinh 🌍',
  'Hóa đơn xanh - Lướt khỏi khói bụi 🚀',
  'Tôi đi xanh, bạn cũng thế chứ? 💚'
];

function generateStoryAndHeadline(
  origin: string,
  destination: string,
  duration: number,
  walking: number | null,
  transfers: number | null,
  greenScore: number
) {
  let headline = headlines[0];
  if (greenScore >= 80) {
    headline = 'Kiện tướng lướt khói cấp vũ trụ 🏆';
  } else if (greenScore >= 50) {
    headline = 'Hành trình xanh đầy cảm hứng ⚡';
  } else {
    headline = 'Mỗi bước đi, một dấu chân xanh 🌱';
  }

  const transferText = transfers && transfers > 0 ? `qua ${transfers} lần trung chuyển` : 'di chuyển thẳng';
  const walkText = walking && walking > 0 ? `đi bộ ${walking} phút` : 'tiết kiệm thời gian';
  
  const storyText = `Tôi đã hoàn thành lộ trình từ ${origin} đến ${destination} trong ${duration} phút (${transferText}, ${walkText}). Lựa chọn phương tiện công cộng này đạt điểm xanh ấn tượng ${greenScore}/100! Hãy cùng lướt khói chạm xanh vì một tương lai trong lành hơn.`;

  return { headline, storyText };
}

function toSafeDto(bill: any) {
  return {
    shareSlug: bill.shareSlug,
    originLabel: bill.originLabel,
    destinationLabel: bill.destinationLabel,
    routeTitle: bill.routeTitle,
    durationMinutes: bill.durationMinutes,
    walkingMinutes: bill.walkingMinutes,
    transferCount: bill.transferCount,
    distanceKm: bill.distanceKm,
    weatherSummary: bill.weatherSummary,
    preferenceSummary: bill.preferenceSummary,
    greenScore: bill.greenScore,
    estimatedCo2SavedGrams: bill.estimatedCo2SavedGrams,
    estimatedMoneySavedVnd: bill.estimatedMoneySavedVnd,
    headline: bill.headline,
    storyText: bill.storyText,
    routeSnapshot: bill.routeSnapshot,
    isPublic: bill.isPublic,
    createdAt: bill.createdAt,
    estimateDisclaimer: ESTIMATE_DISCLAIMER,
    nickname: bill.nickname,
    moment: bill.moment,
    luckyNumber: bill.luckyNumber,
  };
}

// 1. POST /api/time-bills
router.post('/time-bills', async (req: Request, res: Response) => {
  try {
    if (checkHtmlRecursive(req.body)) {
      return res.status(400).json({
        message: 'Nội dung đầu vào không được chứa thẻ HTML.',
      });
    }

    const parseResult = CreateTimeBillSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const data = parseResult.data;

    // Check shareSlug generation
    let shareSlug = '';
    let isUnique = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      shareSlug = `lx-${crypto.randomBytes(5).toString('hex')}`;
      const existing = await prisma.timeBill.findUnique({
        where: { shareSlug }
      });
      if (!existing) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      return res.status(500).json({
        message: 'Không thể tạo mã chia sẻ duy nhất sau nhiều lần thử.',
      });
    }

    // Estimate calculations
    let greenScore = 10;
    if (data.distanceKm) {
      const walk = data.walkingMinutes || 0;
      const trans = data.transferCount || 0;
      const scoreBase = 30 + Math.floor(walk * 3) + Math.floor(data.distanceKm * 5) - trans * 5;
      greenScore = Math.max(10, Math.min(100, scoreBase));
    }

    let estimatedCo2SavedGrams = 0;
    let estimatedMoneySavedVnd = 0;
    if (data.distanceKm && data.distanceKm > 0) {
      estimatedCo2SavedGrams = Math.max(0, Math.round(data.distanceKm * 120));
      estimatedMoneySavedVnd = Math.max(0, Math.round(data.distanceKm * 3000));
    }

    const { headline, storyText } = generateStoryAndHeadline(
      data.originLabel,
      data.destinationLabel,
      data.durationMinutes,
      data.walkingMinutes ?? null,
      data.transferCount ?? null,
      greenScore
    );

    // Whitelist routeSnapshot properties
    let routeSnapshot: any = null;
    if (data.routeSnapshot) {
      const raw = data.routeSnapshot;
      routeSnapshot = {
        totalTimeMinutes: typeof raw.totalTimeMinutes === 'number' ? raw.totalTimeMinutes : undefined,
        walkingMinutes: typeof raw.walkingMinutes === 'number' ? raw.walkingMinutes : undefined,
        transferCount: typeof raw.transferCount === 'number' ? raw.transferCount : undefined,
        explanation: typeof raw.explanation === 'string' ? raw.explanation : undefined,
        legs: Array.isArray(raw.legs) ? raw.legs.map((leg: any) => ({
          mode: ['metro', 'bus', 'walk'].includes(leg.mode) ? leg.mode : 'walk',
          durationMinutes: typeof leg.durationMinutes === 'number' ? leg.durationMinutes : undefined,
          distanceMeters: typeof leg.distanceMeters === 'number' ? leg.distanceMeters : undefined,
          fromStationName: typeof leg.fromStationName === 'string' ? leg.fromStationName : undefined,
          toStationName: typeof leg.toStationName === 'string' ? leg.toStationName : undefined,
          lineCode: typeof leg.lineCode === 'string' ? leg.lineCode : undefined,
        })) : undefined
      };
    }

    const loggedInUser = req.session?.user;

    const created = await prisma.timeBill.create({
      data: {
        shareSlug,
        userId: loggedInUser ? loggedInUser.id : null,
        originLabel: data.originLabel,
        destinationLabel: data.destinationLabel,
        routeTitle: data.routeTitle,
        durationMinutes: data.durationMinutes,
        walkingMinutes: data.walkingMinutes,
        transferCount: data.transferCount,
        distanceKm: data.distanceKm,
        weatherSummary: data.weatherSummary,
        preferenceSummary: data.preferenceSummary,
        greenScore,
        estimatedCo2SavedGrams,
        estimatedMoneySavedVnd,
        headline,
        storyText,
        routeSnapshot: routeSnapshot ? JSON.parse(JSON.stringify(routeSnapshot)) : null,
        isPublic: true,
        nickname: data.nickname,
        moment: data.moment,
        luckyNumber: data.luckyNumber,
      },
    });

    return res.status(201).json(toSafeDto(created));
  } catch (err: any) {
    console.error('Create time bill error:', err);
    return res.status(500).json({ message: 'Lỗi tạo hóa đơn thời gian.' });
  }
});

// 2. GET /api/time-bills/mine
router.get('/time-bills/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const loggedInUser = req.session.user!;
    const bills = await prisma.timeBill.findMany({
      where: { userId: loggedInUser.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(bills.map(toSafeDto));
  } catch (err: any) {
    console.error('Fetch mine time bills error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách hóa đơn thời gian.' });
  }
});

// 3. GET /api/time-bills/:shareSlug
router.get('/time-bills/:shareSlug', async (req: Request, res: Response) => {
  try {
    const { shareSlug } = req.params;
    const bill = await prisma.timeBill.findUnique({
      where: { shareSlug },
    });

    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn thời gian.' });
    }

    if (!bill.isPublic) {
      const loggedInUser = req.session?.user;
      if (!loggedInUser || loggedInUser.id !== bill.userId) {
        return res.status(404).json({ message: 'Không tìm thấy hóa đơn thời gian.' });
      }
    }

    return res.status(200).json(toSafeDto(bill));
  } catch (err: any) {
    console.error('Get time bill error:', err);
    return res.status(500).json({ message: 'Lỗi tải chi tiết hóa đơn thời gian.' });
  }
});

// 4. PATCH /api/time-bills/:shareSlug/privacy
router.patch('/time-bills/:shareSlug/privacy', requireAuth, async (req: Request, res: Response) => {
  try {
    const { shareSlug } = req.params;
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ message: 'Trường isPublic phải có kiểu boolean.' });
    }

    const bill = await prisma.timeBill.findUnique({
      where: { shareSlug },
    });

    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn thời gian.' });
    }

    const loggedInUser = req.session.user!;
    if (bill.userId !== loggedInUser.id) {
      return res.status(403).json({ message: 'Bạn không có quyền thay đổi trạng thái riêng tư của hóa đơn này.' });
    }

    const updated = await prisma.timeBill.update({
      where: { shareSlug },
      data: { isPublic },
    });

    return res.status(200).json(toSafeDto(updated));
  } catch (err: any) {
    console.error('Update time bill privacy error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái riêng tư hóa đơn.' });
  }
});

export default router;
