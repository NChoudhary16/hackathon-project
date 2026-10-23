import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export class CommoditiesController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commodities = await prisma.commodity.findMany({
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: commodities });
    } catch (err) {
      next(err);
    }
  }
}
