import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import type { Prisma } from '@prisma/client';
import { createWalletWithUniqueAlias } from '../utils/alias.js';

const router = Router();

// Apply global role authorization guards
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MODERATOR']));

// 1. GET /api/admin/overview - Dashboard stats overview
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const [
      pendingReviewsCount,
      pendingTicketsCount,
      activeVouchersCount,
      outOfStockVouchersCount,
      expiredVouchersCount,
      recentRedemptionsCount,
      totalPointsIssuedRes,
      totalPointsSpentRes,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.uGCReview.count({ where: { status: 'pending' } }),
      prisma.ticket.count({ where: { status: 'pending' } }),
      prisma.voucher.count({
        where: {
          isActive: true,
          stockRemaining: { gt: 0 },
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
      }),
      prisma.voucher.count({
        where: {
          isActive: true,
          stockRemaining: 0,
        },
      }),
      prisma.voucher.count({
        where: {
          validUntil: { lt: now },
        },
      }),
      prisma.voucherRedemption.count(),
      prisma.pointsLedger.aggregate({
        _sum: { delta: true },
        where: { delta: { gt: 0 } },
      }),
      prisma.pointsLedger.aggregate({
        _sum: { delta: true },
        where: { delta: { lt: 0 } },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalPointsIssued = totalPointsIssuedRes._sum.delta || 0;
    const totalPointsSpent = Math.abs(totalPointsSpentRes._sum.delta || 0);

    return res.status(200).json({
      pendingReviewsCount,
      pendingTicketsCount,
      activeVouchersCount,
      outOfStockVouchersCount,
      expiredVouchersCount,
      recentRedemptionsCount,
      totalPointsIssued,
      totalPointsSpent,
      recentAuditLogs,
    });
  } catch (err: any) {
    console.error('Fetch admin overview stats error:', err);
    return res.status(500).json({ message: 'Lỗi tải thống tin tổng quan quản trị.' });
  }
});

// 2. GET /api/admin/reviews - List reviews for moderation
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query;
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (q && typeof q === 'string') {
      where.OR = [
        { displayName: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    const reviews = await prisma.uGCReview.findMany({
      where,
      include: {
        station: { select: { name: true } },
        place: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = reviews.map((r: any) => ({
      id: r.id,
      displayName: r.displayName || 'Hành khách xanh',
      rating: r.rating,
      content: r.content,
      target: r.place?.name || r.station?.name || 'Không xác định',
      status: r.status,
      createdAt: r.createdAt,
      moderationNote: r.moderationNote || r.moderatorNote || null,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch admin reviews error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách đánh giá.' });
  }
});

// 3. POST /api/admin/reviews/:id/moderate - Approve/Reject reviews
router.post('/reviews/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, note } = req.body;

    if (decision !== 'approved' && decision !== 'rejected') {
      return res.status(400).json({ message: 'Quyết định duyệt không hợp lệ (approved/rejected).' });
    }

    const review = await prisma.uGCReview.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
    }

    // Idempotent check
    if (review.status === decision) {
      return res.status(200).json({
        message: 'Đánh giá đã được cập nhật trạng thái này trước đó.',
        review,
      });
    }

    const updated = await prisma.uGCReview.update({
      where: { id },
      data: {
        status: decision,
        moderationNote: note || null,
        moderatorNote: note || null, // Keep in sync for backward compatibility
        reviewedAt: new Date(),
        reviewedById: req.session.user!.id,
      },
    });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'moderate_review',
        entityType: 'UGCReview',
        entityId: id,
        summary: `Đã duyệt đánh giá của ${review.displayName || 'Khách ẩn danh'} thành ${decision}`,
        metadata: { decision, note: note || '' },
      },
    });

    return res.status(200).json({
      message: `Đã duyệt đánh giá thành công: ${decision}.`,
      review: updated,
    });
  } catch (err: any) {
    console.error('Moderate review error:', err);
    return res.status(500).json({ message: 'Lỗi thực hiện kiểm duyệt đánh giá.' });
  }
});

// 4. GET /api/admin/tickets - List tickets for moderation
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query;
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (q && typeof q === 'string') {
      where.OR = [
        { routeLabel: { contains: q, mode: 'insensitive' } },
        { ocrText: { contains: q, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        station: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Safe scrub: no server path, no email, only secure thumbnail URL
    const mapped = tickets.map((t: any) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      stationName: t.station?.name || null,
      routeLabel: t.routeLabel,
      tripDate: t.tripDate,
      sizeBytes: t.sizeBytes,
      ocrStatus: t.ocrStatus,
      ocrText: t.ocrText,
      createdAt: t.createdAt,
      reviewNote: t.reviewNote,
      thumbnailUrl: `/api/tickets/thumbnail/${t.id}`,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch admin tickets error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách vé di chuyển.' });
  }
});

// 5. POST /api/admin/tickets/:id/review - Approve/Reject tickets and award points (Idempotent)
router.post('/tickets/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, points, note } = req.body;

    if (decision !== 'approved' && decision !== 'rejected') {
      return res.status(400).json({ message: 'Quyết định duyệt không hợp lệ (approved/rejected).' });
    }

    const targetTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!targetTicket) {
      return res.status(404).json({ message: 'Không tìm thấy vé cần duyệt.' });
    }

    const statusMapped = decision === 'approved' ? 'verified' : 'rejected';

    // Idempotent check
    if (targetTicket.status === statusMapped) {
      return res.status(200).json({
        message: 'Trạng thái vé đã được cập nhật trước đó.',
        ticket: targetTicket,
      });
    }

    const awardPoints = Math.min(100, Math.max(5, points ?? 10));

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticket = await tx.ticket.findUnique({ where: { id } });
      if (!ticket) throw new Error('TICKET_NOT_FOUND');
      if (ticket.status === statusMapped) return { ticket, pointsAwarded: 0, skipped: true };

      if (statusMapped === 'verified') {
        if (ticket.status === 'verified') throw new Error('TICKET_ALREADY_VERIFIED');

        const idempKey = `ticket_approved:${ticket.id}`;
        const existingLedger = await tx.pointsLedger.findUnique({ where: { idempotencyKey: idempKey } });
        if (existingLedger) throw new Error('TICKET_ALREADY_CREDITED');

        let wallet = await tx.userWallet.findUnique({ where: { userId: ticket.userId } });
        if (!wallet) {
          wallet = await createWalletWithUniqueAlias(tx, ticket.userId);
        }
        if (!wallet) {
          throw new Error('WALLET_CREATION_FAILED');
        }

        const nextBalance = wallet.balance + awardPoints;
        const nextLifetime = wallet.lifetimeEarned + awardPoints;

        const ledger = await tx.pointsLedger.create({
          data: {
            userId: ticket.userId,
            delta: awardPoints,
            balanceAfter: nextBalance,
            sourceType: 'ticket',
            sourceId: ticket.id,
            idempotencyKey: idempKey,
            status: 'success',
            eventType: 'ticket_approved',
          },
        });

        await tx.userWallet.update({
          where: { userId: ticket.userId },
          data: {
            balance: nextBalance,
            lifetimeEarned: nextLifetime,
          },
        });

        // Update User cache for backward compatibility
        await tx.user.update({
          where: { id: ticket.userId },
          data: { pointsBalanceCache: nextBalance },
        });

        const updatedTicket = await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'verified',
            pointsLedgerId: ledger.id,
            reviewedAt: new Date(),
            reviewedById: req.session.user!.id,
            reviewNote: note || null,
          },
        });

        return { ticket: updatedTicket, pointsAwarded: awardPoints, skipped: false };
      } else {
        // Rejected flow
        let wallet = await tx.userWallet.findUnique({ where: { userId: ticket.userId } });
        if (!wallet) {
          wallet = await createWalletWithUniqueAlias(tx, ticket.userId);
        }
        if (!wallet) {
          throw new Error('WALLET_CREATION_FAILED');
        }

        if (ticket.status === 'verified') {
          // Revocation: was verified, now rejected
          let pointsToDeduct = 10;
          if (ticket.pointsLedgerId) {
            const ledgerEntry = await tx.pointsLedger.findUnique({ where: { id: ticket.pointsLedgerId } });
            if (ledgerEntry) {
              pointsToDeduct = Math.abs(ledgerEntry.delta);
            }
          }

          if (wallet.balance < pointsToDeduct) {
            throw new Error('REVOCATION_INSUFFICIENT_BALANCE');
          }

          const nextBalance = wallet.balance - pointsToDeduct;
          const nextLifetime = wallet.lifetimeEarned - pointsToDeduct;

          const idempKey = `ticket_rejected:${ticket.id}`;
          const existingLedger = await tx.pointsLedger.findUnique({ where: { idempotencyKey: idempKey } });
          if (existingLedger) {
            return { ticket, pointsAwarded: 0, skipped: true };
          }

          await tx.pointsLedger.create({
            data: {
              userId: ticket.userId,
              delta: -pointsToDeduct,
              balanceAfter: nextBalance,
              sourceType: 'ticket',
              sourceId: ticket.id,
              idempotencyKey: idempKey,
              status: 'success',
              eventType: 'ticket_rejected',
            },
          });

          await tx.userWallet.update({
            where: { userId: ticket.userId },
            data: {
              balance: nextBalance,
              lifetimeEarned: nextLifetime,
            },
          });

          await tx.user.update({
            where: { id: ticket.userId },
            data: { pointsBalanceCache: nextBalance },
          });
        }

        const updatedTicket = await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'rejected',
            reviewedAt: new Date(),
            reviewedById: req.session.user!.id,
            reviewNote: note || null,
          },
        });

        return { ticket: updatedTicket, pointsAwarded: 0, skipped: false };
      }
    });

    if (!result.skipped) {
      // Write AuditLog
      await prisma.auditLog.create({
        data: {
          actorUserId: req.session.user!.id,
          actorRole: req.session.user!.role,
          action: 'review_ticket',
          entityType: 'Ticket',
          entityId: id,
          summary: `Đã duyệt vé ${id} thành ${decision} (${awardPoints} điểm)`,
          metadata: { decision, points: awardPoints, note: note || '' },
        },
      });
    }

    return res.status(200).json({
      message: decision === 'approved'
        ? `Duyệt vé thành công. Cộng ${awardPoints} điểm vào ví người dùng.`
        : 'Đã từ chối duyệt vé di chuyển xanh.',
      ticket: result.ticket,
    });
  } catch (err: any) {
    console.error('Admin ticket review error:', err);
    if (err.message === 'REVOCATION_INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        message: 'Không thể thu hồi vé này tự động vì điểm thưởng đã được sử dụng để đổi quà. Vui lòng xử lý điều chỉnh thủ công theo quy trình quản trị.'
      });
    }
    if (err.message === 'TICKET_ALREADY_VERIFIED' || err.message === 'TICKET_ALREADY_CREDITED') {
      return res.status(409).json({ message: 'Vé này đã được duyệt và cộng điểm trước đó.' });
    }
    if (err.message === 'TICKET_NOT_FOUND') {
      return res.status(404).json({ message: 'Không tìm thấy vé cần duyệt.' });
    }
    return res.status(500).json({ message: 'Có lỗi xảy ra khi thực hiện kiểm duyệt vé.' });
  }
});

