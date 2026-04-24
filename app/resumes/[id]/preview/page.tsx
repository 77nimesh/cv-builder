import Link from "next/link";
import { notFound } from "next/navigation";
import PreviewEditor from "@/components/preview/preview-editor";
import ResumePreview from "@/components/preview/resume-preview";
import LogoutButton from "@/components/auth/logout-button";
import { getResumeTemplateDefinitionForRecord } from "@/components/templates/template-registry";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { requireCurrentUser } from "@/lib/auth/session";
import { findResumeWithContentAccess } from "@/lib/auth/resume-access";
import { AUDIT_ACTIONS } from "@/lib/privacy/audit";

type PreviewResumePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreviewResumePage({
  params,
}: PreviewResumePageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;

  const accessResult = await findResumeWithContentAccess(user, id, {
    supportAuditAction: AUDIT_ACTIONS.SUPPORT_RESUME_PREVIEWED,
    supportAuditMetadata: {
      route: `/resumes/${id}/preview`,
    },
  });

  if (!accessResult) {
    notFound();
  }

  const normalizedResume = normalizeResumeRecord(accessResult.resume);
  const templateDefinition =
    getResumeTemplateDefinitionForRecord(normalizedResume);
  const isSupportContentView = accessResult.accessMode === "support-grant";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-slate-100 pb-6 pt-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Previewing: {normalizedResume.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Active template: {templateDefinition.label}
            </p>
            {isSupportContentView ? (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Support content access is active. This is a read-only,
                time-limited, audited view.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSupportContentView ? (
              <Link
                href="/admin/support-access"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2"
              >
                Back to Support
              </Link>
            ) : (
              <Link
                href={`/resumes/${normalizedResume.id}/edit`}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2"
              >
                Back to Edit
              </Link>
            )}

            <Link
              href={`/resumes/${normalizedResume.id}/print`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
              target="_blank"
            >
              Open Print View
            </Link>

            <a
              href={`/api/resumes/${normalizedResume.id}/pdf`}
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            >
              Download PDF
            </a>

            <LogoutButton className="rounded-xl border border-slate-300 bg-white px-4 py-2" />
          </div>
        </div>

        {isSupportContentView ? (
          <div className="flex justify-center">
            <ResumePreview resume={normalizedResume} />
          </div>
        ) : (
          <PreviewEditor resume={normalizedResume} />
        )}
      </div>
    </main>
  );
}