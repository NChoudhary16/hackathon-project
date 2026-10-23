"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFifoSchema = void 0;
const zod_1 = require("zod");
exports.calculateFifoSchema = zod_1.z.object({
    body: zod_1.z.object({
        godownId: zod_1.z.string().uuid('Valid Godown UUID is required'),
        commodityId: zod_1.z.string().uuid('Valid Commodity UUID is required'),
        requestedKg: zod_1.z.number().positive('requestedKg must be strictly positive').optional(),
        requestedMt: zod_1.z.number().positive('requestedMt must be strictly positive').optional(),
        targetBatchId: zod_1.z.string().uuid().optional(),
    }).refine((data) => data.requestedKg !== undefined || data.requestedMt !== undefined, {
        message: 'Either requestedKg or requestedMt must be provided',
        path: ['requestedKg'],
    }),
});