// 6. GET /api/admin/places - Search, filter, list POI/Places
router.get('/places', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query;
    const where: any = {};
    if (status === 'published') where.isPublished = true;
    if (status === 'unpublished') where.isPublished = false;

    if (q && typeof q === 'string') {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const places = await prisma.place.findMany({
      where,
      include: { station: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(places);
  } catch (err: any) {
    console.error('Fetch admin places error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách địa điểm.' });
  }
});

// 7. POST /api/admin/places - Create a new POI/Place
router.post('/places', async (req: Request, res: Response) => {
  try {
    const PlaceSchema = z.object({
      name: z.string().min(1, 'Tên địa điểm không được để trống.'),
      slug: z.string().min(1, 'Slug không được để trống.'),
      category: z.string().min(1, 'Danh mục không được để trống.'),
      stationId: z.string().uuid('Ga tàu không hợp lệ.'),
      lat: z.number(),
      lng: z.number(),
      address: z.string().optional().nullable(),
      shortDescription: z.string().default(''),
      description: z.string().optional().nullable(),
      district: z.string().optional().nullable(),
      walkingMinutes: z.number().int().optional().nullable(),
      distanceMeters: z.number().optional().nullable(),
      priceLevel: z.number().int().optional().nullable(),
      tags: z.array(z.string()).default([]),
      highlights: z.array(z.string()).default([]),
      imageUrl: z.string().optional().nullable(),
      featured: z.boolean().default(false),
      isPublished: z.boolean().default(true),
    });

    const parseResult = PlaceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const data = parseResult.data;

    // Strict HTML injection check
    const htmlRegex = /<[^>]*>/g;
    if (
      htmlRegex.test(data.name) ||
      htmlRegex.test(data.slug) ||
      htmlRegex.test(data.shortDescription) ||
      (data.description && htmlRegex.test(data.description))
    ) {
      return res.status(400).json({ message: 'Nội dung chứa thẻ HTML không hợp lệ.' });
    }

    // Slug unique constraint check
    const existing = await prisma.place.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return res.status(409).json({ message: 'Slug địa điểm đã tồn tại.' });
    }

    // Station existence check
    const station = await prisma.station.findUnique({ where: { id: data.stationId } });
    if (!station) {
      return res.status(400).json({ message: 'Ga tàu liên kết không tồn tại.' });
    }

    const newPlace = await prisma.place.create({ data });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'create_place',
        entityType: 'Place',
        entityId: newPlace.id,
        summary: `Đã tạo địa điểm mới: ${newPlace.name}`,
        metadata: { name: newPlace.name, slug: newPlace.slug },
      },
    });

    return res.status(201).json(newPlace);
  } catch (err: any) {
    console.error('Create place error:', err);
    return res.status(500).json({ message: 'Lỗi tạo mới địa điểm.' });
  }
});

