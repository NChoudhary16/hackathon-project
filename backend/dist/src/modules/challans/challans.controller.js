"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallansController = void 0;
const dispatch_service_1 = require("../../services/dispatch.service");
const prisma_1 = require("../../lib/prisma");
const error_middleware_1 = require("../../middleware/error.middleware");
class ChallansController {
    /**
     * POST /api/challans
     * Issues a delivery challan, validates FIFO, updates inventory batches, and logs movements.
     */
    static async create(req, res, next) {
        try {
            const { godownId, fpsId, commodityId, quantityKg: inputKg, quantityMt, vehicleNumber, driverName, driverPhone, targetBatchId, exceptionReason, remarks, } = req.body;
            const quantityKg = Math.round(inputKg !== undefined ? inputKg : quantityMt * 1000);
            let createdById = req.user?.userId;
            if (!createdById) {
                const fallback = await prisma_1.prisma.user.findFirst();
                if (!fallback)
                    throw new error_middleware_1.AppError('No administrative user found for dispatch audit', 500);
                createdById = fallback.id;
            }
            const challan = await dispatch_service_1.DispatchService.createChallan({
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
            const fullChallan = await dispatch_service_1.DispatchService.getChallanById(challan.id);
            res.status(201).json({
                success: true,
                message: `Delivery Challan #${challan.challanNumber} issued successfully`,
                data: fullChallan,
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/challans
     * Retrieves all delivery challans with joined allocations and FPS data.
     */
    static async list(req, res, next) {
        try {
            const filters = req.query;
            const challans = await dispatch_service_1.DispatchService.listChallans(filters || {});
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
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/challans/:id
     * Retrieves a single challan by ID.
     */
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const challan = await dispatch_service_1.DispatchService.getChallanById(id);
            if (!challan) {
                throw new error_middleware_1.AppError(`Delivery Challan not found with ID: ${id}`, 404);
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
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ChallansController = ChallansController;
