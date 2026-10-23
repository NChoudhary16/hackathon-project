"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GodownsController = void 0;
const prisma_1 = require("../../lib/prisma");
const error_middleware_1 = require("../../middleware/error.middleware");
class GodownsController {
    static async list(req, res, next) {
        try {
            const godowns = await prisma_1.prisma.godown.findMany({
                where: { active: true },
                include: {
                    _count: {
                        select: { batches: true, receipts: true, challans: true },
                    },
                },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: godowns });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const godown = await prisma_1.prisma.godown.findUnique({
                where: { id },
                include: {
                    batches: {
                        take: 10,
                        orderBy: { receiptDate: 'asc' },
                    },
                },
            });
            if (!godown)
                throw new error_middleware_1.AppError('Godown not found', 404);
            res.json({ success: true, data: godown });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.GodownsController = GodownsController;
