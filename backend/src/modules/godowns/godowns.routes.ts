import { Router } from 'express';
import { GodownsController } from './godowns.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER), GodownsController.list);
router.get('/:id', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR, Role.DISPATCH_OFFICER), GodownsController.getById);

export default router;
