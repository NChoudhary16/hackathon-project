import { Router } from 'express';
import { FifoController } from './fifo.controller';
import { validate } from '../../middleware/validate.middleware';
import { calculateFifoSchema } from './fifo.schema';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/calculate',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER),
  validate(calculateFifoSchema),
  FifoController.calculate
);
router.get(
  '/eligible',
  authenticate,
  authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER),
  FifoController.getEligible
);

export default router;
