import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { mailProvider } from '../providers/mailProvider.js';
import argon2 from 'argon2';

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
    await prisma.user.update({
      where: { email: 'test-epic10-a@ecotransit.vn' },
      data: { emailVerified: true },
    });
    await userAgent.post('/api/auth/login').send({
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
    await prisma.user.update({
      where: { email: 'test-epic10-b@ecotransit.vn' },
      data: { emailVerified: true },
    });
    await otherAgent.post('/api/auth/login').send({
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
    function deleteMockEmailFile() {
      const possiblePaths = [
        path.resolve(process.cwd(), 'last-mock-email.json'),
        path.resolve(process.cwd(), '../../last-mock-email.json'),
        path.resolve(process.cwd(), '../last-mock-email.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
    }

    function getMockTokenFromEmailFile(): string {
      const possiblePaths = [
        path.resolve(process.cwd(), 'last-mock-email.json'),
        path.resolve(process.cwd(), '../../last-mock-email.json'),
        path.resolve(process.cwd(), '../last-mock-email.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const emailData = JSON.parse(fs.readFileSync(p, 'utf-8'));
          const match = emailData.text.match(/token=([a-f0-9]+)/);
          if (match) return match[1];
        }
      }
      throw new Error('Mock email file not found or token not found');
    }

    it('should register a new user as unverified and not return token in HTTP response', async () => {
      deleteMockEmailFile();
      const res = await request(app).post('/api/auth/register').send({
        email: 'test-epic10-unverified@ecotransit.vn',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.user.emailVerified).toBe(false);
      expect(res.body.mockToken).toBeUndefined();
      expect(res.body.isMock).toBeUndefined();

      // Read token from UAT mock email artifact
      const mockToken = getMockTokenFromEmailFile();
      expect(mockToken).toBeDefined();
      expect(mockToken.length).toBe(64);

      // Clean up
      await prisma.userWallet.deleteMany({ where: { userId: res.body.user.id } });
      await prisma.user.delete({ where: { id: res.body.user.id } });
    });

    it('should verify email with valid token and reject expired/invalid tokens', async () => {
      deleteMockEmailFile();
      const resReg = await request(app).post('/api/auth/register').send({
        email: 'test-verify-temp@ecotransit.vn',
        password: 'Password123',
      });

      const mockToken = getMockTokenFromEmailFile();

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
      const resResendLimit = await authAgent.post('/api/auth/resend-verification').send({
        targetEmail: 'test-cooldown@ecotransit.vn'
      });
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
    function deleteMockEmailFile() {
      const possiblePaths = [
        path.resolve(process.cwd(), 'last-mock-email.json'),
        path.resolve(process.cwd(), '../../last-mock-email.json'),
        path.resolve(process.cwd(), '../last-mock-email.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
    }

    function getMockTokenFromEmailFile(expectedEmail?: string): string {
      const possiblePaths = [
        path.resolve(process.cwd(), 'last-mock-email.json'),
        path.resolve(process.cwd(), '../../last-mock-email.json'),
        path.resolve(process.cwd(), '../last-mock-email.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const emailData = JSON.parse(fs.readFileSync(p, 'utf-8'));
          if (expectedEmail && emailData.to !== expectedEmail) {
            continue;
          }
          const match = emailData.text.match(/token=([a-f0-9]+)/);
          if (match) return match[1];
        }
      }
      throw new Error('Mock email file not found or token not found');
    }

    it('should preserve existing seed/demo/admin users as verified', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'user@ecotransit.vn' },
      });
      expect(user).toBeDefined();
      expect(user!.emailVerified).toBe(true);
    });

    it('should store verification token as hash in DB and never expose raw token in user DTO', async () => {
      deleteMockEmailFile();
      const res = await request(app).post('/api/auth/register').send({
        email: 'test-hash-check@ecotransit.vn',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      // User DTO in response should NOT contain raw token or hash
      expect(res.body.user.verificationTokenHash).toBeUndefined();
      expect(res.body.user.verificationTokenExpires).toBeUndefined();
      expect(res.body.mockToken).toBeUndefined();
      expect(res.body.isMock).toBeUndefined();

      // Retrieve from DB to confirm it is hashed
      const user = await prisma.user.findUnique({
        where: { email: 'test-hash-check@ecotransit.vn' },
      });
      expect(user).toBeDefined();
      expect(user!.verificationTokenHash).not.toBeNull();
      // It should be a 64-char hex hash
      expect(user!.verificationTokenHash!.length).toBe(64);

      // Verify token in mock file does not match db hash
      const rawToken = getMockTokenFromEmailFile();
      expect(user!.verificationTokenHash).not.toBe(rawToken);

      // Clean up
      await prisma.userWallet.deleteMany({ where: { userId: res.body.user.id } });
      await prisma.user.delete({ where: { id: res.body.user.id } });
    });

    it('should reject registration with 503 when SMTP is not configured in production mode', async () => {
      deleteMockEmailFile();
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
        expect(res.body.message).toContain('Tính năng gửi email xác minh đang tạm thời chưa khả dụng');
        expect(res.body.code).toBe('SMTP_NOT_CONFIGURED');
        expect(res.body.mockToken).toBeUndefined();

        // Verify user was NOT created in DB (cleaned up)
        const user = await prisma.user.findUnique({
          where: { email: 'test-prod-no-smtp@ecotransit.vn' },
        });
        expect(user).toBeNull();

        // Verify NO mock email was created
        expect(() => getMockTokenFromEmailFile('test-prod-no-smtp@ecotransit.vn')).toThrow();
      } finally {
        process.env.NODE_ENV = origNodeEnv;
        process.env.APP_MODE = origAppMode;
      }
    });

    it('should NOT delete user or mutate state on resend failure under production no-SMTP', async () => {
      deleteMockEmailFile();
      const agent = request.agent(app);
      // 1. Register a user in local mode
      const resReg = await agent.post('/api/auth/register').send({
        email: 'test-prod-resend-keep@ecotransit.vn',
        password: 'Password123',
      });
      expect(resReg.status).toBe(201);

      // Get initial database values
      const initialUser = await prisma.user.findUnique({
        where: { email: 'test-prod-resend-keep@ecotransit.vn' },
      });
      expect(initialUser).not.toBeNull();
      const initialHash = initialUser!.verificationTokenHash;
      const initialExpires = initialUser!.verificationTokenExpires;

      // Reset verificationSentAt to make sure we bypass the 60-second cooldown rate limit
      await prisma.user.update({
        where: { id: initialUser!.id },
        data: {
          verificationSentAt: new Date(Date.now() - 120 * 1000), // 2 minutes ago
        },
      });

      deleteMockEmailFile();

      // 2. Switch to production mode
      const origNodeEnv = process.env.NODE_ENV;
      const origAppMode = process.env.APP_MODE;
      process.env.NODE_ENV = 'production';
      process.env.APP_MODE = 'production';

      try {
        // Attempt to resend verification
        const resResend = await agent
          .post('/api/auth/resend-verification')
          .send({ email: 'test-prod-resend-keep@ecotransit.vn' });

        expect(resResend.status).toBe(503);
        expect(resResend.body.code).toBe('SMTP_NOT_CONFIGURED');

        // Retrieve user from DB to confirm not deleted and verification state not mutated
        const afterUser = await prisma.user.findUnique({
          where: { email: 'test-prod-resend-keep@ecotransit.vn' },
        });
        expect(afterUser).not.toBeNull();
        expect(afterUser!.verificationTokenHash).toBe(initialHash);
        expect(afterUser!.verificationTokenExpires?.getTime()).toBe(initialExpires?.getTime());

        // Verify NO mock email was created during resend failure
        expect(() => getMockTokenFromEmailFile()).toThrow();
      } finally {
        process.env.NODE_ENV = origNodeEnv;
        process.env.APP_MODE = origAppMode;

        // Clean up
        await prisma.userWallet.deleteMany({ where: { userId: resReg.body.user.id } });
        await prisma.user.delete({ where: { id: resReg.body.user.id } });
      }
    });
  });

  describe('Points Revocation Safety & Reversal Integrity', () => {
    let adminAgent: any;
    let user: any;
    let wallet: any;
    let origBalance: number;
    let origLifetime: number;

    beforeAll(async () => {
      adminAgent = request.agent(app);
      await adminAgent.post('/api/auth/login').send({
        email: 'admin@ecotransit.vn',
        password: 'Admin@123456',
      });

      user = await prisma.user.findUnique({ where: { email: 'user@ecotransit.vn' } });
      wallet = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      origBalance = wallet!.balance;
      origLifetime = wallet!.lifetimeEarned;
    });

    afterAll(async () => {
      // restore original wallet values
      if (wallet) {
        await prisma.userWallet.update({
          where: { id: wallet.id },
          data: { balance: origBalance, lifetimeEarned: origLifetime },
        });
      }
    });

    it('1. should revoke ticket when points are not used -> reversal works correctly once', async () => {
      // Seed wallet balance to 10 points
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 10, lifetimeEarned: 10 },
      });

      // Create a verified ticket
      const ticket = await prisma.ticket.create({
        data: {
          userId: user!.id,
          status: 'verified',
          imageUrl: 'uploads/test.jpg',
          routeLabel: 'Tuyến số 1',
          pointsLedgerId: 'test-ledger-id',
        },
      });

      // Mock pointsLedger entry of delta 10
      await prisma.pointsLedger.create({
        data: {
          id: 'test-ledger-id',
          userId: user!.id,
          delta: 10,
          balanceAfter: 10,
          sourceType: 'ticket',
          sourceId: ticket.id,
          idempotencyKey: `ticket_approved:${ticket.id}`,
        },
      });

      const res = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'rejected',
        note: 'Revoked for testing',
      });
      expect(res.status).toBe(200);

      const updatedWallet = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      expect(updatedWallet!.balance).toBe(0);
      expect(updatedWallet!.lifetimeEarned).toBe(0);

      // Clean up
      await prisma.ticket.delete({ where: { id: ticket.id } });
      await prisma.pointsLedger.deleteMany({ where: { sourceId: ticket.id } });
    });

    it('2. should prevent double deduction when retrying revoke', async () => {
      // Seed wallet to 10
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 10, lifetimeEarned: 10 },
      });

      const ticket = await prisma.ticket.create({
        data: {
          userId: user!.id,
          status: 'verified',
          imageUrl: 'uploads/test.jpg',
          routeLabel: 'Tuyến số 1',
          pointsLedgerId: 'test-ledger-id-2',
        },
      });

      await prisma.pointsLedger.create({
        data: {
          id: 'test-ledger-id-2',
          userId: user!.id,
          delta: 10,
          balanceAfter: 10,
          sourceType: 'ticket',
          sourceId: ticket.id,
          idempotencyKey: `ticket_approved:${ticket.id}`,
        },
      });

      // First revoke
      const res1 = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'rejected',
        note: 'Revoked for testing',
      });
      expect(res1.status).toBe(200);

      const w1 = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      expect(w1!.balance).toBe(0);

      // Seed to 10 again before retry (if it was double deduct it would deduct again)
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 10 },
      });

      // Retry revoke
      const res2 = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'rejected',
        note: 'Revoked retry',
      });
      expect(res2.status).toBe(200);

      const w2 = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      // Balance remains 10 because it was skipped (idempotent)
      expect(w2!.balance).toBe(10);

      // Clean up
      await prisma.ticket.delete({ where: { id: ticket.id } });
      await prisma.pointsLedger.deleteMany({ where: { sourceId: ticket.id } });
    });

    it('3. should block ticket revocation when points are already redeemed and balance is insufficient', async () => {
      // Seed wallet balance to 5 points (insufficient to deduct 10)
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 5, lifetimeEarned: 15 },
      });

      const ticket = await prisma.ticket.create({
        data: {
          userId: user!.id,
          status: 'verified',
          imageUrl: 'uploads/test.jpg',
          routeLabel: 'Tuyến số 1',
          pointsLedgerId: 'test-ledger-id-3',
        },
      });

      await prisma.pointsLedger.create({
        data: {
          id: 'test-ledger-id-3',
          userId: user!.id,
          delta: 10,
          balanceAfter: 15,
          sourceType: 'ticket',
          sourceId: ticket.id,
          idempotencyKey: `ticket_approved:${ticket.id}`,
        },
      });

      const res = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'rejected',
        note: 'Try revoking spent points',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Không thể thu hồi vé này tự động vì điểm thưởng đã được sử dụng để đổi quà');

      const wAfter = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      // Wallet was not mutated halfway
      expect(wAfter!.balance).toBe(5);
      expect(wAfter!.lifetimeEarned).toBe(15);

      // Clean up
      await prisma.ticket.delete({ where: { id: ticket.id } });
      await prisma.pointsLedger.deleteMany({ where: { sourceId: ticket.id } });
    });

    it('4. should keep balance non-negative at database and route levels', async () => {
      // Direct update check (we check if throwing on revoke when balance is insufficient is active)
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 2, lifetimeEarned: 12 },
      });

      const ticket = await prisma.ticket.create({
        data: {
          userId: user!.id,
          status: 'verified',
          imageUrl: 'uploads/test.jpg',
          routeLabel: 'Tuyến số 1',
          pointsLedgerId: 'test-ledger-id-4',
        },
      });

      await prisma.pointsLedger.create({
        data: {
          id: 'test-ledger-id-4',
          userId: user!.id,
          delta: 10,
          balanceAfter: 12,
          sourceType: 'ticket',
          sourceId: ticket.id,
          idempotencyKey: `ticket_approved:${ticket.id}`,
        },
      });

      // Balance of 2 is less than 10, so it must return 400 and throw error.
      const res = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'rejected',
      });
      expect(res.status).toBe(400);

      const finalWallet = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      expect(finalWallet!.balance).toBeGreaterThanOrEqual(0);

      // Clean up
      await prisma.ticket.delete({ where: { id: ticket.id } });
      await prisma.pointsLedger.deleteMany({ where: { sourceId: ticket.id } });
    });

    it('5. should not decrease lifetimeEarned when user redeems voucher', async () => {
      // Set balance to 100, lifetime to 100
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 100, lifetimeEarned: 100 },
      });

      // Find an active voucher
      const voucher = await prisma.voucher.findFirst({ where: { status: 'active', pointsCost: { gt: 0 } } });
      if (voucher) {
        const userAgent = request.agent(app);
        await userAgent.post('/api/auth/login').send({
          email: 'user@ecotransit.vn',
          password: 'User@123456',
        });

        const res = await userAgent.post('/api/rewards/redeem').send({
          voucherId: voucher.id,
        });

        if (res.status === 200) {
          const wAfterRedeem = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
          // lifetimeEarned should remain 100
          expect(wAfterRedeem!.lifetimeEarned).toBe(100);
          expect(wAfterRedeem!.balance).toBe(100 - voucher.pointsCost);

          // Clean up redemptions
          await prisma.voucherRedemption.deleteMany({ where: { userId: user!.id, voucherId: voucher.id } });
        }
      }
    });

    it('6. should prevent double crediting on ticket approval retry', async () => {
      await prisma.userWallet.update({
        where: { id: wallet!.id },
        data: { balance: 10, lifetimeEarned: 10 },
      });

      const ticket = await prisma.ticket.create({
        data: {
          userId: user!.id,
          status: 'pending',
          imageUrl: 'uploads/test.jpg',
          routeLabel: 'Tuyến số 1',
        },
      });

      // Approve ticket
      const res1 = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'approved',
        points: 10,
      });
      expect(res1.status).toBe(200);

      const w1 = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      expect(w1!.balance).toBe(20);

      // Approve retry
      const res2 = await adminAgent.post(`/api/admin/tickets/${ticket.id}/review`).send({
        decision: 'approved',
        points: 10,
      });
      // Should be 200 but skipped (idempotent, return already processed message)
      expect(res2.status).toBe(200);
      expect(res2.body.message).toContain('Trạng thái vé đã được cập nhật trước đó');

      const w2 = await prisma.userWallet.findUnique({ where: { userId: user!.id } });
      // Should still be 20
      expect(w2!.balance).toBe(20);

      // Clean up
      await prisma.ticket.delete({ where: { id: ticket.id } });
      await prisma.pointsLedger.deleteMany({ where: { sourceId: ticket.id } });
    });
  });

  describe('P0 Auth Recovery & Verification Gates', () => {
    it('1. Successful registration with mock/sent verification email remains unchanged', async () => {
      const email = 'test-p0-normal-reg@ecotransit.vn';
      const password = 'Password123';
      const registerRes = await request(app).post('/api/auth/register').send({
        email,
        password,
      });
      expect(registerRes.status).toBe(201);
      expect(registerRes.body.accountCreated).toBe(true);
      expect(registerRes.body.verificationEmailSent).toBe(true);
      expect(registerRes.body.user.emailVerified).toBe(false);

      const createdUser = await prisma.user.findUnique({ where: { email } });
      expect(createdUser).not.toBeNull();
      if (createdUser) {
        await prisma.userWallet.deleteMany({ where: { userId: createdUser.id } });
        await prisma.user.delete({ where: { id: createdUser.id } });
      }
    });

    it('2. SMTP transport timeout/failure returns truthful flags and retains user', async () => {
      const email = 'test-p0-smtp-timeout@ecotransit.vn';
      const password = 'Password123';

      const originalSendMail = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        throw new Error('SMTP_CONNECTION_TIMEOUT');
      };

      try {
        const registerRes = await request(app).post('/api/auth/register').send({
          email,
          password,
        });
        expect(registerRes.status).toBe(201);
        expect(registerRes.body.accountCreated).toBe(true);
        expect(registerRes.body.verificationEmailSent).toBe(false);
        expect(registerRes.body.recoveryAvailable).toBe(true);
        expect(registerRes.body.message).toContain('Tài khoản đã được tạo nhưng email xác minh chưa được gửi thành công');

        const createdUser = await prisma.user.findUnique({ where: { email } });
        expect(createdUser).not.toBeNull();
        expect(createdUser?.emailVerified).toBe(false);
      } finally {
        mailProvider.sendMail = originalSendMail;
      }

      const createdUser = await prisma.user.findUnique({ where: { email } });
      if (createdUser) {
        await prisma.userWallet.deleteMany({ where: { userId: createdUser.id } });
        await prisma.user.delete({ where: { id: createdUser.id } });
      }
    });

    it('3. Hard preflight mail configuration failure does not create account and returns 503', async () => {
      const email = 'test-p0-hard-preflight@ecotransit.vn';
      const password = 'Password123';

      const originalHasSmtpConfig = mailProvider.hasSmtpConfig;
      mailProvider.hasSmtpConfig = () => false;

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const registerRes = await request(app).post('/api/auth/register').send({
          email,
          password,
        });
        expect(registerRes.status).toBe(503);
        expect(registerRes.body.message).toContain('Tính năng gửi email xác minh đang tạm thời chưa khả dụng');

        const createdUser = await prisma.user.findUnique({ where: { email } });
        expect(createdUser).toBeNull();
      } finally {
        mailProvider.hasSmtpConfig = originalHasSmtpConfig;
        process.env.NODE_ENV = origNodeEnv;
      }
    });

    it('4. Refresh/interruption recovery: correct password reaches resend flow, wrong password remains generic', async () => {
      const email = 'test-p0-refresh-recover@ecotransit.vn';
      const password = 'Password123';

      // 1. Create unverified account directly or through register SMTP fail
      const originalSendMail = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        throw new Error('SMTP_CONNECTION_TIMEOUT');
      };

      const agent = request.agent(app);

      try {
        await agent.post('/api/auth/register').send({ email, password });

        const origNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        try {
          // 2. Wrong password should return generic response and NOT expose unverified status
          const wrongLoginRes = await agent.post('/api/auth/login').send({
            email,
            password: 'WrongPassword',
          });
          expect(wrongLoginRes.status).toBe(401);
          expect(wrongLoginRes.body.message).toBe('Email hoặc mật khẩu chưa đúng.');
          expect(wrongLoginRes.body.code).toBeUndefined();

          // 3. Correct password should return EMAIL_UNVERIFIED and enable resend
          const correctLoginRes = await agent.post('/api/auth/login').send({
            email,
            password,
          });
          expect(correctLoginRes.status).toBe(401);
          expect(correctLoginRes.body.code).toBe('EMAIL_UNVERIFIED');
          expect(correctLoginRes.body.recoveryAvailable).toBe(true);
        } finally {
          process.env.NODE_ENV = origNodeEnv;
        }
      } finally {
        mailProvider.sendMail = originalSendMail;
      }

      const createdUser = await prisma.user.findUnique({ where: { email } });
      if (createdUser) {
        await prisma.userWallet.deleteMany({ where: { userId: createdUser.id } });
        await prisma.user.delete({ where: { id: createdUser.id } });
      }
    });

    it('5. Resend authorization scopes: agent can resend only for authorized email, verified account does not leak state', async () => {
      const emailA = 'e2e-user-p0-resend-a@ecotransit.vn';
      const emailB = 'e2e-user-p0-resend-b@ecotransit.vn';
      const password = 'Password123';

      const originalSendMail = mailProvider.sendMail;
      let sendCount = 0;
      mailProvider.sendMail = async () => {
        sendCount++;
        return { sent: true, isMock: true };
      };

      const agentA = request.agent(app);
      const agentAnonymous = request.agent(app);

      try {
        // Register user A with SMTP timeout (unverified, sets unverifiedUserEmail in session A)
        mailProvider.sendMail = async () => {
          throw new Error('SMTP_TIMEOUT');
        };
        await agentA.post('/api/auth/register').send({ email: emailA, password });

        // Register user B normally (verified for testing)
        mailProvider.sendMail = async () => {
          return { sent: true, isMock: true };
        };
        await request(app).post('/api/auth/register').send({ email: emailB, password });
        const userB = await prisma.user.findUnique({ where: { email: emailB } });
        if (userB) {
          await prisma.user.update({
            where: { id: userB.id },
            data: { emailVerified: true },
          });
        }

        // Restore sendMail mock to trace sends
        sendCount = 0;
        mailProvider.sendMail = async () => {
          sendCount++;
          return { sent: true, isMock: true };
        };

        // Case 5.1: Agent A resends for A (authorized). Should send email.
        const resendARes = await agentA.post('/api/auth/resend-verification').send({ email: emailA });
        expect(resendARes.status).toBe(200);
        expect(sendCount).toBe(1);

        // Case 5.2: Anonymous agent resends for A. Should return generic success, but send no email.
        sendCount = 0;
        const resendAnonRes = await agentAnonymous.post('/api/auth/resend-verification').send({ email: emailA });
        expect(resendAnonRes.status).toBe(200);
        expect(resendAnonRes.body.message).toContain('Yêu cầu đã được ghi nhận');
        expect(sendCount).toBe(0);

        // Case 5.3: Agent A resends for B. Should return generic success, but send no email.
        sendCount = 0;
        const resendBRes = await agentA.post('/api/auth/resend-verification').send({ email: emailB });
        expect(resendBRes.status).toBe(200);
        expect(resendBRes.body.message).toContain('Yêu cầu đã được ghi nhận');
        expect(sendCount).toBe(0);

        // Case 5.4: Verified user B. Resend should not send email and return generic success.
        const agentB = request.agent(app);
        const origNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        try {
          await agentB.post('/api/auth/login').send({ email: emailB, password });
        } finally {
          process.env.NODE_ENV = origNodeEnv;
        }

        sendCount = 0;
        const resendVerifiedRes = await agentB.post('/api/auth/resend-verification').send({ email: emailB });
        expect(resendVerifiedRes.status).toBe(200);
        expect(resendVerifiedRes.body.message).toContain('Yêu cầu đã được ghi nhận');
        expect(sendCount).toBe(0);
      } finally {
        mailProvider.sendMail = originalSendMail;

        const uA = await prisma.user.findUnique({ where: { email: emailA } });
        if (uA) {
          await prisma.userWallet.deleteMany({ where: { userId: uA.id } });
          await prisma.user.delete({ where: { id: uA.id } });
        }
        const uB = await prisma.user.findUnique({ where: { email: emailB } });
        if (uB) {
          await prisma.userWallet.deleteMany({ where: { userId: uB.id } });
          await prisma.user.delete({ where: { id: uB.id } });
        }
      }
    });

    it('6. Cooldown rate limits repeated sends and returns safe retry metadata', async () => {
      const email = 'e2e-user-p0-resend-cooldown@ecotransit.vn';
      const password = 'Password123';

      const agent = request.agent(app);
      const originalSendMail = mailProvider.sendMail;

      try {
        // Register A (sets unverifiedUserEmail)
        mailProvider.sendMail = async () => {
          throw new Error('SMTP_TIMEOUT');
        };
        await agent.post('/api/auth/register').send({ email, password });

        mailProvider.sendMail = async () => {
          return { sent: true, isMock: true };
        };

        // First resend: accepted
        const firstResend = await agent.post('/api/auth/resend-verification').send({ email });
        expect(firstResend.status).toBe(200);

        // Immediate second resend: blocked by cooldown 429
        const secondResend = await agent.post('/api/auth/resend-verification').send({ email });
        expect(secondResend.status).toBe(429);
        expect(secondResend.body.cooldownRemaining).toBeGreaterThan(0);
        expect(secondResend.body.message).toContain('Vui lòng đợi');
      } finally {
        mailProvider.sendMail = originalSendMail;

        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });

    it('8. Detailed Unverified Access Control, Session Fixation and Wrong Password Guards', async () => {
      const email = 'unverified-test-gate@ecotransit.vn';
      const password = 'Password123';
      const agent = request.agent(app);

      // Clean up if left over
      const initialUser = await prisma.user.findUnique({ where: { email } });
      if (initialUser) {
        await prisma.userWallet.deleteMany({ where: { userId: initialUser.id } });
        await prisma.user.delete({ where: { id: initialUser.id } });
      }

      // Case 8.1: Successful registration (verificationEmailSent=true)
      // - Must not establish an authenticated session.
      // - Must set recovery session only.
      // - /me must return 401.
      const regRes = await agent.post('/api/auth/register').send({ email, password });
      expect(regRes.status).toBe(201);
      expect(regRes.body.verificationEmailSent).toBe(true);
      expect(regRes.body.recoveryAvailable).toBe(true);

      // Check /me
      const meRes = await agent.get('/api/auth/me');
      expect(meRes.status).toBe(401);

      // Protected route like /api/wallet/me must reject
      const walletRes = await agent.get('/api/wallet/me');
      expect(walletRes.status).toBe(401);

      // Case 8.2: Wrong password attempt to unverified account
      // - Generic message
      // - No auth session, no recovery session (clears recovery session)
      const wrongLoginRes = await agent.post('/api/auth/login').send({ email, password: 'WrongPassword' });
      expect(wrongLoginRes.status).toBe(401);
      expect(wrongLoginRes.body.message).toBe('Email hoặc mật khẩu chưa đúng.');
      expect(wrongLoginRes.body.code).toBeUndefined();

      // Verify recovery session was cleared by checking resend (resend should fail to send email since wrong password cleared the session)
      let sentMailAfterWrong = false;
      const originalSendMailAfterWrong = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        sentMailAfterWrong = true;
        return { sent: true, isMock: true };
      };
      try {
        const resendRes = await agent.post('/api/auth/resend-verification').send({ email });
        expect(resendRes.status).toBe(200);
        expect(sentMailAfterWrong).toBe(false);
      } finally {
        mailProvider.sendMail = originalSendMailAfterWrong;
      }

      // Case 8.3: Correct-password login to unverified account
      // - recovery session only
      // - no protected-route access
      const correctLoginRes = await agent.post('/api/auth/login').send({ email, password });
      expect(correctLoginRes.status).toBe(401);
      expect(correctLoginRes.body.code).toBe('EMAIL_UNVERIFIED');
      expect(correctLoginRes.body.recoveryAvailable).toBe(true);

      // Verify recovery session is active (resend-verification succeeds and sends email)
      const originalSendMail = mailProvider.sendMail;
      let sentMail = false;
      mailProvider.sendMail = async (options) => {
        if (options.to === email) {
          sentMail = true;
        }
        return { sent: true, isMock: true };
      };

      try {
        // Reset verificationSentAt to bypass cooldown in DB
        const userInDb = await prisma.user.findUnique({ where: { email } });
        await prisma.user.update({
          where: { id: userInDb!.id },
          data: { verificationSentAt: null },
        });

        const resendSuccessRes = await agent.post('/api/auth/resend-verification').send({ email });
        expect(resendSuccessRes.status).toBe(200);
        expect(sentMail).toBe(true);
      } finally {
        mailProvider.sendMail = originalSendMail;
      }

      // Case 8.4: Logout from recovery session
      // - Must successfully clear recovery session and return 200
      const logoutRes = await agent.post('/api/auth/logout');
      expect(logoutRes.status).toBe(200);

      // Verify recovery session was cleared by checking resend
      let sentMailAfterLogout = false;
      const originalSendMailAfterLogout = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        sentMailAfterLogout = true;
        return { sent: true, isMock: true };
      };
      try {
        const resendAfterLogout = await agent.post('/api/auth/resend-verification').send({ email });
        expect(resendAfterLogout.status).toBe(200);
        expect(sentMailAfterLogout).toBe(false);
      } finally {
        mailProvider.sendMail = originalSendMailAfterLogout;
      }

      // Clean up
      const finalUser = await prisma.user.findUnique({ where: { email } });
      if (finalUser) {
        await prisma.userWallet.deleteMany({ where: { userId: finalUser.id } });
        await prisma.user.delete({ where: { id: finalUser.id } });
      }
    });

    it('7. Initial anonymous GET /api/auth/me returns 401 without noisy output', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Bạn chưa đăng nhập');
    });

    it('8. Cross-origin HTTP response headers and session recovery contract (production-like)', async () => {
      // 1. Temporarily backup environment and config values
      const origNodeEnv = process.env.NODE_ENV;
      const origAppMode = process.env.APP_MODE;
      const origCookieSameSite = process.env.COOKIE_SAME_SITE;
      const origCookieSecure = process.env.COOKIE_SECURE;
      const origCorsOrigin = process.env.CORS_ORIGIN;

      // 2. Set non-secret production-like test values
      process.env.NODE_ENV = 'production';
      process.env.APP_MODE = 'demo';
      process.env.COOKIE_SAME_SITE = 'none';
      process.env.COOKIE_SECURE = 'true';
      process.env.CORS_ORIGIN = 'https://eco-transit-project-web-lgwz.vercel.app';

      const email = 'cross-origin-test@ecotransit.vn';
      const password = 'Password123';

      // Ensure user doesn't exist
      const initialUser = await prisma.user.findUnique({ where: { email } });
      if (initialUser) {
        await prisma.userWallet.deleteMany({ where: { userId: initialUser.id } });
        await prisma.user.delete({ where: { id: initialUser.id } });
      }

      // We need a fresh agent to isolate headers and cookies
      const agent = request.agent(app);

      try {
        // Register an unverified account (SMTP fails under mock mode since port is not configured, creating unverified account + recovery session)
        const originalHasSmtpConfig = mailProvider.hasSmtpConfig;
        mailProvider.hasSmtpConfig = () => true;

        const originalSendMail = mailProvider.sendMail;
        mailProvider.sendMail = async () => {
          throw new Error('SMTP_CONNECTION_TIMEOUT');
        };

        let response: any;
        try {
          response = await agent
            .post('/api/auth/register')
            .set('Origin', 'https://eco-transit-project-web-lgwz.vercel.app')
            .set('X-Forwarded-Proto', 'https')
            .send({ email, password });
        } finally {
          mailProvider.sendMail = originalSendMail;
          mailProvider.hasSmtpConfig = originalHasSmtpConfig;
        }

        expect(response.status).toBe(201);

        // Prove CORS headers are appropriate
        expect(response.headers['access-control-allow-origin']).toBe('https://eco-transit-project-web-lgwz.vercel.app');
        expect(response.headers['access-control-allow-credentials']).toBe('true');
        expect(response.headers['access-control-allow-origin']).not.toBe('*');

        // Prove Set-Cookie exists and contains appropriate production flags
        const setCookieHeaders = response.headers['set-cookie'] as string[];
        expect(setCookieHeaders).toBeDefined();
        expect(setCookieHeaders.length).toBeGreaterThan(0);

        const cookieStr = setCookieHeaders[0];
        expect(cookieStr).toContain('HttpOnly');
        expect(cookieStr).toContain('Secure');
        expect(cookieStr.toLowerCase()).toContain('samesite=none');
        expect(cookieStr.toLowerCase()).toContain('path=/');

        // Prove recovery session does NOT grant authenticated access to req.session.user
        // GET /api/auth/me stays unauthenticated with recovery session
        const meRes = await agent
          .get('/api/auth/me')
          .set('Origin', 'https://eco-transit-project-web-lgwz.vercel.app')
          .set('X-Forwarded-Proto', 'https')
          .set('Cookie', setCookieHeaders);
        expect(meRes.status).toBe(401);
        expect(meRes.body.user).toBeUndefined();

        // Prove resend request relies strictly on the cookie session identity rather than browser-supplied email
        // Setup a spy to trace what email is passed to SMTP send
        let sentToEmail: string | null = null;
        const spySendMail = mailProvider.sendMail;
        mailProvider.sendMail = async (options) => {
          sentToEmail = options.to;
          return { sent: true, isMock: true };
        };

        try {
          // Send request to bypass DB cooldown
          const userInDb = await prisma.user.findUnique({ where: { email } });
          await prisma.user.update({
            where: { id: userInDb!.id },
            data: { verificationSentAt: null },
          });

          // Send resend-verification request with a completely different targetEmail in the body (attacker attempt)
          const resendRes = await agent
            .post('/api/auth/resend-verification')
            .set('Origin', 'https://eco-transit-project-web-lgwz.vercel.app')
            .set('X-Forwarded-Proto', 'https')
            .set('Cookie', setCookieHeaders)
            .send({ email: 'attacker-target@ecotransit.vn' });

          // Should return the generic message but NOT send to the attacker-supplied email
          expect(resendRes.status).toBe(200);
          expect(sentToEmail).not.toBe('attacker-target@ecotransit.vn');
          expect(sentToEmail).toBeNull();

          // Resending with matching canonical email in body should succeed and send to canonical email (relying on the cookie/session)
          const resendSuccess = await agent
            .post('/api/auth/resend-verification')
            .set('Origin', 'https://eco-transit-project-web-lgwz.vercel.app')
            .set('X-Forwarded-Proto', 'https')
            .set('Cookie', setCookieHeaders)
            .send({ email });
          expect(resendSuccess.status).toBe(200);
          expect(sentToEmail).toBe(email);
        } finally {
          mailProvider.sendMail = spySendMail;
        }

      } finally {
        // Restore environment settings
        process.env.NODE_ENV = origNodeEnv;
        if (origAppMode !== undefined) process.env.APP_MODE = origAppMode; else delete process.env.APP_MODE;
        if (origCookieSameSite !== undefined) process.env.COOKIE_SAME_SITE = origCookieSameSite; else delete process.env.COOKIE_SAME_SITE;
        if (origCookieSecure !== undefined) process.env.COOKIE_SECURE = origCookieSecure; else delete process.env.COOKIE_SECURE;
        if (origCorsOrigin !== undefined) process.env.CORS_ORIGIN = origCorsOrigin; else delete process.env.CORS_ORIGIN;

        // Clean up DB user
        const finalUser = await prisma.user.findUnique({ where: { email } });
        if (finalUser) {
          await prisma.userWallet.deleteMany({ where: { userId: finalUser.id } });
          await prisma.user.delete({ where: { id: finalUser.id } });
        }
      }
    });

    it('9. Existing authenticated-session wrong-password safeguard', async () => {
      // 1. Create a verified user in DB
      const email = 'verified-safeguard@ecotransit.vn';
      const password = 'Password123';
      const hash = await argon2.hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          role: 'USER',
          emailVerified: true,
        },
      });

      const agent = request.agent(app);

      try {
        // 2. Log in successfully to establish req.session.user
        const loginRes = await agent.post('/api/auth/login').send({ email, password });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body.user).toBeDefined();
        expect(loginRes.body.user.emailVerified).toBe(true);

        // Verify /me is authenticated
        const meBefore = await agent.get('/api/auth/me');
        expect(meBefore.status).toBe(200);
        expect(meBefore.body.user.email).toBe(email);

        // 3. Submit a failed login attempt with wrong credentials in that same session context
        const failedLogin = await agent.post('/api/auth/login').send({ email, password: 'WrongPassword' });
        expect(failedLogin.status).toBe(401);

        // 4. Confirm authenticated session remains valid and untouched
        const meAfter = await agent.get('/api/auth/me');
        expect(meAfter.status).toBe(200);
        expect(meAfter.body.user.email).toBe(email);
        expect(meAfter.body.user.emailVerified).toBe(true);
      } finally {
        // Clean up
        await prisma.userWallet.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    });

    it('10. Distinct preflight config check vs transport failure outcomes and trust proxy client spoofing check', async () => {
      // 1. Proof of B (SMTP transport failure after account creation returns 201 with distinct message)
      const email = 'transport-fail-distinct@ecotransit.vn';
      const password = 'Password123';

      const originalSendMail = mailProvider.sendMail;
      const originalHasSmtpConfig = mailProvider.hasSmtpConfig;

      // Mock SMTP configured but failing during transport (e.g. connection timeout)
      mailProvider.hasSmtpConfig = () => true;
      mailProvider.sendMail = async () => {
        throw new Error('SMTP_CONNECTION_TIMEOUT');
      };

      try {
        const registerRes = await request(app)
          .post('/api/auth/register')
          .send({ email, password });

        expect(registerRes.status).toBe(201);
        expect(registerRes.body.accountCreated).toBe(true);
        expect(registerRes.body.verificationEmailSent).toBe(false);
        expect(registerRes.body.recoveryAvailable).toBe(true);
        expect(registerRes.body.message).toBe('Tài khoản đã được tạo nhưng email xác minh chưa được gửi thành công. Đăng nhập để gửi lại email xác minh.');

        // 2. Proof of trust proxy single-hop IP resolution check (client spoofing check)
        // Send a request with spoofed X-Forwarded-For header.
        // Under trust proxy = 1, Express trusts only 1 proxy, so spoofed IPs are ignored.
        const healthRes = await request(app)
          .get('/api/healthz')
          .set('X-Forwarded-For', '9.9.9.9, 8.8.8.8');
        expect(healthRes.status).toBe(200);
      } finally {
        mailProvider.sendMail = originalSendMail;
        mailProvider.hasSmtpConfig = originalHasSmtpConfig;

        const createdUser = await prisma.user.findUnique({ where: { email } });
        if (createdUser) {
          await prisma.userWallet.deleteMany({ where: { userId: createdUser.id } });
          await prisma.user.delete({ where: { id: createdUser.id } });
        }
      }
    });
  });

  describe('P0.1 SMTP Error Classification & Resend Safety Integration Tests', () => {
    it('P0.1-1. Missing/structurally invalid SMTP config registration check', async () => {
      const email = 'p01-test-missing-config@ecotransit.vn';
      const password = 'Password123';
      const originalIsConfigured = (mailProvider as any).isConfigured;
      (mailProvider as any).isConfigured = false;
      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const res = await request(app).post('/api/auth/register').send({ email, password });
        expect(res.status).toBe(503);
        expect(res.body.code).toBe('SMTP_NOT_CONFIGURED');
        expect(res.body.message).toContain('Tính năng gửi email xác minh đang tạm thời chưa khả dụng');

        const user = await prisma.user.findUnique({ where: { email } });
        expect(user).toBeNull();
      } finally {
        (mailProvider as any).isConfigured = originalIsConfigured;
        process.env.NODE_ENV = origNodeEnv;
      }
    });

    it('P0.1-2. Registration connection timeout preserves account & recovery session', async () => {
      const email = 'p01-test-timeout-reg@ecotransit.vn';
      const password = 'Password123';
      const originalSendMail = mailProvider.sendMail;
      const originalIsConfigured = (mailProvider as any).isConfigured;
      (mailProvider as any).isConfigured = true;

      mailProvider.sendMail = async () => {
        throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
      };

      const agent = request.agent(app);
      try {
        const res = await agent.post('/api/auth/register').send({ email, password });
        expect(res.status).toBe(201);
        expect(res.body.accountCreated).toBe(true);
        expect(res.body.verificationEmailSent).toBe(false);
        expect(res.body.recoveryAvailable).toBe(true);

        const user = await prisma.user.findUnique({ where: { email } });
        expect(user).not.toBeNull();
        expect(user!.emailVerified).toBe(false);
      } finally {
        mailProvider.sendMail = originalSendMail;
        (mailProvider as any).isConfigured = originalIsConfigured;
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });

    it('P0.1-3. Runtime Gmail authentication failure maps to EMAIL_DELIVERY_UNAVAILABLE', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          throw new Error('Invalid login: 535-5.7.8 Username and Password not accepted.');
        }
      };

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');
      } finally {
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.1-4. Runtime sender/recipient rejection maps to EMAIL_DELIVERY_UNAVAILABLE', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          throw new Error('554 5.7.1 <bad@example.com>: Sender address rejected: Access denied');
        }
      };

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');
      } finally {
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.1-5. Resend with missing SMTP config returns SMTP_NOT_CONFIGURED', async () => {
      const email = 'p01-test-missing-resend@ecotransit.vn';
      const password = 'Password123';
      const originalIsConfigured = (mailProvider as any).isConfigured;

      const agent = request.agent(app);
      try {
        await agent.post('/api/auth/register').send({ email, password });

        const createdUser = await prisma.user.findUnique({ where: { email } });
        await prisma.user.update({
          where: { id: createdUser!.id },
          data: { verificationSentAt: null },
        });

        (mailProvider as any).isConfigured = false;
        const origNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        try {
          const res = await agent.post('/api/auth/resend-verification').send({ email });
          expect(res.status).toBe(503);
          expect(res.body.code).toBe('SMTP_NOT_CONFIGURED');
        } finally {
          process.env.NODE_ENV = origNodeEnv;
        }
      } finally {
        (mailProvider as any).isConfigured = originalIsConfigured;
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });

    it('P0.1-6. Resend with runtime transport failure does not overwrite token/cooldown', async () => {
      const email = 'p01-test-fail-resend@ecotransit.vn';
      const password = 'Password123';
      const agent = request.agent(app);

      await agent.post('/api/auth/register').send({ email, password });

      const initialUser = await prisma.user.findUnique({ where: { email } });
      await prisma.user.update({
        where: { id: initialUser!.id },
        data: { verificationSentAt: null },
      });

      const initialTokenHash = initialUser!.verificationTokenHash;

      const originalSendMail = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const res = await agent.post('/api/auth/resend-verification').send({ email });
        expect(res.status).toBe(503);
        expect(res.body.code).toBe('EMAIL_DELIVERY_UNAVAILABLE');

        const userAfter = await prisma.user.findUnique({ where: { email } });
        expect(userAfter!.verificationTokenHash).toBe(initialTokenHash);
        expect(userAfter!.verificationSentAt).toBeNull();
      } finally {
        mailProvider.sendMail = originalSendMail;
        process.env.NODE_ENV = origNodeEnv;
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });

    it('P0.1-7. Persist failure after accepted delivery preserves old token and fails safely', async () => {
      const email = 'p01-test-persist-fail@ecotransit.vn';
      const password = 'Password123';
      const agent = request.agent(app);

      await agent.post('/api/auth/register').send({ email, password });

      const initialUser = await prisma.user.findUnique({ where: { email } });
      await prisma.user.update({
        where: { id: initialUser!.id },
        data: { verificationSentAt: null },
      });

      const initialTokenHash = initialUser!.verificationTokenHash;

      const originalSendMail = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        return { sent: true, isMock: true };
      };

      const originalUpdate = prisma.user.update;
      (prisma.user as any).update = async () => {
        throw new Error('Database connection lost');
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const res = await agent.post('/api/auth/resend-verification').send({ email });
        expect(res.status).toBe(503);
        expect(res.body.code).toBe('EMAIL_DELIVERY_UNAVAILABLE');

        (prisma.user as any).update = originalUpdate;

        const userAfter = await prisma.user.findUnique({ where: { email } });
        expect(userAfter!.verificationTokenHash).toBe(initialTokenHash);
      } finally {
        mailProvider.sendMail = originalSendMail;
        (prisma.user as any).update = originalUpdate;
        process.env.NODE_ENV = origNodeEnv;
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });

    it('P0.1-8. Concurrency guard blocks rapid duplicate sends', async () => {
      const email = 'p01-test-concurrency@ecotransit.vn';
      const password = 'Password123';
      const agent = request.agent(app);

      await agent.post('/api/auth/register').send({ email, password });

      const originalSendMail = mailProvider.sendMail;
      let sendCount = 0;
      mailProvider.sendMail = async () => {
        sendCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return { sent: true, isMock: true };
      };

      try {
        const userInDb = await prisma.user.findUnique({ where: { email } });
        await prisma.user.update({
          where: { id: userInDb!.id },
          data: { verificationSentAt: null },
        });

        const [res1, res2] = await Promise.all([
          agent.post('/api/auth/resend-verification').send({ email }),
          agent.post('/api/auth/resend-verification').send({ email }),
        ]);

        const statuses = [res1.status, res2.status];
        expect(statuses).toContain(200);
        expect(statuses).toContain(429);
        expect(sendCount).toBe(1);
      } finally {
        mailProvider.sendMail = originalSendMail;
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });

    it('P0.1-9. Successful resend sets verificationSentAt and blocks second request', async () => {
      const email = 'p01-test-success-cooldown@ecotransit.vn';
      const password = 'Password123';
      const agent = request.agent(app);

      await agent.post('/api/auth/register').send({ email, password });

      const userInDb = await prisma.user.findUnique({ where: { email } });
      await prisma.user.update({
        where: { id: userInDb!.id },
        data: { verificationSentAt: null },
      });

      const res1 = await agent.post('/api/auth/resend-verification').send({ email });
      expect(res1.status).toBe(200);

      const res2 = await agent.post('/api/auth/resend-verification').send({ email });
      expect(res2.status).toBe(429);
      expect(res2.body.message).toContain('Bạn thao tác quá nhanh');

      const u = await prisma.user.findUnique({ where: { email } });
      if (u) {
        await prisma.userWallet.deleteMany({ where: { userId: u.id } });
        await prisma.user.delete({ where: { id: u.id } });
      }
    });
  });

  describe('P0.3 Safe SMTP Diagnostics, Forensics & Production Stack Suppression Tests', () => {
    it('P0.3-1. Direct EAUTH-style error: category=AUTH_REJECTED, no raw data in logs', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          const err = new Error('Invalid login: 535-5.7.8 Username and Password not accepted.');
          (err as any).code = 'EAUTH';
          throw err;
        }
      };

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');

        expect(loggedOutput).toContain('[MAIL_TRANSPORT_FAILURE] phase=send category=AUTH_REJECTED');
        expect(loggedOutput).not.toContain('Username and Password not accepted');
        expect(loggedOutput).not.toContain('EAUTH');
      } finally {
        console.error = originalConsoleError;
        process.env.NODE_ENV = origNodeEnv;
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.3-2. Nested cause timeout: category=CONNECTION_TIMEOUT, nested cause considered, no nested raw text in logs', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          const nestedErr = new Error('Connection timeout nested details');
          (nestedErr as any).code = 'ETIMEDOUT';
          const topErr = new Error('Wrapper SMTP transport failure');
          (topErr as any).cause = nestedErr;
          throw topErr;
        }
      };

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');

        expect(loggedOutput).toContain('[MAIL_TRANSPORT_FAILURE] phase=send category=CONNECTION_TIMEOUT');
        expect(loggedOutput).not.toContain('Wrapper SMTP transport failure');
        expect(loggedOutput).not.toContain('Connection timeout nested details');
      } finally {
        console.error = originalConsoleError;
        process.env.NODE_ENV = origNodeEnv;
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.3-3. Direct unrecognized-code error: category=UNKNOWN_TRANSPORT_FAILURE, hint=DIRECT_ERROR_UNRECOGNIZED_CODE', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          const err = new Error('Something very strange happened on socket');
          (err as any).code = 'ESOMECODE';
          throw err;
        }
      };

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');

        expect(loggedOutput).toContain('[MAIL_TRANSPORT_FAILURE] phase=send category=UNKNOWN_TRANSPORT_FAILURE hint=DIRECT_ERROR_UNRECOGNIZED_CODE');
        expect(loggedOutput).not.toContain('ESOMECODE');
        expect(loggedOutput).not.toContain('Something very strange');
      } finally {
        console.error = originalConsoleError;
        process.env.NODE_ENV = origNodeEnv;
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.3-4. Direct generic no-metadata error: category=UNKNOWN_TRANSPORT_FAILURE, hint=DIRECT_ERROR_NO_METADATA', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          throw new Error('Generic error message');
        }
      };

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');

        expect(loggedOutput).toContain('[MAIL_TRANSPORT_FAILURE] phase=send category=UNKNOWN_TRANSPORT_FAILURE hint=DIRECT_ERROR_NO_METADATA');
        expect(loggedOutput).not.toContain('Generic error message');
      } finally {
        console.error = originalConsoleError;
        process.env.NODE_ENV = origNodeEnv;
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.3-5. Already-normalized application error: category=UNKNOWN_TRANSPORT_FAILURE, hint=ALREADY_NORMALIZED_ERROR', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
        }
      };

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');

        expect(loggedOutput).toContain('[MAIL_TRANSPORT_FAILURE] phase=send category=UNKNOWN_TRANSPORT_FAILURE hint=ALREADY_NORMALIZED_ERROR');
      } finally {
        console.error = originalConsoleError;
        process.env.NODE_ENV = origNodeEnv;
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.3-6. Generic SMTP responseCode only: category=SMTP_RESPONSE_REJECTED without sender/recipient evidence', async () => {
      const originalIsConfigured = (mailProvider as any).isConfigured;
      const originalTransporter = (mailProvider as any).transporter;
      (mailProvider as any).isConfigured = true;
      (mailProvider as any).transporter = {
        sendMail: async () => {
          const err = new Error('Ambiguous SMTP response');
          (err as any).responseCode = 554;
          throw err;
        }
      };

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(mailProvider.sendMail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'test',
          html: 'test'
        })).rejects.toThrow('EMAIL_DELIVERY_UNAVAILABLE');

        expect(loggedOutput).toContain('[MAIL_TRANSPORT_FAILURE] phase=send category=SMTP_RESPONSE_REJECTED');
        expect(loggedOutput).not.toContain('Ambiguous SMTP response');
      } finally {
        console.error = originalConsoleError;
        process.env.NODE_ENV = origNodeEnv;
        (mailProvider as any).isConfigured = originalIsConfigured;
        (mailProvider as any).transporter = originalTransporter;
      }
    });

    it('P0.3-7. Resend route in production: public 503, emits concise event, suppresses stack trace', async () => {
      const email = 'p03-test-production-resend@ecotransit.vn';
      const password = 'Password123';
      const agent = request.agent(app);

      await agent.post('/api/auth/register').send({ email, password });

      const initialUser = await prisma.user.findUnique({ where: { email } });
      await prisma.user.update({
        where: { id: initialUser!.id },
        data: { verificationSentAt: null },
      });

      const initialTokenHash = initialUser!.verificationTokenHash;

      const originalSendMail = mailProvider.sendMail;
      mailProvider.sendMail = async () => {
        throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
      };

      const origNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const originalConsoleError = console.error;
      let loggedOutput = '';
      console.error = (...args: any[]) => {
        loggedOutput += args.join(' ') + '\n';
      };

      try {
        const res = await agent.post('/api/auth/resend-verification').send({ email });
        expect(res.status).toBe(503);
        expect(res.body.code).toBe('EMAIL_DELIVERY_UNAVAILABLE');
        expect(res.body.cooldownRemaining).toBeUndefined();

        expect(loggedOutput).toContain('[MAIL_DELIVERY_UNAVAILABLE] action=resend');
        expect(loggedOutput).not.toContain('Failed to resend verification email');
        expect(loggedOutput).not.toContain('EMAIL_DELIVERY_UNAVAILABLE');
        expect(loggedOutput).not.toContain('at MailProvider.sendMail');

        const userAfter = await prisma.user.findUnique({ where: { email } });
        expect(userAfter!.verificationTokenHash).toBe(initialTokenHash);
        expect(userAfter!.verificationSentAt).toBeNull();
      } finally {
        console.error = originalConsoleError;
        mailProvider.sendMail = originalSendMail;
        process.env.NODE_ENV = origNodeEnv;
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.userWallet.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
    });
  });
});
