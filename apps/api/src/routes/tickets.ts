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

      let ocrText = '';
      let extractedType = type;
      let extractedDate: Date | null = tripDate ? new Date(tripDate) : null;
      let confidenceScore = 1.0;
      let serialNumber = '';
      let isTicketValid = true;
      let ocrStatus = 'completed';

      const isTestEnv = process.env.NODE_ENV === 'test';
      const isMockApiKey = config.GEMINI_API_KEY === 'mock-api-key';

      if (config.GEMINI_API_KEY && (!isTestEnv || isMockApiKey)) {
        try {
          const base64Image = processedBuffer.toString('base64');
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${config.GEMINI_API_KEY}`;
          const prompt = `Bạn là hệ thống AI phân tích và kiểm duyệt vé phương tiện công cộng xanh cho chiến dịch "Lướt khói chạm xanh".
Hãy phân tích hình ảnh vé xe được cung cấp. Thực hiện các bước sau:
1. Xác định xem hình ảnh này có phải là một chiếc vé xe buýt, vé tàu điện Metro, vé VinBus hoặc thẻ đi lại công cộng thật sự hay không (dạng giấy hoặc màn hình vé online đều được chấp nhận). Trả về isValid = true nếu đúng, ngược lại isValid = false.
2. Trích xuất loại phương tiện:
   - "metro": nếu là tàu điện đô thị (Metro Bến Thành - Suối Tiên, MRT...).
   - "bus": nếu là xe buýt đô thị thường.
   - "ebus": nếu là xe buýt điện VinBus.
   - "other": các loại vé/thẻ khác.
3. Trích xuất mã số vé / số sê-ri / số hóa đơn độc nhất in trên vé. Nếu không có số sê-ri rõ ràng, hãy tạo một chuỗi mã định danh duy nhất bằng cách kết hợp thông tin văn bản đọc được trên vé (ví dụ: ngày giờ + tuyến đường + mã số khác). Mã định danh này được sử dụng để kiểm tra trùng lặp và chống gian lận.
4. Trích xuất ngày đi trên vé (định dạng YYYY-MM-DD). Nếu không tìm thấy, trả về null.
5. Đánh giá mức độ tin cậy của phân tích (từ 0.0 đến 1.0).

Bạn phải trả về câu trả lời ở định dạng JSON duy nhất như sau:
{
  "isValid": true,
  "type": "metro" | "bus" | "ebus" | "other",
  "serialNumber": "chuỗi mã vé trích xuất",
  "tripDate": "YYYY-MM-DD" hoặc null,
  "confidenceScore": 0.95,
  "ocrText": "Toàn bộ văn bản trích xuất được từ vé"
}`;

          const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Image,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
              },
            }),
          });

          if (geminiResponse.ok) {
            const geminiData: any = await geminiResponse.json();
            const jsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
              const result = JSON.parse(jsonText.trim());
              isTicketValid = typeof result.isValid === 'boolean' ? result.isValid : true;
              extractedType = result.type || type;
              ocrText = result.ocrText || '';
              confidenceScore = typeof result.confidenceScore === 'number' ? result.confidenceScore : 0.8;
              serialNumber = (result.serialNumber || '').trim();
              if (result.tripDate) {
                const parsedDate = new Date(result.tripDate);
                if (!isNaN(parsedDate.getTime())) {
                  extractedDate = parsedDate;
                }
              }
            }
          } else {
            console.error('Gemini API returned error status:', geminiResponse.status);
            ocrStatus = 'failed';
            ocrText = 'Lỗi kết nối Gemini API.';
          }
        } catch (geminiErr) {
          console.error('Gemini ticket OCR analysis failed:', geminiErr);
          ocrStatus = 'failed';
          ocrText = 'Lỗi phân tích tự động từ Gemini AI.';
          confidenceScore = 0.5;
        }
      } else {
        ocrText = `MOCK OCR: Vé ${type === 'metro' ? 'Metro' : type === 'bus' ? 'Xe buýt' : type === 'ebus' ? 'Xe buýt điện' : 'Di chuyển'} - ${routeLabel || 'Tuyến xanh'}. Phân tích ngày: ${new Date().toLocaleDateString('vi-VN')}`;
        ocrStatus = 'mocked';
      }

      // 1. If not a valid ticket, reject upload with 400
      if (config.GEMINI_API_KEY && !isTicketValid) {
        if (fs.existsSync(targetFilePath)) {
          fs.unlinkSync(targetFilePath);
        }
        return res.status(400).json({
          message: 'Tệp tải lên không được nhận diện là vé phương tiện công cộng xanh hợp lệ. Vui lòng chụp rõ nét vé xe của bạn.',
        });
      }

      // 2. Check for duplicate serial number in DB (fraud prevention)
      if (serialNumber) {
        const duplicateTicket = await prisma.ticket.findFirst({
          where: {
            ocrText: {
              contains: `SERIAL:${serialNumber}`,
            },
          },
        });

        if (duplicateTicket) {
          if (fs.existsSync(targetFilePath)) {
            fs.unlinkSync(targetFilePath);
          }
          return res.status(409).json({
            message: 'Mã số vé này đã được tải lên hệ thống trước đó bởi một người dùng khác. Vui lòng không sử dụng lại vé để tích điểm.',
          });
        }
      }

      const finalOcrText = `SERIAL:${serialNumber}\nGEMINI OCR:\n${ocrText || 'Không có văn bản.'}`;

      // 5. Save Ticket to DB
      const ticket = await prisma.ticket.create({
        data: {
          userId: sessionUser.id,
          status: 'pending',
          type: extractedType,
          stationId: stationId || null,
          routeLabel: routeLabel || null,
          amount: amount || null,
          tripDate: extractedDate,
          originalFileName: originalName,
          mimeType: 'image/jpeg',
          sizeBytes: processedBuffer.length,
          imagePath: targetFilePath,
          duplicateHash: contentHash,
          ocrStatus: ocrStatus as any,
          ocrText: finalOcrText,
          confidenceScore,
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
    const scrubbed = tickets.map((t: any) => ({
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
