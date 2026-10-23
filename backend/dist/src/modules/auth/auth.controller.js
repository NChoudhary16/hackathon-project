"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const jwt_1 = require("../../lib/jwt");
const error_middleware_1 = require("../../middleware/error.middleware");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { email },
                include: { godown: true },
            });
            if (!user) {
                throw new error_middleware_1.AppError('Invalid email or password', 401);
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isMatch) {
                throw new error_middleware_1.AppError('Invalid email or password', 401);
            }
            const token = (0, jwt_1.signToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
                godownId: user.godownId,
            });
            res.json({
                success: true,
                message: 'Authentication successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        godown: user.godown
                            ? {
                                id: user.godown.id,
                                code: user.godown.code,
                                name: user.godown.name,
                            }
                            : null,
                    },
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Not authenticated', 401);
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    godown: {
                        select: { id: true, code: true, name: true, district: true, state: true },
                    },
                    createdAt: true,
                },
            });
            if (!user) {
                throw new error_middleware_1.AppError('User not found', 404);
            }
            res.json({
                success: true,
                data: user,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async register(req, res, next) {
        try {
            const { email, password, name, role, godownId } = req.body;
            const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existing) {
                throw new error_middleware_1.AppError('A user with this email already exists', 409);
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    role,
                    godownId,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    godownId: true,
                    createdAt: true,
                },
            });
            const token = (0, jwt_1.signToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
                godownId: user.godownId,
            });
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { token, user },
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
