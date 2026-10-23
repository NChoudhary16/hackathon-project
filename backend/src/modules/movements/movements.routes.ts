import { Router } from 'express';
import { MovementsController } from './movements.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER), MovementsController.list);

export default router;
