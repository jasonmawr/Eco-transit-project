import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import crypto from 'crypto';

describe('EcoTransit Rewards / Voucher Wallet Integration Tests', () => {
  let userAgent: any;
  let testUser: any;
  let highlandsVoucherId: string;

  beforeAll(async () => {
    // 1. Clean up old test user
    await prisma.user.deleteMany({
      where: { email: 'test-user-rewards@ecotransit.vn' },
    });

    // 2. Create test user
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/register').send({
      email: 'test-user-rewards@ecotransit.vn',
      password: 'UserPassword123',
    });
    await prisma.user.update({
      where: { email: 'test-user-rewards@ecotransit.vn' },
      data: { emailVerified: true },
    });
    await userAgent.post('/api/auth/login').send({
      email: 'test-user-rewards@ecotransit.vn',
      password: 'UserPassword123',
    });

    testUser = await prisma.user.findUnique({
      where: { email: 'test-user-rewards@ecotransit.vn' },
    });
    expect(testUser).toBeDefined();

    // 3. Set up test vouchers specifically for tests to ensure constant test environment
    // Clean potential duplicate slugs if any from seed
    await prisma.voucherRedemption.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.voucher.deleteMany({
      where: {
        slug: {
          in: [
            'test-highlands-drink',
            'test-expired-coffee',
            'test-soldout-cup',
            'test-limit-ticket',
          ],
        },
      },
    });

    const v1 = await prisma.voucher.create({
      data: {
        name: 'Voucher Highlands Drink Test',
        cost: 200,
        quantity: 10,
        status: 'active',
        encryptedCodes: 'CODE-1,CODE-2,CODE-3',
        slug: 'test-highlands-drink',
        description: 'Test voucher Highlands Drink description',
        brandName: 'Highlands Coffee',
        category: 'drink',
        pointsCost: 200,
        stockTotal: 10,
        stockRemaining: 10,
        perUserLimit: 3,
        isActive: true,
      } as any,
    });
    highlandsVoucherId = v1.id;

    await prisma.voucher.create({
      data: {
        name: 'Voucher Expired Coffee Test',
        cost: 300,
        quantity: 10,
        status: 'expired',
        encryptedCodes: 'CODE-EXP',
        slug: 'test-expired-coffee',
        description: 'Expired test coffee description',
        brandName: 'Starbucks',
        category: 'drink',
        pointsCost: 300,
        stockTotal: 10,
        stockRemaining: 10,
        perUserLimit: 1,
        isActive: true,
        validUntil: new Date('2026-01-01'), // Expired date
      } as any,
    });

    await prisma.voucher.create({
      data: {
        name: 'Voucher Soldout Cup Test',
        cost: 100,
        quantity: 10,
        status: 'sold_out',
        encryptedCodes: 'CODE-SOLD',
        slug: 'test-soldout-cup',
        description: 'Soldout test cup description',
        brandName: 'EcoLife',
        category: 'shopping',
        pointsCost: 100,
        stockTotal: 10,
        stockRemaining: 0,
        perUserLimit: 1,
        isActive: true,
      } as any,
    });

    await prisma.voucher.create({
      data: {
        name: 'Voucher Limit Ticket Test',
        cost: 50,
        quantity: 100,
        status: 'active',
        encryptedCodes: 'LIMIT-1,LIMIT-2',
        slug: 'test-limit-ticket',
        description: 'Limited ticket test description',
        brandName: 'HCMC Bus',
        category: 'transit',
        pointsCost: 50,
        stockTotal: 100,
        stockRemaining: 100,
        perUserLimit: 1, // Only 1 allowed per user
        isActive: true,
      } as any,
    });

    // 4. Initialise test user wallet points to 500
    await prisma.userWallet.create({
      data: {
        userId: testUser.id,
        balance: 500,
        lifetimeEarned: 500,
        lifetimeSpent: 0,
      },
    });
  });

  afterAll(async () => {
    // Clean up all tests data
    if (testUser) {
      await prisma.voucherRedemption.deleteMany({ where: { userId: testUser.id } });
      await prisma.pointsLedger.deleteMany({ where: { userId: testUser.id } });
      await prisma.userWallet.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    await prisma.voucher.deleteMany({
      where: {
        slug: {
          in: [
            'test-highlands-drink',
            'test-expired-coffee',
            'test-soldout-cup',
            'test-limit-ticket',
          ],
        },
      },
    });
    await prisma.$disconnect();
  });

  // 1. List catalog
  it('GET /api/rewards should fetch all active vouchers, support filtering, and map parameters properly', async () => {
    // General Fetch
    const resAll = await request(app).get('/api/rewards');
    expect(resAll.status).toBe(200);
    expect(Array.isArray(resAll.body)).toBe(true);
    expect(resAll.body.length).toBeGreaterThan(0);

    const Highlands = resAll.body.find((v: any) => v.slug === 'test-highlands-drink');
    expect(Highlands).toBeDefined();
    expect(Highlands.title).toBe('Voucher Highlands Drink Test'); // fallback name -> title
    expect(Highlands.pointsCost).toBe(200); // fallback cost -> pointsCost
    expect(Highlands.stockStatus).toBe('available');

    // Filter Category
    const resFiltered = await request(app).get('/api/rewards?category=transit');
    expect(resFiltered.status).toBe(200);
    const hasDrink = resFiltered.body.some((v: any) => v.category === 'drink');
    expect(hasDrink).toBe(false);

    // Search query q
    const resSearch = await request(app).get('/api/rewards?q=Soldout');
    expect(resSearch.status).toBe(200);
    expect(resSearch.body.every((v: any) => v.title.includes('Soldout') || v.description.includes('Soldout'))).toBe(true);
  });

  // 2. Fetch detail
  it('GET /api/rewards/:slug should return details, detail map, and 404 for missing slugs', async () => {
    const resDetail = await request(app).get('/api/rewards/test-highlands-drink');
    expect(resDetail.status).toBe(200);
    expect(resDetail.body.slug).toBe('test-highlands-drink');
    expect(resDetail.body.brandName).toBe('Highlands Coffee');

    const resMissing = await request(app).get('/api/rewards/non-existent-slug-1234');
    expect(resMissing.status).toBe(404);
  });

  // 3. Security Check
  it('POST /api/rewards/:slug/redeem should deny requests for unauthenticated sessions', async () => {
    const resRedeem = await request(app).post('/api/rewards/test-highlands-drink/redeem').send({});
    expect(resRedeem.status).toBe(401);
  });

  // 4. Invalid Vouchers
  it('should reject redemptions for expired, inactive, or out-of-stock vouchers', async () => {
    // Expired
    const resExp = await userAgent.post('/api/rewards/test-expired-coffee/redeem').send({});
    expect(resExp.status).toBe(400);
    expect(resExp.body.message).toContain('hết hạn');

    // Out of stock
    const resSold = await userAgent.post('/api/rewards/test-soldout-cup/redeem').send({});
    expect(resSold.status).toBe(409);
    expect(resSold.body.message).toContain('hết quà');
  });

  // 5. Successful Redeem, Wallet Deductions, Ledger Creation
  it('should process a valid voucher redemption, deduct wallet balance, and log points ledger with delta', async () => {
    const initialWallet = await prisma.userWallet.findUnique({ where: { userId: testUser.id } });
    expect(initialWallet?.balance).toBe(500);

    const resRedeem = await userAgent.post('/api/rewards/test-highlands-drink/redeem').send({});
    expect(resRedeem.status).toBe(201);
    expect(resRedeem.body.redemption.code).toBe('CODE-1'); // Picked first code from encryptedCodes list
    expect(resRedeem.body.redemption.pointsSpent).toBe(200);

    // Verify wallet updated
    const finalWallet = await prisma.userWallet.findUnique({ where: { userId: testUser.id } });
    expect(finalWallet?.balance).toBe(300); // 500 - 200 = 300
    expect(finalWallet?.lifetimeSpent).toBe(200);

    // Verify PointsLedger logged
    const ledger = await prisma.pointsLedger.findFirst({
      where: {
        userId: testUser.id,
        eventType: 'voucher_redeemed',
      },
    });
    expect(ledger).toBeDefined();
    expect(ledger?.delta).toBe(-200);
    expect(ledger?.balanceAfter).toBe(300);
    expect(ledger?.sourceType).toBe('voucher_redemption');

    // Verify Voucher Stock decremented
    const voucher = await prisma.voucher.findUnique({ where: { id: highlandsVoucherId } });
    expect(voucher?.stockRemaining).toBe(9); // 10 - 1 = 9
  });

  // 6. Insufficient Balance
  it('should reject redemptions when the user points balance is insufficient', async () => {
    // Current points: 300. Attempting to redeem a voucher cost 500 (gigamall-50k) or custom test voucher with cost 500
    // Let's change phuongnam-20k (cost 150) or create a new high cost voucher or change test user wallet points
    // Let's subtract test user points to 10 points
    await prisma.userWallet.update({
      where: { userId: testUser.id },
      data: { balance: 10 },
    });

    const resRedeemLow = await userAgent.post('/api/rewards/test-highlands-drink/redeem').send({});
    expect(resRedeemLow.status).toBe(400);
    expect(resRedeemLow.body.message).toContain('không đủ');

    // Restore balance back to 300
    await prisma.userWallet.update({
      where: { userId: testUser.id },
      data: { balance: 300 },
    });
  });

  // 7. Enforces perUserLimit
  it('should reject redemptions once the user reaches the perUserLimit', async () => {
    // Voucher "test-limit-ticket" has perUserLimit = 1
    // First redemption: success
    const res1 = await userAgent.post('/api/rewards/test-limit-ticket/redeem').send({});
    expect(res1.status).toBe(201);

    // Second redemption: fails with 409 Limit Exceeded
    const res2 = await userAgent.post('/api/rewards/test-limit-ticket/redeem').send({});
    expect(res2.status).toBe(409);
    expect(res2.body.message).toContain('giới hạn');
  });

  // 8. Idempotency Check
  it('should return the previously generated voucher code and not deduct points twice on identical idempotencyKey', async () => {
    const key = `test-idemp-key-${crypto.randomUUID()}`;

    const initialWallet = await prisma.userWallet.findUnique({ where: { userId: testUser.id } });
    const initialBalance = initialWallet?.balance || 0; // Current balance should be 300 (after 200 Highlands, 50 Limit ticket) = 250

    // First request
    const res1 = await userAgent.post('/api/rewards/test-highlands-drink/redeem').send({
      idempotencyKey: key,
    });
    expect(res1.status).toBe(201);
    const code = res1.body.redemption.code;

    // Second request with identical key
    const res2 = await userAgent.post('/api/rewards/test-highlands-drink/redeem').send({
      idempotencyKey: key,
    });
    expect(res2.status).toBe(200);
    expect(res2.body.redemption.code).toBe(code); // Returned exact same code
    expect(res2.body.wallet.balance).toBe(initialBalance - 200); // Points not deducted a second time!
  });

  // 9. My redemptions portfolio list
  it('GET /api/rewards/mine should list redeemed vouchers and omit internal user identifiers', async () => {
    const res = await userAgent.get('/api/rewards/mine');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const first = res.body[0];
    expect(first.code).toBeDefined();
    expect(first.voucherTitle).toBeDefined();
    expect(first.pointsSpent).toBeDefined();
    
    // Privacy assertions
    expect(first).not.toHaveProperty('userId');
    expect(first).not.toHaveProperty('email');
    expect(first).not.toHaveProperty('voucherId');
  });
});
