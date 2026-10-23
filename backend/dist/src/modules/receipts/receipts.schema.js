"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceiptsQuerySchema = exports.createReceiptSchema = void 0;
const zod_1 = require("zod");
exports.createReceiptSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiptNumber: zod_1.z.string().min(3, 'Receipt number is required and must be at least 3 chars'),
        godownId: zod_1.z.string().uuid('Valid Godown UUID is required'),
        supplierId: zod_1.z.string().uuid('Valid Supplier UUID is required'),
        commodityId: zod_1.z.string().uuid('Valid Commodity UUID is required'),
        variety: zod_1.z.string().min(2, 'Commodity variety is required'),
        receiptDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'receiptDate must be a valid ISO date string',
        }),
        expiryDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'expiryDate must be a valid ISO date string',
        }),
        quantityKg: zod_1.z.number().positive('quantityKg must be strictly positive').optional(),
        quantityMt: zod_1.z.number().positive('quantityMt must be strictly positive').optional(),
        qualityGrade: zod_1.z.enum(['GRADE_A', 'GRADE_B', 'QUARANTINE', 'DAMAGED']).default('GRADE_A'),
        stackLocation: zod_1.z.string().min(2, 'Stack location is required (e.g., Bay A-1, Stack S-02)'),
        bayId: zod_1.z.string().min(1, 'Bay identifier is required (e.g., A1)'),
        moisturePercent: zod_1.z.number().min(0).max(100, 'Moisture percent must be between 0 and 100'),
        labReportNo: zod_1.z.string().optional(),
        vehicleNumber: zod_1.z.string().optional(),
        remarks: zod_1.z.string().optional(),
    }).refine((data) => data.quantityKg !== undefined || data.quantityMt !== undefined, {
        message: 'Either quantityKg or quantityMt must be provided',
        path: ['quantityKg'],
    }),
});
exports.getReceiptsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        godownId: zod_1.z.string().uuid().optional(),
        commodityId: zod_1.z.string().uuid().optional(),
        supplierId: zod_1.z.string().uuid().optional(),
        search: zod_1.z.string().optional(),
        from: zod_1.z.string().optional(),
        to: zod_1.z.string().optional(),
    }),
});
