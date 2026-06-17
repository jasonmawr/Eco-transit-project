import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import crypto from 'crypto';

const router = Router();

const RedeemBodySchema = z.object({
  idempotencyKey: z.string().max(255).optional(),
});

// Helper: Map DB Voucher object to clean API DTO
function mapVoucherToDTO(voucher: any, userId?: string, userBalance: number = 0, userRedemptionCount: number = 0) {
  const now = new Date();
  const isExpired = voucher.validUntil && new Date(voucher.validUntil) < now;
  const isStarted = !voucher.validFrom || new Date(voucher.validFrom) <= now;

  let stockStatus = 'available';
  if (voucher.stockRemaining <= 0) {
    stockStatus = 'out_of_stock';
  } else if (voucher.stockRemaining <= 5) {
    stockStatus = 'low_stock';
  }

  let isRedeemable = false;
  let cantRedeemReason = '';

  if (userId) {
    if (!voucher.isActive) {
      isRedeemable = false;
      cantRedeemReason = 'Ưu đãi hiện chưa hoạt động.';
    } else if (isExpired) {
      isRedeemable = false;
      cantRedeemReason = 'Ưu đãi đã hết hạn sử dụng.';
    } else if (!isStarted) {
      isRedeemable = false;
      cantRedeemReason = 'Ưu đãi chưa đến thời gian mở đổi.';
    } else if (voucher.stockRemaining <= 0) {
      isRedeemable = false;
      cantRedeemReason = 'Đã hết lượt đổi ưu đãi này.';
    } else if (userRedemptionCount >= (voucher.perUserLimit ?? 1)) {
      isRedeemable = false;
      cantRedeemReason = `Bạn đã đạt giới hạn đổi tối đa (${voucher.perUserLimit} lần).`;
    } else if (userBalance < voucher.pointsCost) {
      isRedeemable = false;
      cantRedeemReason = 'Số dư điểm xanh không đủ để đổi.';
    } else {
      isRedeemable = true;
    }
  }

  return {
    id: voucher.id,
    slug: voucher.slug,
    title: voucher.name, // fallback from name
    description: voucher.description,
    brandName: voucher.brandName,
    category: voucher.category,
    pointsCost: voucher.pointsCost || voucher.cost, // fallback from cost
    stockStatus,
    validUntil: voucher.validUntil,
    terms: voucher.terms,
    imageUrl: voucher.imageUrl,
    isActive: voucher.isActive,
    isRedeemable,
    cantRedeemReason,
    perUserLimit: voucher.perUserLimit,
  };
}

