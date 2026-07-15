import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import { config } from '../config/index.js';

describe('Green Buddy AI Assistant Router Integration Tests', () => {
  let testUser: any;
  let userAgent: any;

  beforeEach(async () => {
    // Clean up if previous tests left state
    await prisma.user.deleteMany({ where: { email: 'ai-tester@ecotransit.vn' } });

    // Register a test user
    const resReg = await request(app).post('/api/auth/register').send({
      email: 'ai-tester@ecotransit.vn',
      password: 'Password123',
    });
    testUser = resReg.body.user;

    // Simulate verified email
    await prisma.user.update({
      where: { id: testUser.id },
      data: { emailVerified: true },
    });

    // Create session agent
    userAgent = request.agent(app);
    await userAgent.post('/api/auth/login').send({
      email: 'ai-tester@ecotransit.vn',
      password: 'Password123',
    });
  });

  afterEach(async () => {
    // Clean up
    if (testUser?.id) {
      await prisma.userWallet.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    vi.restoreAllMocks();
  });

  it('should block unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/ai/chat').send({
      messages: [{ role: 'user', content: 'hello' }],
    });
    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid message logs', async () => {
    const res = await userAgent.post('/api/ai/chat').send({
      messages: 'not-an-array',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Lịch sử tin nhắn không hợp lệ');
  });

  it('should call Gemini API and return simulated assistant reply', async () => {
    // Temporarily set API key for the test
    const originalKey = config.GEMINI_API_KEY;
    config.GEMINI_API_KEY = 'mock-api-key';

    // Mock fetch for Gemini API
    const mockReply = 'Chào bạn! Mình là Green Buddy 🌿. Đây là phản hồi giả lập của mình!';
    const spyFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: mockReply }],
              },
            },
          ],
        }),
      } as any);
    });

    const res = await userAgent.post('/api/ai/chat').send({
      messages: [{ role: 'user', content: 'Chào bạn Green Buddy' }],
    });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe(mockReply);
    expect(spyFetch).toHaveBeenCalled();

    // Restore original key
    config.GEMINI_API_KEY = originalKey;
  });
});
