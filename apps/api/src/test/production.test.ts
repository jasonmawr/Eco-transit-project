import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import fs from 'fs';

describe('Production-Ready Features Integration Tests', () => {
  let testUser: any;
  let userAgent: any;

  beforeEach(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: 'prod-tester@ecotransit.vn' } });

    // Register user
    const resReg = await request(app).post('/api/auth/register').send({
      email: 'prod-tester@ecotransit.vn',
      password: 'Password123',
    });
    testUser = resReg.body.user;

    // Verify user
    await prisma.user.update({
      where: { id: testUser.id },
      data: { emailVerified: true },
    });

    // Log in
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/login').send({
      email: 'prod-tester@ecotransit.vn',
      password: 'Password123',
    });
  });

  afterEach(async () => {
    if (testUser?.id) {
      await prisma.ticket.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.userWallet.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    vi.restoreAllMocks();
  });

  describe('Base64 Database Fallback', () => {
    it('should save base64 fallback during upload and serve it when physical file is deleted', async () => {
      // 1. Upload a ticket
      const dummyBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b');
      
      const Jimp = await import('jimp');
      vi.spyOn(Jimp.Jimp, 'read').mockImplementation(() => {
        return Promise.resolve({
          width: 100,
          height: 100,
          resize: () => {},
          getBuffer: () => Promise.resolve(dummyBuffer),
        } as any);
      });

      const resUpload = await userAgent
        .post('/api/tickets/upload')
        .attach('ticketImage', dummyBuffer, 'test-ticket.jpg')
        .field('type', 'metro');

      expect(resUpload.status).toBe(201);
      const ticketId = resUpload.body.ticket.id;

      // Verify the ticket in DB has base64DataFallback
      const dbTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      expect(dbTicket).toBeDefined();
      expect(dbTicket?.base64DataFallback).toBeDefined();
      expect(dbTicket?.base64DataFallback?.length).toBeGreaterThan(0);

      // Verify physical file exists
      const filePath = dbTicket?.imagePath;
      expect(filePath).toBeDefined();
      expect(fs.existsSync(filePath!)).toBe(true);

      // 2. Serve from disk - should be 200 OK
      const resServe1 = await userAgent.get(`/api/tickets/thumbnail/${ticketId}`);
      expect(resServe1.status).toBe(200);

      // 3. Delete physical file to simulate Render server reset
      fs.unlinkSync(filePath!);
      expect(fs.existsSync(filePath!)).toBe(false);

      // 4. Serve again - should serve from base64 database fallback with 200 OK!
      const resServe2 = await userAgent.get(`/api/tickets/thumbnail/${ticketId}`);
      expect(resServe2.status).toBe(200);
      expect(resServe2.headers['content-type']).toContain('image/jpeg');
    });
  });

  describe('HTTP Security Headers', () => {
    it('should return standard security headers on API responses', async () => {
      const res = await request(app).get('/api/healthz');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  describe('API Rate Limiting', () => {
    it('should allow unlimited requests in test environment', async () => {
      // Send 12 requests (limit is 10)
      for (let i = 0; i < 12; i++) {
        const res = await request(app).post('/api/auth/login').send({
          email: 'nonexistent@ecotransit.vn',
          password: 'wrong',
        });
        expect(res.status).toBe(401); // not blocked by 429
      }
    });

    it('should trigger rate limiting on auth routes when NOT in test mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalVitest = process.env.VITEST;
      process.env.NODE_ENV = 'production'; // simulate production
      delete process.env.VITEST; // temporarily disable Vitest skip

      try {
        let lastStatus = 0;
        // Limit is 10 requests/minute. Send 12 requests.
        for (let i = 0; i < 12; i++) {
          const res = await request(app).post('/api/auth/login').send({
            email: 'nonexistent@ecotransit.vn',
            password: 'wrong',
          });
          lastStatus = res.status;
          if (res.status === 429) {
            expect(res.body.message).toContain('quá nhiều lần');
            break;
          }
        }
        expect(lastStatus).toBe(429);
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.VITEST = originalVitest;
      }
    });
  });

  describe('Access Analytics & Visitor Tracking', () => {
    it('should record page views on /api/analytics/track and secure the IP', async () => {
      // Delete previous visitor logs to avoid noise
      await prisma.visitorLog.deleteMany({});

      const trackRes = await request(app)
        .post('/api/analytics/track')
        .send({ path: '/test-page-route' })
        .set('User-Agent', 'Mozilla/5.0 TestBrowser');

      expect(trackRes.status).toBe(200);
      expect(trackRes.body.success).toBe(true);

      // Verify log in DB
      const logs = await prisma.visitorLog.findMany({});
      expect(logs.length).toBe(1);
      expect(logs[0].path).toBe('/test-page-route');
      expect(logs[0].userAgent).toBe('Mozilla/5.0 TestBrowser');
      expect(logs[0].ipHash).toBeDefined();
      expect(logs[0].ipHash.length).toBe(64); // SHA-256 length is 64 hex characters
    });

    it('should record user session details (userId & userEmail) when user is logged in', async () => {
      await prisma.visitorLog.deleteMany({});

      // Set admin role & login first
      await prisma.user.update({
        where: { id: testUser.id },
        data: { role: 'ADMIN' },
      });
      await userAgent.post('/api/auth/login').send({
        email: 'prod-tester@ecotransit.vn',
        password: 'Password123',
      });

      // Send track request with session agent
      const trackRes = await userAgent
        .post('/api/analytics/track')
        .send({ path: '/dashboard-page' });

      expect(trackRes.status).toBe(200);

      // Verify user fields in DB
      const logs = await prisma.visitorLog.findMany({});
      expect(logs.length).toBe(1);
      expect(logs[0].path).toBe('/dashboard-page');
      expect(logs[0].userId).toBe(testUser.id);
      expect(logs[0].userEmail).toBe('prod-tester@ecotransit.vn');
    });

    it('should block non-admins from accessing admin analytics statistics', async () => {
      // 1. Guest request
      const resGuest = await request(app).get('/api/admin/analytics');
      expect(resGuest.status).toBe(401);

      // 2. Regular user request
      const resUser = await userAgent.get('/api/admin/analytics');
      expect(resUser.status).toBe(403); // user exists but role is USER
    });

    it('should allow admin/moderator to fetch overview analytics stats', async () => {
      // Promote test user to ADMIN
      await prisma.user.update({
        where: { id: testUser.id },
        data: { role: 'ADMIN' },
      });

      // Relogin to pick up new role in session
      await userAgent.post('/api/auth/login').send({
        email: 'prod-tester@ecotransit.vn',
        password: 'Password123',
      });

      const resAdmin = await userAgent.get('/api/admin/analytics');
      expect(resAdmin.status).toBe(200);
      expect(resAdmin.body.totalPageViews).toBeDefined();
      expect(resAdmin.body.uniqueVisitors).toBeDefined();
      expect(resAdmin.body.totalUsers).toBeDefined();
      expect(resAdmin.body.totalRouteSearches).toBeDefined();
      expect(resAdmin.body.ticketStats).toBeDefined();
      expect(resAdmin.body.recentAccessLogs).toBeDefined();
    });
  });
});