// 8. PATCH /api/admin/places/:id - Update an existing POI/Place (soft publish/unpublish)
router.patch('/places/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const PlaceUpdateSchema = z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      category: z.string().optional(),
      stationId: z.string().uuid().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().optional().nullable(),
      shortDescription: z.string().optional(),
      description: z.string().optional().nullable(),
      district: z.string().optional().nullable(),
      walkingMinutes: z.number().int().optional().nullable(),
      distanceMeters: z.number().optional().nullable(),
      priceLevel: z.number().int().optional().nullable(),
      tags: z.array(z.string()).optional(),
      highlights: z.array(z.string()).optional(),
      imageUrl: z.string().optional().nullable(),
      featured: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    });

    const parseResult = PlaceUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const data = parseResult.data;

    // HTML validation
    const htmlRegex = /<[^>]*>/g;
    if (
      (data.name && htmlRegex.test(data.name)) ||
      (data.slug && htmlRegex.test(data.slug)) ||
      (data.shortDescription && htmlRegex.test(data.shortDescription)) ||
      (data.description && htmlRegex.test(data.description))
    ) {
      return res.status(400).json({ message: 'Nội dung chứa thẻ HTML không hợp lệ.' });
    }

    const place = await prisma.place.findUnique({ where: { id } });
    if (!place) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm.' });
    }

    if (data.slug && data.slug !== place.slug) {
      const existing = await prisma.place.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return res.status(409).json({ message: 'Slug địa điểm đã tồn tại.' });
      }
    }

    if (data.stationId) {
      const station = await prisma.station.findUnique({ where: { id: data.stationId } });
      if (!station) {
        return res.status(400).json({ message: 'Ga tàu liên kết không tồn tại.' });
      }
    }

    const updated = await prisma.place.update({ where: { id }, data });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'update_place',
        entityType: 'Place',
        entityId: id,
        summary: `Đã cập nhật địa điểm: ${updated.name}`,
        metadata: { fieldsChanged: Object.keys(data) },
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('Update place error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật địa điểm.' });
  }
});