// 1. GET /api/rewards - Get public/active vouchers
router.get('/rewards', async (req: Request, res: Response) => {
  try {
    const { category, q, availableOnly } = req.query;

    const whereClause: any = {
      isActive: true,
    };

    if (category && typeof category === 'string' && category !== 'all') {
      whereClause.category = category;
    }

    if (q && typeof q === 'string') {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brandName: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (availableOnly === 'true') {
      whereClause.stockRemaining = { gt: 0 };
      whereClause.OR = [
        { validUntil: null },
        { validUntil: { gte: new Date() } }
      ];
    }

    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const sessionUser = req.session?.user;
    let balance = 0;
    let redemptionsMap: Record<string, number> = {};

    if (sessionUser) {
      const wallet = await prisma.userWallet.findUnique({
        where: { userId: sessionUser.id },
      });
      balance = wallet ? wallet.balance : 0;

      const userRedemptions = await prisma.voucherRedemption.groupBy({
        by: ['voucherId'],
        where: { userId: sessionUser.id },
        _count: { id: true },
      });

      userRedemptions.forEach((group) => {
        redemptionsMap[group.voucherId] = group._count.id;
      });
    }

    const list = vouchers.map((v) =>
      mapVoucherToDTO(
        v,
        sessionUser?.id,
        balance,
        redemptionsMap[v.id] || 0
      )
    );

    return res.status(200).json(list);
  } catch (err: any) {
    console.error('Fetch rewards error:', err);
    return res.status(500).json({ message: 'Có lỗi xảy ra khi tải danh mục phần thưởng.' });
  }
});

// 2. GET /api/rewards/mine - Get user's active/used redemptions
router.get('/rewards/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const sessionUser = req.session.user!;
    const redemptions = await prisma.voucherRedemption.findMany({
      where: { userId: sessionUser.id },
      orderBy: { redeemedAt: 'desc' },
      include: {
        voucher: {
          select: {
            name: true,
            category: true,
            brandName: true,
            validUntil: true,
          },
        },
      },
    });

    // Privacy scrubbed: no userId/email or database keys exposed
    const mapped = redemptions.map((r) => ({
      id: r.id,
      code: r.code,
      voucherTitle: r.voucher.name,
      brandName: r.voucher.brandName,
      category: r.voucher.category,
      status: r.status,
      pointsSpent: r.pointsSpent,
      redeemedAt: r.redeemedAt,
      expiresAt: r.expiresAt,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch my redemptions error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách voucher của tôi.' });
  }
});

// 3. GET /api/rewards/:slug - Get reward detail
router.get('/rewards/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const voucher = await prisma.voucher.findUnique({
      where: { slug },
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Phần thưởng không tồn tại.' });
    }

    const sessionUser = req.session?.user;
    let alreadyRedeemedCount = 0;
    let balance = 0;

    if (sessionUser) {
      alreadyRedeemedCount = await prisma.voucherRedemption.count({
        where: { userId: sessionUser.id, voucherId: voucher.id },
      });
      const wallet = await prisma.userWallet.findUnique({
        where: { userId: sessionUser.id },
      });
      balance = wallet ? wallet.balance : 0;
    }

    const dto = mapVoucherToDTO(voucher, sessionUser?.id, balance, alreadyRedeemedCount);

    return res.status(200).json({
      ...dto,
      userRedemptionSummary: sessionUser ? {
        alreadyRedeemedCount,
        perUserLimit: voucher.perUserLimit,
        canRedeem: dto.isRedeemable,
        reason: dto.cantRedeemReason,
      } : null,
    });
  } catch (err: any) {
    console.error('Fetch reward detail error:', err);
    return res.status(500).json({ message: 'Lỗi khi tải chi tiết phần thưởng.' });
  }
});

