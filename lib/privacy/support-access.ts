import { prisma } from "@/lib/prisma";
import {
  canManageSupportAccessGrants,
  canUseSupportContentGrantRole,
  type PermissionActor,
} from "@/lib/auth/permissions";
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
  writeAuditLog,
} from "@/lib/privacy/audit";

export const DEFAULT_SUPPORT_ACCESS_GRANT_TTL_MS = 30 * 60 * 1000;
export const MAX_SUPPORT_ACCESS_GRANT_TTL_MS = 2 * 60 * 60 * 1000;

export class SupportAccessPermissionError extends Error {
  constructor(message = "You do not have permission to manage support access.") {
    super(message);
    this.name = "SupportAccessPermissionError";
  }
}

export class SupportAccessReasonRequiredError extends Error {
  constructor(message = "A reason is required for support content access.") {
    super(message);
    this.name = "SupportAccessReasonRequiredError";
  }
}

export class SupportAccessExpiryError extends Error {
  constructor(message = "Support content access must have a short-lived expiry.") {
    super(message);
    this.name = "SupportAccessExpiryError";
  }
}

export class SupportAccessRoleError extends Error {
  constructor(
    message = "Support content grants can only be assigned to SUPPORT_CONTENT_ACCESS users."
  ) {
    super(message);
    this.name = "SupportAccessRoleError";
  }
}

export class SupportAccessTargetError extends Error {
  constructor(message = "Support access target was not found or is invalid.") {
    super(message);
    this.name = "SupportAccessTargetError";
  }
}

export async function findActiveSupportAccessGrant(input: {
  supportUserId: string;
  targetUserId: string;
  targetResumeId?: string | null;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  return prisma.supportAccessGrant.findFirst({
    where: {
      supportUserId: input.supportUserId,
      targetUserId: input.targetUserId,
      revokedAt: null,
      startsAt: {
        lte: now,
      },
      expiresAt: {
        gt: now,
      },
      OR: input.targetResumeId
        ? [{ targetResumeId: null }, { targetResumeId: input.targetResumeId }]
        : [{ targetResumeId: null }],
    },
    orderBy: {
      expiresAt: "desc",
    },
  });
}

export async function findActiveSupportContentGrantForActor(input: {
  actor: PermissionActor;
  targetUserId: string;
  targetResumeId?: string | null;
  now?: Date;
}) {
  if (!canUseSupportContentGrantRole(input.actor)) {
    return null;
  }

  return findActiveSupportAccessGrant({
    supportUserId: input.actor.id,
    targetUserId: input.targetUserId,
    targetResumeId: input.targetResumeId,
    now: input.now,
  });
}

export async function actorHasActiveSupportContentGrant(input: {
  actor: PermissionActor;
  targetUserId: string;
  targetResumeId?: string | null;
  now?: Date;
}) {
  const grant = await findActiveSupportContentGrantForActor(input);
  return Boolean(grant);
}

async function assertValidSupportAccessTarget(input: {
  targetUserId: string;
  targetResumeId?: string | null;
}) {
  const targetUser = await prisma.user.findUnique({
    where: {
      id: input.targetUserId,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    throw new SupportAccessTargetError("Target customer was not found.");
  }

  if (!input.targetResumeId) {
    return;
  }

  const targetResume = await prisma.resume.findFirst({
    where: {
      id: input.targetResumeId,
      userId: input.targetUserId,
    },
    select: {
      id: true,
    },
  });

  if (!targetResume) {
    throw new SupportAccessTargetError(
      "Target resume was not found for the selected customer."
    );
  }
}

export async function createSupportAccessGrant(input: {
  grantor: PermissionActor;
  supportUserId: string;
  targetUserId: string;
  targetResumeId?: string | null;
  reason: string;
  expiresAt?: Date;
  startsAt?: Date;
}) {
  if (!canManageSupportAccessGrants(input.grantor)) {
    throw new SupportAccessPermissionError();
  }

  const supportUser = await prisma.user.findUnique({
    where: {
      id: input.supportUserId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!supportUser || !canUseSupportContentGrantRole(supportUser)) {
    throw new SupportAccessRoleError();
  }

  await assertValidSupportAccessTarget({
    targetUserId: input.targetUserId,
    targetResumeId: input.targetResumeId,
  });

  const reason = input.reason.trim();

  if (!reason) {
    throw new SupportAccessReasonRequiredError();
  }

  const startsAt = input.startsAt ?? new Date();
  const expiresAt =
    input.expiresAt ??
    new Date(startsAt.getTime() + DEFAULT_SUPPORT_ACCESS_GRANT_TTL_MS);
  const ttlMs = expiresAt.getTime() - startsAt.getTime();

  if (ttlMs <= 0 || ttlMs > MAX_SUPPORT_ACCESS_GRANT_TTL_MS) {
    throw new SupportAccessExpiryError();
  }

  const grant = await prisma.supportAccessGrant.create({
    data: {
      targetUserId: input.targetUserId,
      targetResumeId: input.targetResumeId ?? null,
      supportUserId: input.supportUserId,
      grantedByUserId: input.grantor.id,
      reason,
      startsAt,
      expiresAt,
    },
  });

  await writeAuditLog({
    actor: input.grantor,
    action: AUDIT_ACTIONS.SUPPORT_GRANT_CREATED,
    targetType: AUDIT_TARGET_TYPES.SUPPORT_ACCESS_GRANT,
    targetId: grant.id,
    targetOwnerUserId: input.targetUserId,
    metadata: {
      supportUserId: input.supportUserId,
      targetUserId: input.targetUserId,
      targetResumeId: input.targetResumeId ?? null,
      expiresAt: expiresAt.toISOString(),
    },
  });

  return grant;
}

export async function revokeSupportAccessGrant(input: {
  grantor: PermissionActor;
  grantId: string;
}) {
  if (!canManageSupportAccessGrants(input.grantor)) {
    throw new SupportAccessPermissionError();
  }

  const existingGrant = await prisma.supportAccessGrant.findUnique({
    where: {
      id: input.grantId,
    },
  });

  if (!existingGrant) {
    return null;
  }

  const grant = await prisma.supportAccessGrant.update({
    where: {
      id: input.grantId,
    },
    data: {
      revokedAt: existingGrant.revokedAt ?? new Date(),
    },
  });

  await writeAuditLog({
    actor: input.grantor,
    action: AUDIT_ACTIONS.SUPPORT_GRANT_REVOKED,
    targetType: AUDIT_TARGET_TYPES.SUPPORT_ACCESS_GRANT,
    targetId: grant.id,
    targetOwnerUserId: grant.targetUserId,
    metadata: {
      supportUserId: grant.supportUserId,
      targetUserId: grant.targetUserId,
      targetResumeId: grant.targetResumeId,
    },
  });

  return grant;
}