import { prisma } from '../lib/prisma';
import { BatchStatus, QualityGrade, Prisma } from '@prisma/client';
import { FifoService } from './fifo.service';

export interface InventoryFilterOptions {
  godownId?: string;
  commodityId?: string;
  status?: BatchStatus;
  qualityGrade?: QualityGrade;
  isEligible?: boolean;
  minAgeDays?: number;
  maxAgeDays?: number;
  receiptFrom?: string;
  receiptTo?: string;
  search?: string;
}

export class InventoryService {
  /**
   * Determine if a batch is strictly eligible for FIFO PDS dispatches.
   */
  static isBatchEligible(batch: {
    status: BatchStatus;
    qualityGrade: QualityGrade;
    remainingQuantityKg: number;
    expiryDate: Date;
  }): boolean {
    const isNotExpired = new Date(batch.expiryDate).getTime() > Date.now();
    const hasRemaining = batch.remainingQuantityKg > 0;
    const isQualityApproved =
      batch.qualityGrade === QualityGrade.GRADE_A || batch.qualityGrade === QualityGrade.GRADE_B;
    const isActive = batch.status === BatchStatus.ACTIVE;

    return isNotExpired && hasRemaining && isQualityApproved && isActive;
  }

  /**
   * Query inventory batches with dynamic filtering, age calculation, and eligibility tagging.
   */
  static async listBatches(filters: InventoryFilterOptions) {
    const where: Prisma.InventoryBatchWhereInput = {};

    if (filters.godownId) {
      where.godownId = filters.godownId;
    }

    if (filters.commodityId) {
      where.commodityId = filters.commodityId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.qualityGrade) {
      where.qualityGrade = filters.qualityGrade;
    }

    if (filters.receiptFrom || filters.receiptTo) {
      where.receiptDate = {};
      if (filters.receiptFrom) {
        where.receiptDate.gte = new Date(filters.receiptFrom);
      }
      if (filters.receiptTo) {
        where.receiptDate.lte = new Date(filters.receiptTo);
      }
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { batchNumber: { contains: q, mode: 'insensitive' } },
        { stackLocation: { contains: q, mode: 'insensitive' } },
        { bayId: { contains: q, mode: 'insensitive' } },
        { variety: { contains: q, mode: 'insensitive' } },
      ];
    }

    const batches = await prisma.inventoryBatch.findMany({
      where,
      include: {
        godown: true,
        commodity: true,
        receipt: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: [{ receiptDate: 'asc' }, { createdAt: 'asc' }],
    });

    const now = Date.now();

    const formatted = batches.map((batch) => {
      const ageDays = FifoService.calculateAgeDays(batch.receiptDate);
      const isEligible = this.isBatchEligible(batch);
      const issuedQuantityKg = batch.initialQuantityKg - batch.remainingQuantityKg;
      const daysToExpiry = Math.floor(
        (new Date(batch.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)
      );

      // Spoilage risk score (0-100) based on age vs shelf-life and moisture
      const shelfLifeDays = batch.commodity.defaultShelfLifeDays || 365;
      const ageRisk = Math.min(60, (ageDays / shelfLifeDays) * 60);
      const moistureRisk = Math.max(0, (batch.moisturePercent - 12.0) * 10);
      const spoilageRiskScore = Math.min(100, Math.round(ageRisk + moistureRisk));

      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        godownId: batch.godownId,
        godownName: batch.godown.name,
        godownCode: batch.godown.code,
        commodityId: batch.commodityId,
        commodityCode: batch.commodity.code,
        commodityName: batch.commodity.name,
        variety: batch.variety,
        supplierName: batch.receipt.supplier.name,
        supplierState: batch.receipt.supplier.state,
        receiptNumber: batch.receipt.receiptNumber,
        receiptDate: batch.receiptDate.toISOString().split('T')[0],
        expiryDate: batch.expiryDate.toISOString().split('T')[0],
        initialQuantityKg: batch.initialQuantityKg,
        initialQuantityMt: batch.initialQuantityKg / 1000,
        issuedQuantityKg,
        issuedQuantityMt: issuedQuantityKg / 1000,
        remainingQuantityKg: batch.remainingQuantityKg,
        remainingQuantityMt: batch.remainingQuantityKg / 1000,
        bagCount: batch.bagCount,
        bagWeightKg: batch.bagWeightKg,
        stackLocation: batch.stackLocation,
        bayId: batch.bayId,
        moisturePercent: batch.moisturePercent,
        qualityGrade: batch.qualityGrade,
        status: batch.status,
        quarantineReason: batch.quarantineReason,
        fumigationDueDate: batch.fumigationDueDate?.toISOString().split('T')[0] || null,
        lastFumigationDate: batch.lastFumigationDate?.toISOString().split('T')[0] || null,
        ageDays,
        daysToExpiry,
        spoilageRiskScore,
        isEligible,
      };
    });

    // Apply age and eligibility filters post-enrichment if provided
    return formatted.filter((item) => {
      if (filters.isEligible !== undefined && item.isEligible !== filters.isEligible) {
        return false;
      }
      if (filters.minAgeDays !== undefined && item.ageDays < filters.minAgeDays) {
        return false;
      }
      if (filters.maxAgeDays !== undefined && item.ageDays > filters.maxAgeDays) {
        return false;
      }
      return true;
    });
  }

