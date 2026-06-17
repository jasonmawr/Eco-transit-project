import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';

describe('EcoTransit Time Bill Generator & Social Share Integration Tests', () => {
  let userAgent: any;
  let otherUserAgent: any;
  let testUser: any;
  let otherUser: any;
  const createdSlugs: string[] = [];

  beforeAll(async () => {
    // Clear old test users
    await prisma.user.deleteMany({
      where: {
        email: { in: ['test-bill-owner@ecotransit.vn', 'test-bill-other@ecotransit.vn'] },
      },
    });

    // Register test user (owner)
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/register').send({
      email: 'test-bill-owner@ecotransit.vn',
      password: 'OwnerPassword123',
    });

    testUser = await prisma.user.findUnique({
      where: { email: 'test-bill-owner@ecotransit.vn' },
    });
    expect(testUser).toBeDefined();

    // Register other user
    otherUserAgent = request.agent(app);
    await otherUserAgent.post('/api/auth/register').send({
      email: 'test-bill-other@ecotransit.vn',
      password: 'OtherPassword123',
    });

    otherUser = await prisma.user.findUnique({
      where: { email: 'test-bill-other@ecotransit.vn' },
    });
    expect(otherUser).toBeDefined();
  });

  afterAll(async () => {
    // Cleanup created time bills
    await prisma.timeBill.deleteMany({
      where: {
        shareSlug: { in: createdSlugs },
      },
    });

    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    if (otherUser) {
      await prisma.user.delete({ where: { id: otherUser.id } });
    }
    await prisma.$disconnect();
  });

  // 1. Guest create bill success
  it('should allow Guest to create a public time bill successfully', async () => {
    const res = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'Bến Thành',
        destinationLabel: 'Thảo Điền',
        durationMinutes: 25,
        walkingMinutes: 5,
        transferCount: 0,
        distanceKm: 6.2,
        weatherSummary: 'normal',
        preferenceSummary: 'none',
        routeSnapshot: {
          totalTimeMinutes: 25,
          walkingMinutes: 5,
          transferCount: 0,
          explanation: 'Tuyến tàu điện Metro số 1 nhanh chóng.',
          legs: [
            {
              mode: 'metro',
              durationMinutes: 20,
              distanceMeters: 5500,
              fromStationName: 'Bến Thành',
              toStationName: 'Thảo Điền',
              lineCode: 'M1',
            },
            {
              mode: 'walk',
              durationMinutes: 5,
              distanceMeters: 700,
              fromStationName: 'Thảo Điền',
              toStationName: 'Điểm đến',
            }
          ]
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.shareSlug).toBeDefined();
    expect(res.body.shareSlug).toMatch(/^lx-[a-z0-9]{10}$/);
    expect(res.body.originLabel).toBe('Bến Thành');
    expect(res.body.destinationLabel).toBe('Thảo Điền');
    expect(res.body.headline).toBeDefined();
    expect(res.body.storyText).toBeDefined();
    expect(res.body.estimateDisclaimer).toBe(
      'Các chỉ số xanh là ước tính demo cho chiến dịch, không thay thế dữ liệu đo đạc thực tế.'
    );

    createdSlugs.push(res.body.shareSlug);
  });

  // 2. Logged-in user create bill associates ownership
  it('should associate ownership when a logged-in user creates a time bill', async () => {
    const res = await userAgent
      .post('/api/time-bills')
      .send({
        originLabel: 'Tân Sơn Nhất',
        destinationLabel: 'Bến Thành',
        durationMinutes: 40,
        walkingMinutes: 10,
        transferCount: 1,
        distanceKm: 8.5,
        weatherSummary: 'normal',
        preferenceSummary: 'none',
      });

    expect(res.status).toBe(201);
    expect(res.body.shareSlug).toBeDefined();
    createdSlugs.push(res.body.shareSlug);

    // Retrieve from DB to check userId
    const bill = await prisma.timeBill.findUnique({
      where: { shareSlug: res.body.shareSlug },
    });
    expect(bill).toBeDefined();
    expect(bill!.userId).toBe(testUser.id);
  });

  // 3. Invalid duration/walking/transfer/distance returns 400
  it('should reject requests with invalid types or negative duration/walking/transfer/distance', async () => {
    const res = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'A',
        destinationLabel: 'B',
        durationMinutes: -5, // Negative duration
        walkingMinutes: 10,
        transferCount: 0,
        distanceKm: 5.0,
      });

    expect(res.status).toBe(400);
  });

  // 4. HTML tags in text fields return 400
  it('should reject requests that contain HTML tags in text fields to prevent XSS', async () => {
    const payloads = [
      {
        originLabel: '<script>alert("XSS")</script>',
        destinationLabel: 'B',
        durationMinutes: 20,
      },
      {
        originLabel: 'A',
        destinationLabel: 'B <b>bold</b>',
        durationMinutes: 20,
      },
      {
        originLabel: 'A',
        destinationLabel: 'B',
        durationMinutes: 20,
        weatherSummary: '<img src="x" onerror="alert(1)">',
      }
    ];

    for (const payload of payloads) {
      const res = await request(app)
        .post('/api/time-bills')
        .send(payload);
      expect(res.status).toBe(400);
    }
  });

  // 5. shareSlug format uses at least 8-10 random chars
  it('should verify shareSlug uses the secure crypto-random lx-[a-z0-9]{10} pattern', async () => {
    const res = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'Trạm A',
        destinationLabel: 'Trạm B',
        durationMinutes: 15,
        distanceKm: 3.0,
      });

    expect(res.status).toBe(201);
    const slug = res.body.shareSlug;
    expect(slug).toMatch(/^lx-[a-z0-9]{10}$/);
    createdSlugs.push(slug);
  });

  // 6. Public GET public bill returns 200
  it('should return 200 when Guest accesses a public time bill', async () => {
    const resCreate = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'Ga Nhà Rồng',
        destinationLabel: 'Thanh Đa',
        durationMinutes: 30,
        distanceKm: 7.2,
      });
    expect(resCreate.status).toBe(201);
    const slug = resCreate.body.shareSlug;
    createdSlugs.push(slug);

    const resGet = await request(app).get(`/api/time-bills/${slug}`);
    expect(resGet.status).toBe(200);
    expect(resGet.body.originLabel).toBe('Ga Nhà Rồng');
  });

  // 7. Public GET private bill as guest returns 404
  it('should return 404 when Guest accesses a private bill', async () => {
    // Create a bill as user
    const resCreate = await userAgent
      .post('/api/time-bills')
      .send({
        originLabel: 'Private Origin',
        destinationLabel: 'Private Dest',
        durationMinutes: 25,
        distanceKm: 4.0,
      });
    expect(resCreate.status).toBe(201);
    const slug = resCreate.body.shareSlug;
    createdSlugs.push(slug);

    // Make it private
    const resPatch = await userAgent
      .patch(`/api/time-bills/${slug}/privacy`)
      .send({ isPublic: false });
    expect(resPatch.status).toBe(200);

    // Get as Guest -> should be 404
    const resGetGuest = await request(app).get(`/api/time-bills/${slug}`);
    expect(resGetGuest.status).toBe(404);
  });

  // 8. Owner GET private bill returns 200
  it('should return 200 when Owner accesses their own private bill', async () => {
    const resCreate = await userAgent
      .post('/api/time-bills')
      .send({
        originLabel: 'Owner Private',
        destinationLabel: 'Owner Dest',
        durationMinutes: 25,
        distanceKm: 4.0,
      });
    const slug = resCreate.body.shareSlug;
    createdSlugs.push(slug);

    // Make it private
    await userAgent
      .patch(`/api/time-bills/${slug}/privacy`)
      .send({ isPublic: false });

    // Get as Owner -> should be 200
    const resGetOwner = await userAgent.get(`/api/time-bills/${slug}`);
    expect(resGetOwner.status).toBe(200);
    expect(resGetOwner.body.originLabel).toBe('Owner Private');
  });

  // 9. Other user GET private bill returns 404
  it('should return 404 when a different user tries to access a private bill', async () => {
    const resCreate = await userAgent
      .post('/api/time-bills')
      .send({
        originLabel: 'Owner Private 2',
        destinationLabel: 'Owner Dest 2',
        durationMinutes: 25,
        distanceKm: 4.0,
      });
    const slug = resCreate.body.shareSlug;
    createdSlugs.push(slug);

    // Make it private
    await userAgent
      .patch(`/api/time-bills/${slug}/privacy`)
      .send({ isPublic: false });

    // Get as Other User -> should be 404
    const resGetOther = await otherUserAgent.get(`/api/time-bills/${slug}`);
    expect(resGetOther.status).toBe(404);
  });

  // 10. PATCH privacy only owner can change
  it('should only allow the Owner of the bill to modify its privacy settings', async () => {
    const resCreate = await userAgent
      .post('/api/time-bills')
      .send({
        originLabel: 'Privacy Switch',
        destinationLabel: 'Dest',
        durationMinutes: 20,
      });
    const slug = resCreate.body.shareSlug;
    createdSlugs.push(slug);

    // Attempt PATCH from other user -> should be 403
    const resPatchOther = await otherUserAgent
      .patch(`/api/time-bills/${slug}/privacy`)
      .send({ isPublic: false });
    expect(resPatchOther.status).toBe(403);

    // Attempt PATCH from owner -> should be 200
    const resPatchOwner = await userAgent
      .patch(`/api/time-bills/${slug}/privacy`)
      .send({ isPublic: false });
    expect(resPatchOwner.status).toBe(200);
  });

  // 11. Mine endpoint requires login and only returns own bills
  it('should return only owner bills at /api/time-bills/mine, and deny guest access', async () => {
    // Guest access -> should be 401
    const resGuest = await request(app).get('/api/time-bills/mine');
    expect(resGuest.status).toBe(401);

    // Owner access -> should be 200
    const resOwner = await userAgent.get('/api/time-bills/mine');
    expect(resOwner.status).toBe(200);
    expect(Array.isArray(resOwner.body)).toBe(true);
    // Should contain at least some of the owner's bills we created
    expect(resOwner.body.length).toBeGreaterThan(0);
  });

  // 12. DTO does not expose userId/email/internal id
  it('should verify that TimeBill DTO does not expose sensitive database fields', async () => {
    const res = await userAgent
      .post('/api/time-bills')
      .send({
        originLabel: 'DTO origin',
        destinationLabel: 'DTO dest',
        durationMinutes: 15,
        distanceKm: 2.0,
      });
    
    createdSlugs.push(res.body.shareSlug);

    const dto = res.body;
    expect(dto).not.toHaveProperty('id');
    expect(dto).not.toHaveProperty('userId');
    expect(dto).not.toHaveProperty('email');
    expect(dto).not.toHaveProperty('user');
  });

  // 13. routeSnapshot is whitelist-safe
  it('should scrub and keep only whitelisted fields in routeSnapshot', async () => {
    const res = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'Sài Gòn',
        destinationLabel: 'Chợ Lớn',
        durationMinutes: 30,
        routeSnapshot: {
          totalTimeMinutes: 30,
          walkingMinutes: 8,
          transferCount: 1,
          explanation: 'Safe text info.',
          extraInternalId: '999999', // Non-whitelisted field
          token: 'secret-token-123',  // Non-whitelisted field
          legs: [
            {
              mode: 'bus',
              durationMinutes: 22,
              distanceMeters: 4000,
              fromStationName: 'Sài Gòn',
              toStationName: 'Chợ Lớn',
              lineCode: '150',
              secretAdminNote: 'confidential' // Non-whitelisted field
            }
          ]
        }
      });

    createdSlugs.push(res.body.shareSlug);
    const snap = res.body.routeSnapshot;
    expect(snap).toBeDefined();
    expect(snap.totalTimeMinutes).toBe(30);
    expect(snap.walkingMinutes).toBe(8);
    expect(snap.legs[0].mode).toBe('bus');
    expect(snap.legs[0].lineCode).toBe('150');
    
    // Check fields that must be scrubbed out
    expect(snap).not.toHaveProperty('extraInternalId');
    expect(snap).not.toHaveProperty('token');
    expect(snap.legs[0]).not.toHaveProperty('secretAdminNote');
  });

  // 14. estimates non-negative and greenScore clamped
  it('should enforce non-negative estimates and greenScore clamped between 10 and 100', async () => {
    // Create bill with distanceKm = 0
    const resZero = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'A',
        destinationLabel: 'B',
        durationMinutes: 10,
        distanceKm: 0.0,
      });

    expect(resZero.body.greenScore).toBe(10); // clamped minimum
    expect(resZero.body.estimatedCo2SavedGrams).toBe(0);
    expect(resZero.body.estimatedMoneySavedVnd).toBe(0);
    createdSlugs.push(resZero.body.shareSlug);

    // Create bill with massive distance
    const resHuge = await request(app)
      .post('/api/time-bills')
      .send({
        originLabel: 'A',
        destinationLabel: 'B',
        durationMinutes: 180,
        walkingMinutes: 100,
        distanceKm: 200.0,
      });

    expect(resHuge.body.greenScore).toBe(100); // clamped maximum
    expect(resHuge.body.estimatedCo2SavedGrams).toBeGreaterThan(0);
    expect(resHuge.body.estimatedMoneySavedVnd).toBeGreaterThan(0);
    createdSlugs.push(resHuge.body.shareSlug);
  });
});
