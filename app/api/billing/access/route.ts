import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { findAccessibleResume } from "@/lib/auth/resume-access";
import { getEffectiveEntitlementSnapshotForResume } from "@/lib/billing/entitlements";
import { getResumeExportAccess } from "@/lib/billing/export-access";
import { getOwnResumePlanExemption } from "@/lib/billing/plan-exemptions";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumeId = req.nextUrl.searchParams.get("resumeId");

  if (resumeId) {
    const resume = await findAccessibleResume(user, resumeId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
  }

  const exemption = await getOwnResumePlanExemption({
    userId: user.id,
    userRole: user.role,
    resumeId,
  });

  const entitlement = exemption
    ? {
        userId: user.id,
        resumeId,
        templateLimit: exemption.templateLimit,
        exportEnabled: exemption.exportEnabled,
        exportResumeScoped: exemption.exportResumeScoped,
        downloadLimit: exemption.downloadLimit,
        downloadsUsed: exemption.downloadsUsed,
        activeEntitlementIds: [],
        activePlanCodes: [exemption.code],
      }
    : await getEffectiveEntitlementSnapshotForResume({
        userId: user.id,
        resumeId,
      });

  const exportAccess = resumeId
    ? await getResumeExportAccess({
        userId: user.id,
        userRole: user.role,
        resumeId,
      })
    : null;

  return NextResponse.json({
    resumeId,
    templateLimit: entitlement.templateLimit,
    activePlanCodes: entitlement.activePlanCodes,
    exportEnabled: entitlement.exportEnabled,
    exportAccess,
    planExemption: exemption
      ? {
          code: exemption.code,
          reason: exemption.reason,
        }
      : null,
  });
}