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
(0, vitest_1.describe)('Inventory APIs Integration Tests', () => {
    let godownId;
    let commodityId;
    (0, vitest_1.beforeAll)(async () => {
        const godown = await prisma_1.prisma.godown.findFirstOrThrow();
        const commodity = await prisma_1.prisma.commodity.findFirstOrThrow();
        godownId = godown.id;
        commodityId = commodity.id;
    });
    (0, vitest_1.it)('GET /api/inventory should return batches with computed age and eligibility', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/inventory');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(Array.isArray(res.body.data)).toBe(true);
        const first = res.body.data[0];
        (0, vitest_1.expect)(first).toHaveProperty('ageDays');
        (0, vitest_1.expect)(first).toHaveProperty('isEligible');
        (0, vitest_1.expect)(first).toHaveProperty('remainingQuantityKg');
        (0, vitest_1.expect)(first).toHaveProperty('remainingQuantityMt');
        (0, vitest_1.expect)(typeof first.ageDays).toBe('number');
    });
    (0, vitest_1.it)('GET /api/inventory/summary should return accurate stock totals and capacity utilization', async () => {
        const res = await (0, supertest_1.default)(app).get(`/api/inventory/summary?godownId=${godownId}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toHaveProperty('totalStockKg');
        (0, vitest_1.expect)(res.body.data).toHaveProperty('eligibleStockKg');
        (0, vitest_1.expect)(res.body.data).toHaveProperty('quarantinedStockKg');
        (0, vitest_1.expect)(res.body.data).toHaveProperty('capacityUtilizationPercent');
        // Quarantined stock must be accounted for and separated from eligible stock
        (0, vitest_1.expect)(res.body.data.totalStockKg).toBeGreaterThanOrEqual(res.body.data.eligibleStockKg);
    });
    (0, vitest_1.it)('GET /api/inventory/:batchId should return single batch details with movements', async () => {
        const batch = await prisma_1.prisma.inventoryBatch.findFirstOrThrow();
        const res = await (0, supertest_1.default)(app).get(`/api/inventory/${batch.id}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.id).toBe(batch.id);
        (0, vitest_1.expect)(res.body.data).toHaveProperty('movements');
    });
    (0, vitest_1.it)('GET /api/inventory with filter isEligible=true should exclude quarantined batches', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/inventory?isEligible=true');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        for (const item of res.body.data) {
            (0, vitest_1.expect)(item.isEligible).toBe(true);
            (0, vitest_1.expect)(item.status).toBe('ACTIVE');
            (0, vitest_1.expect)(item.qualityGrade).not.toBe('QUARANTINE');
            (0, vitest_1.expect)(item.qualityGrade).not.toBe('DAMAGED');
        }
    });
});
