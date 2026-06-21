import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';

const router = Router();

// GET /api/leaderboard
// Returns list of users ordered by points earned, with competition ranking (1-2-2-4)
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const wallets = await prisma.userWallet.findMany({
      orderBy: { lifetimeEarned: 'desc' },
      select: {
        userId: true,
        lifetimeEarned: true,
        publicLeaderboardAlias: true,
      },
    });

    const currentUserId = req.session?.user?.id;

    let currentRank = 1;
    let previousScore = -1;

    const leaderboard = wallets.map((wallet, index) => {
      const score = wallet.lifetimeEarned;
      if (score !== previousScore) {
        currentRank = index + 1;
        previousScore = score;
      }

      return {
        rank: currentRank,
        nickname: wallet.publicLeaderboardAlias || 'Hành khách xanh ẩn danh',
        isMe: currentUserId ? wallet.userId === currentUserId : false,
      };
    });

    return res.status(200).json(leaderboard);
  } catch (err: any) {
    console.error('Fetch leaderboard error:', err);
    return res.status(500).json({ message: 'Lỗi tải bảng xếp hạng di chuyển xanh.' });
  }
});

export default router;
