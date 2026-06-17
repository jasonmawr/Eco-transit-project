import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';

describe('EcoTransit Moderator/Admin Console Integration Tests', () => {
  let userAgent: any;
  let adminAgent: any;
  let modAgent: any;

  let userId: string;
  let adminId: string;
  let modId: string;
  let testStationId: string;

  beforeAll(async () => {
    // 1. Clean up old test accounts
    await prisma.place.deleteMany({ where: { slug: 'test-admin-place-slug' } });
    await prisma.guide.deleteMany({ where: { slug: 'test-admin-guide-slug' } });
    await prisma.voucher.deleteMany({ where: { slug: 'test-admin-voucher-slug' } });

    await prisma.pointsLedger.deleteMany({
      where: {
        user: {
          email: { in: ['user-admin-t@ecotransit.vn', 'admin-admin-t@ecotransit.vn', 'mod-admin-t@ecotransit.vn'] }
        }
      }
    });
    await prisma.userWallet.deleteMany({
      where: {
        user: {
          email: { in: ['user-admin-t@ecotransit.vn', 'admin-admin-t@ecotransit.vn', 'mod-admin-t@ecotransit.vn'] }
        }
      }
    });
    await prisma.uGCReview.deleteMany({
      where: {
        user: {
          email: { in: ['user-admin-t@ecotransit.vn', 'admin-admin-t@ecotransit.vn', 'mod-admin-t@ecotransit.vn'] }
        }
      }
    });
    await prisma.ticket.deleteMany({
      where: {
        user: {
          email: { in: ['user-admin-t@ecotransit.vn', 'admin-admin-t@ecotransit.vn', 'mod-admin-t@ecotransit.vn'] }
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: ['user-admin-t@ecotransit.vn', 'admin-admin-t@ecotransit.vn', 'mod-admin-t@ecotransit.vn'] }
      }
    });

    // 2. Register users
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/register').send({
      email: 'user-admin-t@ecotransit.vn',
      password: 'UserPassword123'
    });
    const uUser = await prisma.user.findUnique({ where: { email: 'user-admin-t@ecotransit.vn' } });
    userId = uUser!.id;

    adminAgent = request.agent(app);
    await adminAgent.post('/api/auth/register').send({
      email: 'admin-admin-t@ecotransit.vn',
      password: 'AdminPassword123'
    });
    const uAdmin = await prisma.user.update({
      where: { email: 'admin-admin-t@ecotransit.vn' },
      data: { role: 'ADMIN' }
    });
    adminId = uAdmin.id;
    // Log in again to bind the ADMIN role session
    await adminAgent.post('/api/auth/login').send({
      email: 'admin-admin-t@ecotransit.vn',
      password: 'AdminPassword123'
    });

    modAgent = request.agent(app);
    await modAgent.post('/api/auth/register').send({
      email: 'mod-admin-t@ecotransit.vn',
      password: 'ModPassword123'
    });
    const uMod = await prisma.user.update({
      where: { email: 'mod-admin-t@ecotransit.vn' },
      data: { role: 'MODERATOR' }
    });
    modId = uMod.id;
    // Log in again to bind the MODERATOR role session
    await modAgent.post('/api/auth/login').send({
      email: 'mod-admin-t@ecotransit.vn',
      password: 'ModPassword123'
    });

    // Grab or seed a test station
    let station = await prisma.station.findFirst();
    if (!station) {
      station = await prisma.station.create({
        data: {
          name: 'Ga Test Admin',
          lineName: 'Metro Tuyến 1',
          orderNumber: 99,
          lat: 10.7712,
          lng: 106.6976
        }
      });
    }
    testStationId = station.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.place.deleteMany({ where: { slug: 'test-admin-place-slug' } });
    await prisma.guide.deleteMany({ where: { slug: 'test-admin-guide-slug' } });
    await prisma.voucher.deleteMany({ where: { slug: 'test-admin-voucher-slug' } });

    await prisma.pointsLedger.deleteMany({ where: { userId: { in: [userId, adminId, modId] } } });
    await prisma.userWallet.deleteMany({ where: { userId: { in: [userId, adminId, modId] } } });
    await prisma.uGCReview.deleteMany({ where: { userId: { in: [userId, adminId, modId] } } });
    await prisma.ticket.deleteMany({ where: { userId: { in: [userId, adminId, modId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, adminId, modId] } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: [userId, adminId, modId] } } });
    await prisma.$disconnect();
  });

  describe('Auth/Role guards', () => {
    it('should return 401 for unauthenticated calls', async () => {
      const res = await request(app).get('/api/admin/overview');
      expect(res.status).toBe(401);
    });

    it('should return 403 for typical USER role', async () => {
      const res = await userAgent.get('/api/admin/overview');
      expect(res.status).toBe(403);
    });

    it('should return 200 for ADMIN role', async () => {
      const res = await adminAgent.get('/api/admin/overview');
      expect(res.status).toBe(200);
    });

    it('should return 200 for MODERATOR role', async () => {
      const res = await modAgent.get('/api/admin/overview');
      expect(res.status).toBe(200);
    });
  });

  describe('Overview API', () => {
    it('GET /api/admin/overview returns counts and short audit logs', async () => {
      const res = await adminAgent.get('/api/admin/overview');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pendingReviewsCount');
      expect(res.body).toHaveProperty('pendingTicketsCount');
      expect(res.body).toHaveProperty('activeVouchersCount');
      expect(res.body).toHaveProperty('totalPointsIssued');
      expect(res.body).toHaveProperty('totalPointsSpent');
      expect(Array.isArray(res.body.recentAuditLogs)).toBe(true);
    });
  });

  describe('Review Moderation', () => {
    let reviewId: string;

    beforeAll(async () => {
      const rev = await prisma.uGCReview.create({
        data: {
          userId,
          stationId: testStationId,
          rating: 4,
          content: 'Test review contents for admin check.',
          status: 'pending',
          displayName: 'Test Reviewer'
        }
      });
      reviewId = rev.id;
    });

    it('GET /api/admin/reviews should list reviews', async () => {
      const res = await adminAgent.get('/api/admin/reviews?status=pending');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((r: any) => r.id === reviewId);
      expect(found).toBeDefined();
    });

    it('POST /api/admin/reviews/:id/moderate should approve and create AuditLog', async () => {
      const res = await adminAgent
        .post(`/api/admin/reviews/${reviewId}/moderate`)
        .send({ decision: 'approved', note: 'Approve review' });

      expect(res.status).toBe(200);
      expect(res.body.review.status).toBe('approved');
      expect(res.body.review.moderationNote).toBe('Approve review');

      // Verify AuditLog
      const audit = await prisma.auditLog.findFirst({
        where: { actorUserId: adminId, action: 'moderate_review', entityId: reviewId }
      });
      expect(audit).toBeDefined();
      expect(audit?.summary).toContain('approved');
    });

    it('Public review endpoint should only return approved reviews', async () => {
      // Create another pending review
      const revPending = await prisma.uGCReview.create({
        data: {
          userId,
          stationId: testStationId,
          rating: 2,
          content: 'Secret pending review detail.',
          status: 'pending',
          displayName: 'Secret Reviewer'
        }
      });

      const res = await request(app).get(`/api/reviews?stationId=${testStationId}`);
      expect(res.status).toBe(200);
      
      const foundPending = res.body.some((r: any) => r.id === revPending.id);
      expect(foundPending).toBe(false);

      const foundApproved = res.body.some((r: any) => r.id === reviewId);
      expect(foundApproved).toBe(true);

      // Clean up the pending review
      await prisma.uGCReview.delete({ where: { id: revPending.id } });
    });

    it('POST /api/admin/reviews/:id/moderate should reject and save note', async () => {
      const rev = await prisma.uGCReview.create({
        data: {
          userId,
          stationId: testStationId,
          rating: 1,
          content: 'Test review contents to reject.',
          status: 'pending',
          displayName: 'Reject Reviewer'
        }
      });

      const res = await adminAgent
        .post(`/api/admin/reviews/${rev.id}/moderate`)
        .send({ decision: 'rejected', note: 'Bad review content' });

      expect(res.status).toBe(200);
      expect(res.body.review.status).toBe('rejected');
      expect(res.body.review.moderationNote).toBe('Bad review content');
    });
  });

  describe('Ticket Moderation', () => {
    let ticketId: string;

    beforeAll(async () => {
      const ticket = await prisma.ticket.create({
        data: {
          userId,
          status: 'pending',
          type: 'metro',
          routeLabel: 'Tuyến xanh 1',
          originalFileName: 'ticket_test.jpg',
          ocrText: 'MOCK OCR: Metro 1',
          ocrStatus: 'mocked'
        }
      });
      ticketId = ticket.id;
    });

    it('GET /api/admin/tickets lists tickets without raw system paths', async () => {
      const res = await adminAgent.get('/api/admin/tickets');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      const first = res.body[0];
      expect(first).not.toHaveProperty('imagePath');
      expect(first).not.toHaveProperty('thumbnailPath');
      expect(first).not.toHaveProperty('userEmail');
    });

    it('POST /api/admin/tickets/:id/review awards points and is idempotent', async () => {
      await prisma.userWallet.create({
        data: { userId, balance: 0 }
      });

      // 1. Approve ticket and award 50 points
      const res1 = await adminAgent
        .post(`/api/admin/tickets/${ticketId}/review`)
        .send({ decision: 'approved', points: 50, note: 'Looks perfect' });

      expect(res1.status).toBe(200);
      expect(res1.body.ticket.status).toBe('verified');

      const walletAfter = await prisma.userWallet.findUnique({ where: { userId } });
      expect(walletAfter?.balance).toBe(50);

      // Verify AuditLog
      const audit = await prisma.auditLog.findFirst({
        where: { actorUserId: adminId, action: 'review_ticket', entityId: ticketId }
      });
      expect(audit).toBeDefined();

      // 2. Call again with identical decision -> idempotent return 200, no extra points
      const res2 = await adminAgent
        .post(`/api/admin/tickets/${ticketId}/review`)
        .send({ decision: 'approved', points: 50, note: 'Looks perfect' });

      expect(res2.status).toBe(200);
      const walletDouble = await prisma.userWallet.findUnique({ where: { userId } });
      expect(walletDouble?.balance).toBe(50); // Still 50, not 100!
    });

    it('POST /api/admin/tickets/:id/review rejection does not award points', async () => {
      const t = await prisma.ticket.create({
        data: {
          userId,
          status: 'pending',
          type: 'bus',
          routeLabel: 'Tuyến số 19',
          originalFileName: 'ticket_bus.jpg'
        }
      });

      const res = await adminAgent
        .post(`/api/admin/tickets/${t.id}/review`)
        .send({ decision: 'rejected', note: 'Wrong category' });

      expect(res.status).toBe(200);
      expect(res.body.ticket.status).toBe('rejected');

      const wallet = await prisma.userWallet.findUnique({ where: { userId } });
      expect(wallet?.balance).toBe(50); // Remain unchanged
    });
  });

  describe('POI/Places Management', () => {
    let placeId: string;

    it('POST /api/admin/places creates place and rejects HTML', async () => {
      // 1. Valid create
      const res1 = await adminAgent.post('/api/admin/places').send({
        name: 'Địa điểm test admin',
        slug: 'test-admin-place-slug',
        category: 'cafe',
        stationId: testStationId,
        lat: 10.7712,
        lng: 106.6976,
        shortDescription: 'Mô tả ngắn test admin',
        isPublished: true
      });
      expect(res1.status).toBe(201);
      placeId = res1.body.id;

      // 2. Invalid create with HTML
      const res2 = await adminAgent.post('/api/admin/places').send({
        name: '<div>Hack HTML</div>',
        slug: 'test-html-slug',
        category: 'cafe',
        stationId: testStationId,
        lat: 10.7712,
        lng: 106.6976,
        shortDescription: 'Mô tả ngắn html'
      });
      expect(res2.status).toBe(400);
    });

    it('PATCH /api/admin/places/:id updates details', async () => {
      const res = await adminAgent
        .patch(`/api/admin/places/${placeId}`)
        .send({ isPublished: false, name: 'Tên địa điểm cập nhật' });

      expect(res.status).toBe(200);
      expect(res.body.isPublished).toBe(false);
      expect(res.body.name).toBe('Tên địa điểm cập nhật');
    });
  });

  describe('Guides Management', () => {
    let guideId: string;

    it('POST /api/admin/guides creates guide and rejects HTML', async () => {
      // 1. Valid create
      const res1 = await adminAgent.post('/api/admin/guides').send({
        title: 'Cẩm nang test admin',
        slug: 'test-admin-guide-slug',
        excerpt: 'Mô tả ngắn cẩm nang',
        content: 'Nội dung plain text cẩm nang.',
        isPublished: true
      });
      expect(res1.status).toBe(201);
      guideId = res1.body.id;

      // 2. Invalid create with HTML
      const res2 = await adminAgent.post('/api/admin/guides').send({
        title: 'Cẩm nang hack',
        slug: 'test-html-guide-slug',
        excerpt: 'Excerpt hack',
        content: '<p>Hack HTML tag</p>'
      });
      expect(res2.status).toBe(400);
    });

    it('PATCH /api/admin/guides/:id updates details', async () => {
      const res = await adminAgent
        .patch(`/api/admin/guides/${guideId}`)
        .send({ isPublished: false, title: 'Cẩm nang cập nhật' });

      expect(res.status).toBe(200);
      expect(res.body.isPublished).toBe(false);
      expect(res.body.title).toBe('Cẩm nang cập nhật');
    });
  });

  describe('Vouchers Management', () => {
    let voucherId: string;

    it('POST /api/admin/vouchers creates voucher and maps older fields', async () => {
      const res = await adminAgent.post('/api/admin/vouchers').send({
        name: 'Voucher test admin',
        slug: 'test-admin-voucher-slug',
        pointsCost: 150,
        stockTotal: 20,
        stockRemaining: 20,
        perUserLimit: 2,
        brandName: 'Highlands Coffee',
        category: 'drink',
        description: 'Mô tả voucher admin test',
        isActive: true
      });
      expect(res.status).toBe(201);
      expect(res.body.cost).toBe(150); // cost sync mapping
      expect(res.body.quantity).toBe(20); // quantity sync mapping
      voucherId = res.body.id;
    });

    it('PATCH /api/admin/vouchers/:id updates details', async () => {
      const res = await adminAgent
        .patch(`/api/admin/vouchers/${voucherId}`)
        .send({ isActive: false, stockTotal: 30 });

      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(false);
      expect(res.body.quantity).toBe(30); // quantity sync mapping
    });
  });

  describe('Audit Logs API', () => {
    it('GET /api/admin/audit-logs requires ADMIN/MODERATOR role and filters entries', async () => {
      // Non admin access denied
      const resDeny = await userAgent.get('/api/admin/audit-logs');
      expect(resDeny.status).toBe(403);

      // Admin access allowed
      const res = await adminAgent.get('/api/admin/audit-logs?action=moderate_review');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Audit logs must not expose passwords or secrets
      const hasPass = res.body.some((l: any) => l.summary.includes('password') || (l.metadata && l.metadata.password));
      expect(hasPass).toBe(false);
    });
  });
});
