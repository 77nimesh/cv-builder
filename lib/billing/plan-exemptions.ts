import { prisma } from "@/lib/prisma";
import { isSystemAdminRole, type AppRoleLike } from "@/lib/auth/roles";
import { PRO_TEMPLATE_LIMIT } from "@/lib/billing/types";

export const PLAN_EXEMPTION_CODES = {
  ADMIN_OWN_RESUME: "admin_own_resume_exemption",
} as const;

export type PlanExemptionCode =
  (typeof PLAN_EXEMPTION_CODES)[keyof typeof PLAN_EXEMPTION_CODES];

export type PlanExemptionSnapshot = {
  code: PlanExemptionCode;
  userId: string;
  resumeId: string | null;
  templateLimit: number;
  exportEnabled: boolean;
  exportResumeScoped: boolean;
  downloadLimit: number | null;
  downloadsUsed: number;
  remainingDownloads: number | null;
  reason: string;
};

async function resolveDatabaseUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role ?? null;
}

async function isOwnResume(input: { userId: string; resumeId: string }) {
  const resume = await prisma.resume.findUnique({
    where: { id: input.resumeId },
    select: { userId: true },
  });

  return resume?.userId === input.userId;
}

export async function getOwnResumePlanExemption(input: {
  userId: string;
  userRole?: AppRoleLike;
  resumeId?: string | null;
}): Promise<PlanExemptionSnapshot | null> {
  // Use DB role as source of truth so stale sessions do not block the admin's own-resume exemption.
  const databaseRole = await resolveDatabaseUserRole(input.userId);
  const effectiveRole = databaseRole ?? input.userRole ?? null;

  if (!isSystemAdminRole(effectiveRole)) {
    return null;
  }

  const resumeId = input.resumeId ?? null;

  if (resumeId) {
    const ownsResume = await isOwnResume({
      userId: input.userId,
      resumeId,
    });

    if (!ownsResume) {
      return null;
    }
  }

  return {
    code: PLAN_EXEMPTION_CODES.ADMIN_OWN_RESUME,
    userId: input.userId,
    resumeId,
    templateLimit: PRO_TEMPLATE_LIMIT,
    exportEnabled: true,
    exportResumeScoped: false,
    downloadLimit: null,
    downloadsUsed: 0,
    remainingDownloads: null,
    reason: "ADMIN_SYSTEM own-resume plan exemption.",
  };
}