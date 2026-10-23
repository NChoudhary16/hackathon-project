"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const prisma_1 = require("../../lib/prisma");
class UsersController {
    static async list(req, res, next) {
        try {
            const users = await prisma_1.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    godownId: true,
                    godown: {
                        select: { id: true, code: true, name: true },
                    },
                    createdAt: true,
                },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: users });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UsersController = UsersController;
