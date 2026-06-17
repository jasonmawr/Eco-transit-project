import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { Jimp } from 'jimp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

const router = Router();

// Configure Multer for memory storage (file size check done programmatically)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB hard limit
}).single('ticketImage');

const UploadBodySchema = z.object({
  type: z.enum(['metro', 'bus', 'ebus', 'other']).default('other'),
  stationId: z.string().uuid().optional().nullable(),
  routeLabel: z.string().max(100).optional().nullable(),
  amount: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().optional().nullable()),
  tripDate: z.string().optional().nullable(), // expecting 'YYYY-MM-DD'
});

// 1. POST /api/tickets/upload
router.post('/tickets/upload', requireAuth, (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'Kích thước tệp vượt quá giới hạn cho phép (Tối đa 2MB).',
        });
      }
      return res.status(400).json({
        message: 'Lỗi trong quá trình tải tệp lên.',
        error: err.message,
      });
    }

    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: 'Không tìm thấy thông tin phiên đăng nhập.' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tệp ảnh vé xe.' });
      }

      const fileBuffer = req.file.buffer;
      if (fileBuffer.length === 0) {
        return res.status(400).json({ message: 'Tệp tải lên trống (0 bytes).' });
      }

      // Reject SVGs explicitly
      const originalName = req.file.originalname || '';
      const fileExt = path.extname(originalName).toLowerCase();
      const mimeType = req.file.mimetype || '';
      if (fileExt === '.svg' || mimeType.includes('svg') || mimeType.includes('xml')) {
        return res.status(400).json({ message: 'Định dạng SVG không được chấp nhận. Chỉ nhận JPG/PNG/WEBP.' });
      }

      // Allow only JPG, PNG, WEBP
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ message: 'Định dạng tệp không hợp lệ. Chỉ nhận JPG/PNG/WEBP.' });
      }

      // 2. Reject fake images that fail to decode
      let image: any;
      try {
        image = await Jimp.read(fileBuffer);
      } catch (decodeErr) {
        return res.status(400).json({ message: 'Tệp tải lên không phải ảnh hợp lệ hoặc không giải mã được.' });
      }

      // Validate other metadata using Zod
      const parseResult = UploadBodySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: parseResult.error.errors[0].message });
      }
      const { type, stationId, routeLabel, amount, tripDate } = parseResult.data;

      // Validate HTML tags to prevent XSS
      const htmlTagRegex = /<\/?[a-zA-Z][\s\S]*?>/;
      if (routeLabel && htmlTagRegex.test(routeLabel)) {
        return res.status(400).json({
          message: 'Nội dung đầu vào không được chứa thẻ HTML.',
        });
      }

      // Validate stationId exists if provided
      if (stationId) {
        const stationExists = await prisma.station.findUnique({ where: { id: stationId } });
        if (!stationExists) {
          return res.status(400).json({ message: 'Ga tàu được chọn không tồn tại.' });
        }
      }

      // 3. Prevent duplicate upload by user using SHA-256 contentHash
      const contentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const existingTicket = await prisma.ticket.findFirst({
        where: {
          userId: sessionUser.id,
          duplicateHash: contentHash,
        },
      });

      if (existingTicket) {
        return res.status(409).json({ message: 'Bạn đã tải lên vé này trước đó.' });
      }

      // 4. Process and Compress Image with Jimp
      // Resize to max width 800px preserving ratio
      if (image.width > 800) {
        image.resize({ w: 800 });
      }

      // Quality starting at 75%
      let quality = 75;
      let processedBuffer = await image.getBuffer('image/jpeg', { quality });

      // Sequentially lower quality to 65% or 60% if the image size still exceeds 500KB
      if (processedBuffer.length > 500 * 1024) {
        quality = 65;
        processedBuffer = await image.getBuffer('image/jpeg', { quality });
      }
      if (processedBuffer.length > 500 * 1024) {
        quality = 60;
        processedBuffer = await image.getBuffer('image/jpeg', { quality });
      }

      // Save processed file using random UUID filename (prevents traversal & path leaks)
      const filename = `${crypto.randomUUID()}.jpg`;
      const uploadDir = path.resolve(config.UPLOAD_DIR);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const targetFilePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(targetFilePath, processedBuffer);

      // Mock OCR simulation
      const mockOcrText = `MOCK OCR: Vé ${type === 'metro' ? 'Metro' : type === 'bus' ? 'Xe buýt' : type === 'ebus' ? 'Xe buýt điện' : 'Di chuyển'} - ${routeLabel || 'Tuyến xanh'}. Phân tích ngày: ${new Date().toLocaleDateString('vi-VN')}`;

      // 5. Save Ticket to DB
      const ticket = await prisma.ticket.create({
        data: {
          userId: sessionUser.id,
          status: 'pending',
          type,
          stationId: stationId || null,
          routeLabel: routeLabel || null,
          amount: amount || null,
          tripDate: tripDate ? new Date(tripDate) : null,
          originalFileName: originalName,
          mimeType: 'image/jpeg',
          sizeBytes: processedBuffer.length,
          imagePath: targetFilePath,
          duplicateHash: contentHash,
          ocrStatus: 'mocked',
          ocrText: mockOcrText,
          confidenceScore: 0.88,
        },
      });

      // Construct a secure imageUrl referencing the local serving endpoint
      const imageUrl = `/api/tickets/thumbnail/${ticket.id}`;
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { imageUrl },
      });

      return res.status(201).json({
        message: 'Tải lên vé xe xanh thành công. Vé đang ở trạng thái chờ duyệt.',
        ticket: {
          id: ticket.id,
          type: ticket.type,
          status: 'pending',
          routeLabel: ticket.routeLabel,
          createdAt: ticket.createdAt,
          imageUrl,
        },
      });
    } catch (err: any) {
      console.error('Upload ticket error:', err);
      return res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình xử lý vé.' });
    }
  });
});

