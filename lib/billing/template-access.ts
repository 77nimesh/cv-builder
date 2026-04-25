import type { AppRoleLike } from "@/lib/auth/roles";
import {
  AVAILABLE_RESUME_TEMPLATE_IDS,
  isAvailableResumeTemplateId,
  type AvailableResumeTemplateId,
} from "@/components/templates/template-registry";
import { getEffectiveEntitlementSnapshotForResume } from "@/lib/billing/entitlements";
import { getOwnResumePlanExemption } from "@/lib/billing/plan-exemptions";

export const TEMPLATE_ACCESS_ERROR_CODES = {
  INVALID_TEMPLATE: "INVALID_TEMPLATE",
  TEMPLATE_LOCKED_BY_PLAN: "TEMPLATE_LOCKED_BY_PLAN",
} as const;

export type TemplateAccessErrorCode =
  (typeof TEMPLATE_ACCESS_ERROR_CODES)[keyof typeof TEMPLATE_ACCESS_ERROR_CODES];

export class TemplateAccessError extends Error {
  status: number;
  code: TemplateAccessErrorCode;

  constructor(input: {
    message: string;
    status: number;
    code: TemplateAccessErrorCode;
  }) {
    super(input.message);
    this.name = "TemplateAccessError";
    this.status = input.status;
    this.code = input.code;
  }
}

export type ResumeTemplateAccessResult = {
  canUse: boolean;
  templateId: AvailableResumeTemplateId | null;
  templateRank: number | null;
  templateLimit: number;
  activePlanCodes: string[];
  reason: string | null;
  code: TemplateAccessErrorCode | null;
};

export function normalizeTemplateIdForAccess(
  template: string | null | undefined
): AvailableResumeTemplateId | null {
  const trimmed = template?.trim();

  if (!trimmed) {
    return null;
  }

  if (!isAvailableResumeTemplateId(trimmed)) {
    return null;
  }

  return trimmed;
}

export function getTemplateEntitlementRank(
  templateId: AvailableResumeTemplateId
) {
  const index = AVAILABLE_RESUME_TEMPLATE_IDS.indexOf(templateId);

  if (index < 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  return index + 1;
}

export function isTemplateAllowedByLimit(input: {
  templateId: AvailableResumeTemplateId;
  templateLimit: number;
}) {
  return getTemplateEntitlementRank(input.templateId) <= input.templateLimit;
}

export async function getResumeTemplateAccess(input: {
  userId: string;
  userRole?: AppRoleLike;
  resumeId?: string | null;
  template: string | null | undefined;
}): Promise<ResumeTemplateAccessResult> {
  const templateId = normalizeTemplateIdForAccess(input.template);

  if (!templateId) {
    return {
      canUse: false,
      templateId: null,
      templateRank: null,
      templateLimit: 0,
      activePlanCodes: [],
      reason: "The selected template is not available.",
      code: TEMPLATE_ACCESS_ERROR_CODES.INVALID_TEMPLATE,
    };
  }

  const planExemption = await getOwnResumePlanExemption({
    userId: input.userId,
    userRole: input.userRole,
    resumeId: input.resumeId ?? null,
  });

  if (planExemption) {
    return {
      canUse: true,
      templateId,
      templateRank: getTemplateEntitlementRank(templateId),
      templateLimit: planExemption.templateLimit,
      activePlanCodes: [planExemption.code],
      reason: null,
      code: null,
    };
  }

  const entitlement = await getEffectiveEntitlementSnapshotForResume({
    userId: input.userId,
    resumeId: input.resumeId ?? null,
  });

  const templateRank = getTemplateEntitlementRank(templateId);
  const canUse = templateRank <= entitlement.templateLimit;

  return {
    canUse,
    templateId,
    templateRank,
    templateLimit: entitlement.templateLimit,
    activePlanCodes: entitlement.activePlanCodes,
    reason: canUse
      ? null
      : `This template requires a plan with access to at least ${templateRank} templates. Your current access allows ${entitlement.templateLimit}.`,
    code: canUse ? null : TEMPLATE_ACCESS_ERROR_CODES.TEMPLATE_LOCKED_BY_PLAN,
  };
}

export async function assertCanUseResumeTemplate(input: {
  userId: string;
  userRole?: AppRoleLike;
  resumeId?: string | null;
  template: string | null | undefined;
}) {
  const access = await getResumeTemplateAccess(input);

  if (!access.canUse) {
    throw new TemplateAccessError({
      message: access.reason ?? "This template is not available to your plan.",
      status:
        access.code === TEMPLATE_ACCESS_ERROR_CODES.INVALID_TEMPLATE ? 400 : 403,
      code:
        access.code ?? TEMPLATE_ACCESS_ERROR_CODES.TEMPLATE_LOCKED_BY_PLAN,
    });
  }

  if (!access.templateId) {
    throw new TemplateAccessError({
      message: "The selected template is not available.",
      status: 400,
      code: TEMPLATE_ACCESS_ERROR_CODES.INVALID_TEMPLATE,
    });
  }

  return {
    ...access,
    templateId: access.templateId,
  };
}