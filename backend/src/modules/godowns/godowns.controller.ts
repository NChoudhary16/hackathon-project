import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';

export class GodownsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const godowns = await prisma.godown.findMany({
        where: { active: true },
        include: {
          _count: {
            select: { batches: true, receipts: true, challans: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: godowns });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const godown = await prisma.godown.findUnique({
        where: { id },
        include: {
          batches: {
            take: 10,
            orderBy: { receiptDate: 'asc' },
          },
        },
      });

      if (!godown) throw new AppError('Godown not found', 404);
      res.json({ success: true, data: godown });
    } catch (err) {
      next(err);
    }
  }
}
