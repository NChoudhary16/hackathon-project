import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entity, entityId, limit = '100' } = req.query;

      const logs = await prisma.auditLog.findMany({
        where: {
          ...(entity ? { entity: String(entity) } : {}),
          ...(entityId ? { entityId: String(entityId) } : {}),
        },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: Math.min(200, Math.max(1, Number(limit))),
      });

      res.json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  }

  static async listExceptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { challanId } = req.query;

      const exceptions = await prisma.fifoException.findMany({
        where: {
          ...(challanId ? { challanId: String(challanId) } : {}),
        },
        include: {
          challan: {
            select: {
              id: true,
              challanNumber: true,
              totalQuantityKg: true,
              vehicleNumber: true,
              dispatchDate: true,
              fps: { select: { id: true, name: true, code: true } },
            },
          },
          approvedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        count: exceptions.length,
        data: exceptions,
      });
    } catch (err) {
      next(err);
    }
  }
}
