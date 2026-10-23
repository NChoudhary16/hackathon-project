"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_1 = require("../lib/prisma");
class AuditService {
    static async log(params) {
        try {
            return await prisma_1.prisma.auditLog.create({
                data: {
                    action: params.action,
                    entity: params.entity,
                    entityId: params.entityId,
                    payloadJson: params.payloadJson ? JSON.stringify(params.payloadJson) : null,
                    performedById: params.performedById || null,
                },
            });
        }
        catch (err) {
            console.error('[AUDIT_LOG_ERROR] Failed to record audit log:', err);
        }
    }
}
exports.AuditService = AuditService;
