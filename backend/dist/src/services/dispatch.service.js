"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const fifo_service_1 = require("./fifo.service");
const error_middleware_1 = require("../middleware/error.middleware");
class DispatchService {
    /**
     * Generates next serial challan number, e.g., PDS/DC/2026/1042
     */
    static generateChallanNumber() {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `PDS/DC/${year}/${rand}`;
    }
    /**
     * Create a Delivery Challan with FIFO allocations and transactional inventory updates.
     */
    static async createChallan(input) {
        const { godownId, fpsId, commodityId, quantityKg, vehicleNumber, driverName, driverPhone, targetBatchId, exceptionReason, remarks, createdById, } = input;
        if (quantityKg <= 0) {
            throw new error_middleware_1.AppError('Dispatch quantity must be strictly greater than 0 kg', 400);
        }
        // 1. Verify existence of godown, FPS, commodity
        const [godown, fps, commodity] = await Promise.all([
            prisma_1.prisma.godown.findUnique({ where: { id: godownId } }),
            prisma_1.prisma.fairPriceShop.findUnique({ where: { id: fpsId } }),
            prisma_1.prisma.commodity.findUnique({ where: { id: commodityId } }),
        ]);
        if (!godown)
            throw new error_middleware_1.AppError(`Godown not found: ${godownId}`, 404);
        if (!fps)
            throw new error_middleware_1.AppError(`Fair Price Shop not found: ${fpsId}`, 404);
        if (!commodity)
            throw new error_middleware_1.AppError(`Commodity not found: ${commodityId}`, 404);
        // 2. Run FIFO allocation algorithm
        const allocationResult = await fifo_service_1.FifoService.calculateAllocation({
            godownId,
            commodityId,
            requestedKg: quantityKg,
            targetBatchId,
        });
        if (!allocationResult.isFullyFulfilled) {
            throw new error_middleware_1.AppError(`Insufficient eligible stock. Requested: ${quantityKg} kg, Available eligible: ${allocationResult.allocatedKg} kg`, 400, { requestedKg: quantityKg, availableKg: allocationResult.allocatedKg });
        }
        // 3. If there is a deviation from strict FIFO, ensure an exceptionReason is documented
        if (allocationResult.hasDeviation && !exceptionReason) {
            throw new error_middleware_1.AppError('FIFO Deviation detected! Manual batch override requires a documented exceptionReason.', 400, { deviationReasons: allocationResult.deviationReasons });
        }
        const challanNumber = this.generateChallanNumber();
        // 4. Execute atomic transaction
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Create Delivery Challan
            const challan = await tx.deliveryChallan.create({
                data: {
                    challanNumber,
                    godownId,
                    fpsId,
                    commodityId,
                    totalQuantityKg: quantityKg,
                    totalBags: allocationResult.totalBags,
                    vehicleNumber,
                    driverName,
                    driverPhone,
                    status: client_1.ChallanStatus.DISPATCHED,
                    dispatchDate: new Date(),
                    createdById,
                    remarks: remarks || 'Standard PDS quota dispatch',
                },
            });
            // Process each allocation chunk
            for (const item of allocationResult.allocations) {
                // Create ChallanAllocation
                await tx.challanAllocation.create({
                    data: {
                        challanId: challan.id,
                        batchId: item.batchId,
                        quantityKg: item.allocatedKg,
                        bagCount: item.allocatedBags,
                        priorityRank: item.priorityRank,
                    },
                });
                // Deduct from batch
                const updatedRemaining = item.remainingInBatchAfterKg;
                const newStatus = updatedRemaining === 0 ? client_1.BatchStatus.EXHAUSTED : client_1.BatchStatus.ACTIVE;
                await tx.inventoryBatch.update({
                    where: { id: item.batchId },
                    data: {
                        remainingQuantityKg: updatedRemaining,
                        bagCount: Math.max(0, Math.ceil(updatedRemaining / 50)),
                        status: newStatus,
                    },
                });
                // Record append-only StockMovement event
                await tx.stockMovement.create({
                    data: {
                        batchId: item.batchId,
                        godownId,
                        movementType: client_1.MovementType.DISPATCH,
                        quantityKg: -item.allocatedKg, // Negative for dispatches
                        balanceAfterKg: updatedRemaining,
                        referenceType: 'DELIVERY_CHALLAN',
                        referenceId: challan.id,
                        reason: `Dispatch to FPS: ${fps.name} (${fps.code}) via Challan ${challan.challanNumber}`,
                        performedById: createdById,
                    },
                });
            }
            // Record FifoExceptions if deviation occurred
            if (allocationResult.hasDeviation && allocationResult.bypassedBatchIds.length > 0) {
                for (const bypassedId of allocationResult.bypassedBatchIds) {
                    await tx.fifoException.create({
                        data: {
                            challanId: challan.id,
                            requestedBatchId: targetBatchId || allocationResult.allocations[0].batchId,
                            bypassedBatchId: bypassedId,
                            reason: exceptionReason || 'Approved managerial exception override',
                            approvedById: createdById,
                        },
                    });
                }
            }
            // Update Fair Price Shop quota if applicable
            if (fps.activeQuotaRemainingKg > 0) {
                await tx.fairPriceShop.update({
                    where: { id: fps.id },
                    data: {
                        activeQuotaRemainingKg: Math.max(0, fps.activeQuotaRemainingKg - quantityKg),
                    },
                });
            }
            // Create Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'CREATE_DELIVERY_CHALLAN',
                    entity: 'DELIVERY_CHALLAN',
                    entityId: challan.id,
                    payloadJson: JSON.stringify({
                        challanNumber: challan.challanNumber,
                        totalQuantityKg: quantityKg,
                        hasDeviation: allocationResult.hasDeviation,
                        allocationsCount: allocationResult.allocations.length,
                    }),
                    performedById: createdById,
                },
            });
            return challan;
        });
    }
    /**
     * List delivery challans with full allocations.
     */
    static async listChallans(filters) {
        return await prisma_1.prisma.deliveryChallan.findMany({
            where: {
                ...(filters.godownId ? { godownId: filters.godownId } : {}),
                ...(filters.fpsId ? { fpsId: filters.fpsId } : {}),
                ...(filters.commodityId ? { commodityId: filters.commodityId } : {}),
                ...(filters.status ? { status: filters.status } : {}),
            },
            include: {
                godown: true,
                fps: true,
                commodity: true,
                createdBy: {
                    select: { id: true, name: true, role: true },
                },
                allocations: {
                    include: {
                        batch: true,
                    },
                },
                fifoExceptions: true,
            },
            orderBy: { dispatchDate: 'desc' },
        });
    }
    /**
     * Get single delivery challan.
     */
    static async getChallanById(id) {
        return await prisma_1.prisma.deliveryChallan.findUnique({
            where: { id },
            include: {
                godown: true,
                fps: true,
                commodity: true,
                createdBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
                allocations: {
                    include: {
                        batch: {
                            include: {
                                receipt: {
                                    include: {
                                        supplier: true,
                                    },
                                },
                            },
                        },
                    },
                },
                fifoExceptions: {
                    include: {
                        approvedBy: {
                            select: { id: true, name: true, role: true },
                        },
                    },
                },
            },
        });
    }
}
exports.DispatchService = DispatchService;
