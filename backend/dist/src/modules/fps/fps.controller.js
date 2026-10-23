"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FPSController = void 0;
const prisma_1 = require("../../lib/prisma");
class FPSController {
    static async list(req, res, next) {
        try {
            const { district } = req.query;
            const fpsList = await prisma_1.prisma.fairPriceShop.findMany({
                where: district ? { district: String(district) } : undefined,
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: fpsList });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.FPSController = FPSController;
