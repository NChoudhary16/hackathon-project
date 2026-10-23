import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import { AppError } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { godown: true },
      });

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        godownId: user.godownId,
      });

      res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            godown: user.godown
              ? {
                  id: user.godown.id,
                  code: user.godown.code,
                  name: user.godown.name,
                }
              : null,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          godown: {
            select: { id: true, code: true, name: true, district: true, state: true },
          },
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role, godownId } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError('A user with this email already exists', 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role,
          godownId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          godownId: true,
          createdAt: true,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        godownId: user.godownId,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { token, user },
      });
    } catch (err) {
      next(err);
    }
  }
}
