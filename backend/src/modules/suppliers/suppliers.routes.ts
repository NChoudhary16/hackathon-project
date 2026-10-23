import { Router } from 'express';
import { SuppliersController } from './suppliers.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER), SuppliersController.list);

export default router;
