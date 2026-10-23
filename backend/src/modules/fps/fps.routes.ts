import { Router } from 'express';
import { FPSController } from './fps.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER), FPSController.list);

export default router;
