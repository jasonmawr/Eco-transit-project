import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import * as argon2 from 'argon2';
import { Jimp } from 'jimp';

describe('EcoTransit Ticket Upload & Green Points Ledger Integration Tests', () => {
  let userAgent: any;
  let adminAgent: any;
  let testUser: any;
  let testAdmin: any;
  let validImageBuffer: Buffer;
  const createdTicketIds: string[] = [];

  beforeAll(async () => {
    // 1. Generate a valid tiny JPEG buffer using Jimp 1.0 to simulate a real ticket image
    const img = new Jimp({ width: 10, height: 10 });
    validImageBuffer = await img.getBuffer('image/jpeg', { quality: 20 });

    // 2. Clear old test users
    await prisma.user.deleteMany({
      where: {
        email: { in: ['test-user-wallet@ecotransit.vn', 'test-admin-wallet@ecotransit.vn'] },
      },
    });

    const adminPass = await argon2.hash('AdminPassword123');

    // 3. Register standard user
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/register').send({
      email: 'test-user-wallet@ecotransit.vn',
      password: 'UserPassword123',
    });

    testUser = await prisma.user.findUnique({
      where: { email: 'test-user-wallet@ecotransit.vn' },
    });
    expect(testUser).toBeDefined();

    // 4. Create admin user
    await prisma.user.create({
      data: {
        email: 'test-admin-wallet@ecotransit.vn',
        passwordHash: adminPass,
        role: 'ADMIN',
      },
    });

    testAdmin = await prisma.user.findUnique({
      where: { email: 'test-admin-wallet@ecotransit.vn' },
    });
    expect(testAdmin).toBeDefined();

    adminAgent = request.agent(app);
    await adminAgent.post('/api/auth/login').send({
      email: 'test-admin-wallet@ecotransit.vn',
      password: 'AdminPassword123',
    });
  });

  afterAll(async () => {
    // Cleanup created tickets and wallets
    if (testUser) {
      await prisma.userWallet.deleteMany({ where: { userId: testUser.id } });
      await prisma.pointsLedger.deleteMany({ where: { userId: testUser.id } });
      await prisma.ticket.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    if (testAdmin) {
      await prisma.userWallet.deleteMany({ where: { userId: testAdmin.id } });
      await prisma.pointsLedger.deleteMany({ where: { userId: testAdmin.id } });
      await prisma.user.delete({ where: { id: testAdmin.id } });
    }
    await prisma.$disconnect();
  });

  // 1. Authentication Check
  it('should deny access to ticket upload and wallet endpoints when unauthenticated', async () => {
    const resUpload = await request(app).post('/api/tickets/upload').send({});
    expect(resUpload.status).toBe(401);

    const resMine = await request(app).get('/api/tickets/mine');
    expect(resMine.status).toBe(401);

    const resWallet = await request(app).get('/api/wallet/me');
    expect(resWallet.status).toBe(401);
  });

  // 2. Size and Format Validations
  it('should reject file uploads that violate size, format, or validity rules', async () => {
    // 0-byte file
    const resEmpty = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', Buffer.alloc(0), 'empty.jpg')
      .field('type', 'metro');
    expect(resEmpty.status).toBe(400);
    expect(resEmpty.body.message).toContain('trống');

    // > 2MB file
    const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024);
    const resLarge = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', largeBuffer, 'large.jpg')
      .field('type', 'metro');
    expect(resLarge.status).toBe(400);
    expect(resLarge.body.message).toContain('giới hạn');

    // SVG file
    const svgContent = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>');
    const resSvg = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', svgContent, 'vector.svg')
      .field('type', 'metro');
    expect(resSvg.status).toBe(400);
    expect(resSvg.body.message).toContain('SVG');

    // Invalid extension
    const textBuffer = Buffer.from('hello world');
    const resTxt = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', textBuffer, 'log.txt')
      .field('type', 'metro');
    expect(resTxt.status).toBe(400);

    // Fake image (correct extension/mime but doesn't decode)
    const fakeImageBuffer = Buffer.from('not an actual image file contents');
    const resFake = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', fakeImageBuffer, 'fake.jpg')
      .field('type', 'metro');
    expect(resFake.status).toBe(400);
    expect(resFake.body.message).toContain('không giải mã được');
  });

  // 3. Success Upload & Duplicate Checking
  it('should upload a valid image ticket, return pending status, and prevent duplicate uploads', async () => {
    const resUpload = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', validImageBuffer, 'valid_ticket.jpg')
      .field('type', 'metro')
      .field('routeLabel', 'Metro Line 1 Bến Thành');

    expect(resUpload.status).toBe(201);
    expect(resUpload.body.ticket.status).toBe('pending');
    expect(resUpload.body.ticket.imageUrl).toBeDefined();
    
    const ticketId = resUpload.body.ticket.id;
    expect(ticketId).toBeDefined();
    createdTicketIds.push(ticketId);

    // Try uploading duplicate file (same hash) -> Should conflict (409)
    const resDuplicate = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', validImageBuffer, 'another_name.jpg')
      .field('type', 'metro')
      .field('routeLabel', 'Metro Line 1 Bến Thành');
    expect(resDuplicate.status).toBe(409);
    expect(resDuplicate.body.message).toContain('đã tải lên vé này');
  });

  // 4. Ticket mine list & Privacy scrub
  it('GET /api/tickets/mine should fetch user tickets and hide internal identifiers', async () => {
    const res = await userAgent.get('/api/tickets/mine');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Find the uploaded ticket
    const ticket = res.body.find((t: any) => t.id === createdTicketIds[0]);
    expect(ticket).toBeDefined();
    expect(ticket.status).toBe('pending');
    expect(ticket.type).toBe('metro');
    expect(ticket.routeLabel).toBe('Metro Line 1 Bến Thành');
    
    // Privacy scrub verification
    expect(ticket).not.toHaveProperty('userId');
    expect(ticket).not.toHaveProperty('email');
    expect(ticket).not.toHaveProperty('reviewerId');
    expect(ticket).not.toHaveProperty('imagePath');
    expect(ticket).not.toHaveProperty('thumbnailPath');
  });

  // 5. Image Access & Path Traversal Guards
  it('should restrict ticket image access to owners/admins and block path traversal', async () => {
    const ticketId = createdTicketIds[0];

    // 1. Owner can access
    const resOwner = await userAgent.get(`/api/tickets/thumbnail/${ticketId}`);
    expect(resOwner.status).toBe(200);

    // 2. Admin can access
    const resAdmin = await adminAgent.get(`/api/tickets/thumbnail/${ticketId}`);
    expect(resAdmin.status).toBe(200);

    // 3. Different user cannot access
    const otherUserAgent = request.agent(app);
    await otherUserAgent.post('/api/auth/register').send({
      email: 'other-user@ecotransit.vn',
      password: 'OtherPassword123',
    });
    const resOther = await otherUserAgent.get(`/api/tickets/thumbnail/${ticketId}`);
    expect(resOther.status).toBe(403);

    // Cleanup other-user
    const otherUser = await prisma.user.findUnique({ where: { email: 'other-user@ecotransit.vn' } });
    if (otherUser) {
      await prisma.userWallet.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    }

    // 4. Path traversal attempt should fail
    const resTraversal = await userAgent.get(`/api/tickets/thumbnail/..%2f..%2fpackage.json`);
    // Validation matches route uuid check, or path resolve block -> returns 404 or 400
    expect([400, 404, 403]).toContain(resTraversal.status);
  });

  // 6. Review Role Guard
  it('should forbid normal users from reviewing tickets', async () => {
    const ticketId = createdTicketIds[0];
    const res = await userAgent.post(`/api/tickets/${ticketId}/review`).send({
      status: 'verified',
    });
    expect(res.status).toBe(403);
  });

  // 7. Transaction, Clamping, and Idempotency
  it('should allow Admin to review ticket, award points with default clamping, and enforce idempotency', async () => {
    const ticketId = createdTicketIds[0];

    // 1. Approve ticket without specifying points -> should default to 10
    const resReview = await adminAgent.post(`/api/tickets/${ticketId}/review`).send({
      status: 'verified',
      reviewNote: 'Đạt yêu cầu',
    });

    expect(resReview.status).toBe(200);
    expect(resReview.body.ticket.status).toBe('verified');

    // Verify wallet updated
    const resWallet = await userAgent.get('/api/wallet/me');
    expect(resWallet.status).toBe(200);
    expect(resWallet.body.balance).toBe(10);
    expect(resWallet.body.lifetimeEarned).toBe(10);

    // Verify PointsLedger entry
    const resLedger = await userAgent.get('/api/points/ledger');
    expect(resLedger.status).toBe(200);
    expect(resLedger.body.length).toBeGreaterThan(0);
    const ledgerItem = resLedger.body.find((item: any) => item.sourceId === ticketId);
    expect(ledgerItem).toBeDefined();
    expect(ledgerItem.delta).toBe(10);
    expect(ledgerItem.eventType).toBe('ticket_approved');

    // 2. Try approving the same ticket again -> should return 409 (Conflict) and not double credit
    const resDoubleReview = await adminAgent.post(`/api/tickets/${ticketId}/review`).send({
      status: 'verified',
      points: 50,
    });
    expect(resDoubleReview.status).toBe(409);

    const resWalletAfter = await userAgent.get('/api/wallet/me');
    expect(resWalletAfter.body.balance).toBe(10); // Still 10, no change!

    // 3. Test points clamping (min 5, max 100)
    // Upload another ticket
    const img = new Jimp({ width: 10, height: 10, color: 0xff0000ff });
    const anotherImageBuffer = await img.getBuffer('image/jpeg', { quality: 20 });
    const resUpload2 = await userAgent
      .post('/api/tickets/upload')
      .attach('ticketImage', anotherImageBuffer, 'ticket2.jpg')
      .field('type', 'bus')
      .field('routeLabel', 'Bus 150');
    
    const ticketId2 = resUpload2.body.ticket.id;
    expect(ticketId2).toBeDefined();
    createdTicketIds.push(ticketId2);

    // Review with points = 2 -> Should clamp to 5
    const resReviewLow = await adminAgent.post(`/api/tickets/${ticketId2}/review`).send({
      status: 'verified',
      points: 2,
    });
    expect(resReviewLow.status).toBe(200);

    // Wallet balance should be 10 (previous) + 5 (clamped) = 15
    const resWalletAfterLow = await userAgent.get('/api/wallet/me');
    expect(resWalletAfterLow.body.balance).toBe(15);
  });
});
