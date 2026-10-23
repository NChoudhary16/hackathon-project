import { Router } from 'express';
import { ReceiptsController } from './receipts.controller';
import { validate } from '../../middleware/validate.middleware';
import { createReceiptSchema, getReceiptsQuerySchema } from './receipts.schema';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR),
  validate(createReceiptSchema),
  ReceiptsController.createReceipt
);
router.get(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER),
  validate(getReceiptsQuerySchema),
  ReceiptsController.listReceipts
);
router.get(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER),
  ReceiptsController.getReceiptById
);

export default router;
