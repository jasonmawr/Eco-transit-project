import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import crypto from 'crypto';

const router = Router();

// POST /api/analytics/track
// Public endpoint for frontend page-view tracking
router.post('/analytics/track', async (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    // Resolve single IP string if x-forwarded-for contains array or list
    const ipStr = Array.isArray(ip) 
      ? ip[0] 
      : typeof ip === 'string' 
        ? ip.split(',')[0].trim() 
        : String(ip);

    // Secure SHA-256 hash of IP to maintain user privacy
    const ipHash = crypto.createHash('sha256').update(ipStr).digest('hex');
    const userAgent = req.headers['user-agent'] || null;

    const userId = req.session?.user?.id || null;
    const userEmail = req.session?.user?.email || null;

    await prisma.visitorLog.create({
      data: {
        ipHash,
        userAgent,
        path: path || '/',
        userId,
        userEmail,
      },
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Analytics tracking error:', err);
    // Return 500 but fail gracefully to not break user experience
    return res.status(500).json({ message: 'Lỗi ghi nhận thống kê.' });
  }
});

export default router;
