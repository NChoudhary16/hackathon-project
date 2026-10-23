import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema, registerSchema } from './auth.schema';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/register', authenticate, authorizeRoles(Role.ADMIN), validate(registerSchema), AuthController.register);
router.get('/me', authenticate, AuthController.me);

export default router;
