import { Router } from 'express';
import { ChallansController } from './challans.controller';
import { validate } from '../../middleware/validate.middleware';
import { createChallanSchema, listChallansQuerySchema } from './challans.schema';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER),
  validate(createChallanSchema),
  ChallansController.create
);
router.get(
  '/',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER, Role.QUALITY_INSPECTOR),
  validate(listChallansQuerySchema),
  ChallansController.list
);
router.get(
  '/:id',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER, Role.QUALITY_INSPECTOR),
  ChallansController.getById
);

export default router;
