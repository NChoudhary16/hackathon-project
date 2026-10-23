"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventorySummaryQuerySchema = exports.listInventoryQuerySchema = void 0;
const zod_1 = require("zod");
exports.listInventoryQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        godownId: zod_1.z.string().uuid().optional(),
        commodityId: zod_1.z.string().uuid().optional(),
        status: zod_1.z.enum(['ACTIVE', 'EXHAUSTED', 'QUARANTINE', 'FUMIGATION_LOCKOUT']).optional(),
        qualityGrade: zod_1.z.enum(['GRADE_A', 'GRADE_B', 'QUARANTINE', 'DAMAGED']).optional(),
        isEligible: zod_1.z
            .string()
            .optional()
            .transform((val) => (val === undefined ? undefined : val === 'true')),
        minAgeDays: zod_1.z
            .string()
            .optional()
            .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined)),
        maxAgeDays: zod_1.z
            .string()
            .optional()
            .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined)),
        receiptFrom: zod_1.z.string().optional(),
        receiptTo: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
    }),
});
exports.inventorySummaryQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        godownId: zod_1.z.string().uuid().optional(),
    }),
});
