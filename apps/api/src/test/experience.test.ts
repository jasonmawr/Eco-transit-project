import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';

describe('EcoTransit Station Experience & UGC Integration Tests', () => {
  let testUser: any;
  let testAgent: any;
  let sampleStation: any;
  let samplePlace: any;

  beforeAll(async () => {
    // 1. Find a station seeded in DB (like Bến Thành)
    sampleStation = await prisma.station.findFirst({
      where: { name: 'Bến Thành' },
    });
    expect(sampleStation).toBeDefined();

    // 2. Find a place seeded in DB (like Đồng Khởi Cafe)
    samplePlace = await prisma.place.findFirst({
      where: { slug: 'dong-khoi-cafe' },
    });
    expect(samplePlace).toBeDefined();

    // 3. Clear existing test users if any
    await prisma.user.deleteMany({
      where: { email: { in: ['test-ugc-user@ecotransit.vn'] } },
    });

    // 4. Create a test user and log in to get session cookie
    testAgent = request.agent(app);
    await testAgent.post('/api/auth/register').send({
      email: 'test-ugc-user@ecotransit.vn',
      password: 'TestPassword123',
    });

    // Fetch the test user from DB
    testUser = await prisma.user.findUnique({
      where: { email: 'test-ugc-user@ecotransit.vn' },
    });
    expect(testUser).toBeDefined();
  });

  afterAll(async () => {
    // Clean up test reviews and users
    if (testUser) {
      await prisma.uGCReview.deleteMany({
        where: { userId: testUser.id },
      });
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }
    await prisma.$disconnect();
  });

  // 1. Places list, category filter, and search
  it('GET /api/places should return published places and support filters', async () => {
    const res = await request(app).get('/api/places');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const first = res.body[0];
    expect(first).toHaveProperty('slug');
    expect(first).toHaveProperty('shortDescription');
    expect(first).toHaveProperty('stationName');
    expect(first).not.toHaveProperty('isPublished');

    // Filter by station
    const resStation = await request(app).get(`/api/places?stationId=${sampleStation.id}`);
    expect(resStation.status).toBe(200);
    expect(resStation.body.every((p: any) => p.stationId === sampleStation.id)).toBe(true);

    // Filter by category
    const resCat = await request(app).get('/api/places?category=cafe');
    expect(resCat.status).toBe(200);
    expect(resCat.body.every((p: any) => p.category === 'cafe')).toBe(true);
  });

  // 2. Place detail by ID or Slug and 404 for unpublished
  it('GET /api/places/:idOrSlug should return detail or 404', async () => {
    // Retrieve by slug
    const resSlug = await request(app).get(`/api/places/${samplePlace.slug}`);
    expect(resSlug.status).toBe(200);
    expect(resSlug.body.name).toBe(samplePlace.name);
    expect(Array.isArray(resSlug.body.reviews)).toBe(true);

    // Retrieve by ID
    const resId = await request(app).get(`/api/places/${samplePlace.id}`);
    expect(resId.status).toBe(200);
    expect(resId.body.slug).toBe(samplePlace.slug);

    // Retrieve non-existent
    const resMissing = await request(app).get('/api/places/missing-place-slug');
    expect(resMissing.status).toBe(404);
  });

  // 3. Station Experience Payload
  it('GET /api/stations/:id/experience should aggregate station data', async () => {
    const res = await request(app).get(`/api/stations/${sampleStation.id}/experience`);
    expect(res.status).toBe(200);
    expect(res.body.station.id).toBe(sampleStation.id);
    expect(Array.isArray(res.body.places)).toBe(true);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.reviewsSummary).toHaveProperty('averageRating');
    expect(res.body.reviewsSummary).toHaveProperty('totalCount');
    expect(Array.isArray(res.body.reviewsSummary.list)).toBe(true);
    expect(Array.isArray(res.body.guides)).toBe(true);
  });

  // 4. Reviews approved/pending visibility rule
  it('GET /api/reviews should return only approved reviews, and scrub private details', async () => {
    const res = await request(app).get(`/api/reviews?stationId=${sampleStation.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Check that all returned reviews are approved (pending is hidden)
    // "Thùy Dương" review is pending and must not be returned
    expect(res.body.some((r: any) => r.displayName === 'Thùy Dương')).toBe(false);

    // Verify privacy gate: no email, userId or user details
    if (res.body.length > 0) {
      const first = res.body[0];
      expect(first).toHaveProperty('displayName');
      expect(first).not.toHaveProperty('userId');
      expect(first).not.toHaveProperty('user');
      expect(first).not.toHaveProperty('email');
    }
  });

  // 5. POST review auth required
  it('POST /api/reviews should fail with 401 if unauthenticated', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        stationId: sampleStation.id,
        rating: 5,
        content: 'Đây là bài viết đánh giá không hợp lệ vì chưa đăng nhập.',
      });
    expect(res.status).toBe(401);
  });

  // 6. POST review creates pending review and is not immediately visible
  it('POST /api/reviews should create pending review with session, not visible in public list', async () => {
    const uniqueContent = `Đánh giá thử nghiệm đặc biệt: ${Date.now()}`;
    const resCreate = await testAgent
      .post('/api/reviews')
      .send({
        stationId: sampleStation.id,
        rating: 4,
        content: uniqueContent,
        displayName: 'Khách Hàng Thử Nghiệm',
      });
    
    expect(resCreate.status).toBe(201);
    expect(resCreate.body.message).toContain('chờ kiểm duyệt');
    expect(resCreate.body.review.rating).toBe(4);
    expect(resCreate.body.review.displayName).toBe('Khách Hàng Thử Nghiệm');

    // Confirm it is not returned in public reviews list
    const resList = await request(app).get(`/api/reviews?stationId=${sampleStation.id}`);
    expect(resList.body.some((r: any) => r.content === uniqueContent)).toBe(false);
  });

  // 7. Invalid review payload returns 400
  it('POST /api/reviews with invalid fields should return 400', async () => {
    // Missing rating & content
    const resEmpty = await testAgent.post('/api/reviews').send({
      stationId: sampleStation.id,
    });
    expect(resEmpty.status).toBe(400);

    // Rating out of bounds
    const resBounds = await testAgent.post('/api/reviews').send({
      stationId: sampleStation.id,
      rating: 6,
      content: 'Nhận xét dài đủ 10 ký tự nhưng sao không hợp lệ.',
    });
    expect(resBounds.status).toBe(400);

    // Content too short
    const resShort = await testAgent.post('/api/reviews').send({
      stationId: sampleStation.id,
      rating: 5,
      content: 'Quá ngắn',
    });
    expect(resShort.status).toBe(400);
  });

  // 7b. HTML injection validation in reviews
  it('POST /api/reviews with HTML tags in content or displayName should return 400', async () => {
    // HTML in content
    const resHtmlContent = await testAgent.post('/api/reviews').send({
      stationId: sampleStation.id,
      rating: 5,
      content: 'Chào hành khách <script>alert(1)</script> xanh mát.',
      displayName: 'Khách hàng',
    });
    expect(resHtmlContent.status).toBe(400);
    expect(resHtmlContent.body.message).toContain('không được chứa thẻ HTML');

    // HTML in displayName
    const resHtmlName = await testAgent.post('/api/reviews').send({
      stationId: sampleStation.id,
      rating: 5,
      content: 'Nội dung đánh giá hợp lệ dài hơn mười ký tự.',
      displayName: '<b>Admin Hack</b>',
    });
    expect(resHtmlName.status).toBe(400);
    expect(resHtmlName.body.message).toContain('không được chứa thẻ HTML');

    // Safe mathematical comparison shouldn't be rejected
    const resSafeCompare = await testAgent.post('/api/reviews').send({
      stationId: sampleStation.id,
      rating: 5,
      content: 'Đánh giá này có chứa chữ viết 3 < 5 và a < b rất bình thường.',
      displayName: 'Khách hàng',
    });
    expect(resSafeCompare.status).toBe(201); // created successfully
  });

  // 8. Guides list and detail
  it('GET /api/guides and detail should work properly', async () => {
    const res = await request(app).get('/api/guides');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Guide list shouldn't return unpublished nháp
    expect(res.body.some((g: any) => g.slug === 'guide-chua-xuat-ban')).toBe(false);

    // Get detail
    const first = res.body[0];
    const resDetail = await request(app).get(`/api/guides/${first.slug}`);
    expect(resDetail.status).toBe(200);
    expect(resDetail.body.title).toBeDefined();
    expect(resDetail.body.content).toBeDefined();

    // Try to get detail of unpublished nháp guide
    const resDraft = await request(app).get('/api/guides/guide-chua-xuat-ban');
    expect(resDraft.status).toBe(404);
  });
});
