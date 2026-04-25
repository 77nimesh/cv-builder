import type { AppRoleLike } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import {
  type EntitlementWithPlan,
  buildFreeEntitlementSnapshot,
  listActiveEntitlementsForResumeScope,
} from "@/lib/billing/entitlements";
import { ENTITLEMENT_STATUSES } from "@/lib/billing/types";
import { getOwnResumePlanExemption } from "@/lib/billing/plan-exemptions";

export const EXPORT_ACCESS_ERROR_CODES = {
  EXPORT_REQUIRES_PAYMENT: "EXPORT_REQUIRES_PAYMENT",
  DOWNLOAD_LIMIT_REACHED: "DOWNLOAD_LIMIT_REACHED",
  EXPORT_ENTITLEMENT_NOT_FOUND: "EXPORT_ENTITLEMENT_NOT_FOUND",
} as const;

export type ExportAccessErrorCode =
  (typeof EXPORT_ACCESS_ERROR_CODES)[keyof typeof EXPORT_ACCESS_ERROR_CODES];

export class ExportAccessError extends Error {
  status: number;
  code: ExportAccessErrorCode;

  constructor(input: {
    message: string;
    status: number;
    code: ExportAccessErrorCode;
  }) {
    super(input.message);
    this.name = "ExportAccessError";
    this.status = input.status;
    this.code = input.code;
  }
}

export type ResumeExportAccess = {
  canExport: boolean;
  userId: string;
  resumeId: string;
  entitlementId: string | null;
  planCode: string | null;
  downloadLimit: number | null;
  downloadsUsed: number;
  remainingDownloads: number | null;
  reason: string | null;
  code: ExportAccessErrorCode | null;
};

function getRemainingDownloads(
  entitlement: Pick<EntitlementWithPlan, "downloadLimit" | "downloadsUsed">
) {
  if (entitlement.downloadLimit === null) {
    return null;
  }

  return Math.max(0, entitlement.downloadLimit - entitlement.downloadsUsed);
}

function hasDownloadsRemaining(entitlement: EntitlementWithPlan) {
  const remainingDownloads = getRemainingDownloads(entitlement);

  return remainingDownloads === null || remainingDownloads > 0;
}

function sortExportEntitlementsForConsumption(
  left: EntitlementWithPlan,
  right: EntitlementWithPlan
) {
  if (left.downloadLimit === null && right.downloadLimit !== null) {
    return -1;
  }

  if (left.downloadLimit !== null && right.downloadLimit === null) {
    return 1;
  }

  if (left.resumeId && !right.resumeId) {
    return -1;
  }

  if (!left.resumeId && right.resumeId) {
    return 1;
  }

  return left.createdAt.getTime() - right.createdAt.getTime();
}

