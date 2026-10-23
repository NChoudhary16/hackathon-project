import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { MovementType } from '@prisma/client';

export class MovementsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { godownId, batchId, movementType, limit } = req.query;

      const movements = await prisma.stockMovement.findMany({
        where: {
          ...(godownId ? { godownId: String(godownId) } : {}),
          ...(batchId ? { batchId: String(batchId) } : {}),
          ...(movementType ? { movementType: movementType as MovementType } : {}),
        },
        include: {
          godown: {
            select: { id: true, code: true, name: true },
          },
          batch: {
            include: {
              commodity: {
                select: { id: true, code: true, name: true },
              },
            },
          },
          performedBy: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(String(limit), 10) : 100,
      });

      const formatted = movements.map((m) => ({
        ...m,
        quantityMt: m.quantityKg / 1000,
        balanceAfterMt: m.balanceAfterKg / 1000,
      }));

      res.json({
        success: true,
        data: formatted,
        count: formatted.length,
      });
    } catch (err) {
      next(err);
    }
  }
}
