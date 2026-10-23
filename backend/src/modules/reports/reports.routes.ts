import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/ageing', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.QUALITY_INSPECTOR), ReportsController.getAgeingReport);
router.get('/fifo-compliance', authenticate, authorizeRoles(Role.ADMIN, Role.GODOWN_MANAGER, Role.DISPATCH_OFFICER), ReportsController.getComplianceReport);

export default router;
