import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeAppRole, type AppRoleLike } from "@/lib/auth/roles";

export const AUDIT_ACTIONS = {
  SUPPORT_GRANT_CREATED: "SUPPORT_GRANT_CREATED",
  SUPPORT_GRANT_REVOKED: "SUPPORT_GRANT_REVOKED",
  SUPPORT_METADATA_VIEWED: "SUPPORT_METADATA_VIEWED",
  SUPPORT_CONTENT_VIEWED: "SUPPORT_CONTENT_VIEWED",
  SUPPORT_RESUME_PREVIEWED: "SUPPORT_RESUME_PREVIEWED",
  SUPPORT_RESUME_PRINTED: "SUPPORT_RESUME_PRINTED",
  SUPPORT_RESUME_PDF_GENERATED: "SUPPORT_RESUME_PDF_GENERATED",
  PRIVACY_AUDIT_VIEWED: "PRIVACY_AUDIT_VIEWED",
  PRIVACY_REQUEST_VIEWED: "PRIVACY_REQUEST_VIEWED",
  PRIVACY_REQUEST_STATUS_UPDATED: "PRIVACY_REQUEST_STATUS_UPDATED",
  RETENTION_POLICY_VIEWED: "RETENTION_POLICY_VIEWED",
  ACCOUNT_DELETION_REQUESTED: "ACCOUNT_DELETION_REQUESTED",
  ACCOUNT_DELETION_ANONYMIZED: "ACCOUNT_DELETION_ANONYMIZED",
} as const;

export const AUDIT_TARGET_TYPES = {
  USER: "USER",
  RESUME: "RESUME",
  IMAGE_ASSET: "IMAGE_ASSET",
  SUPPORT_ACCESS_GRANT: "SUPPORT_ACCESS_GRANT",
  AUDIT_LOG: "AUDIT_LOG",
  PRIVACY_REQUEST: "PRIVACY_REQUEST",
  RETENTION_POLICY: "RETENTION_POLICY",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
export type AuditTargetType =
  (typeof AUDIT_TARGET_TYPES)[keyof typeof AUDIT_TARGET_TYPES];

export type AuditActor = {
  id?: string | null;
  role?: AppRoleLike;
} | null;

export type WriteAuditLogInput = {
  actor?: AuditActor;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string | null;
  targetOwnerUserId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function writeAuditLog(input: WriteAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actor?.id ?? null,
      actorRole: input.actor?.role ? normalizeAppRole(input.actor.role) : null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      targetOwnerUserId: input.targetOwnerUserId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}