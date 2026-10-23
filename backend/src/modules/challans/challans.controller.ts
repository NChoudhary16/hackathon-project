import { Response, NextFunction } from 'express';
import { DispatchService } from '../../services/dispatch.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';

export class ChallansController {
  /**
   * POST /api/challans
   * Issues a delivery challan, validates FIFO, updates inventory batches, and logs movements.
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        godownId,
        fpsId,
        commodityId,
        quantityKg: inputKg,
        quantityMt,
        vehicleNumber,
        driverName,
        driverPhone,
        targetBatchId,
        exceptionReason,
        remarks,
      } = req.body;

      const quantityKg = Math.round(
        inputKg !== undefined ? inputKg : (quantityMt as number) * 1000
      );

      let createdById = req.user?.userId;
      if (!createdById) {
        const fallback = await prisma.user.findFirst();
        if (!fallback) throw new AppError('No administrative user found for dispatch audit', 500);
        createdById = fallback.id;
      }

      const challan = await DispatchService.createChallan({
        godownId,
        fpsId,
        commodityId,
        quantityKg,
        vehicleNumber: vehicleNumber.trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        targetBatchId,
        exceptionReason,
        remarks,
        createdById,
      });

      const fullChallan = await DispatchService.getChallanById(challan.id);

      res.status(201).json({
        success: true,
        message: `Delivery Challan #${challan.challanNumber} issued successfully`,
        data: fullChallan,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/challans
   * Retrieves all delivery challans with joined allocations and FPS data.
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as unknown as Parameters<typeof DispatchService.listChallans>[0];
      const challans = await DispatchService.listChallans(filters || {});

      const formatted = challans.map((c) => ({
        ...c,
        totalQuantityMt: c.totalQuantityKg / 1000,
        allocations: c.allocations.map((a) => ({
          ...a,
          quantityMt: a.quantityKg / 1000,
        })),
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

  /**
   * GET /api/challans/:id
   * Retrieves a single challan by ID.
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const challan = await DispatchService.getChallanById(id);

      if (!challan) {
        throw new AppError(`Delivery Challan not found with ID: ${id}`, 404);
      }

      res.json({
        success: true,
        data: {
          ...challan,
          totalQuantityMt: challan.totalQuantityKg / 1000,
          allocations: challan.allocations.map((a) => ({
            ...a,
            quantityMt: a.quantityKg / 1000,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
