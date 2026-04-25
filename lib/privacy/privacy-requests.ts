import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";
import {
  canManagePrivacyRequests,
  canViewPrivacyRequests,
  type PermissionActor,
} from "@/lib/auth/permissions";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { APP_ROLES, normalizeAppRole } from "@/lib/auth/roles";
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
  writeAuditLog,
} from "@/lib/privacy/audit";
import {
  ACTIVE_PRIVACY_REQUEST_STATUSES,
  PRIVACY_REQUEST_STATUSES,
  PRIVACY_REQUEST_TYPES,
  calculatePrivacyRequestDueAt,
  isActivePrivacyRequestStatus,
  isPrivacyRequestStatus,
  type PrivacyRequestStatus,
} from "@/lib/privacy/retention";
import { deleteLocalAssetByStorageKey } from "@/lib/assets/storage";

export class PrivacyRequestPermissionError extends Error {
  constructor(message = "You do not have permission to manage privacy requests.") {
    super(message);
    this.name = "PrivacyRequestPermissionError";
  }
}

export class PrivacyRequestStatusError extends Error {
  constructor(message = "Invalid privacy request status.") {
    super(message);
    this.name = "PrivacyRequestStatusError";
  }
}

export class PrivacyRequestActorError extends Error {
  constructor(message = "A signed-in user is required for this privacy request.") {
    super(message);
    this.name = "PrivacyRequestActorError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class PrivacyRequestTypeError extends Error {
  constructor(message = "Invalid privacy request type.") {
    super(message);
    this.name = "PrivacyRequestTypeError";
  }
}

export async function requestAccountDeletion(input: {
  actor: PermissionActor;
  reason?: string | null;
}) {
  if (!input.actor?.id) {
    throw new PrivacyRequestActorError();
  }

  const existingActiveRequest = await prisma.privacyRequest.findFirst({
    where: {
      subjectUserId: input.actor.id,
      type: PRIVACY_REQUEST_TYPES.ACCOUNT_DELETION,
      status: {
        in: ACTIVE_PRIVACY_REQUEST_STATUSES,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingActiveRequest) {
    return existingActiveRequest;
  }

  const dueAt = calculatePrivacyRequestDueAt();
  const reason = input.reason?.trim() || null;

  const privacyRequest = await prisma.privacyRequest.create({
    data: {
      type: PRIVACY_REQUEST_TYPES.ACCOUNT_DELETION,
      status: PRIVACY_REQUEST_STATUSES.OPEN,
      subjectUserId: input.actor.id,
      requestedByUserId: input.actor.id,
      reason,
      dueAt,
      requestDetails: {
        source: "account",
        destructiveDeletionPerformed: false,
        note: "Deletion request captured only. Manual privacy-admin review is required before deletion execution is implemented.",
      },
    },
  });

  await writeAuditLog({
    actor: input.actor,
    action: AUDIT_ACTIONS.ACCOUNT_DELETION_REQUESTED,
    targetType: AUDIT_TARGET_TYPES.PRIVACY_REQUEST,
    targetId: privacyRequest.id,
    targetOwnerUserId: input.actor.id,
    metadata: {
      type: privacyRequest.type,
      status: privacyRequest.status,
      dueAt: privacyRequest.dueAt?.toISOString() ?? null,
    },
  });

  return privacyRequest;
}

export async function updatePrivacyRequestStatus(input: {
  actor: PermissionActor;
  requestId: string;
  status: PrivacyRequestStatus;
  resolutionNotes?: string | null;
}) {
  if (!canManagePrivacyRequests(input.actor)) {
    throw new PrivacyRequestPermissionError();
  }

  if (!isPrivacyRequestStatus(input.status)) {
    throw new PrivacyRequestStatusError();
  }

  const existingRequest = await prisma.privacyRequest.findUnique({
    where: {
      id: input.requestId,
    },
  });

  if (!existingRequest) {
    return null;
  }

  if (
    existingRequest.resolvedAt ||
    !isActivePrivacyRequestStatus(existingRequest.status)
  ) {
    throw new PrivacyRequestStatusError(
      "Resolved privacy requests cannot be updated."
    );
  }

  const isResolvedStatus =
    input.status === PRIVACY_REQUEST_STATUSES.COMPLETED ||
    input.status === PRIVACY_REQUEST_STATUSES.REJECTED ||
    input.status === PRIVACY_REQUEST_STATUSES.CANCELLED;

  const privacyRequest = await prisma.privacyRequest.update({
    where: {
      id: input.requestId,
    },
    data: {
      status: input.status,
      resolutionNotes: input.resolutionNotes?.trim() || null,
      resolvedAt: isResolvedStatus ? new Date() : null,
      resolvedByUserId: isResolvedStatus ? input.actor.id : null,
    },
  });

  await writeAuditLog({
    actor: input.actor,
    action: AUDIT_ACTIONS.PRIVACY_REQUEST_STATUS_UPDATED,
    targetType: AUDIT_TARGET_TYPES.PRIVACY_REQUEST,
    targetId: privacyRequest.id,
    targetOwnerUserId: privacyRequest.subjectUserId,
    metadata: {
      previousStatus: existingRequest.status,
      nextStatus: privacyRequest.status,
      type: privacyRequest.type,
      destructiveDeletionPerformed: false,
    },
  });

  return privacyRequest;
}

export async function executeAccountDeletionAnonymization(input: {
  actor: PermissionActor;
  requestId: string;
}) {
  if (!canManagePrivacyRequests(input.actor)) {
    throw new PrivacyRequestPermissionError();
  }

  const existingRequest = await prisma.privacyRequest.findUnique({
    where: {
      id: input.requestId,
    },
  });

  if (!existingRequest) {
    return null;
  }

  if (existingRequest.type !== PRIVACY_REQUEST_TYPES.ACCOUNT_DELETION) {
    throw new PrivacyRequestTypeError(
      "Only account deletion requests can be anonymized."
    );
  }

  if (existingRequest.resolvedAt || !isActivePrivacyRequestStatus(existingRequest.status)) {
    throw new PrivacyRequestStatusError(
      "Resolved privacy requests cannot be executed."
    );
  }

  const subjectUser = await prisma.user.findUnique({
    where: {
      id: existingRequest.subjectUserId,
    },
    select: {
      id: true,
      anonymizedAt: true,
    },
  });

  if (!subjectUser) {
    throw new Error("Privacy request subject user was not found.");
  }

  if (subjectUser.anonymizedAt) {
    throw new PrivacyRequestStatusError("Account is already anonymized.");
  }

  const imageAssets = await prisma.imageAsset.findMany({
    where: {
      userId: subjectUser.id,
    },
    select: {
      storageProvider: true,
      storageKey: true,
    },
  });

  const now = new Date();
  const randomPassword = randomBytes(48).toString("hex");
  const anonymizedEmail = normalizeEmail(
    `deleted+${subjectUser.id}@example.invalid`
  );

  const updatedRequestDetails = (() => {
    const existingDetails = isRecord(existingRequest.requestDetails)
      ? existingRequest.requestDetails
      : {};

    return {
      ...existingDetails,
      destructiveDeletionPerformed: true,
      executedAt: now.toISOString(),
      execution: {
        kind: "anonymize",
      },
    };
  })();

  const result = await prisma.$transaction(async (tx) => {
    const deletedResumes = await tx.resume.deleteMany({
      where: {
        userId: subjectUser.id,
      },
    });

    const deletedSupportAccessGrants = await tx.supportAccessGrant.deleteMany({
      where: {
        OR: [
          { targetUserId: subjectUser.id },
          { supportUserId: subjectUser.id },
          { grantedByUserId: subjectUser.id },
        ],
      },
    });

    const deletedEmailVerificationTokens =
      await tx.emailVerificationToken.deleteMany({
        where: {
          userId: subjectUser.id,
        },
      });

    const deletedPasswordResetTokens = await tx.passwordResetToken.deleteMany({
      where: {
        userId: subjectUser.id,
      },
    });

    const deletedImageAssets = await tx.imageAsset.deleteMany({
      where: {
        userId: subjectUser.id,
      },
    });

    const user = await tx.user.update({
      where: {
        id: subjectUser.id,
      },
      data: {
        name: null,
        email: anonymizedEmail,
        passwordHash: await hashPassword(randomPassword),
        role: APP_ROLES.USER,
        emailVerified: null,
        anonymizedAt: now,
      },
      select: {
        id: true,
        anonymizedAt: true,
      },
    });

    const privacyRequest = await tx.privacyRequest.update({
      where: {
        id: existingRequest.id,
      },
      data: {
        status: PRIVACY_REQUEST_STATUSES.COMPLETED,
        resolvedAt: now,
        resolvedByUserId: input.actor.id,
        resolutionNotes:
          existingRequest.resolutionNotes?.trim() ||
          "Account anonymization executed. Resumes and image assets were deleted; uploaded files were deleted best-effort.",
        requestDetails: updatedRequestDetails,
      },
    });

    const actorRole = input.actor.role
      ? normalizeAppRole(input.actor.role)
      : null;

    await tx.auditLog.create({
      data: {
        actorUserId: input.actor.id,
        actorRole,
        action: AUDIT_ACTIONS.PRIVACY_REQUEST_STATUS_UPDATED,
        targetType: AUDIT_TARGET_TYPES.PRIVACY_REQUEST,
        targetId: privacyRequest.id,
        targetOwnerUserId: privacyRequest.subjectUserId,
        metadata: {
          previousStatus: existingRequest.status,
          nextStatus: privacyRequest.status,
          type: privacyRequest.type,
          destructiveDeletionPerformed: true,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actor.id,
        actorRole,
        action: AUDIT_ACTIONS.ACCOUNT_DELETION_ANONYMIZED,
        targetType: AUDIT_TARGET_TYPES.USER,
        targetId: subjectUser.id,
        targetOwnerUserId: subjectUser.id,
        metadata: {
          privacyRequestId: privacyRequest.id,
          deletedResumes: deletedResumes.count,
          deletedImageAssets: deletedImageAssets.count,
          deletedSupportAccessGrants: deletedSupportAccessGrants.count,
          deletedEmailVerificationTokens: deletedEmailVerificationTokens.count,
          deletedPasswordResetTokens: deletedPasswordResetTokens.count,
        },
      },
    });

    return {
      privacyRequest,
      user,
      deletedResumesCount: deletedResumes.count,
      deletedImageAssetsCount: deletedImageAssets.count,
    };
  });

  let deletedFiles = 0;
  let fileDeleteFailures = 0;

  for (const asset of imageAssets) {
    if (!asset.storageKey) {
      continue;
    }

    try {
      await deleteLocalAssetByStorageKey(asset.storageKey);
      deletedFiles += 1;
    } catch (error) {
      fileDeleteFailures += 1;
      console.error("Failed to delete local image asset file:", error);
    }
  }

  await writeAuditLog({
    actor: input.actor,
    action: AUDIT_ACTIONS.ACCOUNT_DELETION_ANONYMIZED,
    targetType: AUDIT_TARGET_TYPES.PRIVACY_REQUEST,
    targetId: existingRequest.id,
    targetOwnerUserId: existingRequest.subjectUserId,
    metadata: {
      fileDeletionAttempted: imageAssets.length,
      fileDeletionSucceeded: deletedFiles,
      fileDeletionFailed: fileDeleteFailures,
    },
  }).catch((error) => {
    console.error("Failed to write anonymization file cleanup audit log:", error);
  });

  return {
    ...result,
    deletedFiles,
    fileDeleteFailures,
  };
}

export function assertCanViewPrivacyRequests(actor: PermissionActor) {
  if (!canViewPrivacyRequests(actor)) {
    throw new PrivacyRequestPermissionError(
      "You do not have permission to view privacy requests."
    );
  }
}