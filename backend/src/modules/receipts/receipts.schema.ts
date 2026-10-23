import { z } from 'zod';

export const createReceiptSchema = z.object({
  body: z.object({
    receiptNumber: z.string().min(3, 'Receipt number is required and must be at least 3 chars'),
    godownId: z.string().uuid('Valid Godown UUID is required'),
    supplierId: z.string().uuid('Valid Supplier UUID is required'),
    commodityId: z.string().uuid('Valid Commodity UUID is required'),
    variety: z.string().min(2, 'Commodity variety is required'),
    receiptDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'receiptDate must be a valid ISO date string',
    }),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'expiryDate must be a valid ISO date string',
    }),
    quantityKg: z.number().positive('quantityKg must be strictly positive').optional(),
    quantityMt: z.number().positive('quantityMt must be strictly positive').optional(),
    qualityGrade: z.enum(['GRADE_A', 'GRADE_B', 'QUARANTINE', 'DAMAGED']).default('GRADE_A'),
    stackLocation: z.string().min(2, 'Stack location is required (e.g., Bay A-1, Stack S-02)'),
    bayId: z.string().min(1, 'Bay identifier is required (e.g., A1)'),
    moisturePercent: z.number().min(0).max(100, 'Moisture percent must be between 0 and 100'),
    labReportNo: z.string().optional(),
    vehicleNumber: z.string().optional(),
    remarks: z.string().optional(),
  }).refine((data) => data.quantityKg !== undefined || data.quantityMt !== undefined, {
    message: 'Either quantityKg or quantityMt must be provided',
    path: ['quantityKg'],
  }),
});

export const getReceiptsQuerySchema = z.object({
  query: z.object({
    godownId: z.string().uuid().optional(),
    commodityId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    search: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});