// 9. GET /api/admin/guides - List guides
router.get('/guides', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query;
    const where: any = {};
    if (status === 'published') where.isPublished = true;
    if (status === 'unpublished') where.isPublished = false;

    if (q && typeof q === 'string') {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    const guides = await prisma.guide.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(guides);
  } catch (err: any) {
    console.error('Fetch admin guides error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách cẩm nang.' });
  }
});

// 10. POST /api/admin/guides - Create a guide
router.post('/guides', async (req: Request, res: Response) => {
  try {
    const GuideSchema = z.object({
      slug: z.string().min(1, 'Slug không được để trống.'),
      title: z.string().min(1, 'Tiêu đề không được để trống.'),
      excerpt: z.string().default(''),
      content: z.string().min(1, 'Nội dung không được để trống.'),
      tags: z.array(z.string()).default([]),
      relatedStationId: z.string().uuid().optional().nullable(),
      isPublished: z.boolean().default(true),
    });

    const parseResult = GuideSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const data = parseResult.data;

    // Strict HTML rejection check
    const htmlRegex = /<[^>]*>/g;
    if (
      htmlRegex.test(data.title) ||
      htmlRegex.test(data.slug) ||
      htmlRegex.test(data.excerpt) ||
      htmlRegex.test(data.content)
    ) {
      return res.status(400).json({ message: 'Nội dung chứa thẻ HTML không hợp lệ.' });
    }

    const existing = await prisma.guide.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return res.status(409).json({ message: 'Slug cẩm nang đã tồn tại.' });
    }

    if (data.relatedStationId) {
      const station = await prisma.station.findUnique({ where: { id: data.relatedStationId } });
      if (!station) {
        return res.status(400).json({ message: 'Ga tàu liên kết không tồn tại.' });
      }
    }

    const newGuide = await prisma.guide.create({ data });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'create_guide',
        entityType: 'Guide',
        entityId: newGuide.id,
        summary: `Đã tạo cẩm nang: ${newGuide.title}`,
        metadata: { title: newGuide.title, slug: newGuide.slug },
      },
    });

    return res.status(201).json(newGuide);
  } catch (err: any) {
    console.error('Create guide error:', err);
    return res.status(500).json({ message: 'Lỗi tạo mới cẩm nang.' });
  }
});

