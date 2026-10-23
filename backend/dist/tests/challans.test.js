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
(0, vitest_1.describe)('Delivery Challans API Tests', () => {
    let godownId;
    let wheatId;
    let fpsId;
    (0, vitest_1.beforeAll)(async () => {
        const godown = await prisma_1.prisma.godown.findFirstOrThrow({ where: { code: 'GDN-LDH-01' } });
        const wheat = await prisma_1.prisma.commodity.findFirstOrThrow({ where: { code: 'WHEAT' } });
        const fps = await prisma_1.prisma.fairPriceShop.findFirstOrThrow();
        godownId = godown.id;
        wheatId = wheat.id;
        fpsId = fps.id;
    });
    (0, vitest_1.it)('GET /api/challans should return list of delivery challans', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/challans');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(Array.isArray(res.body.data)).toBe(true);
    });
    (0, vitest_1.it)('POST /api/challans should create delivery challan and deduct batch stock in single transaction', async () => {
        // Check oldest batch before dispatch
        const oldestBatch = await prisma_1.prisma.inventoryBatch.findFirstOrThrow({
            where: {
                godownId,
                commodityId: wheatId,
                status: 'ACTIVE',
                qualityGrade: 'GRADE_A',
                remainingQuantityKg: { gt: 5000 },
            },
            orderBy: { receiptDate: 'asc' },
        });
        const initialStock = oldestBatch.remainingQuantityKg;
        const dispatchQtyKg = 3000;
        const res = await (0, supertest_1.default)(app)
            .post('/api/challans')
            .send({
            godownId,
            fpsId,
            commodityId: wheatId,
            quantityKg: dispatchQtyKg,
            vehicleNumber: 'PB-10-DISPATCH-99',
            driverName: 'Mohinder Singh',
            driverPhone: '+91-98721-00000',
            remarks: 'Test PDS dispatch to verify stock deduction',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toHaveProperty('challanNumber');
        (0, vitest_1.expect)(res.body.data.totalQuantityKg).toBe(dispatchQtyKg);
        // Verify batch stock was deducted in database
        const batchAfter = await prisma_1.prisma.inventoryBatch.findUniqueOrThrow({
            where: { id: oldestBatch.id },
        });
        (0, vitest_1.expect)(batchAfter.remainingQuantityKg).toBe(initialStock - dispatchQtyKg);
        // Verify stock movement of type DISPATCH was recorded
        const movement = await prisma_1.prisma.stockMovement.findFirst({
            where: {
                referenceType: 'DELIVERY_CHALLAN',
                referenceId: res.body.data.id,
            },
        });
        (0, vitest_1.expect)(movement).toBeDefined();
        (0, vitest_1.expect)(movement?.movementType).toBe('DISPATCH');
        (0, vitest_1.expect)(movement?.quantityKg).toBe(-dispatchQtyKg);
    });
    (0, vitest_1.it)('POST /api/challans should reject deviation if exceptionReason is missing', async () => {
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
            const youngerBatch = eligible[eligible.length - 1];
            const res = await (0, supertest_1.default)(app)
                .post('/api/challans')
                .send({
                godownId,
                fpsId,
                commodityId: wheatId,
                quantityKg: 2000,
                vehicleNumber: 'PB-10-TEST-DEV',
                driverName: 'Driver X',
                driverPhone: '+91-98721-00000',
                targetBatchId: youngerBatch.id, // Younger batch without exceptionReason!
            });
            (0, vitest_1.expect)(res.status).toBe(400);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error).toContain('FIFO Deviation detected');
        }
    });
});
