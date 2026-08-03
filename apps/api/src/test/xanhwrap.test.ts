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
    it('should assign #1 LƯỚT XANH CHỦ ĐỘNG when 100% legs are metro/bus & totalKm >= 20', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'Ga Thủ Đức', to: 'Ga Bến Thành', depart_time: '07:00', mode: 'metro', distance_km: 14, duration_min: 30 },
        { from: 'Ga Bến Thành', to: 'Ga Suối Tiên', depart_time: '17:00', mode: 'bus', distance_km: 15, duration_min: 40 },
      ];
      const label = assignXanhWrapLabel(legs);
      expect(label.code).toBe('no_smoke_absolute');
      expect(label.name).toBe('LƯỚT XANH CHỦ ĐỘNG');
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

    it('should calculate CO2e saved trip & year correctly (Spec 8: 25km test case: 15km Metro + 10km Electric Bus)', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'P. Long Thạnh Mỹ', to: 'Trường ĐH FPT', depart_time: '09:00', mode: 'bus', distance_km: 10, duration_min: 25 },
        { from: 'Trường ĐH FPT', to: 'ĐHQG TP.HCM', depart_time: '10:30', mode: 'metro', distance_km: 15, duration_min: 30 },
      ];
      const stats = calculateXanhWrapStats(legs);
      expect(stats.totalKm).toBe(25);
      expect(stats.co2e_saved_trip_kg).toBe(1.11);
      expect(stats.co2e_saved_year_kg).toBe(278);
      expect(stats.factor_version).toBe('xanhwrap-2026.08-v1');
      expect(stats.is_estimate).toBe(true);
    });

    it('should handle zero or negative CO2e savings when using higher emission modes', () => {
      const legs: XanhWrapLeg[] = [
        { from: 'A', to: 'B', depart_time: '08:00', mode: 'car', distance_km: 10, duration_min: 25 },
        { from: 'B', to: 'C', depart_time: '17:00', mode: 'car', distance_km: 10, duration_min: 25 },
      ];
      const stats = calculateXanhWrapStats(legs, { baselineMode: 'motorbike_average' });
      expect(stats.co2e_saved_trip_kg).toBe(0);
      expect(stats.co2e_saved_year_kg).toBe(0);
    });
  });

  describe('2. XanhWrap API Integration Tests', () => {
    let createdReceiptId: string;

    it('POST /api/xanhwrap/receipts should reject less than 2 legs', async () => {
      const res = await request(app)
        .post('/api/xanhwrap/receipts')
        .send({
          nickname: 'TestRunnerUser',
          recordDate: '2026-08-02',
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
          recordDate: '2026-08-02',
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

    it('POST /api/xanhwrap/receipts should create receipt with CO2e data successfully', async () => {
      const res = await request(app)
        .post('/api/xanhwrap/receipts')
        .send({
          nickname: 'TestRunnerUser',
          recordDate: '2026-08-02',
          reflection: 'Tôi đi làm bằng Metro số 1 rất tiện lợi và không khói bụi.',
          luckyNumber: 777,
          baselineMode: 'motorbike_average',
          annualTravelDays: 250,
          legs: [
            { from: 'Ga Thủ Đức', to: 'Ga Bến Thành', depart_time: '07:15', mode: 'metro', distance_km: 14, duration_min: 32 },
            { from: 'Ga Bến Thành', to: 'KĐT Phú Mỹ Hưng', depart_time: '17:30', mode: 'bus', distance_km: 7, duration_min: 25 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.nickname).toBe('TestRunnerUser');
      expect(res.body.assignedLabelName).toBe('LƯỚT XANH CHỦ ĐỘNG');
      expect(res.body.luckyNumber).toBe(777);
      expect(res.body.co2e_saved_trip_kg).toBeGreaterThan(0);
      expect(res.body.factor_version).toBe('xanhwrap-2026.08-v1');

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

    it('GET /api/xanhwrap/receipts/:id should fetch created receipt with CO2e stats', async () => {
      const res = await request(app).get(`/api/xanhwrap/receipts/${createdReceiptId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdReceiptId);
      expect(res.body.postUrl).toContain('facebook.com');
      expect(res.body.co2e_saved_trip_kg).toBeDefined();
    });
  });
});

