"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const prisma_1 = require("../src/lib/prisma");
const app = (0, app_1.createApp)();
(0, vitest_1.describe)('FIFO Allocation Engine Tests', () => {
    let godownId;
    let wheatId;
    (0, vitest_1.beforeAll)(async () => {
        const godown = await prisma_1.prisma.godown.findFirstOrThrow({ where: { code: 'GDN-LDH-01' } });
        const wheat = await prisma_1.prisma.commodity.findFirstOrThrow({ where: { code: 'WHEAT' } });
        godownId = godown.id;
        wheatId = wheat.id;
    });
    (0, vitest_1.it)('POST /api/fifo/calculate should strictly allocate from oldest eligible batch first', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/fifo/calculate')
            .send({
            godownId,
            commodityId: wheatId,
            requestedKg: 10000, // 10 MT
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.isFullyFulfilled).toBe(true);
        (0, vitest_1.expect)(res.body.data.allocations.length).toBeGreaterThan(0);
        const firstAllocation = res.body.data.allocations[0];
        (0, vitest_1.expect)(firstAllocation.priorityRank).toBe(1);
        (0, vitest_1.expect)(firstAllocation.isOldestAvailable).toBe(true);
        (0, vitest_1.expect)(res.body.data.hasDeviation).toBe(false);
    });
    (0, vitest_1.it)('POST /api/fifo/calculate should detect deviation when younger batch is manually selected', async () => {
        // Fetch all eligible batches ordered by receiptDate
        const eligible = await prisma_1.prisma.inventoryBatch.findMany({
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
            const res = await (0, supertest_1.default)(app)
                .post('/api/fifo/calculate')
                .send({
                godownId,
                commodityId: wheatId,
                requestedKg: 5000,
                targetBatchId: youngerBatch.id,
            });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.hasDeviation).toBe(true);
            (0, vitest_1.expect)(res.body.data.deviationBatchCount).toBeGreaterThan(0);
            (0, vitest_1.expect)(res.body.data.bypassedBatchIds.length).toBeGreaterThan(0);
        }
    });
    (0, vitest_1.it)('GET /api/fifo/eligible should return batches ordered by receiptDate ascending', async () => {
        const res = await (0, supertest_1.default)(app).get(`/api/fifo/eligible?godownId=${godownId}&commodityId=${wheatId}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(Array.isArray(res.body.data)).toBe(true);
        for (let i = 0; i < res.body.data.length - 1; i++) {
            const current = new Date(res.body.data[i].receiptDate).getTime();
            const next = new Date(res.body.data[i + 1].receiptDate).getTime();
            (0, vitest_1.expect)(current).toBeLessThanOrEqual(next);
        }
    });
});