export async function getResumeExportAccess(input: {
  userId: string;
  userRole?: AppRoleLike;
  resumeId: string;
}): Promise<ResumeExportAccess> {
  const planExemption = await getOwnResumePlanExemption({
    userId: input.userId,
    userRole: input.userRole,
    resumeId: input.resumeId,
  });

  if (planExemption?.exportEnabled) {
    return {
      canExport: true,
      userId: input.userId,
      resumeId: input.resumeId,
      entitlementId: null,
      planCode: planExemption.code,
      downloadLimit: planExemption.downloadLimit,
      downloadsUsed: planExemption.downloadsUsed,
      remainingDownloads: planExemption.remainingDownloads,
      reason: null,
      code: null,
    };
  }

  const entitlements = await listActiveEntitlementsForResumeScope({
    userId: input.userId,
    resumeId: input.resumeId,
    exportOnly: true,
  });

  const exportEntitlements = entitlements.filter(
    (entitlement) => entitlement.exportEnabled
  );

  if (exportEntitlements.length === 0) {
    const freeSnapshot = buildFreeEntitlementSnapshot({
      userId: input.userId,
      resumeId: input.resumeId,
    });

    return {
      canExport: false,
      userId: input.userId,
      resumeId: input.resumeId,
      entitlementId: null,
      planCode: freeSnapshot.activePlanCodes[0] ?? null,
      downloadLimit: freeSnapshot.downloadLimit,
      downloadsUsed: freeSnapshot.downloadsUsed,
      remainingDownloads: 0,
      reason: "PDF export is locked for your current plan.",
      code: EXPORT_ACCESS_ERROR_CODES.EXPORT_REQUIRES_PAYMENT,
    };
  }

  const eligibleEntitlement = [...exportEntitlements]
    .filter(hasDownloadsRemaining)
    .sort(sortExportEntitlementsForConsumption)[0];

  if (!eligibleEntitlement) {
    const firstEntitlement = exportEntitlements[0];

    return {
      canExport: false,
      userId: input.userId,
      resumeId: input.resumeId,
      entitlementId: null,
      planCode: firstEntitlement?.plan?.code ?? null,
      downloadLimit: firstEntitlement?.downloadLimit ?? 0,
      downloadsUsed: firstEntitlement?.downloadsUsed ?? 0,
      remainingDownloads: 0,
      reason: "Your download allowance for this entitlement has been used.",
      code: EXPORT_ACCESS_ERROR_CODES.DOWNLOAD_LIMIT_REACHED,
    };
  }

  return {
    canExport: true,
    userId: input.userId,
    resumeId: input.resumeId,
    entitlementId: eligibleEntitlement.id,
    planCode: eligibleEntitlement.plan?.code ?? null,
    downloadLimit: eligibleEntitlement.downloadLimit,
    downloadsUsed: eligibleEntitlement.downloadsUsed,
    remainingDownloads: getRemainingDownloads(eligibleEntitlement),
    reason: null,
    code: null,
  };
}

export async function assertCanExportResume(input: {
  userId: string;
  userRole?: AppRoleLike;
  resumeId: string;
}) {
  const access = await getResumeExportAccess(input);

  if (!access.canExport) {
    throw new ExportAccessError({
      message: access.reason ?? "PDF export is not available.",
      status:
        access.code === EXPORT_ACCESS_ERROR_CODES.DOWNLOAD_LIMIT_REACHED
          ? 403
          : 402,
      code:
        access.code ?? EXPORT_ACCESS_ERROR_CODES.EXPORT_REQUIRES_PAYMENT,
    });
  }

  return access;
}

export async function consumeResumeExportDownload(access: ResumeExportAccess) {
  if (!access.canExport || !access.entitlementId) {
    return;
  }

  if (access.downloadLimit === null) {
    return;
  }

  const now = new Date();

  const entitlement = await prisma.entitlement.findFirst({
    where: {
      id: access.entitlementId,
      userId: access.userId,
      status: ENTITLEMENT_STATUSES.ACTIVE,
      revokedAt: null,
      startsAt: {
        lte: now,
      },
      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gt: now,
          },
        },
      ],
    },
    select: {
      id: true,
      downloadLimit: true,
      downloadsUsed: true,
    },
  });

  if (!entitlement) {
    throw new ExportAccessError({
      message: "The export entitlement is no longer available.",
      status: 403,
      code: EXPORT_ACCESS_ERROR_CODES.EXPORT_ENTITLEMENT_NOT_FOUND,
    });
  }

  if (
    entitlement.downloadLimit !== null &&
    entitlement.downloadsUsed >= entitlement.downloadLimit
  ) {
    throw new ExportAccessError({
      message: "Your download allowance for this entitlement has been used.",
      status: 403,
      code: EXPORT_ACCESS_ERROR_CODES.DOWNLOAD_LIMIT_REACHED,
    });
  }

  await prisma.entitlement.update({
    where: {
      id: entitlement.id,
    },
    data: {
      downloadsUsed: {
        increment: 1,
      },
    },
  });
}