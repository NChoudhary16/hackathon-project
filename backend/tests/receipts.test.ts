import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();

describe('Stock Receipts API Integration Tests', () => {
  let godownId: string;
  let supplierId: string;
  let commodityId: string;

  beforeAll(async () => {
    const godown = await prisma.godown.findFirstOrThrow();
    const supplier = await prisma.supplier.findFirstOrThrow();
    const commodity = await prisma.commodity.findFirstOrThrow();

    godownId = godown.id;
    supplierId = supplier.id;
    commodityId = commodity.id;
  });

  it('GET /api/receipts should return list of stock receipts with MT conversion', async () => {
    const res = await request(app).get('/api/receipts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('quantityMt');
    expect(res.body.data[0]).toHaveProperty('quantityKg');
  });

  it('POST /api/receipts should create receipt, batch, and append-only movement in one transaction', async () => {
    const uniqueReceiptNo = `TEST/REC/${Date.now()}`;
    const payload = {
      receiptNumber: uniqueReceiptNo,
      godownId,
      supplierId,
      commodityId,
      variety: 'HD-3086 Test Consignment',
      receiptDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantityKg: 25000, // 25 MT
      qualityGrade: 'GRADE_A',
      stackLocation: 'Bay B-1, Stack S-10',
      bayId: 'B1',
      moisturePercent: 11.5,
      labReportNo: 'AGMARK-TEST-001',
      vehicleNumber: 'PB-10-TEST-123',
      remarks: 'Automated test consignment receipt',
    };

    const res = await request(app).post('/api/receipts').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.receipt.receiptNumber).toBe(uniqueReceiptNo);
    expect(res.body.data.receipt.quantityKg).toBe(25000);
    expect(res.body.data.receipt.quantityMt).toBe(25);

    // Verify batch was created with matching quantity and Active status
    expect(res.body.data.batch.remainingQuantityKg).toBe(25000);
    expect(res.body.data.batch.status).toBe('ACTIVE');

    // Verify stock movement was recorded
    expect(res.body.data.movement.movementType).toBe('RECEIPT');
    expect(res.body.data.movement.quantityKg).toBe(25000);
    expect(res.body.data.movement.balanceAfterKg).toBe(25000);

    // Test GET /api/receipts/:id with the newly created receipt
    const detailRes = await request(app).get(`/api/receipts/${res.body.data.receipt.id}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.receiptNumber).toBe(uniqueReceiptNo);
  });

  it('POST /api/receipts should reject duplicate receipt numbers with 409 Conflict', async () => {
    const existing = await prisma.stockReceipt.findFirstOrThrow();

    const payload = {
      receiptNumber: existing.receiptNumber, // Duplicate!
      godownId,
      supplierId,
      commodityId,
      variety: 'HD-3086 Duplicate',
      receiptDate: '2026-10-22',
      expiryDate: '2027-10-22',
      quantityKg: 10000,
      qualityGrade: 'GRADE_A',
      stackLocation: 'Bay B-2',
      bayId: 'B2',
      moisturePercent: 11.0,
    };

    const res = await request(app).post('/api/receipts').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already exists');
  });

  it('POST /api/receipts should reject invalid or non-existent godown ID with 404', async () => {
    const payload = {
      receiptNumber: `INVALID/GODOWN/${Date.now()}`,
      godownId: '00000000-0000-0000-0000-000000000000',
      supplierId,
      commodityId,
      variety: 'HD-3086',
      receiptDate: '2026-10-22',
      expiryDate: '2027-10-22',
      quantityKg: 10000,
      qualityGrade: 'GRADE_A',
      stackLocation: 'Bay B-2',
      bayId: 'B2',
      moisturePercent: 11.0,
    };

    const res = await request(app).post('/api/receipts').send(payload);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/receipts should reject zero or negative quantities with 400', async () => {
    const payload = {
      receiptNumber: `ZERO/QTY/${Date.now()}`,
      godownId,
      supplierId,
      commodityId,
      variety: 'HD-3086',
      receiptDate: '2026-10-22',
      expiryDate: '2027-10-22',
      quantityKg: -500, // Negative!
      qualityGrade: 'GRADE_A',
      stackLocation: 'Bay B-2',
      bayId: 'B2',
      moisturePercent: 11.0,
    };

    const res = await request(app).post('/api/receipts').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
