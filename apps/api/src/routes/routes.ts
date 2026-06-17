import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';
import { LocalRouteProvider } from '../providers/local/LocalRouteProvider.js';
import { normalizeWeatherPresets } from '../utils/weather.js';

const router = Router();

const WeatherEnum = z.enum(['normal', 'rain', 'hot', 'night'], {
  errorMap: () => ({ message: 'Thời tiết không hợp lệ.' }),
});

const SearchSchema = z.object({
  originStationId: z.string().uuid('ID điểm đi không hợp lệ.'),
  destinationStationId: z.string().uuid('ID điểm đến không hợp lệ.'),
  weatherPreset: WeatherEnum.optional().nullable(),
  weatherPresets: z.array(WeatherEnum).optional().nullable(),
  preferences: z.object({
    fewerTransfers: z.boolean().optional(),
    lessWalking: z.boolean().optional(),
    cheaper: z.boolean().optional(),
    accessible: z.boolean().optional(),
  }).optional(),
});

// 1. GET /api/weather/presets
router.get('/weather/presets', (_req: Request, res: Response) => {
  const presets = [
    {
      id: 'normal',
      name: 'Bình thường',
      description: 'Thời tiết mát mẻ, lý tưởng cho mọi lộ trình di chuyển xanh.',
    },
    {
      id: 'rain',
      name: 'Trời mưa',
      description: 'Đường trơn trượt, ưu tiên lộ trình sử dụng Metro có mái che và hạn chế đi bộ.',
    },
    {
      id: 'hot',
      name: 'Nắng nóng',
      description: 'Nhiệt độ ngoài trời cao, ưu tiên Metro máy lạnh và giảm thời gian đi bộ.',
    },
    {
      id: 'night',
      name: 'Trời tối',
      description: 'Hạn chế đi bộ chặng xa ngoài trời vào ban đêm để bảo đảm an toàn.',
    },
  ];
  return res.status(200).json(presets);
});

// 2. POST /api/routes/search
router.post('/routes/search', async (req: Request, res: Response) => {
  try {
    const parseResult = SearchSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0].message,
      });
    }

    const { originStationId, destinationStationId, weatherPreset, weatherPresets, preferences } = parseResult.data;

    // 1. Validation - origin and destination cannot be identical
    if (originStationId === destinationStationId) {
      return res.status(400).json({
        message: 'Điểm xuất phát và điểm đến không được trùng nhau.',
      });
    }

    // 2. Fetch stations from database
    const [originSt, destSt] = await Promise.all([
      prisma.station.findUnique({ where: { id: originStationId } }),
      prisma.station.findUnique({ where: { id: destinationStationId } }),
    ]);

    if (!originSt) {
      return res.status(404).json({
        message: 'Trạm xuất phát không tồn tại trong hệ thống.',
      });
    }
    if (!destSt) {
      return res.status(404).json({
        message: 'Trạm kết thúc không tồn tại trong hệ thống.',
      });
    }

    // Normalize presets using the pure helper function
    const normalizedConditions = normalizeWeatherPresets(weatherPresets, weatherPreset);

    // 3. Find routes
    const routeProvider = new LocalRouteProvider();
    
    // Convert presets to weather context attributes
    let temperature = 28;
    if (normalizedConditions.includes('hot')) {
      temperature = 37;
    } else if (normalizedConditions.includes('rain')) {
      temperature = 25;
    }

    const routes = await routeProvider.findRoutes(
      { lat: originSt.lat, lng: originSt.lng, label: originSt.name },
      { lat: destSt.lat, lng: destSt.lng, label: destSt.name },
      new Date(),
      preferences,
      {
        condition: normalizedConditions[0], // primary condition for backward compatibility
        conditions: normalizedConditions,
        temperature
      }
    );

    if (routes.length === 0) {
      return res.status(404).json({
        message: 'Không tìm thấy lộ trình di chuyển phù hợp giữa hai ga/trạm này.',
      });
    }

    return res.status(200).json(routes);
  } catch (err: any) {
    console.error('Route search error:', err);
    return res.status(500).json({
      message: 'Có lỗi xảy ra trong quá trình tìm đường.',
    });
  }
});

export default router;
