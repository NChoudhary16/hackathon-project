import { Batch, CommodityType, FifoAllocationItem, FifoCalculationResult } from '../types/inventory';

/**
 * Calculates stock age in days relative to current date or reference date.
 */
export function calculateStockAge(receiptDateStr: string, referenceDateStr: string = '2026-10-22'): number {
  const receipt = new Date(receiptDateStr).getTime();
  const ref = new Date(referenceDateStr).getTime();
  const diffTime = Math.max(0, ref - receipt);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Deterministic Spoilage Risk Score (0 - 100 scale).
 * Based on grain moisture, age tier, and fumigation currency.
 */
export function calculateSpoilageRisk(batch: Pick<Batch, 'ageDays' | 'moistureContentPercent' | 'fumigationDueDate'>): number {
  let score = 0;

  // Age component (up to 45 pts)
  if (batch.ageDays > 180) score += 45;
  else if (batch.ageDays > 120) score += 30;
  else if (batch.ageDays > 60) score += 18;
  else score += Math.floor((batch.ageDays / 60) * 12);

  // Moisture component (Safe threshold for wheat/rice is <=12%) (up to 40 pts)
  if (batch.moistureContentPercent >= 14.0) score += 40;
  else if (batch.moistureContentPercent >= 13.0) score += 28;
  else if (batch.moistureContentPercent >= 12.0) score += 15;
  else score += 5;

  // Fumigation overdue penalty (up to 15 pts)
  const today = new Date('2026-10-22').getTime();
  const fumigationDue = new Date(batch.fumigationDueDate).getTime();
  if (fumigationDue < today) {
    score += 15;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Pure Deterministic FIFO Stock Allocation Engine.
 * Follows strict Indian Food Corporation (FCI) godown regulations:
 * 1. Filter out quarantined, damaged, and fumigation-locked stock.
 * 2. Sort available lots chronologically by receipt date (oldest first).
 * 3. Greedily allocate up to requested Metric Tonnes.
 * 4. Yield multi-batch allocations, bag conversions, and audit signature.
 */
export function calculateDeterministicFifoAllocation(
  commodity: CommodityType,
  requestedQuantityMt: number,
  allBatches: Batch[],
  options?: {
    allowPartial?: boolean;
    referenceDate?: string;
  }
): FifoCalculationResult {
  const referenceDate = options?.referenceDate ?? '2026-10-22';

  // Step 1: Filter eligible batches for the specific commodity
  const eligibleBatches = allBatches.filter((b) => {
    return (
      b.commodity === commodity &&
      b.currentQuantityMt > 0.01 &&
      b.qualityGrade !== 'Quarantine' &&
      b.qualityGrade !== 'Damaged' &&
      b.status === 'active'
    );
  });

  // Step 2: Strictly sort ascending by receipt date (Earliest in = First out)
  // Tie-breaker: lexicographical comparison of batch ID for pure determinism
  eligibleBatches.sort((a, b) => {
    const timeA = new Date(a.receiptDate).getTime();
    const timeB = new Date(b.receiptDate).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.id.localeCompare(b.id);
  });

  const allocations: FifoAllocationItem[] = [];
  let remainingNeededMt = requestedQuantityMt;
  let totalAllocatedMt = 0;

  for (let index = 0; index < eligibleBatches.length; index++) {
    if (remainingNeededMt <= 0.0001) break;

    const batch = eligibleBatches[index];
    const allocateFromThisBatch = Math.min(remainingNeededMt, batch.currentQuantityMt);
    
    // 50kg bag conversion: 1 MT = 1000 kg = 20 bags
    const allocatedBags = Math.round(allocateFromThisBatch * 20);
    const remainingInBatch = Math.max(0, batch.currentQuantityMt - allocateFromThisBatch);

    allocations.push({
      batchId: batch.id,
      batchCode: batch.id,
      stackLocation: batch.stackLocation,
      receiptDate: batch.receiptDate,
      ageDays: calculateStockAge(batch.receiptDate, referenceDate),
      allocatedMt: Number(allocateFromThisBatch.toFixed(2)),
      allocatedBags,
      remainingInBatchMt: Number(remainingInBatch.toFixed(2)),
      moisturePercent: batch.moistureContentPercent,
      qualityGrade: batch.qualityGrade,
      isOldestAvailable: index === 0,
      priorityRank: index + 1,
    });

    totalAllocatedMt += allocateFromThisBatch;
    remainingNeededMt -= allocateFromThisBatch;
  }

  const isFullyFulfilled = totalAllocatedMt >= requestedQuantityMt - 0.01;
  const totalBags = allocations.reduce((sum, item) => sum + item.allocatedBags, 0);

  // Deterministic audit hash string based on input & allocations
  const auditPayload = `${commodity}:${requestedQuantityMt}:${allocations.map(a => `${a.batchId}_${a.allocatedMt}`).join('|')}`;
  let hashNum = 0;
  for (let i = 0; i < auditPayload.length; i++) {
    hashNum = (hashNum << 5) - hashNum + auditPayload.charCodeAt(i);
    hashNum |= 0;
  }
  const auditHash = `FIFO-AUDIT-${Math.abs(hashNum).toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    commodity,
    requestedMt: requestedQuantityMt,
    allocatedMt: Number(totalAllocatedMt.toFixed(2)),
    totalBags,
    isFullyFulfilled,
    allocations,
    hasDeviation: false,
    deviationBatchCount: 0,
    allocationTimestamp: new Date().toISOString(),
    auditHash,
  };
}

/**
 * Evaluates whether a manual warehouse superintendent batch selection
 * deviates from the strict FIFO schedule.
 */
export function evaluateManualDeviation(
  selectedBatchIds: string[],
  allBatches: Batch[],
  commodity: CommodityType
): {
  isDeviated: boolean;
  skippedOlderBatches: Batch[];
  deviationSummary: string;
} {
  const eligibleBatches = allBatches
    .filter(
      (b) =>
        b.commodity === commodity &&
        b.currentQuantityMt > 0.05 &&
        b.qualityGrade !== 'Quarantine' &&
        b.qualityGrade !== 'Damaged' &&
        b.status === 'active'
    )
    .sort((a, b) => new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime());

  if (eligibleBatches.length === 0 || selectedBatchIds.length === 0) {
    return { isDeviated: false, skippedOlderBatches: [], deviationSummary: 'No deviation detected.' };
  }

  // Find oldest eligible batch date
  const oldestBatch = eligibleBatches[0];
  
  // Find the earliest date among user-selected batches
  const selectedBatches = eligibleBatches.filter(b => selectedBatchIds.includes(b.id));
  const skippedOlderBatches = eligibleBatches.filter(
    b => !selectedBatchIds.includes(b.id) && 
         selectedBatches.some(sb => new Date(b.receiptDate) < new Date(sb.receiptDate))
  );

  const isDeviated = skippedOlderBatches.length > 0;

  return {
    isDeviated,
    skippedOlderBatches,
    deviationSummary: isDeviated
      ? `FIFO Violation: ${skippedOlderBatches.length} older consignment(s) (including ${oldestBatch.id} received on ${oldestBatch.receiptDate}) bypassed in favour of newer stock.`
      : 'Strict FIFO compliance maintained. Oldest eligible lots are selected.',
  };
}
