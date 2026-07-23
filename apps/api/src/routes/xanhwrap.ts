import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { 
  XanhWrapLeg, 
  assignXanhWrapLabel, 
  calculateXanhWrapStats, 
  ALL_LABELS,
  XanhWrapLabelDef 
} from '../utils/xanhwrapCore.js';

export const xanhwrapRouter = Router();

// Helper to convert "HH:mm" to total minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Helper to sanitize HTML tags
function sanitizeInput(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * POST /api/xanhwrap/receipts
 * Create a new XanhWrap receipt from 2-8 legs
 */
xanhwrapRouter.post('/receipts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname, recordDate, reflection, luckyNumber, legs } = req.body;

    // 1. Sanitize & basic field validations
    const cleanNickname = sanitizeInput(nickname);
    const cleanReflection = sanitizeInput(reflection);
    const cleanRecordDate = sanitizeInput(recordDate) || '2026-07-23';

    if (!cleanNickname || cleanNickname.length < 2 || cleanNickname.length > 20) {
      res.status(400).json({ message: 'Biệt danh phải từ 2 đến 20 ký tự.' });
      return;
    }

    if (!cleanReflection || cleanReflection.length < 10 || cleanReflection.length > 200) {
      res.status(400).json({ message: 'Dòng suy nghĩ phải từ 10 đến 200 ký tự.' });
      return;
    }

    const luckyNumInt = parseInt(luckyNumber, 10);
    if (isNaN(luckyNumInt) || luckyNumInt < 1 || luckyNumInt > 999) {
      res.status(400).json({ message: 'Con số may mắn phải là số nguyên từ 1 đến 999.' });
      return;
    }

    if (!Array.isArray(legs) || legs.length < 2 || legs.length > 8) {
      res.status(400).json({ message: 'Hành trình phải gồm từ 2 đến 8 chặng di chuyển.' });
      return;
    }

    // 2. Validate legs array & time non-overlapping
    const parsedLegs: XanhWrapLeg[] = [];
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const from = sanitizeInput(leg.from);
      const to = sanitizeInput(leg.to);
      const depart_time = sanitizeInput(leg.depart_time);
      const mode = leg.mode;
      const distance_km = parseFloat(leg.distance_km);
      const duration_min = parseInt(leg.duration_min, 10);

      if (!from || !to || !depart_time || !mode) {
        res.status(400).json({ message: `Chặng ${i + 1} thiếu thông tin điểm đi, điểm đến, giờ đi hoặc phương tiện.` });
        return;
      }

      if (isNaN(distance_km) || distance_km < 0.5 || distance_km > 60) {
        res.status(400).json({ message: `Chặng ${i + 1}: Quãng đường phải từ 0.5km đến 60km.` });
        return;
      }

      if (isNaN(duration_min) || duration_min < 3 || duration_min > 240) {
        res.status(400).json({ message: `Chặng ${i + 1}: Thời gian di chuyển phải từ 3 đến 240 phút.` });
        return;
      }

      parsedLegs.push({
        from,
        to,
        depart_time,
        mode,
        distance_km,
        duration_min,
        transit_line: leg.transit_line ? sanitizeInput(leg.transit_line) : undefined,
      });
    }

    // Validate non-overlapping times: depart_time[i] + duration[i] <= depart_time[i+1]
    for (let i = 0; i < parsedLegs.length - 1; i++) {
      const currentStart = timeToMinutes(parsedLegs[i].depart_time);
      const currentEnd = currentStart + parsedLegs[i].duration_min;
      const nextStart = timeToMinutes(parsedLegs[i + 1].depart_time);

      if (currentEnd > nextStart) {
        res.status(400).json({ 
          message: `Chặng ${i + 1} (${parsedLegs[i].from} → ${parsedLegs[i].to}) kết thúc lúc ${Math.floor(currentEnd/60)}:${currentEnd%60 < 10 ? '0' : ''}${currentEnd%60}, bị trùng thời gian xuất phát với chặng ${i + 2} (${parsedLegs[i + 1].depart_time}).` 
        });
        return;
      }
    }

    // 3. Compute Stats & Label
    const labelDef = assignXanhWrapLabel(parsedLegs);
    const stats = calculateXanhWrapStats(parsedLegs);

    // Soft warning flag check: totalKm > 120 or totalMin > 480 (8 hours)
    const needsReview = stats.totalKm > 120 || stats.totalMin > 480;

    // Check logged in user via session
    const userId = (req.session as any)?.userId || null;

    // 4. Save to Database
    const receipt = await prisma.xanhWrapReceipt.create({
      data: {
        userId,
        nickname: cleanNickname,
        recordDate: cleanRecordDate,
        reflection: cleanReflection,
        luckyNumber: luckyNumInt,
        legsJson: parsedLegs as any,
        totalKm: stats.totalKm,
        totalMin: stats.totalMin,
        transitMin: stats.transitMin,
        handsFreeMin: stats.handsFreeMin,
        co2SavedGrams: stats.co2SavedGrams,
        assignedLabel: labelDef.code,
        assignedLabelName: labelDef.name,
        labelGroup: labelDef.group,
        metricValue: stats.metricValue,
        daysPerYear: stats.daysPerYear,
        episodesPerYear: stats.episodesPerYear,
        needsReview,
      },
    });

    // 5. Compute Rarity Percentage
    const totalReceipts = await prisma.xanhWrapReceipt.count();
    let rarityPct: number | null = null;

    if (totalReceipts >= 100) {
      const sameLabelCount = await prisma.xanhWrapReceipt.count({
        where: { assignedLabel: labelDef.code },
      });
      rarityPct = Math.max(1, Math.round((sameLabelCount / totalReceipts) * 100));
    }

    res.status(201).json({
      ...receipt,
      labelDef,
      rarityPct,
      stats,
    });
  } catch (err: any) {
    console.error('Error creating XanhWrap receipt:', err);
    res.status(500).json({ message: 'Lỗi hệ thống khi tạo phiếu XanhWrap. Vui lòng thử lại.' });
  }
});

/**
 * GET /api/xanhwrap/receipts/:id
 * Retrieve a single receipt with calculated rarity
 */
xanhwrapRouter.get('/receipts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const receipt = await prisma.xanhWrapReceipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      res.status(404).json({ message: 'Không tìm thấy phiếu XanhWrap.' });
      return;
    }

    const labelDef = ALL_LABELS.find((l: XanhWrapLabelDef) => l.code === receipt.assignedLabel) || ALL_LABELS[15];

    const totalReceipts = await prisma.xanhWrapReceipt.count();
    let rarityPct: number | null = null;
    if (totalReceipts >= 100) {
      const sameLabelCount = await prisma.xanhWrapReceipt.count({
        where: { assignedLabel: receipt.assignedLabel },
      });
      rarityPct = Math.max(1, Math.round((sameLabelCount / totalReceipts) * 100));
    }

    res.json({
      ...receipt,
      labelDef,
      rarityPct,
    });
  } catch (err: any) {
    console.error('Error fetching XanhWrap receipt:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
});

/**
 * POST /api/xanhwrap/submit-link
 * Submit social media post URL for minigame contest
 */
xanhwrapRouter.post('/submit-link', async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiptId, postUrl } = req.body;
    const cleanUrl = sanitizeInput(postUrl);

    if (!cleanUrl) {
      res.status(400).json({ message: 'Vui lòng cung cấp đường dẫn bài viết.' });
      return;
    }

    // Validate URL format (facebook.com, instagram.com, threads.net)
    const validDomains = ['facebook.com', 'instagram.com', 'threads.net', 'fb.watch', 'fb.com', 'instagr.am'];
    const isDomainValid = validDomains.some(domain => cleanUrl.toLowerCase().includes(domain));

    if (!isDomainValid) {
      res.status(400).json({ 
        message: 'Đường dẫn bài nộp phải thuộc Facebook (facebook.com), Instagram (instagram.com) hoặc Threads (threads.net).' 
      });
      return;
    }

    // Check if receipt exists
    const receipt = await prisma.xanhWrapReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      res.status(404).json({ message: 'Phiếu XanhWrap không tồn tại hoặc đã bị xóa.' });
      return;
    }

    // Check duplicate URL in DB
    const existingSubmission = await prisma.xanhWrapReceipt.findUnique({
      where: { postUrl: cleanUrl },
    });

    if (existingSubmission && existingSubmission.id !== receiptId) {
      res.status(400).json({ message: 'Đường dẫn bài viết này đã được gửi tham gia minigame trước đó.' });
      return;
    }

    // Generate unique confirmation code XW-2026-XXXX
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const confirmationCode = `XW-2026-${randomDigits}`;

    const updated = await prisma.xanhWrapReceipt.update({
      where: { id: receiptId },
      data: {
        postUrl: cleanUrl,
        confirmationCode,
        status: 'pending',
        submittedAt: new Date(),
      },
    });

    res.json({
      message: 'Nộp bài dự thi Minigame XanhWrap thành công!',
      confirmationCode: updated.confirmationCode,
      postUrl: updated.postUrl,
      status: updated.status,
    });
  } catch (err: any) {
    console.error('Error submitting XanhWrap link:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ message: 'Đường dẫn bài viết này đã được đăng ký.' });
      return;
    }
    res.status(500).json({ message: 'Lỗi hệ thống khi nộp bài dự thi.' });
  }
});
