import { prisma } from '../lib/prisma';

export interface AuditParams {
  action: string;
  entity: string;
  entityId: string;
  payloadJson?: Record<string, unknown> | null;
  performedById?: string | null;
}

export class AuditService {
  static async log(params: AuditParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          payloadJson: params.payloadJson ? JSON.stringify(params.payloadJson) : null,
          performedById: params.performedById || null,
        },
      });
    } catch (err) {
      console.error('[AUDIT_LOG_ERROR] Failed to record audit log:', err);
    }
  }
}
