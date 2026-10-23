"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listChallansQuerySchema = exports.createChallanSchema = void 0;
const zod_1 = require("zod");
exports.createChallanSchema = zod_1.z.object({
    body: zod_1.z.object({
        godownId: zod_1.z.string().uuid('Valid Godown UUID is required'),
        fpsId: zod_1.z.string().uuid('Valid Fair Price Shop UUID is required'),
        commodityId: zod_1.z.string().uuid('Valid Commodity UUID is required'),
        quantityKg: zod_1.z.number().positive('quantityKg must be strictly positive').optional(),
        quantityMt: zod_1.z.number().positive('quantityMt must be strictly positive').optional(),
        vehicleNumber: zod_1.z.string().min(3, 'Vehicle registration number is required'),
        driverName: zod_1.z.string().min(2, 'Driver name is required'),
        driverPhone: zod_1.z.string().min(8, 'Driver phone number is required'),
        targetBatchId: zod_1.z.string().uuid().optional(),
        exceptionReason: zod_1.z.string().optional(),
        remarks: zod_1.z.string().optional(),
    }).refine((data) => data.quantityKg !== undefined || data.quantityMt !== undefined, {
        message: 'Either quantityKg or quantityMt must be provided',
        path: ['quantityKg'],
    }),
});
exports.listChallansQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        godownId: zod_1.z.string().uuid().optional(),
        fpsId: zod_1.z.string().uuid().optional(),
        commodityId: zod_1.z.string().uuid().optional(),
        status: zod_1.z.enum(['PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']).optional(),
    }),
});