// 3. POST /api/rewards/:slug/redeem - Redeem points for voucher (Transaction-safe & Idempotent)
router.post('/rewards/:slug/redeem', requireAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const sessionUser = req.session.user!;

    const parseResult = RedeemBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const { idempotencyKey } = parseResult.data;

    // First lookup voucher
    const voucher = await prisma.voucher.findUnique({
      where: { slug },
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Phần thưởng không tồn tại.' });
    }

    // Strict Idempotency Check
    if (idempotencyKey) {
      const existingRedemption = await prisma.voucherRedemption.findUnique({
        where: { idempotencyKey },
        include: { voucher: true },
      });

      if (existingRedemption) {
        // Enforce privacy: verify it belongs to this user
        if (existingRedemption.userId !== sessionUser.id) {
          return res.status(403).json({ message: 'Không thể truy cập giao dịch của người dùng khác.' });
        }

        const wallet = await prisma.userWallet.findUnique({
          where: { userId: sessionUser.id },
        });

        return res.status(200).json({
          redemption: {
            code: existingRedemption.code,
            voucherTitle: existingRedemption.voucher.name,
            pointsSpent: existingRedemption.pointsSpent,
            status: existingRedemption.status,
            expiresAt: existingRedemption.expiresAt,
          },
          wallet: {
            balance: wallet ? wallet.balance : 0,
            lifetimeSpent: wallet ? wallet.lifetimeSpent : 0,
          },
          message: 'Đổi voucher thành công (Khôi phục mã ưu đãi đã tạo trước đó).',
        });
      }
    }

    const finalIdempKey = idempotencyKey || `voucher_redeemed:${sessionUser.id}:${voucher.id}:${Date.now()}`;

    // Execute atomic transaction for safety
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock/Fetch voucher again
      const v = await tx.voucher.findUnique({
        where: { id: voucher.id },
      });
      if (!v) throw new Error('VOUCHER_NOT_FOUND');
      if (!v.isActive) throw new Error('VOUCHER_INACTIVE');
      if (v.stockRemaining <= 0) throw new Error('OUT_OF_STOCK');

      const now = new Date();
      if (v.validUntil && new Date(v.validUntil) < now) throw new Error('VOUCHER_EXPIRED');
      if (v.validFrom && new Date(v.validFrom) > now) throw new Error('VOUCHER_NOT_STARTED');

      // 2. Lock/Fetch wallet
      let wallet = await tx.userWallet.findUnique({
        where: { userId: sessionUser.id },
      });
      if (!wallet) {
        wallet = await tx.userWallet.create({
          data: { userId: sessionUser.id, balance: 0 },
        });
      }
      if (wallet.balance < v.pointsCost) throw new Error('INSUFFICIENT_BALANCE');

      // 3. Enforce perUserLimit
      const alreadyRedeemed = await tx.voucherRedemption.count({
        where: { userId: sessionUser.id, voucherId: v.id },
      });
      if (alreadyRedeemed >= (v.perUserLimit ?? 1)) {
        throw new Error('LIMIT_EXCEEDED');
      }

      // 4. Extract or generate code
      let finalCode = '';
      if (v.encryptedCodes) {
        const codes = v.encryptedCodes.split(',').map((c) => c.trim()).filter(Boolean);
        if (codes.length > alreadyRedeemed) {
          finalCode = codes[alreadyRedeemed];
        }
      }
      if (!finalCode) {
        // Fallback random code generator
        const randStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        finalCode = `LX-${randStr}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // 5. Atomic decrement (this protects against concurrently selling below 0)
      const updatedVoucher = await tx.voucher.update({
        where: { id: v.id },
        data: {
          stockRemaining: { decrement: 1 },
          quantity: { decrement: 1 }, // sync old field
        },
      });

      if (updatedVoucher.stockRemaining < 0) {
        throw new Error('OUT_OF_STOCK');
      }

      // 6. Update user wallet
      const nextBalance = wallet.balance - v.pointsCost;
      const nextLifetime = wallet.lifetimeSpent + v.pointsCost;

      const updatedWallet = await tx.userWallet.update({
        where: { userId: sessionUser.id },
        data: {
          balance: nextBalance,
          lifetimeSpent: nextLifetime,
        },
      });

      // Keep user pointsBalanceCache updated for queries
      await tx.user.update({
        where: { id: sessionUser.id },
        data: { pointsBalanceCache: nextBalance },
      });

      // 7. Write append-only PointsLedger entry
      await tx.pointsLedger.create({
        data: {
          userId: sessionUser.id,
          delta: -v.pointsCost,
          balanceAfter: nextBalance,
          sourceType: 'voucher_redemption',
          sourceId: v.id,
          idempotencyKey: finalIdempKey,
          eventType: 'voucher_redeemed',
          status: 'success',
        },
      });

      // 8. Create redemption record
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // Valid for 30 days

      const redemption = await tx.voucherRedemption.create({
        data: {
          userId: sessionUser.id,
          voucherId: v.id,
          code: finalCode,
          idempotencyKey: finalIdempKey,
          status: 'active',
          pointsSpent: v.pointsCost,
          expiresAt: expiryDate,
          metadata: { brandName: v.brandName } as any,
        },
      });

      return { redemption, wallet: updatedWallet, voucher: v };
    });

    return res.status(201).json({
      redemption: {
        code: result.redemption.code,
        voucherTitle: result.voucher.name,
        pointsSpent: result.redemption.pointsSpent,
        status: result.redemption.status,
        expiresAt: result.redemption.expiresAt,
      },
      wallet: {
        balance: result.wallet.balance,
        lifetimeSpent: result.wallet.lifetimeSpent,
      },
      message: 'Đổi voucher thành công. Mã ưu đãi đã nằm trong Ví xanh của bạn.',
    });
  } catch (err: any) {
    console.error('Redeem voucher error:', err);
    if (err.message === 'VOUCHER_INACTIVE' || err.message === 'VOUCHER_EXPIRED' || err.message === 'VOUCHER_NOT_STARTED') {
      return res.status(400).json({ message: 'Ưu đãi đã hết hạn hoặc chưa được mở đổi.' });
    }
    if (err.message === 'OUT_OF_STOCK') {
      return res.status(409).json({ message: 'Ưu đãi đã hết quà tặng trong kho.' });
    }
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({ message: 'Số dư điểm xanh của bạn không đủ để đổi.' });
    }
    if (err.message === 'LIMIT_EXCEEDED') {
      return res.status(409).json({ message: 'Bạn đã đạt giới hạn đổi tối đa cho ưu đãi này.' });
    }
    return res.status(500).json({ message: 'Có lỗi xảy ra khi thực hiện đổi phần thưởng.' });
  }
});

export default router;
