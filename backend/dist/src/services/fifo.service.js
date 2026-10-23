"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FifoService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
class FifoService {
    /**
     * Calculate stock age in days relative to current server time.
     */
    static calculateAgeDays(receiptDate) {
        const diffMs = Date.now() - new Date(receiptDate).getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
    /**
     * Retrieves all eligible active batches for a commodity in a godown,
     * sorted strictly by receiptDate ASC (FIFO order).
     * Excludes expired or quarantined or locked out batches.
     */
    static async getEligibleBatches(godownId, commodityId) {
        const now = new Date();
        return await prisma_1.prisma.inventoryBatch.findMany({
            where: {
                godownId,
                commodityId,
                status: client_1.BatchStatus.ACTIVE,
                qualityGrade: {
                    in: [client_1.QualityGrade.GRADE_A, client_1.QualityGrade.GRADE_B],
                },
                remainingQuantityKg: {
                    gt: 0,
                },
                expiryDate: {
                    gt: now,
                },
            },
            orderBy: [
                { receiptDate: 'asc' },
                { createdAt: 'asc' },
            ],
            include: {
                commodity: true,
            },
        });
    }
    /**
     * Dry-run or prepare FIFO allocation according to strict government PDS FIFO rules.
     */
    static async calculateAllocation(options) {
        const { godownId, commodityId, requestedKg, targetBatchId } = options;
        const eligibleBatches = await this.getEligibleBatches(godownId, commodityId);
        let remainingNeededKg = requestedKg;
        let totalAllocatedKg = 0;
        let totalBags = 0;
        const allocations = [];
        const bypassedBatchIds = [];
        const deviationReasons = [];
        let hasDeviation = false;
        // Check if manual batch override was specified
        if (targetBatchId) {
            const targetIndex = eligibleBatches.findIndex((b) => b.id === targetBatchId);
            if (targetIndex > 0) {
                // There are older eligible batches that would be bypassed!
                hasDeviation = true;
                const olderBatches = eligibleBatches.slice(0, targetIndex);
                for (const older of olderBatches) {
                    bypassedBatchIds.push(older.id);
                }
                deviationReasons.push(`Manual selection of batch ${targetBatchId} bypasses ${bypassedBatchIds.length} older eligible batch(es). FIFO Exception justification required.`);
            }
        }
        // Determine batch list order to allocate from
        let batchesToProcess = [...eligibleBatches];
        if (targetBatchId) {
            const chosen = eligibleBatches.find((b) => b.id === targetBatchId);
            if (chosen) {
                batchesToProcess = [chosen, ...eligibleBatches.filter((b) => b.id !== targetBatchId)];
            }
        }
        let rank = 1;
        for (const batch of batchesToProcess) {
            if (remainingNeededKg <= 0)
                break;
            const allocateFromThis = Math.min(batch.remainingQuantityKg, remainingNeededKg);
            const bagWeight = batch.bagWeightKg || batch.commodity.standardBagWeightKg || 50;
            const bags = Math.ceil(allocateFromThis / bagWeight);
            allocations.push({
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                stackLocation: batch.stackLocation,
                bayId: batch.bayId,
                receiptDate: batch.receiptDate,
                ageDays: this.calculateAgeDays(batch.receiptDate),
                availableKg: batch.remainingQuantityKg,
                allocatedKg: allocateFromThis,
                allocatedBags: bags,
                remainingInBatchAfterKg: batch.remainingQuantityKg - allocateFromThis,
                moisturePercent: batch.moisturePercent,
                qualityGrade: batch.qualityGrade,
                priorityRank: rank,
                isOldestAvailable: rank === 1 && !hasDeviation,
            });
            remainingNeededKg -= allocateFromThis;
            totalAllocatedKg += allocateFromThis;
            totalBags += bags;
            rank++;
        }
        return {
            godownId,
            commodityId,
            requestedKg,
            allocatedKg: totalAllocatedKg,
            totalBags,
            isFullyFulfilled: totalAllocatedKg >= requestedKg,
            allocations,
            hasDeviation,
            deviationBatchCount: bypassedBatchIds.length,
            deviationReasons,
            bypassedBatchIds,
            allocationTimestamp: new Date().toISOString(),
        };
    }
}
exports.FifoService = FifoService;
