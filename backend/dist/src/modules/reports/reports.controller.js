"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const prisma_1 = require("../../lib/prisma");
const fifo_service_1 = require("../../services/fifo.service");
class ReportsController {
    /**
     * GET /api/reports/ageing
     * Breaks down inventory into regulatory age brackets (0-30, 31-60, 61-90, 91-180, 180+ days).
     */
    static async getAgeingReport(req, res, next) {
        try {
            const { godownId } = req.query;
            const batches = await prisma_1.prisma.inventoryBatch.findMany({
                where: {
                    remainingQuantityKg: { gt: 0 },
                    ...(godownId ? { godownId: String(godownId) } : {}),
                },
                include: {
                    commodity: true,
                    godown: true,
                },
            });
            const buckets = {
                under30Days: { count: 0, totalKg: 0, totalMt: 0 },
                days31To60: { count: 0, totalKg: 0, totalMt: 0 },
                days61To90: { count: 0, totalKg: 0, totalMt: 0 },
                days91To180: { count: 0, totalKg: 0, totalMt: 0 },
                over180Days: { count: 0, totalKg: 0, totalMt: 0 },
            };
            for (const b of batches) {
                const age = fifo_service_1.FifoService.calculateAgeDays(b.receiptDate);
                const kg = b.remainingQuantityKg;
                if (age <= 30) {
                    buckets.under30Days.count++;
                    buckets.under30Days.totalKg += kg;
                }
                else if (age <= 60) {
                    buckets.days31To60.count++;
                    buckets.days31To60.totalKg += kg;
                }
                else if (age <= 90) {
                    buckets.days61To90.count++;
                    buckets.days61To90.totalKg += kg;
                }
                else if (age <= 180) {
                    buckets.days91To180.count++;
                    buckets.days91To180.totalKg += kg;
                }
                else {
                    buckets.over180Days.count++;
                    buckets.over180Days.totalKg += kg;
                }
            }
            buckets.under30Days.totalMt = buckets.under30Days.totalKg / 1000;
            buckets.days31To60.totalMt = buckets.days31To60.totalKg / 1000;
            buckets.days61To90.totalMt = buckets.days61To90.totalKg / 1000;
            buckets.days91To180.totalMt = buckets.days91To180.totalKg / 1000;
            buckets.over180Days.totalMt = buckets.over180Days.totalKg / 1000;
            res.json({
                success: true,
                data: {
                    totalActiveBatches: batches.length,
                    buckets,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/reports/fifo-compliance
     * Calculates overall percentage of dispatches that strictly complied with FIFO versus exceptions.
     */
    static async getComplianceReport(req, res, next) {
        try {
            const [totalChallans, exceptionCount] = await Promise.all([
                prisma_1.prisma.deliveryChallan.count(),
                prisma_1.prisma.fifoException.count(),
            ]);
            const compliantChallans = Math.max(0, totalChallans - exceptionCount);
            const complianceRate = totalChallans > 0 ? Math.round((compliantChallans / totalChallans) * 1000) / 10 : 100.0;
            res.json({
                success: true,
                data: {
                    totalDispatches: totalChallans,
                    fifoCompliantDispatches: compliantChallans,
                    fifoExceptionsCount: exceptionCount,
                    complianceRatePercent: complianceRate,
                    status: complianceRate >= 95 ? 'EXCELLENT' : complianceRate >= 85 ? 'GOOD' : 'REQUIRES_AUDIT',
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ReportsController = ReportsController;
