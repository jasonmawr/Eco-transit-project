import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import { assignXanhWrapLabel, calculateXanhWrapStats, XanhWrapLeg } from '../utils/xanhwrapCore.js';

describe('XanhWrap Minigame Core & API Test Suite', () => {
  beforeAll(async () => {
    // Clean up test receipts if any
    await prisma.xanhWrapReceipt.deleteMany({
      where: { nickname: 'TestRunnerUser' },
    });
  });

  describe('1. 16 Identity Labels Algorithm Unit Tests', () => {
    it('should assign #1 KHÔNG KHÓI TUYỆT ĐỐI when 100% legs are metro/bus & totalKm >= 20', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'Ga Thủ Đức', to: 'Ga Bến Thành', depart_time: '07:00', mode: 'metro', distance_km: 14, duration_min: 30 },
        { from: 'Ga Bến Thành', to: 'Ga Suối Tiên', depart_time: '17:00', mode: 'bus', distance_km: 15, duration_min: 40 },
      ];
      const label = assignXanhWrapLabel(legs);
      expect(label.code).toBe('no_smoke_absolute');
      expect(label.name).toBe('KHÔNG KHÓI TUYỆT ĐỐI');
    });

    it('should assign #2 TAY LÁI VỀ HƯU when 100% legs are metro/bus & totalKm < 20', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'A', to: 'B', depart_time: '08:00', mode: 'metro', distance_km: 5, duration_min: 15 },
        { from: 'B', to: 'C', depart_time: '12:00', mode: 'bus', distance_km: 4, duration_min: 15 },
      ];
      const label = assignXanhWrapLabel(legs);
      expect(label.code).toBe('retired_driver');
      expect(label.name).toBe('TAY LÁI VỀ HƯU');
    });

    it('should assign #4 TẬP TÀNH BỎ XE when at least 1 leg is bus/metro', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'A', to: 'B', depart_time: '08:00', mode: 'motorbike', distance_km: 6, duration_min: 20 },
        { from: 'B', to: 'C', depart_time: '17:30', mode: 'metro', distance_km: 5, duration_min: 15 },
      ];
      const label = assignXanhWrapLabel(legs);
      expect(label.code).toBe('quitting_rookie');
      expect(label.name).toBe('TẬP TÀNH BỎ XE');
    });

    it('should assign #5 TRÙM CUỐI XA LỘ when no public legs & totalKm >= 35', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'A', to: 'B', depart_time: '08:00', mode: 'motorbike', distance_km: 20, duration_min: 40 },
        { from: 'B', to: 'C', depart_time: '14:00', mode: 'car', distance_km: 20, duration_min: 45 },
      ];
      const label = assignXanhWrapLabel(legs);
      expect(label.code).toBe('highway_boss');
    });

    it('should assign #6 CÚ ĐÊM CHÍNH HIỆU when depart_time >= 21:00', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'A', to: 'B', depart_time: '12:00', mode: 'motorbike', distance_km: 5, duration_min: 15 },
        { from: 'B', to: 'C', depart_time: '21:30', mode: 'motorbike', distance_km: 5, duration_min: 15 },
      ];
      const label = assignXanhWrapLabel(legs);
      expect(label.code).toBe('night_owl');
    });

    it('should calculate CO2 saved & hands-free minutes correctly', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'A', to: 'B', depart_time: '07:00', mode: 'metro', distance_km: 10, duration_min: 25 },
        { from: 'B', to: 'C', depart_time: '17:00', mode: 'bus', distance_km: 5, duration_min: 20 },
      ];
      const stats = calculateXanhWrapStats(legs);
      expect(stats.totalKm).toBe(15);
      expect(stats.totalMin).toBe(45);
      expect(stats.handsFreeMin).toBe(45);
      expect(stats.co2SavedGrams).toBeGreaterThan(0);
    });
  });

  describe('2. XanhWrap API Integration Tests', () => {
    let createdReceiptId: string;

    it('POST /api/xanhwrap/receipts should reject less than 2 legs', async () => {
      const res = await request(app)
        .post('/api/xanhwrap/receipts')
        .send({
          nickname: 'TestRunnerUser',
          recordDate: '2026-07-23',
          reflection: 'Tôi đi làm bằng Metro buổi sáng rất nhẹ nhàng.',
          luckyNumber: 888,
          legs: [
            { from: 'Ga A', to: 'Ga B', depart_time: '07:00', mode: 'metro', distance_km: 10, duration_min: 20 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('từ 2 đến 8 chặng');
    });

    it('POST /api/xanhwrap/receipts should reject overlapping leg times', async () => {
      const res = await request(app)
        .post('/api/xanhwrap/receipts')
        .send({
          nickname: 'TestRunnerUser',
          recordDate: '2026-07-23',
          reflection: 'Tôi đi làm bằng Metro buổi sáng rất nhẹ nhàng.',
          luckyNumber: 888,
          legs: [
            { from: 'Ga A', to: 'Ga B', depart_time: '07:00', mode: 'metro', distance_km: 10, duration_min: 40 }, // ends 07:40
            { from: 'Ga B', to: 'Ga C', depart_time: '07:30', mode: 'bus', distance_km: 5, duration_min: 20 },   // starts 07:30 < 07:40
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('bị trùng thời gian');
    });

    it('POST /api/xanhwrap/receipts should create receipt successfully', async () => {
      const res = await request(app)
        .post('/api/xanhwrap/receipts')
        .send({
          nickname: 'TestRunnerUser',
          recordDate: '2026-07-23',
          reflection: 'Tôi đi làm bằng Metro số 1 rất tiện lợi và không khói bụi.',
          luckyNumber: 777,
          legs: [
            { from: 'Ga Thủ Đức', to: 'Ga Bến Thành', depart_time: '07:15', mode: 'metro', distance_km: 14, duration_min: 32 },
            { from: 'Ga Bến Thành', to: 'KĐT Phú Mỹ Hưng', depart_time: '17:30', mode: 'bus', distance_km: 7, duration_min: 25 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.nickname).toBe('TestRunnerUser');
      expect(res.body.assignedLabelName).toBe('KHÔNG KHÓI TUYỆT ĐỐI');
      expect(res.body.luckyNumber).toBe(777);

      createdReceiptId = res.body.id;
    });

    it('POST /api/xanhwrap/submit-link should validate social media URLs', async () => {
      const resInvalid = await request(app)
        .post('/api/xanhwrap/submit-link')
        .send({
          receiptId: createdReceiptId,
          postUrl: 'https://unknown-website.com/post/123',
        });

      expect(resInvalid.status).toBe(400);
      expect(resInvalid.body.message).toContain('Facebook');

      const resValid = await request(app)
        .post('/api/xanhwrap/submit-link')
        .send({
          receiptId: createdReceiptId,
          postUrl: 'https://facebook.com/testrunner/posts/1000999888',
        });

      expect(resValid.status).toBe(200);
      expect(resValid.body.confirmationCode).toMatch(/^XW-2026-\d{4}$/);
    });

    it('GET /api/xanhwrap/receipts/:id should fetch created receipt', async () => {
      const res = await request(app).get(`/api/xanhwrap/receipts/${createdReceiptId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdReceiptId);
      expect(res.body.postUrl).toContain('facebook.com');
    });
  });
});
