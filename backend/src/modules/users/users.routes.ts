import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
router.get('/', authenticate, UsersController.list);
router.get('/:id', authenticate, UsersController.getById);
router.patch('/:id/role', authenticate, authorizeRoles(Role.ADMIN), UsersController.updateRole);

export default router;
