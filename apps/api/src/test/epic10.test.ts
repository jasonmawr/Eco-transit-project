import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';

describe('EcoTransit Epic 10 Integration Tests', () => {
  let userAgent: any;
  let otherAgent: any;
  let testUser: any;
  let testOtherUser: any;

  beforeAll(async () => {
    // Clear old test users
    await prisma.user.deleteMany({
      where: {
        email: { in: ['test-epic10-a@ecotransit.vn', 'test-epic10-b@ecotransit.vn'] },
      },
    });

    // Register User A
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/register').send({
      email: 'test-epic10-a@ecotransit.vn',
      password: 'UserPassword123',
    });

    testUser = await prisma.user.findUnique({
      where: { email: 'test-epic10-a@ecotransit.vn' },
    });

    // Register User B
    otherAgent = request.agent(app);
    await otherAgent.post('/api/auth/register').send({
      email: 'test-epic10-b@ecotransit.vn',
      password: 'UserPassword123',
    });

    testOtherUser = await prisma.user.findUnique({
      where: { email: 'test-epic10-b@ecotransit.vn' },
    });
  });

  afterAll(async () => {
    // Cleanup wallets & user records
    if (testUser) {
      await prisma.userWallet.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    if (testOtherUser) {
      await prisma.userWallet.deleteMany({ where: { userId: testOtherUser.id } });
      await prisma.user.delete({ where: { id: testOtherUser.id } });
    }
    await prisma.$disconnect();
  });

  // 1. Leaderboard Privacy & Format
  describe('Leaderboard Endpoint', () => {
    it('should return a read-only leaderboard with scrubbed fields', async () => {
      // Access as authenticated User A
      const res = await userAgent.get('/api/leaderboard');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        const item = res.body[0];
        expect(item.rank).toBeDefined();
        expect(item.nickname).toBeDefined();
        expect(item.isMe).toBeDefined();

        // Ensure absolutely NO private fields are leaked
        expect(item.email).toBeUndefined();
        expect(item.userId).toBeUndefined();
        expect(item.walletId).toBeUndefined();
        expect(item.balance).toBeUndefined();
        expect(item.score).toBeUndefined();
        expect(item.lifetimeEarned).toBeUndefined();
      }
    });

    it('should correctly set isMe flag relative to the requesting agent', async () => {
      // Trigger wallet initialization
      await userAgent.get('/api/wallet/me');
      await otherAgent.get('/api/wallet/me');

      const resA = await userAgent.get('/api/leaderboard');
      const mineA = resA.body.find((item: any) => item.isMe === true);
      expect(mineA).toBeDefined();

      const resB = await otherAgent.get('/api/leaderboard');
      const mineB = resB.body.find((item: any) => item.isMe === true);
      expect(mineB).toBeDefined();

      // They should target different nicknames
      expect(mineA.nickname).not.toBe(mineB.nickname);
    });

    it('should apply Standard Competition Ranking (1-2-2-4) for equal scores', async () => {
      // Manually update scores in DB to cause a tie
      const walletA = await prisma.userWallet.findUnique({ where: { userId: testUser.id } });
      const walletB = await prisma.userWallet.findUnique({ where: { userId: testOtherUser.id } });

      await prisma.userWallet.update({
        where: { id: walletA!.id },
        data: { lifetimeEarned: 100 },
      });
      await prisma.userWallet.update({
        where: { id: walletB!.id },
        data: { lifetimeEarned: 100 },
      });

      const res = await request(app).get('/api/leaderboard');
      const rankA = res.body.find((item: any) => item.nickname === walletA!.publicLeaderboardAlias);
      const rankB = res.body.find((item: any) => item.nickname === walletB!.publicLeaderboardAlias);

      // Same scores must have equal rank
      expect(rankA.rank).toBe(rankB.rank);
    });
  });

  // 2. Email Verification Flow
  describe('Email Verification Flow', () => {
    it('should register a new user as unverified', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test-epic10-unverified@ecotransit.vn',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.user.emailVerified).toBe(false);
      expect(res.body.isMock).toBe(true);
      expect(res.body.mockToken).toBeDefined();

      // Clean up
      await prisma.userWallet.deleteMany({ where: { userId: res.body.user.id } });
      await prisma.user.delete({ where: { id: res.body.user.id } });
    });

    it('should verify email with valid token and reject expired/invalid tokens', async () => {
      const resReg = await request(app).post('/api/auth/register').send({
        email: 'test-verify-temp@ecotransit.vn',
        password: 'Password123',
      });

      const mockToken = resReg.body.mockToken;

      // Try verifying with invalid token
      const resVerifyBad = await request(app).post('/api/auth/verify-email').send({
        token: 'invalid-token-code',
      });
      expect(resVerifyBad.status).toBe(400);

      // Verify with valid token
      const resVerifyGood = await request(app).post('/api/auth/verify-email').send({
        token: mockToken,
      });
      expect(resVerifyGood.status).toBe(200);

      // Re-use token should fail
      const resVerifyReuse = await request(app).post('/api/auth/verify-email').send({
        token: mockToken,
      });
      expect(resVerifyReuse.status).toBe(400);

      // Clean up
      await prisma.userWallet.deleteMany({ where: { userId: resReg.body.user.id } });
      await prisma.user.delete({ where: { id: resReg.body.user.id } });
    });

    it('should enforce 60-second cooldown rate limit on resending verification email', async () => {
      const authAgent = request.agent(app);
      await authAgent.post('/api/auth/register').send({
        email: 'test-cooldown@ecotransit.vn',
        password: 'Password123',
      });

      // Instantly requesting another verification should trigger rate-limiting
      const resResendLimit = await authAgent.post('/api/auth/resend-verification').send({});
      expect(resResendLimit.status).toBe(429);

      // Clean up
      const user = await prisma.user.findUnique({ where: { email: 'test-cooldown@ecotransit.vn' } });
      if (user) {
        await prisma.userWallet.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    });
  });

  // 3. Avatar Whitelist Onboarding
  describe('Avatar Whitelist Onboarding', () => {
    it('should reject invalid characterIds and accept whitelisted presets', async () => {
      // Try invalid character
      const resBad = await userAgent.patch('/api/auth/avatar').send({
        characterId: 'super-hacker',
      });
      expect(resBad.status).toBe(400);

      // Select student preset
      const resGood = await userAgent.patch('/api/auth/avatar').send({
        characterId: 'student',
      });
      expect(resGood.status).toBe(200);
      expect(resGood.body.avatarConfig.characterId).toBe('student');

      // Verify in user state
      const resMe = await userAgent.get('/api/auth/me');
      expect(resMe.body.user.avatarConfig.characterId).toBe('student');
    });
  });

  // 4. Hardened Mail Security & Migration Preservation
  describe('Hardened Mail Security & Migration Preservation', () => {
    it('should preserve existing seed/demo/admin users as verified', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'user@ecotransit.vn' },
      });
      expect(user).toBeDefined();
      expect(user!.emailVerified).toBe(true);
    });

    it('should store verification token as hash in DB and never expose raw token in user DTO', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test-hash-check@ecotransit.vn',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      // User DTO in response should NOT contain raw token or hash
      expect(res.body.user.verificationTokenHash).toBeUndefined();
      expect(res.body.user.verificationTokenExpires).toBeUndefined();

      // Retrieve from DB to confirm it is hashed
      const user = await prisma.user.findUnique({
        where: { email: 'test-hash-check@ecotransit.vn' },
      });
      expect(user).toBeDefined();
      expect(user!.verificationTokenHash).not.toBeNull();
      // It should be a 64-char hex hash
      expect(user!.verificationTokenHash!.length).toBe(64);
      // Ensure it doesn't match rawToken
      expect(user!.verificationTokenHash).not.toBe(res.body.mockToken);

      // Clean up
      await prisma.userWallet.deleteMany({ where: { userId: res.body.user.id } });
      await prisma.user.delete({ where: { id: res.body.user.id } });
    });

    it('should reject registration with 503 when SMTP is not configured in production mode', async () => {
      const origNodeEnv = process.env.NODE_ENV;
      const origAppMode = process.env.APP_MODE;
      process.env.NODE_ENV = 'production';
      process.env.APP_MODE = 'production';

      try {
        const res = await request(app).post('/api/auth/register').send({
          email: 'test-prod-no-smtp@ecotransit.vn',
          password: 'Password123',
        });
        expect(res.status).toBe(503);
        expect(res.body.message).toContain('chưa cấu hình dịch vụ gửi thư');
        expect(res.body.mockToken).toBeUndefined();

        // Verify user was NOT created in DB (cleaned up)
        const user = await prisma.user.findUnique({
          where: { email: 'test-prod-no-smtp@ecotransit.vn' },
        });
        expect(user).toBeNull();
      } finally {
        process.env.NODE_ENV = origNodeEnv;
        process.env.APP_MODE = origAppMode;
      }
    });
  });

  describe('Points Revocation Safety', () => {
    it('should deduct points on revocation but prevent negative balance', async () => {
      const user = await prisma.user.findUnique({ where: { email: 'user@ecotransit.vn' } });
      const wallet = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      const origBalance = wallet!.balance;
      const origLifetime = wallet!.lifetimeEarned;

      // Seed wallet balance to 5 points
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 5, lifetimeEarned: 5 },
      });

      // Create a verified ticket
      const ticket = await prisma.ticket.create({
        data: {
          userId: user!.id,
          status: 'verified',
          imageUrl: 'uploads/test.jpg',
          routeLabel: 'Tuyến số 1',
        },
      });

      // Revoke the ticket (set to rejected) via Admin
      const adminAgent = request.agent(app);
      await adminAgent.post('/api/auth/login').send({
        email: 'admin@ecotransit.vn',
        password: 'Admin@123456',
      });

      const res = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'rejected',
        note: 'Revoked for testing',
      });
      expect(res.status).toBe(200);

      // Verify wallet balance is 0, not negative
      const updatedWallet = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      expect(updatedWallet!.balance).toBe(0);
      expect(updatedWallet!.lifetimeEarned).toBe(0);

      // Clean up and restore original wallet values
      await prisma.ticket.delete({ where: { id: ticket.id } });
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: origBalance, lifetimeEarned: origLifetime },
      });
    });
  });
});
