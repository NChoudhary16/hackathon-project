import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { validate } from '../../middleware/validate.middleware';
import { listInventoryQuerySchema, inventorySummaryQuerySchema } from './inventory.schema';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/summary',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER),
  validate(inventorySummaryQuerySchema),
  InventoryController.getSummary
);
router.get(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER),
  validate(listInventoryQuerySchema),
  InventoryController.list
);
router.get(
  '/:batchId',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER),
  InventoryController.getById
);

export default router;
