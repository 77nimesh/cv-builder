import { prisma } from "@/lib/prisma";
import {
  canManagePrivacyRequests,
  canViewPrivacyRequests,
  type PermissionActor,
} from "@/lib/auth/permissions";
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
  isPrivacyRequestStatus,
  type PrivacyRequestStatus,
} from "@/lib/privacy/retention";

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

export function assertCanViewPrivacyRequests(actor: PermissionActor) {
  if (!canViewPrivacyRequests(actor)) {
    throw new PrivacyRequestPermissionError(
      "You do not have permission to view privacy requests."
    );
  }
}