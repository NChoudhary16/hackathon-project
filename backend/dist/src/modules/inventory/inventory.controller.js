"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../../services/inventory.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class InventoryController {
    /**
     * GET /api/inventory
     * Returns list of inventory batches with server-calculated age, eligibility, and metrics.
     */
    static async list(req, res, next) {
        try {
            const filters = req.query;
            const batches = await inventory_service_1.InventoryService.listBatches(filters);
            res.json({
                success: true,
                data: batches,
                count: batches.length,
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/inventory/summary
     * Aggregated stock metrics, capacity utilization, and commodity breakdowns.
     */
    static async getSummary(req, res, next) {
        try {
            const { godownId } = req.query;
            const summary = await inventory_service_1.InventoryService.getSummary(godownId ? String(godownId) : undefined);
            res.json({
                success: true,
                data: summary,
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/inventory/:batchId
     * Detailed batch record with audit history and movements.
     */
    static async getById(req, res, next) {
        try {
            const { batchId } = req.params;
            const batch = await inventory_service_1.InventoryService.getBatchById(batchId);
            if (!batch) {
                throw new error_middleware_1.AppError(`Inventory batch not found with ID: ${batchId}`, 404);
            }
            res.json({
                success: true,
                data: batch,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.InventoryController = InventoryController;
