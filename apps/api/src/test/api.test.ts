import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import { normalizeWeatherPresets } from '../utils/weather.js';

describe('EcoTransit API Integration Tests', () => {
  beforeAll(async () => {
    // Clear test users if any
    await prisma.user.deleteMany({
      where: { email: { in: ['test-register@ecotransit.vn', 'test-login@ecotransit.vn'] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['test-register@ecotransit.vn', 'test-login@ecotransit.vn'] } },
    });
    await prisma.$disconnect();
  });

  // 1. Healthz probe test
  it('GET /api/healthz should return 200 and liveness data', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('mode');
  });

  // 2. Readyz probe test
  it('GET /api/readyz should return 200 and connection state', async () => {
    const res = await request(app).get('/api/readyz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.details.database).toBe('connected');
  });

  // 3. Unauthenticated me probe
  it('GET /api/auth/me should fail with 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  // 4. Registration & Login integration flow
  it('Register and Login should establish session cookies successfully', async () => {
    const agent = request.agent(app); // Agent preserves cookies across requests

    // A. Register user
    const regRes = await agent.post('/api/auth/register').send({
      email: 'test-register@ecotransit.vn',
      password: 'TestPassword123',
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.user.email).toBe('test-register@ecotransit.vn');
    expect(regRes.body.user.role).toBe('USER');

    // Verify email in DB manually to allow login
    await prisma.user.update({
      where: { email: 'test-register@ecotransit.vn' },
      data: { emailVerified: true },
    });

    // B. Log in to establish authenticated session
    const loginRes = await agent.post('/api/auth/login').send({
      email: 'test-register@ecotransit.vn',
      password: 'TestPassword123',
    });
    expect(loginRes.status).toBe(200);

    // C. Check Me (Cookie should be sent automatically by agent)
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('test-register@ecotransit.vn');

    // D. Logout user
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    // D. Me should now fail
    const meFailRes = await agent.get('/api/auth/me');
    expect(meFailRes.status).toBe(401);
  });

  // 5. Stations test
  it('GET /api/stations should return list of seeded stations', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('lineName');
  });

  // 6. Stations search accent-insensitive
  it('GET /api/stations?q=Ben%20Thanh should find Bến Thành station', async () => {
    const res = await request(app).get('/api/stations?q=Ben%20Thanh');
    expect(res.status).toBe(200);
    expect(res.body.some((s: any) => s.name === 'Bến Thành')).toBe(true);
  });

  // 7. Station detail and POIs
  it('GET /api/stations/:id should return station details and nearby POIs', async () => {
    const listRes = await request(app).get('/api/stations?q=Ben%20Thanh');
    const benThanh = listRes.body.find((s: any) => s.name === 'Bến Thành');
    expect(benThanh).toBeDefined();

    const res = await request(app).get(`/api/stations/${benThanh.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bến Thành');
    expect(Array.isArray(res.body.pois)).toBe(true);
  });

  // 8. Dijkstra route search
  it('POST /api/routes/search should calculate routes between Bến Thành and Thảo Điền', async () => {
    const listRes = await request(app).get('/api/stations');
    const benThanh = listRes.body.find((s: any) => s.name === 'Bến Thành');
    const thaoDien = listRes.body.find((s: any) => s.name === 'Thảo Điền');

    expect(benThanh).toBeDefined();
    expect(thaoDien).toBeDefined();

    const res = await request(app)
      .post('/api/routes/search')
      .send({
        originStationId: benThanh.id,
        destinationStationId: thaoDien.id,
        weatherPreset: 'normal',
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    const route = res.body[0];
    expect(route).toHaveProperty('score');
    expect(route).toHaveProperty('totalTimeMinutes');
    expect(route.legs.length).toBeGreaterThan(0);
  });

  // 9. Route search error handling
  it('POST /api/routes/search with invalid inputs should return appropriate errors', async () => {
    const listRes = await request(app).get('/api/stations');
    const benThanh = listRes.body.find((s: any) => s.name === 'Bến Thành');

    const resSame = await request(app)
      .post('/api/routes/search')
      .send({
        originStationId: benThanh.id,
        destinationStationId: benThanh.id,
        weatherPreset: 'normal',
      });
    expect(resSame.status).toBe(400);

    const resMissing = await request(app)
      .post('/api/routes/search')
      .send({
        originStationId: benThanh.id,
      });
    expect(resMissing.status).toBe(400);
  });

  // 10. Weather normalization unit tests
  describe('normalizeWeatherPresets Unit Tests', () => {
    it('should fallback to ["normal"] when input is undefined, null, or empty', () => {
      expect(normalizeWeatherPresets(undefined, undefined)).toEqual(['normal']);
      expect(normalizeWeatherPresets(null, null)).toEqual(['normal']);
      expect(normalizeWeatherPresets([], null)).toEqual(['normal']);
      expect(normalizeWeatherPresets(undefined, null)).toEqual(['normal']);
    });

    it('should prioritize weatherPresets over weatherPreset when both are present', () => {
      expect(normalizeWeatherPresets(['rain'], 'hot')).toEqual(['rain']);
      expect(normalizeWeatherPresets(['hot', 'night'], 'rain')).toEqual(['hot', 'night']);
    });

    it('should fallback to weatherPreset if weatherPresets is not defined', () => {
      expect(normalizeWeatherPresets(undefined, 'hot')).toEqual(['hot']);
      expect(normalizeWeatherPresets(null, 'rain')).toEqual(['rain']);
    });

    it('should remove normal if other conditions are present', () => {
      expect(normalizeWeatherPresets(['normal', 'rain'], undefined)).toEqual(['rain']);
      expect(normalizeWeatherPresets(['normal', 'rain', 'night'], undefined)).toEqual(['rain', 'night']);
      expect(normalizeWeatherPresets(undefined, 'normal')).toEqual(['normal']);
    });

    it('should deduplicate conditions', () => {
      expect(normalizeWeatherPresets(['rain', 'rain', 'night'], undefined)).toEqual(['rain', 'night']);
    });
  });

  // 11. Multi-weather API tests
  describe('API Multi-weather Routing & Normalization Tests', () => {
    let benThanh: any;
    let thaoDien: any;
    let suoiTien: any;

    beforeAll(async () => {
      const listRes = await request(app).get('/api/stations');
      benThanh = listRes.body.find((s: any) => s.name === 'Bến Thành');
      thaoDien = listRes.body.find((s: any) => s.name === 'Thảo Điền');
      suoiTien = listRes.body.find((s: any) => s.name === 'Suối Tiên' || s.name.includes('Suối Tiên'));
    });

    it('POST /api/routes/search with weatherPreset: "rain" (backward compatibility) works', async () => {
      const res = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPreset: 'rain',
        });
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].explanation).toContain('mưa');
    });

    it('POST /api/routes/search with weatherPresets: ["rain", "night"] works', async () => {
      const res = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: ['rain', 'night'],
        });
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].explanation).toContain('Trong điều kiện trời mưa và trời tối');
    });

    it('POST /api/routes/search with weatherPresets: ["normal", "rain"] normalizes to rain', async () => {
      const res = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: ['normal', 'rain'],
        });
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].explanation).toContain('Trời mưa');
      expect(res.body[0].explanation).not.toContain('Bình thường');
    });

    it('POST /api/routes/search with weatherPresets: [] falls back to normal', async () => {
      const res = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: [],
        });
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].explanation).toContain('Thời tiết mát mẻ');
    });

    it('POST /api/routes/search with both weatherPreset and weatherPresets prioritizing weatherPresets', async () => {
      const res = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPreset: 'hot',
          weatherPresets: ['rain'],
        });
      expect(res.status).toBe(200);
      expect(res.body[0].explanation).toContain('Trời mưa');
      expect(res.body[0].explanation).not.toContain('nắng nóng');
    });

    it('POST /api/routes/search with invalid enum (abc) should return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPreset: 'abc',
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Thời tiết không hợp lệ');

      const resArr = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: ['rain', 'storm'],
        });
      expect(resArr.status).toBe(400);
      expect(resArr.body.message).toContain('Thời tiết không hợp lệ');
    });

    it('POST /api/routes/search checks explanation for rain+night and hot+night is natural Vietnamese', async () => {
      const resRainNight = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: ['rain', 'night'],
        });
      expect(resRainNight.body[0].explanation).toBe(
        'Trong điều kiện trời mưa và trời tối, EcoTransit tối ưu hóa lộ trình di chuyển an toàn, ưu tiên Metro và tránh các đoạn đi bộ trơn trượt vào ban đêm.'
      );

      const resHotNight = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: ['hot', 'night'],
        });
      expect(resHotNight.body[0].explanation).toBe(
        'Trong điều kiện nắng nóng và trời tối, EcoTransit tối ưu hóa lộ trình mát mẻ, di chuyển an toàn và tránh đi bộ chặng xa.'
      );
    });

    it('should find routes for Bến Thành -> Thảo Điền or Bến Thành -> Suối Tiên successfully', async () => {
      const resThaoDien = await request(app)
        .post('/api/routes/search')
        .send({
          originStationId: benThanh.id,
          destinationStationId: thaoDien.id,
          weatherPresets: ['rain', 'night'],
        });
      expect(resThaoDien.status).toBe(200);
      expect(resThaoDien.body.length).toBeGreaterThan(0);

      if (suoiTien) {
        const resSuoiTien = await request(app)
          .post('/api/routes/search')
          .send({
            originStationId: benThanh.id,
            destinationStationId: suoiTien.id,
            weatherPresets: ['rain', 'night'],
          });
        expect(resSuoiTien.status).toBe(200);
        expect(resSuoiTien.body.length).toBeGreaterThan(0);
      }
    });
  });
});
