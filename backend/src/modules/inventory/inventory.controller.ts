import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../../services/inventory.service';
import { AppError } from '../../middleware/error.middleware';

export class InventoryController {
  /**
   * GET /api/inventory
   * Returns list of inventory batches with server-calculated age, eligibility, and metrics.
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as unknown as Parameters<typeof InventoryService.listBatches>[0];
      const batches = await InventoryService.listBatches(filters);

      res.json({
        success: true,
        data: batches,
        count: batches.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/inventory/summary
   * Aggregated stock metrics, capacity utilization, and commodity breakdowns.
   */
  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { godownId } = req.query;
      const summary = await InventoryService.getSummary(godownId ? String(godownId) : undefined);

      res.json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/inventory/:batchId
   * Detailed batch record with audit history and movements.
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId } = req.params;
      const batch = await InventoryService.getBatchById(batchId);

      if (!batch) {
        throw new AppError(`Inventory batch not found with ID: ${batchId}`, 404);
      }

      res.json({
        success: true,
        data: batch,
      });
    } catch (err) {
      next(err);
    }
  }
}
