import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export class SuppliersController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: suppliers });
    } catch (err) {
      next(err);
    }
  }
}
