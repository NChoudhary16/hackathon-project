import { z } from 'zod';

export const createChallanSchema = z.object({
  body: z.object({
    godownId: z.string().uuid('Valid Godown UUID is required'),
    fpsId: z.string().uuid('Valid Fair Price Shop UUID is required'),
    commodityId: z.string().uuid('Valid Commodity UUID is required'),
    quantityKg: z.number().positive('quantityKg must be strictly positive').optional(),
    quantityMt: z.number().positive('quantityMt must be strictly positive').optional(),
    vehicleNumber: z.string().min(3, 'Vehicle registration number is required'),
    driverName: z.string().min(2, 'Driver name is required'),
    driverPhone: z.string().min(8, 'Driver phone number is required'),
    targetBatchId: z.string().uuid().optional(),
    exceptionReason: z.string().optional(),
    remarks: z.string().optional(),
  }).refine((data) => data.quantityKg !== undefined || data.quantityMt !== undefined, {
    message: 'Either quantityKg or quantityMt must be provided',
    path: ['quantityKg'],
  }),
});

export const listChallansQuerySchema = z.object({
  query: z.object({
    godownId: z.string().uuid().optional(),
    fpsId: z.string().uuid().optional(),
    commodityId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']).optional(),
  }),
});
