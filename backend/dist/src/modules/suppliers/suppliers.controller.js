"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersController = void 0;
const prisma_1 = require("../../lib/prisma");
class SuppliersController {
    static async list(req, res, next) {
        try {
            const suppliers = await prisma_1.prisma.supplier.findMany({
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: suppliers });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SuppliersController = SuppliersController;
