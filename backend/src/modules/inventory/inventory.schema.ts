import { z } from 'zod';

export const listInventoryQuerySchema = z.object({
  query: z.object({
    godownId: z.string().uuid().optional(),
    commodityId: z.string().uuid().optional(),
    status: z.enum(['ACTIVE', 'EXHAUSTED', 'QUARANTINE', 'FUMIGATION_LOCKOUT']).optional(),
    qualityGrade: z.enum(['GRADE_A', 'GRADE_B', 'QUARANTINE', 'DAMAGED']).optional(),
    isEligible: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : val === 'true')),
    minAgeDays: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined)),
    maxAgeDays: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined)),
    receiptFrom: z.string().optional(),
    receiptTo: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const inventorySummaryQuerySchema = z.object({
  query: z.object({
    godownId: z.string().uuid().optional(),
  }),
});