// 2. GET /api/tickets/mine
router.get('/tickets/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const sessionUser = req.session.user!;
    const tickets = await prisma.ticket.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        station: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Clean DTO scrub: absolutely no userId, email, reviewerId, or raw server paths
    const scrubbed = tickets.map((t) => ({
      id: t.id,
      imageUrl: t.imageUrl,
      ocrText: t.ocrText,
      status: t.status,
      confidenceScore: t.confidenceScore,
      tripDate: t.tripDate,
      type: t.type,
      stationName: t.station?.name || null,
      routeLabel: t.routeLabel,
      amount: t.amount,
      originalFileName: t.originalFileName,
      mimeType: t.mimeType,
      sizeBytes: t.sizeBytes,
      ocrStatus: t.ocrStatus,
      reviewNote: t.reviewNote,
      reviewedAt: t.reviewedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json(scrubbed);
  } catch (err: any) {
    console.error('Fetch mine tickets error:', err);
    return res.status(500).json({ message: 'Lỗi tải danh sách vé di chuyển.' });
  }
});

// 3. GET /api/tickets/thumbnail/:id
router.get('/tickets/thumbnail/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin vé.' });
    }

    // Authorization: owner, admin, or moderator only
    const sessionUser = req.session.user!;
    if (ticket.userId !== sessionUser.id && sessionUser.role !== 'ADMIN' && sessionUser.role !== 'MODERATOR') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập vào hình ảnh này.' });
    }

    if (!ticket.imagePath) {
      return res.status(404).json({ message: 'Hình ảnh vé không khả dụng.' });
    }

    // Path traversal validation
    const absoluteFilePath = path.resolve(ticket.imagePath);
    const uploadDir = path.resolve(config.UPLOAD_DIR);
    if (!absoluteFilePath.startsWith(uploadDir)) {
      return res.status(403).json({ message: 'Thao tác không được phép.' });
    }

    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({ message: 'Tệp hình ảnh không tồn tại trên hệ thống.' });
    }

    return res.sendFile(absoluteFilePath);
  } catch (err: any) {
    console.error('Serve thumbnail error:', err);
    return res.status(500).json({ message: 'Lỗi trong quá trình hiển thị ảnh vé.' });
  }
});

export default router;