// 11. PATCH /api/admin/guides/:id - Update an existing guide
router.patch('/guides/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const GuideUpdateSchema = z.object({
      slug: z.string().optional(),
      title: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      relatedStationId: z.string().uuid().optional().nullable(),
      isPublished: z.boolean().optional(),
    });

    const parseResult = GuideUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const data = parseResult.data;

    // HTML validation
    const htmlRegex = /<[^>]*>/g;
    if (
      (data.title && htmlRegex.test(data.title)) ||
      (data.slug && htmlRegex.test(data.slug)) ||
      (data.excerpt && htmlRegex.test(data.excerpt)) ||
      (data.content && htmlRegex.test(data.content))
    ) {
      return res.status(400).json({ message: 'Nội dung chứa thẻ HTML không hợp lệ.' });
    }

    const guide = await prisma.guide.findUnique({ where: { id } });
    if (!guide) {
      return res.status(404).json({ message: 'Không tìm thấy cẩm nang.' });
    }

    if (data.slug && data.slug !== guide.slug) {
      const existing = await prisma.guide.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return res.status(409).json({ message: 'Slug cẩm nang đã tồn tại.' });
      }
    }

    if (data.relatedStationId) {
      const station = await prisma.station.findUnique({ where: { id: data.relatedStationId } });
      if (!station) {
        return res.status(400).json({ message: 'Ga tàu liên kết không tồn tại.' });
      }
    }

    const updated = await prisma.guide.update({ where: { id }, data });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'update_guide',
        entityType: 'Guide',
        entityId: id,
        summary: `Đã cập nhật cẩm nang: ${updated.title}`,
        metadata: { fieldsChanged: Object.keys(data) },
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('Update guide error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật cẩm nang.' });
  }
});

