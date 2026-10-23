"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address format'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address format'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        role: zod_1.z.enum(['ADMIN', 'GODOWN_MANAGER', 'QUALITY_INSPECTOR', 'DISPATCH_OFFICER']).default('GODOWN_MANAGER'),
        godownId: zod_1.z.string().optional(),
    }),
});
