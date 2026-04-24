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

  const user = await getCurrentUser();

  let resume = user
    ? (
        await findResumeWithContentAccess(user, id, {
          supportAuditAction: AUDIT_ACTIONS.SUPPORT_RESUME_PRINTED,
          supportAuditMetadata: {
            route: `/resumes/${id}/print`,
          },
        })
      )?.resume
    : null;

  if (!resume) {
    const tokenPayload = verifyResumePrintAccessToken(printAccessToken);

    if (tokenPayload && tokenPayload.resumeId === id) {
      resume = await findResumeFromPrintAccessPayload(tokenPayload);
    }
  }

  if (!resume) {
    notFound();
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