// 12. GET /api/admin/vouchers - List vouchers
router.get('/vouchers', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query;
    const where: any = {};
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    if (q && typeof q === 'string') {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brandName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const vouchers = await prisma.voucher.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(vouchers);
  } catch (err: any) {
    console.error('Fetch admin vouchers error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách voucher.' });
  }
});

// 13. POST /api/admin/vouchers - Create a voucher (sync fields for backward compatibility)
router.post('/vouchers', async (req: Request, res: Response) => {
  try {
    const VoucherSchema = z.object({
      name: z.string().min(1, 'Tên voucher không được để trống.'),
      slug: z.string().min(1, 'Slug không được để trống.'),
      pointsCost: z.number().int().gt(0, 'Điểm đổi phải lớn hơn 0.'),
      stockRemaining: z.number().int().min(0, 'Số lượng còn lại không được âm.'),
      stockTotal: z.number().int().min(0, 'Tổng số lượng không được âm.'),
      perUserLimit: z.number().int().min(1, 'Giới hạn đổi tối thiểu là 1.'),
      validFrom: z.string().optional().nullable(),
      validUntil: z.string().optional().nullable(),
      brandName: z.string().default(''),
      category: z.string().default('other'),
      description: z.string().optional().nullable(),
      terms: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      isActive: z.boolean().default(true),
      encryptedCodes: z.string().optional().nullable(),
    });

    const parseResult = VoucherSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const data = parseResult.data;

    if (data.stockTotal < data.stockRemaining) {
      return res.status(400).json({ message: 'Tổng số lượng phải lớn hơn hoặc bằng số lượng còn lại.' });
    }

    const existing = await prisma.voucher.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return res.status(409).json({ message: 'Slug voucher đã tồn tại.' });
    }

    // Map old fields to keep compatibility with older code/queries
    const syncData = {
      ...data,
      cost: data.pointsCost,
      quantity: data.stockTotal,
      encryptedCodes: data.encryptedCodes || 'LX-CODE-DEFAULT-MOCK',
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
    };

    const newVoucher = await prisma.voucher.create({ data: syncData as any });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'create_voucher',
        entityType: 'Voucher',
        entityId: newVoucher.id,
        summary: `Đã tạo voucher mới: ${newVoucher.name}`,
        metadata: { name: newVoucher.name, slug: newVoucher.slug },
      },
    });

    return res.status(201).json(newVoucher);
  } catch (err: any) {
    console.error('Create voucher error:', err);
    return res.status(500).json({ message: 'Lỗi tạo mới voucher.' });
  }
});

// 14. PATCH /api/admin/vouchers/:id - Update an existing voucher
router.patch('/vouchers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const VoucherUpdateSchema = z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      pointsCost: z.number().int().gt(0).optional(),
      stockRemaining: z.number().int().min(0).optional(),
      stockTotal: z.number().int().min(0).optional(),
      perUserLimit: z.number().int().min(1).optional(),
      validFrom: z.string().optional().nullable(),
      validUntil: z.string().optional().nullable(),
      brandName: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional().nullable(),
      terms: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
      encryptedCodes: z.string().optional().nullable(),
    });

    const parseResult = VoucherUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const data = parseResult.data;

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher.' });
    }

    if (data.slug && data.slug !== voucher.slug) {
      const existing = await prisma.voucher.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return res.status(409).json({ message: 'Slug voucher đã tồn tại.' });
      }
    }

    const targetStockTotal = data.stockTotal ?? voucher.stockTotal;
    const targetStockRemaining = data.stockRemaining ?? voucher.stockRemaining;
    if (targetStockTotal < targetStockRemaining) {
      return res.status(400).json({ message: 'Tổng số lượng phải lớn hơn hoặc bằng số lượng còn lại.' });
    }

    const syncData: any = { ...data };
    if (data.pointsCost !== undefined) syncData.cost = data.pointsCost;
    if (data.stockTotal !== undefined) syncData.quantity = data.stockTotal;
    if (data.validFrom !== undefined) syncData.validFrom = data.validFrom ? new Date(data.validFrom) : null;
    if (data.validUntil !== undefined) syncData.validUntil = data.validUntil ? new Date(data.validUntil) : null;

    const updated = await prisma.voucher.update({ where: { id }, data: syncData });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorUserId: req.session.user!.id,
        actorRole: req.session.user!.role,
        action: 'update_voucher',
        entityType: 'Voucher',
        entityId: id,
        summary: `Đã cập nhật voucher: ${updated.name}`,
        metadata: { fieldsChanged: Object.keys(data) },
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('Update voucher error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật voucher.' });
  }
});

// 15. GET /api/admin/audit-logs - Query audit history logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { action, entityType } = req.query;
    const where: any = {};
    if (action && typeof action === 'string') {
      where.action = action;
    }
    if (entityType && typeof entityType === 'string') {
      where.entityType = entityType;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Remove any passwords/secrets/tokens explicitly just in case (metadata checked)
    const scrubbed = logs.map((l: any) => {
      const meta = l.metadata as any;
      if (meta) {
        delete meta.password;
        delete meta.passwordHash;
        delete meta.token;
        delete meta.secret;
        delete meta.cookie;
      }
      return {
        id: l.id,
        actorUserId: l.actorUserId,
        actorRole: l.actorRole,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        summary: l.summary,
        metadata: meta,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      };
    });

    return res.status(200).json(scrubbed);
  } catch (err: any) {
    console.error('Fetch audit logs error:', err);
    return res.status(500).json({ message: 'Lỗi tải lịch sử nhật ký kiểm toán.' });
  }
});

// 16. GET /api/admin/analytics - Detailed visitor statistics
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const [
      totalPageViews,
      uniqueVisitorsGroup,
      totalUsers,
      totalRouteSearches,
      totalTickets,
      totalRedemptions,
      recentLogs,
    ] = await Promise.all([
      prisma.visitorLog.count(),
      prisma.visitorLog.groupBy({
        by: ['ipHash'],
      }),
      prisma.user.count(),
      prisma.timeBill.count(), // number of created timebills = route planning sessions
      prisma.ticket.count(),
      prisma.voucherRedemption.count(),
      prisma.visitorLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const uniqueVisitors = uniqueVisitorsGroup.length;

    // Aggregates for tickets by status
    const ticketsGroup = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    
    const ticketStats = {
      pending: ticketsGroup.find(t => t.status === 'pending')?._count._all || 0,
      verified: ticketsGroup.find(t => t.status === 'verified')?._count._all || 0,
      rejected: ticketsGroup.find(t => t.status === 'rejected')?._count._all || 0,
      total: totalTickets,
    };

    // Access logs scrubbed for user-agent simplification
    const simplifiedLogs = recentLogs.map((log: any) => {
      let device = 'Máy tính';
      const ua = log.userAgent || '';
      if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
        device = 'Điện thoại';
      } else if (/tablet|ipad/i.test(ua)) {
        device = 'Máy tính bảng';
      }
      
      let browser = 'Chrome';
      if (/firefox/i.test(ua)) {
        browser = 'Firefox';
      } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        browser = 'Safari';
      } else if (/edge|edg/i.test(ua)) {
        browser = 'Edge';
      }

      return {
        id: log.id,
        path: log.path,
        device,
        browser,
        userEmail: log.userEmail || 'Khách vãng lai',
        createdAt: log.createdAt,
      };
    });

    return res.status(200).json({
      totalPageViews,
      uniqueVisitors,
      totalUsers,
      totalRouteSearches,
      ticketStats,
      totalRedemptions,
      recentAccessLogs: simplifiedLogs,
    });
  } catch (err: any) {
    console.error('Fetch admin analytics error:', err);
    return res.status(500).json({ message: 'Lỗi tải số liệu thống kê truy cập.' });
  }
});

// 17. GET /api/admin/users - List all users in system
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        pointsBalanceCache: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  } catch (err: any) {
    console.error('Fetch admin users error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách người dùng.' });
  }
});

