import { notFound } from "next/navigation";
import ResumePreview from "@/components/preview/resume-preview";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { getCurrentUser } from "@/lib/auth/session";
import {
  findResumeFromPrintAccessPayload,
  findResumeWithContentAccess,
  verifyResumePrintAccessToken,
} from "@/lib/auth/resume-access";
import { AUDIT_ACTIONS } from "@/lib/privacy/audit";
import {
  consumeResumeExportDownload,
  getResumeExportAccess,
  type ResumeExportAccess,
} from "@/lib/billing/export-access";

type PrintResumePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ printAccessToken?: string }>;
};

export const dynamic = "force-dynamic";

export default async function PrintResumePage({
  params,
  searchParams,
}: PrintResumePageProps) {
  const { id } = await params;
  const { printAccessToken } = await searchParams;

  let resume = null;
  let ownerPrintExportAccess: ResumeExportAccess | null = null;

  const tokenPayload = verifyResumePrintAccessToken(printAccessToken);

  if (tokenPayload && tokenPayload.resumeId === id) {
    resume = await findResumeFromPrintAccessPayload(tokenPayload);
  }

  if (!resume) {
    const user = await getCurrentUser();

    const accessResult = user
      ? await findResumeWithContentAccess(user, id, {
          supportAuditAction: AUDIT_ACTIONS.SUPPORT_RESUME_PRINTED,
          supportAuditMetadata: {
            route: `/resumes/${id}/print`,
          },
        })
      : null;

    if (accessResult?.accessMode === "owner" && user) {
      const exportAccess = await getResumeExportAccess({
        userId: user.id,
        resumeId: id,
      });

      if (!exportAccess.canExport) {
        notFound();
      }

      ownerPrintExportAccess = exportAccess;
    }

    resume = accessResult?.resume ?? null;
  }

  if (!resume) {
    notFound();
  }

  if (ownerPrintExportAccess) {
    await consumeResumeExportDownload(ownerPrintExportAccess);
  }

  const normalizedResume = normalizeResumeRecord(resume);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        html, body {
          background: white;
        }
      `}</style>

      <ResumePreview resume={normalizedResume} mode="print" />
    </main>
  );
}