  /**
   * Fetch single batch with full relational details.
   */
  static async getBatchById(batchId: string) {
    const batch = await prisma.inventoryBatch.findUnique({
      where: { id: batchId },
      include: {
        godown: true,
        commodity: true,
        receipt: {
          include: {
            supplier: true,
            createdBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        allocations: {
          include: {
            challan: {
              include: {
                fps: true,
              },
            },
          },
        },
        movements: {
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!batch) return null;

    const ageDays = FifoService.calculateAgeDays(batch.receiptDate);
    const isEligible = this.isBatchEligible(batch);
    const issuedQuantityKg = batch.initialQuantityKg - batch.remainingQuantityKg;

    return {
      ...batch,
      initialQuantityMt: batch.initialQuantityKg / 1000,
      issuedQuantityKg,
      issuedQuantityMt: issuedQuantityKg / 1000,
      remainingQuantityMt: batch.remainingQuantityKg / 1000,
      ageDays,
      isEligible,
    };
  }

  /**
   * Get executive inventory summary:
   * Total MT, eligible MT, quarantined MT, capacity utilization %, commodity distribution.
   */
  static async getSummary(godownId?: string) {
    const where: Prisma.InventoryBatchWhereInput = godownId ? { godownId } : {};

    const [batches, godowns] = await Promise.all([
      prisma.inventoryBatch.findMany({
        where,
        include: {
          commodity: true,
          godown: true,
        },
      }),
      prisma.godown.findMany({
        where: godownId ? { id: godownId } : { active: true },
      }),
    ]);

    let totalStockKg = 0;
    let eligibleStockKg = 0;
    let quarantinedStockKg = 0;
    let expiredStockKg = 0;
    let totalBags = 0;

    const commodityBreakdown: Record<
      string,
      { code: string; name: string; totalKg: number; eligibleKg: number; batchCount: number }
    > = {};

    const now = Date.now();

    for (const batch of batches) {
      totalStockKg += batch.remainingQuantityKg;
      totalBags += Math.ceil(batch.remainingQuantityKg / (batch.bagWeightKg || 50));

      const isExpired = new Date(batch.expiryDate).getTime() <= now;
      const isQuarantined =
        batch.status === BatchStatus.QUARANTINE || batch.qualityGrade === QualityGrade.QUARANTINE;
      const isEligible = this.isBatchEligible(batch);

      if (isQuarantined) {
        quarantinedStockKg += batch.remainingQuantityKg;
      }
      if (isExpired) {
        expiredStockKg += batch.remainingQuantityKg;
      }
      if (isEligible) {
        eligibleStockKg += batch.remainingQuantityKg;
      }

      if (!commodityBreakdown[batch.commodityId]) {
        commodityBreakdown[batch.commodityId] = {
          code: batch.commodity.code,
          name: batch.commodity.name,
          totalKg: 0,
          eligibleKg: 0,
          batchCount: 0,
        };
      }

      commodityBreakdown[batch.commodityId].totalKg += batch.remainingQuantityKg;
      commodityBreakdown[batch.commodityId].batchCount += 1;
      if (isEligible) {
        commodityBreakdown[batch.commodityId].eligibleKg += batch.remainingQuantityKg;
      }
    }

    const totalCapacityMt = godowns.reduce((acc, g) => acc + g.capacityMt, 0);
    const totalStockMt = totalStockKg / 1000;
    const capacityUtilizationPercent =
      totalCapacityMt > 0 ? Math.round((totalStockMt / totalCapacityMt) * 1000) / 10 : 0;

    return {
      totalStockKg,
      totalStockMt,
      eligibleStockKg,
      eligibleStockMt: eligibleStockKg / 1000,
      quarantinedStockKg,
      quarantinedStockMt: quarantinedStockKg / 1000,
      expiredStockKg,
      expiredStockMt: expiredStockKg / 1000,
      totalBags,
      totalBatches: batches.length,
      capacityMt: totalCapacityMt,
      capacityUtilizationPercent,
      commodities: Object.values(commodityBreakdown).map((c) => ({
        ...c,
        totalMt: c.totalKg / 1000,
        eligibleMt: c.eligibleKg / 1000,
      })),
    };
  }
}
