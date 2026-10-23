import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export class UsersController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          godownId: true,
          godown: {
            select: { id: true, code: true, name: true },
          },
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          godownId: true,
          godown: {
            select: { id: true, code: true, name: true, district: true, state: true },
          },
          createdAt: true,
        },
      });
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role, godownId } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(role ? { role } : {}),
          ...(godownId !== undefined ? { godownId } : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          godownId: true,
          godown: {
            select: { id: true, code: true, name: true },
          },
          updatedAt: true,
        },
      });
      res.json({ success: true, message: 'User role updated successfully', data: user });
    } catch (err) {
      next(err);
    }
  }
}
