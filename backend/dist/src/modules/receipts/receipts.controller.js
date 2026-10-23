"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptsController = void 0;
const prisma_1 = require("../../lib/prisma");
const error_middleware_1 = require("../../middleware/error.middleware");
const client_1 = require("@prisma/client");
class ReceiptsController {
    /**
     * Helper to generate unique Batch Number, e.g., B-WHT-2026-8491
     */
    static generateBatchNumber(commodityCode) {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const codePrefix = commodityCode.replace(/[^A-Z0-9]/gi, '').substring(0, 4).toUpperCase();
        return `B-${codePrefix}-${year}-${rand}`;
    }
    /**
     * POST /api/receipts
     * Creates a stock receipt, inventory batch, and movement in an atomic transaction.
     */
    static async createReceipt(req, res, next) {
        try {
            const { receiptNumber, godownId, supplierId, commodityId, variety, receiptDate, expiryDate, quantityKg: inputKg, quantityMt, qualityGrade, stackLocation, bayId, moisturePercent, labReportNo, vehicleNumber, remarks, } = req.body;
            // 1. Calculate integer base unit (KG)
            const quantityKg = Math.round(inputKg !== undefined ? inputKg : quantityMt * 1000);
            if (quantityKg <= 0) {
                throw new error_middleware_1.AppError('Received quantity must be strictly greater than 0', 400);
            }
            // 2. Check duplicate receipt reference
            const existingReceipt = await prisma_1.prisma.stockReceipt.findUnique({
                where: { receiptNumber: receiptNumber.trim() },
            });
            if (existingReceipt) {
                throw new error_middleware_1.AppError(`A stock receipt with reference '${receiptNumber}' already exists in the system`, 409);
            }
            // 3. Verify references: Godown, Supplier, Commodity
            const [godown, supplier, commodity] = await Promise.all([
                prisma_1.prisma.godown.findUnique({ where: { id: godownId } }),
                prisma_1.prisma.supplier.findUnique({ where: { id: supplierId } }),
                prisma_1.prisma.commodity.findUnique({ where: { id: commodityId } }),
            ]);
            if (!godown) {
                throw new error_middleware_1.AppError(`Referenced Godown not found with ID: ${godownId}`, 404);
            }
            if (!supplier) {
                throw new error_middleware_1.AppError(`Referenced Supplier not found with ID: ${supplierId}`, 404);
            }
            if (!commodity) {
                throw new error_middleware_1.AppError(`Referenced Commodity not found with ID: ${commodityId}`, 404);
            }
            // Determine default bag count and status
            const bagWeightKg = commodity.standardBagWeightKg || 50;
            const bagCount = Math.ceil(quantityKg / bagWeightKg);
            let initialStatus = client_1.BatchStatus.ACTIVE;
            if (qualityGrade === client_1.QualityGrade.QUARANTINE) {
                initialStatus = client_1.BatchStatus.QUARANTINE;
            }
            else if (qualityGrade === client_1.QualityGrade.DAMAGED) {
                initialStatus = client_1.BatchStatus.QUARANTINE;
            }
            const createdById = req.user?.userId;
            if (!createdById) {
                // Fallback to first admin or manager if unauthenticated in public mode
                const fallbackUser = await prisma_1.prisma.user.findFirst();
                if (!fallbackUser)
                    throw new error_middleware_1.AppError('No administrative user found for receipt audit', 500);
            }
            const activeUserId = createdById || (await prisma_1.prisma.user.findFirstOrThrow()).id;
            const batchNumber = ReceiptsController.generateBatchNumber(commodity.code);
            const parsedReceiptDate = new Date(receiptDate);
            const parsedExpiryDate = new Date(expiryDate);
            // 4-7. Commit all changes in one database transaction
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                // Create Receipt
                const receipt = await tx.stockReceipt.create({
                    data: {
                        receiptNumber: receiptNumber.trim(),
                        godownId,
                        supplierId,
                        commodityId,
                        variety: variety.trim(),
                        receiptDate: parsedReceiptDate,
                        expiryDate: parsedExpiryDate,
                        vehicleNumber: vehicleNumber?.trim() || null,
                        labReportNo: labReportNo?.trim() || null,
                        moisturePercent: Number(moisturePercent),
                        stackLocation: stackLocation.trim(),
                        bayId: bayId.trim(),
                        quantityKg,
                        bagCount,
                        qualityGrade,
                        createdById: activeUserId,
                        remarks: remarks?.trim() || null,
                    },
                });
                // Create Inventory Batch
                const batch = await tx.inventoryBatch.create({
                    data: {
                        batchNumber,
                        godownId,
                        receiptId: receipt.id,
                        commodityId,
                        variety: variety.trim(),
                        initialQuantityKg: quantityKg,
                        remainingQuantityKg: quantityKg,
                        bagCount,
                        bagWeightKg,
                        stackLocation: stackLocation.trim(),
                        bayId: bayId.trim(),
                        moisturePercent: Number(moisturePercent),
                        qualityGrade,
                        status: initialStatus,
                        receiptDate: parsedReceiptDate,
                        expiryDate: parsedExpiryDate,
                        quarantineReason: initialStatus === client_1.BatchStatus.QUARANTINE
                            ? `Consignment flagged during inward inspection. Grade: ${qualityGrade}.`
                            : null,
                    },
                });
                // Record Append-Only Stock Movement
                const movement = await tx.stockMovement.create({
                    data: {
                        batchId: batch.id,
                        godownId,
                        movementType: client_1.MovementType.RECEIPT,
                        quantityKg,
                        balanceAfterKg: quantityKg,
                        referenceType: 'STOCK_RECEIPT',
                        referenceId: receipt.id,
                        reason: `Inward Consignment from ${supplier.name} (#${receipt.receiptNumber})`,
                        performedById: activeUserId,
                        createdAt: parsedReceiptDate,
                    },
                });
                // Record Audit Log
                await tx.auditLog.create({
                    data: {
                        action: 'CREATE_STOCK_RECEIPT',
                        entity: 'STOCK_RECEIPT',
                        entityId: receipt.id,
                        payloadJson: JSON.stringify({
                            receiptNumber: receipt.receiptNumber,
                            batchNumber: batch.batchNumber,
                            quantityKg,
                            supplier: supplier.name,
                            commodity: commodity.name,
                        }),
                        performedById: activeUserId,
                    },
                });
                return { receipt, batch, movement };
            });
            res.status(201).json({
                success: true,
                message: `Stock receipt #${result.receipt.receiptNumber} created successfully. Generated batch ${result.batch.batchNumber}.`,
                data: {
                    receipt: {
                        ...result.receipt,
                        quantityMt: result.receipt.quantityKg / 1000,
                    },
                    batch: {
                        ...result.batch,
                        initialQuantityMt: result.batch.initialQuantityKg / 1000,
                        remainingQuantityMt: result.batch.remainingQuantityKg / 1000,
                    },
                    movement: result.movement,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/receipts
     * Lists stock receipts with relational joins and query filtering.
     */
    static async listReceipts(req, res, next) {
        try {
            const { godownId, commodityId, supplierId, search, from, to } = req.query;
            const where = {};
            if (godownId)
                where.godownId = String(godownId);
            if (commodityId)
                where.commodityId = String(commodityId);
            if (supplierId)
                where.supplierId = String(supplierId);
            if (from || to) {
                where.receiptDate = {
                    ...(from ? { gte: new Date(String(from)) } : {}),
                    ...(to ? { lte: new Date(String(to)) } : {}),
                };
            }
            if (search) {
                const q = String(search).trim();
                where.OR = [
                    { receiptNumber: { contains: q, mode: 'insensitive' } },
                    { variety: { contains: q, mode: 'insensitive' } },
                    { labReportNo: { contains: q, mode: 'insensitive' } },
                    { vehicleNumber: { contains: q, mode: 'insensitive' } },
                ];
            }
            const receipts = await prisma_1.prisma.stockReceipt.findMany({
                where,
                include: {
                    godown: true,
                    supplier: true,
                    commodity: true,
                    batch: true,
                    createdBy: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
                orderBy: { receiptDate: 'desc' },
            });
            const formatted = receipts.map((r) => ({
                ...r,
                quantityMt: r.quantityKg / 1000,
                batchNumber: r.batch?.batchNumber || null,
                batchId: r.batch?.id || null,
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
     * GET /api/receipts/:id
     * Fetches single stock receipt details.
     */
    static async getReceiptById(req, res, next) {
        try {
            const { id } = req.params;
            const receipt = await prisma_1.prisma.stockReceipt.findUnique({
                where: { id },
                include: {
                    godown: true,
                    supplier: true,
                    commodity: true,
                    batch: {
                        include: {
                            movements: true,
                        },
                    },
                    createdBy: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
            });
            if (!receipt) {
                throw new error_middleware_1.AppError(`Stock Receipt not found with ID: ${id}`, 404);
            }
            res.json({
                success: true,
                data: {
                    ...receipt,
                    quantityMt: receipt.quantityKg / 1000,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ReceiptsController = ReceiptsController;
