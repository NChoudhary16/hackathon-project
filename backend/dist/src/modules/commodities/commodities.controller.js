"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommoditiesController = void 0;
const prisma_1 = require("../../lib/prisma");
class CommoditiesController {
    static async list(req, res, next) {
        try {
            const commodities = await prisma_1.prisma.commodity.findMany({
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: commodities });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CommoditiesController = CommoditiesController;
