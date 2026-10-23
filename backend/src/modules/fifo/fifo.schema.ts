import { z } from 'zod';

export const calculateFifoSchema = z.object({
  body: z.object({
    godownId: z.string().uuid('Valid Godown UUID is required'),
    commodityId: z.string().uuid('Valid Commodity UUID is required'),
    requestedKg: z.number().positive('requestedKg must be strictly positive').optional(),
    requestedMt: z.number().positive('requestedMt must be strictly positive').optional(),
    targetBatchId: z.string().uuid().optional(),
  }).refine((data) => data.requestedKg !== undefined || data.requestedMt !== undefined, {
    message: 'Either requestedKg or requestedMt must be provided',
    path: ['requestedKg'],
  }),
});
