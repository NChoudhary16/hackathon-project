"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementsController = void 0;
const prisma_1 = require("../../lib/prisma");
class MovementsController {
    static async list(req, res, next) {
        try {
            const { godownId, batchId, movementType, limit } = req.query;
            const movements = await prisma_1.prisma.stockMovement.findMany({
                where: {
                    ...(godownId ? { godownId: String(godownId) } : {}),
                    ...(batchId ? { batchId: String(batchId) } : {}),
                    ...(movementType ? { movementType: movementType } : {}),
                },
                include: {
                    godown: {
                        select: { id: true, code: true, name: true },
                    },
                    batch: {
                        include: {
                            commodity: {
                                select: { id: true, code: true, name: true },
                            },
                        },
                    },
                    performedBy: {
                        select: { id: true, name: true, role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit ? parseInt(String(limit), 10) : 100,
            });
            const formatted = movements.map((m) => ({
                ...m,
                quantityMt: m.quantityKg / 1000,
                balanceAfterMt: m.balanceAfterKg / 1000,
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
}
exports.MovementsController = MovementsController;
