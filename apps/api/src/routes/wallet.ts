import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import type { Prisma } from '@prisma/client';

const router = Router();

const ReviewBodySchema = z.object({
  status: z.enum(['verified', 'rejected']),
  points: z.number().int().optional(), // optional - clamp handled programmatically
  reviewNote: z.string().max(250).optional(),
});

// 1. GET /api/wallet/me
router.get('/wallet/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const sessionUser = req.session.user!;

    // Find or initialize wallet
    let wallet = await prisma.userWallet.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!wallet) {
      wallet = await prisma.userWallet.create({
        data: {
          userId: sessionUser.id,
          balance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });
    }

    // Get ticket counts grouped by status
    const ticketCounts = await prisma.ticket.groupBy({
      by: ['status'],
      where: { userId: sessionUser.id },
      _count: { id: true },
    });

    const counts = {
      pending: 0,
      verified: 0,
      rejected: 0,
      manual_review: 0,
    };

    ticketCounts.forEach((group: any) => {
      const statusKey = group.status as keyof typeof counts;
      if (statusKey in counts) {
        counts[statusKey] = group._count.id;
      }
    });

    return res.status(200).json({
      balance: wallet.balance,
      lifetimeEarned: wallet.lifetimeEarned,
      lifetimeSpent: wallet.lifetimeSpent,
      ticketCounts: counts,
    });
  } catch (err: any) {
    console.error('Get wallet stats error:', err);
    return res.status(500).json({ message: 'Lỗi tải thông tin ví điểm xanh.' });
  }
});

// 2. GET /api/points/ledger
router.get('/points/ledger', requireAuth, async (req: Request, res: Response) => {
  try {
    const sessionUser = req.session.user!;
    const ledger = await prisma.pointsLedger.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = ledger.map((item: any) => ({
      id: item.id,
      delta: item.delta,
      balanceAfter: item.balanceAfter,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      eventType: item.eventType || item.sourceType,
      createdAt: item.createdAt,
    }));

    return res.status(200).json(mapped);
  } catch (err: any) {
    console.error('Fetch points ledger error:', err);
    return res.status(500).json({ message: 'Lỗi tải lịch sử giao dịch điểm xanh.' });
  }
});

// 3. POST /api/tickets/:id/review
router.post('/tickets/:id/review', requireAuth, requireRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user!;

    // Additional strict security check
    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'MODERATOR') {
      return res.status(403).json({
        message: 'Tài khoản của bạn không có quyền thực hiện tác vụ kiểm duyệt.',
      });
    }

    const parseResult = ReviewBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }

    const { status, points, reviewNote } = parseResult.data;

    // Clamp points inside [5, 100] with default value of 10
    const awardPoints = Math.min(100, Math.max(5, points ?? 10));

    const targetTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!targetTicket) {
      return res.status(404).json({ message: 'Không tìm thấy vé cần duyệt.' });
    }

    // Prevent double reviewing if already approved
    if (targetTicket.status === 'verified') {
      return res.status(409).json({ message: 'Vé này đã được duyệt và cộng điểm trước đó.' });
    }

    // Execute atomic transaction for state changes, wallets, and ledger
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Re-verify under transaction lock
      const ticket = await tx.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new Error('TICKET_NOT_FOUND');
      }

      if (ticket.status === 'verified') {
        throw new Error('TICKET_ALREADY_VERIFIED');
      }

      if (status === 'verified') {
        const idempKey = `ticket_approved:${ticket.id}`;

        // Verify idempotency ledger does not exist
        const existingLedger = await tx.pointsLedger.findUnique({
          where: { idempotencyKey: idempKey },
        });

        if (existingLedger) {
          throw new Error('TICKET_ALREADY_CREDITED');
        }

        // Fetch/Init user wallet
        let wallet = await tx.userWallet.findUnique({
          where: { userId: ticket.userId },
        });

        if (!wallet) {
          wallet = await tx.userWallet.create({
            data: {
              userId: ticket.userId,
              balance: 0,
              lifetimeEarned: 0,
              lifetimeSpent: 0,
            },
          });
        }

        const nextBalance = wallet.balance + awardPoints;
        const nextLifetime = wallet.lifetimeEarned + awardPoints;

        // Write append-only ledger history
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

        // Update Wallet
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
          data: {
            pointsBalanceCache: nextBalance,
          },
        });

        // Update Ticket status
        const updatedTicket = await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'verified',
            pointsLedgerId: ledger.id,
            reviewedAt: new Date(),
            reviewedById: sessionUser.id,
            reviewNote: reviewNote || null,
          },
        });

        return { ticket: updatedTicket, pointsAwarded: awardPoints };
      } else {
        // Rejected flow
        const updatedTicket = await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'rejected',
            reviewedAt: new Date(),
            reviewedById: sessionUser.id,
            reviewNote: reviewNote || null,
          },
        });

        return { ticket: updatedTicket, pointsAwarded: 0 };
      }
    });

    return res.status(200).json({
      message: status === 'verified'
        ? `Duyệt vé thành công. Cộng ${result.pointsAwarded} điểm vào ví người dùng.`
        : 'Đã từ chối duyệt vé di chuyển xanh.',
      ticket: {
        id: result.ticket.id,
        status: result.ticket.status,
        reviewNote: result.ticket.reviewNote,
        reviewedAt: result.ticket.reviewedAt,
      },
    });
  } catch (err: any) {
    console.error('Review ticket error:', err);
    if (
      err.message === 'TICKET_ALREADY_VERIFIED' ||
      err.message === 'TICKET_ALREADY_CREDITED'
    ) {
      return res.status(409).json({ message: 'Vé này đã được duyệt và cộng điểm trước đó.' });
    }
    if (err.message === 'TICKET_NOT_FOUND') {
      return res.status(404).json({ message: 'Không tìm thấy vé cần duyệt.' });
    }
    return res.status(500).json({ message: 'Có lỗi xảy ra khi thực hiện kiểm duyệt vé.' });
  }
});

export default router;
