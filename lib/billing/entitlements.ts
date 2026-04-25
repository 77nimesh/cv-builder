import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ENTITLEMENT_STATUSES,
  FREE_TEMPLATE_LIMIT,
} from "@/lib/billing/types";

const entitlementWithPlanInclude = {
  plan: {
    select: {
      code: true,
      name: true,
    },
  },
} satisfies Prisma.EntitlementInclude;

export type EntitlementWithPlan = Prisma.EntitlementGetPayload<{
  include: typeof entitlementWithPlanInclude;
}>;

export type EffectiveEntitlementSnapshot = {
  userId: string;
  resumeId: string | null;
  templateLimit: number;
  exportEnabled: boolean;
  exportResumeScoped: boolean;
  downloadLimit: number | null;
  downloadsUsed: number;
  activeEntitlementIds: string[];
  activePlanCodes: string[];
};

export function buildFreeEntitlementSnapshot(input: {
  userId: string;
  resumeId?: string | null;
}): EffectiveEntitlementSnapshot {
  return {
    userId: input.userId,
    resumeId: input.resumeId ?? null,
    templateLimit: FREE_TEMPLATE_LIMIT,
    exportEnabled: false,
    exportResumeScoped: false,
    downloadLimit: 0,
    downloadsUsed: 0,
    activeEntitlementIds: [],
    activePlanCodes: [],
  };
}

function buildActiveEntitlementWhere(input: {
  userId: string;
  resumeId?: string | null;
  now: Date;
  exportOnly?: boolean;
}): Prisma.EntitlementWhereInput {
  const filters: Prisma.EntitlementWhereInput[] = [
    {
      userId: input.userId,
      status: ENTITLEMENT_STATUSES.ACTIVE,
      revokedAt: null,
      startsAt: {
        lte: input.now,
      },
      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gt: input.now,
          },
        },
      ],
    },
  ];

  if (input.resumeId) {
    filters.push({
      OR: [
        {
          resumeId: null,
        },
        {
          resumeId: input.resumeId,
        },
      ],
    });
  } else {
    filters.push({
      resumeId: null,
    });
  }

  if (input.exportOnly) {
    filters.push({
      exportEnabled: true,
    });
  }

  return {
    AND: filters,
  };
}

export function entitlementAppliesToResume(
  entitlement: Pick<EntitlementWithPlan, "resumeId" | "exportResumeScoped">,
  resumeId: string | null | undefined
) {
  if (!resumeId) {
    return entitlement.resumeId === null;
  }

  if (!entitlement.resumeId) {
    return !entitlement.exportResumeScoped;
  }

  return entitlement.resumeId === resumeId;
}

export async function listActiveEntitlementsForResumeScope(input: {
  userId: string;
  resumeId?: string | null;
  now?: Date;
  exportOnly?: boolean;
}) {
  const now = input.now ?? new Date();

  const entitlements = await prisma.entitlement.findMany({
    where: buildActiveEntitlementWhere({
      userId: input.userId,
      resumeId: input.resumeId ?? null,
      now,
      exportOnly: input.exportOnly,
    }),
    include: entitlementWithPlanInclude,
    orderBy: [
      {
        expiresAt: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return entitlements.filter((entitlement) =>
    entitlementAppliesToResume(entitlement, input.resumeId ?? null)
  );
}

export function buildEffectiveEntitlementSnapshot(input: {
  userId: string;
  resumeId?: string | null;
  entitlements: EntitlementWithPlan[];
}): EffectiveEntitlementSnapshot {
  const snapshot = buildFreeEntitlementSnapshot({
    userId: input.userId,
    resumeId: input.resumeId ?? null,
  });

  const exportEntitlements = input.entitlements.filter(
    (entitlement) => entitlement.exportEnabled
  );

  let hasUnlimitedDownloads = false;
  let summedDownloadLimit = 0;
  let summedDownloadsUsed = 0;
  let hasAccountWideExport = false;
  let hasScopedExport = false;

  for (const entitlement of input.entitlements) {
    snapshot.templateLimit = Math.max(
      snapshot.templateLimit,
      entitlement.templateLimit
    );

    snapshot.activeEntitlementIds.push(entitlement.id);

    if (entitlement.plan?.code) {
      snapshot.activePlanCodes.push(entitlement.plan.code);
    }
  }

  for (const entitlement of exportEntitlements) {
    snapshot.exportEnabled = true;

    if (entitlement.exportResumeScoped) {
      hasScopedExport = true;
    } else {
      hasAccountWideExport = true;
    }

    if (entitlement.downloadLimit === null) {
      hasUnlimitedDownloads = true;
    } else {
      summedDownloadLimit += entitlement.downloadLimit;
      summedDownloadsUsed += entitlement.downloadsUsed;
    }
  }

  if (snapshot.exportEnabled) {
    snapshot.exportResumeScoped = hasScopedExport && !hasAccountWideExport;
    snapshot.downloadLimit = hasUnlimitedDownloads ? null : summedDownloadLimit;
    snapshot.downloadsUsed = summedDownloadsUsed;
  }

  snapshot.activePlanCodes = Array.from(new Set(snapshot.activePlanCodes));

  return snapshot;
}

export async function getEffectiveEntitlementSnapshotForResume(input: {
  userId: string;
  resumeId?: string | null;
  now?: Date;
}) {
  const entitlements = await listActiveEntitlementsForResumeScope({
    userId: input.userId,
    resumeId: input.resumeId ?? null,
    now: input.now,
  });

  return buildEffectiveEntitlementSnapshot({
    userId: input.userId,
    resumeId: input.resumeId ?? null,
    entitlements,
  });
}