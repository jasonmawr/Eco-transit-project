import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import { config } from '../config/index.js';

describe('Gemini Ticket verification & Email Auto-login Integration Tests', () => {
  let testUser: any;
  let rawToken: string;

  beforeEach(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: 'gemini-tester@ecotransit.vn' } });

    // Register user
    const resReg = await request(app).post('/api/auth/register').send({
      email: 'gemini-tester@ecotransit.vn',
      password: 'Password123',
    });
    testUser = resReg.body.user;


    // Since it's in MOCK mode, we can read rawToken from mock email or db
    // Let's generate a known token directly in DB for testing verification
    rawToken = 'test-token-123456';
    const crypto = await import('crypto');
    const tokenHash = crypto.default.createHash('sha256').update(rawToken).digest('hex');
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        verificationTokenHash: tokenHash,
        verificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
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

  it('should auto-login the user upon successful email verification', async () => {
    const agent = request.agent(app);

    // Call verify-email
    const resVerify = await agent.post('/api/auth/verify-email').send({
      token: rawToken,
    });
    expect(resVerify.status).toBe(200);
    expect(resVerify.body.user.emailVerified).toBe(true);

    // Now call GET /auth/me to check if we are authenticated
    const resMe = await agent.get('/api/auth/me');
    expect(resMe.status).toBe(200);
    expect(resMe.body.user).toBeDefined();
    expect(resMe.body.user.email).toBe('gemini-tester@ecotransit.vn');
  });

  it('should enforce fraud protection: detect duplicate serial number via Gemini API and block second upload', async () => {
    // Enable Gemini API simulation
    const originalKey = config.GEMINI_API_KEY;
    config.GEMINI_API_KEY = 'mock-api-key';

    // Mock Gemini response returning a specific serialNumber
    const mockSerialNumber = 'VE-METRO-999999';
    const mockGeminiResponse = {
      isValid: true,
      type: 'metro',
      serialNumber: mockSerialNumber,
      tripDate: '2026-07-15',
      confidenceScore: 0.98,
      ocrText: 'Vé Metro Bến Thành - Suối Tiên. Serial: VE-METRO-999999',
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockGeminiResponse) }],
              },
            },
          ],
        }),
      } as any);
    });

    const agent = request.agent(app);

    // Set emailVerified to true BEFORE logging in, as login blocks unverified users
    await prisma.user.update({
      where: { id: testUser.id },
      data: { emailVerified: true },
    });

    // Log in
    const loginRes = await agent.post('/api/auth/login').send({
      email: 'gemini-tester@ecotransit.vn',
      password: 'Password123',
    });
    expect(loginRes.status).toBe(200);

    // Create a dummy image buffer for testing
    const dummyGifBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b');
    // Jimp mock read
    const Jimp = await import('jimp');
    vi.spyOn(Jimp.Jimp, 'read').mockImplementation(() => {
      return Promise.resolve({
        width: 100,
        height: 100,
        resize: () => {},
        getBuffer: () => Promise.resolve(dummyGifBuffer),
      } as any);
    });

    // First upload
    const res1 = await agent
      .post('/api/tickets/upload')
      .attach('ticketImage', dummyGifBuffer, 'ticket1.png')
      .field('type', 'metro');

    expect(res1.status).toBe(201);
    expect(res1.body.ticket).toBeDefined();

    // Reset fetch mock to return the same serial number but different image buffer for the second upload
    const dummyPngBuffer = Buffer.from('PNG...\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b');

    // Second upload (should be blocked by duplicate serial number check)
    const res2 = await agent
      .post('/api/tickets/upload')
      .attach('ticketImage', dummyPngBuffer, 'ticket2.png')
      .field('type', 'metro');

    expect(res2.status).toBe(409);
    expect(res2.body.message).toContain('đã được tải lên hệ thống trước đó');

    config.GEMINI_API_KEY = originalKey;
  });
});
