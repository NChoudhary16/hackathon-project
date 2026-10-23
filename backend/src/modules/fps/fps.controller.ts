import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export class FPSController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { district } = req.query;
      const fpsList = await prisma.fairPriceShop.findMany({
        where: district ? { district: String(district) } : undefined,
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: fpsList });
    } catch (err) {
      next(err);
    }
  }
}
