import { Request, Response, NextFunction } from 'express';
import { FifoService } from '../../services/fifo.service';

export class FifoController {
  /**
   * POST /api/fifo/calculate
   * Simulates FIFO batch allocation, checking priority, eligibility, and deviations.
   */
  static async calculate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { godownId, commodityId, requestedKg: inputKg, requestedMt, targetBatchId } = req.body;
      const requestedKg = Math.round(
        inputKg !== undefined ? inputKg : (requestedMt as number) * 1000
      );

      const result = await FifoService.calculateAllocation({
        godownId,
        commodityId,
        requestedKg,
        targetBatchId,
      });

      res.json({
        success: true,
        data: {
          ...result,
          requestedMt: result.requestedKg / 1000,
          allocatedMt: result.allocatedKg / 1000,
          allocations: result.allocations.map((a) => ({
            ...a,
            availableMt: a.availableKg / 1000,
            allocatedMt: a.allocatedKg / 1000,
            remainingInBatchAfterMt: a.remainingInBatchAfterKg / 1000,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fifo/eligible
   * Lists all eligible batches sorted strictly in FIFO sequence.
   */
  static async getEligible(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { godownId, commodityId } = req.query;
      if (!godownId || !commodityId) {
        res.status(400).json({
          success: false,
          error: 'Both godownId and commodityId query parameters are required',
        });
        return;
      }

      const batches = await FifoService.getEligibleBatches(
        String(godownId),
        String(commodityId)
      );

      const formatted = batches.map((b, idx) => ({
        ...b,
        priorityRank: idx + 1,
        isOldestAvailable: idx === 0,
        ageDays: FifoService.calculateAgeDays(b.receiptDate),
        remainingQuantityMt: b.remainingQuantityKg / 1000,
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