// 18. GET /api/admin/routes-all - List recent route bills
router.get('/routes-all', async (_req: Request, res: Response) => {
  try {
    const routes = await prisma.timeBill.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        originLabel: true,
        destinationLabel: true,
        routeTitle: true,
        durationMinutes: true,
        distanceKm: true,
        greenScore: true,
        createdAt: true,
        nickname: true,
      },
    });
    return res.status(200).json(routes);
  } catch (err: any) {
    console.error('Fetch admin routes error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách lộ trình.' });
  }
});

// 19. GET /api/admin/xanhwrap/submissions - List all XanhWrap contest submissions
router.get('/xanhwrap/submissions', async (req: Request, res: Response) => {
  try {
    const { status, luckyNumber, search } = req.query;

    const whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.status = String(status);
    }

    if (luckyNumber) {
      const num = parseInt(String(luckyNumber), 10);
      if (!isNaN(num)) {
        whereClause.luckyNumber = num;
      }
    }

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { nickname: { contains: q, mode: 'insensitive' } },
        { reflection: { contains: q, mode: 'insensitive' } },
        { confirmationCode: { contains: q, mode: 'insensitive' } },
        { postUrl: { contains: q, mode: 'insensitive' } },
      ];
    }

    const submissions = await prisma.xanhWrapReceipt.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return res.status(200).json(submissions);
  } catch (err: any) {
    console.error('Fetch XanhWrap submissions error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách bài dự thi XanhWrap.' });
  }
});

// 20. PATCH /api/admin/xanhwrap/submissions/:id - Approve or reject a submission
router.patch('/xanhwrap/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['valid', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ. Phải là valid, rejected hoặc pending.' });
    }

    const updated = await prisma.xanhWrapReceipt.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? (rejectionReason || 'Bài đăng không hợp lệ hoặc thiếu thông tin') : null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: (req as any).user?.id || null,
        actorRole: (req as any).user?.role || 'ADMIN',
        action: 'UPDATE_XANHWRAP_SUBMISSION',
        entityType: 'XanhWrapReceipt',
        entityId: id,
        summary: `Cập nhật trạng thái bài dự thi ${updated.nickname} (${updated.confirmationCode || id}) sang ${status}`,
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('Update XanhWrap submission error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái bài dự thi.' });
  }
});

// 21. GET /api/admin/xanhwrap/export-csv - Export CSV of submissions
router.get('/xanhwrap/export-csv', async (_req: Request, res: Response) => {
  try {
    const submissions = await prisma.xanhWrapReceipt.findMany({
      orderBy: { createdAt: 'desc' },
    });

    let csvContent = 'STT,MaXacNhan,BietDanh,SoMayMan,NhanDanhTinh,NgayGhiNhan,QuangDuongKm,PhutKhongLai,LinkBaiDang,SuyNghi,TrangThai,NgayNop\n';

    submissions.forEach((item, index) => {
      const code = item.confirmationCode || 'ChuaNop';
      const nick = `"${(item.nickname || '').replace(/"/g, '""')}"`;
      const label = `"${(item.assignedLabelName || '').replace(/"/g, '""')}"`;
      const link = `"${(item.postUrl || '').replace(/"/g, '""')}"`;
      const reflection = `"${(item.reflection || '').replace(/"/g, '""')}"`;
      const date = item.recordDate || '';
      const submittedAt = item.submittedAt ? item.submittedAt.toISOString() : '';

      csvContent += `${index + 1},${code},${nick},${item.luckyNumber},${label},${date},${item.totalKm},${item.handsFreeMin},${link},${reflection},${item.status},${submittedAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="XanhWrap_Minigame_Submissions.csv"');
    return res.status(200).send('\uFEFF' + csvContent); // BOM for Excel UTF-8
  } catch (err: any) {
    console.error('Export XanhWrap CSV error:', err);
    return res.status(500).json({ message: 'Lỗi xuất CSV bài dự thi.' });
  }
});

export default router;

