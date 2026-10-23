import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();

describe('FIFO Allocation Engine Tests', () => {
  let godownId: string;
  let wheatId: string;

  beforeAll(async () => {
    const godown = await prisma.godown.findFirstOrThrow({ where: { code: 'GDN-LDH-01' } });
    const wheat = await prisma.commodity.findFirstOrThrow({ where: { code: 'WHEAT' } });
    godownId = godown.id;
    wheatId = wheat.id;
  });

  it('POST /api/fifo/calculate should strictly allocate from oldest eligible batch first', async () => {
    const res = await request(app)
      .post('/api/fifo/calculate')
      .send({
        godownId,
        commodityId: wheatId,
        requestedKg: 10000, // 10 MT
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isFullyFulfilled).toBe(true);
    expect(res.body.data.allocations.length).toBeGreaterThan(0);

    const firstAllocation = res.body.data.allocations[0];
    expect(firstAllocation.priorityRank).toBe(1);
    expect(firstAllocation.isOldestAvailable).toBe(true);
    expect(res.body.data.hasDeviation).toBe(false);
  });

  it('POST /api/fifo/calculate should detect deviation when younger batch is manually selected', async () => {
    // Fetch all eligible batches ordered by receiptDate
    const eligible = await prisma.inventoryBatch.findMany({
      where: {
        godownId,
        commodityId: wheatId,
        status: 'ACTIVE',
        qualityGrade: 'GRADE_A',
        remainingQuantityKg: { gt: 0 },
      },
      orderBy: { receiptDate: 'asc' },
    });

    if (eligible.length > 1) {
      const youngerBatch = eligible[eligible.length - 1]; // Pick youngest batch

      const res = await request(app)
        .post('/api/fifo/calculate')
        .send({
          godownId,
          commodityId: wheatId,
          requestedKg: 5000,
          targetBatchId: youngerBatch.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasDeviation).toBe(true);
      expect(res.body.data.deviationBatchCount).toBeGreaterThan(0);
      expect(res.body.data.bypassedBatchIds.length).toBeGreaterThan(0);
    }
  });

  it('GET /api/fifo/eligible should return batches ordered by receiptDate ascending', async () => {
    const res = await request(app).get(`/api/fifo/eligible?godownId=${godownId}&commodityId=${wheatId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    for (let i = 0; i < res.body.data.length - 1; i++) {
      const current = new Date(res.body.data[i].receiptDate).getTime();
      const next = new Date(res.body.data[i + 1].receiptDate).getTime();
      expect(current).toBeLessThanOrEqual(next);
    }
  });
});
