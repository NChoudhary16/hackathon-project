import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();

describe('Inventory APIs Integration Tests', () => {
  let godownId: string;
  let commodityId: string;

  beforeAll(async () => {
    const godown = await prisma.godown.findFirstOrThrow();
    const commodity = await prisma.commodity.findFirstOrThrow();
    godownId = godown.id;
    commodityId = commodity.id;
  });

  it('GET /api/inventory should return batches with computed age and eligibility', async () => {
    const res = await request(app).get('/api/inventory');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const first = res.body.data[0];
    expect(first).toHaveProperty('ageDays');
    expect(first).toHaveProperty('isEligible');
    expect(first).toHaveProperty('remainingQuantityKg');
    expect(first).toHaveProperty('remainingQuantityMt');
    expect(typeof first.ageDays).toBe('number');
  });

  it('GET /api/inventory/summary should return accurate stock totals and capacity utilization', async () => {
    const res = await request(app).get(`/api/inventory/summary?godownId=${godownId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalStockKg');
    expect(res.body.data).toHaveProperty('eligibleStockKg');
    expect(res.body.data).toHaveProperty('quarantinedStockKg');
    expect(res.body.data).toHaveProperty('capacityUtilizationPercent');

    // Quarantined stock must be accounted for and separated from eligible stock
    expect(res.body.data.totalStockKg).toBeGreaterThanOrEqual(res.body.data.eligibleStockKg);
  });

  it('GET /api/inventory/:batchId should return single batch details with movements', async () => {
    const batch = await prisma.inventoryBatch.findFirstOrThrow();
    const res = await request(app).get(`/api/inventory/${batch.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(batch.id);
    expect(res.body.data).toHaveProperty('movements');
  });

  it('GET /api/inventory with filter isEligible=true should exclude quarantined batches', async () => {
    const res = await request(app).get('/api/inventory?isEligible=true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    for (const item of res.body.data) {
      expect(item.isEligible).toBe(true);
      expect(item.status).toBe('ACTIVE');
      expect(item.qualityGrade).not.toBe('QUARANTINE');
      expect(item.qualityGrade).not.toBe('DAMAGED');
    }
  });
});
