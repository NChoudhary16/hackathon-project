import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/logs', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER), AuditController.list);
router.get('/exceptions', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER), AuditController.listExceptions);

export default router;
