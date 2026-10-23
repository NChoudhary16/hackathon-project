import { prisma } from '../lib/prisma';
import { BatchStatus, QualityGrade } from '@prisma/client';

export interface FifoAllocationCandidate {
  batchId: string;
  batchNumber: string;
  stackLocation: string;
  bayId: string;
  receiptDate: Date;
  ageDays: number;
  availableKg: number;
  allocatedKg: number;
  allocatedBags: number;
  remainingInBatchAfterKg: number;
  moisturePercent: number;
  qualityGrade: QualityGrade;
  priorityRank: number;
  isOldestAvailable: boolean;
}

export interface FifoCalculationOptions {
  godownId: string;
  commodityId: string;
  requestedKg: number;
  targetBatchId?: string; // Optional manual override batch
}

export interface FifoCalculationResponse {
  godownId: string;
  commodityId: string;
  requestedKg: number;
  allocatedKg: number;
  totalBags: number;
  isFullyFulfilled: boolean;
  allocations: FifoAllocationCandidate[];
  hasDeviation: boolean;
  deviationBatchCount: number;
  deviationReasons: string[];
  bypassedBatchIds: string[];
  allocationTimestamp: string;
}

export class FifoService {
  /**
   * Calculate stock age in days relative to current server time.
   */
  static calculateAgeDays(receiptDate: Date): number {
    const diffMs = Date.now() - new Date(receiptDate).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Retrieves all eligible active batches for a commodity in a godown,
   * sorted strictly by receiptDate ASC (FIFO order).
   * Excludes expired or quarantined or locked out batches.
   */
  static async getEligibleBatches(godownId: string, commodityId: string) {
    const now = new Date();

    return await prisma.inventoryBatch.findMany({
      where: {
        godownId,
        commodityId,
        status: BatchStatus.ACTIVE,
        qualityGrade: {
          in: [QualityGrade.GRADE_A, QualityGrade.GRADE_B],
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
  static async calculateAllocation(
    options: FifoCalculationOptions
  ): Promise<FifoCalculationResponse> {
    const { godownId, commodityId, requestedKg, targetBatchId } = options;

    const eligibleBatches = await this.getEligibleBatches(godownId, commodityId);

    let remainingNeededKg = requestedKg;
    let totalAllocatedKg = 0;
    let totalBags = 0;
    const allocations: FifoAllocationCandidate[] = [];
    const bypassedBatchIds: string[] = [];
    const deviationReasons: string[] = [];
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
        deviationReasons.push(
          `Manual selection of batch ${targetBatchId} bypasses ${bypassedBatchIds.length} older eligible batch(es). FIFO Exception justification required.`
        );
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
      if (remainingNeededKg <= 0) break;

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
