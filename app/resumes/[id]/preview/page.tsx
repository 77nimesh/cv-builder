import Link from "next/link";
import { notFound } from "next/navigation";
import PreviewEditor from "@/components/preview/preview-editor";
import ResumePreview from "@/components/preview/resume-preview";
import LogoutButton from "@/components/auth/logout-button";
import ExportButton from "@/components/billing/export-button";
import { getResumeTemplateDefinitionForRecord } from "@/components/templates/template-registry";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { requireCurrentUser } from "@/lib/auth/session";
import { findResumeWithContentAccess } from "@/lib/auth/resume-access";
import { AUDIT_ACTIONS } from "@/lib/privacy/audit";
import { getResumeExportAccess } from "@/lib/billing/export-access";

type PreviewResumePageProps = {
  params: Promise<{ id: string }>;
};

function buildExportStatusLabel(input: {
  isSupportContentView: boolean;
  canExport: boolean;
  lockedCode?: string | null;
}) {
  if (input.isSupportContentView) {
    return "Support read-only export";
  }

  if (input.canExport) {
    return "Export unlocked";
  }

  if (input.lockedCode === "DOWNLOAD_LIMIT_REACHED") {
    return "Download allowance used";
  }

  return "Export locked";
}

function buildExportStatusClasses(input: {
  isSupportContentView: boolean;
  canExport: boolean;
  lockedCode?: string | null;
}) {
  if (input.isSupportContentView) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (input.canExport) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (input.lockedCode === "DOWNLOAD_LIMIT_REACHED") {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

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
  const exportAccess = isSupportContentView
    ? null
    : await getResumeExportAccess({
        userId: user.id,
        userRole: user.role,
        resumeId: normalizedResume.id,
      });

  const canOpenExportActions =
    isSupportContentView || Boolean(exportAccess?.canExport);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-5">
        <section className="static top-0 z-30 mb-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Resume Preview
              </p>

              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight md:text-3xl">
                {normalizedResume.title}
              </h1>

              <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                    Template: {templateDefinition.label}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 ${buildExportStatusClasses(
                      {
                        isSupportContentView,
                        canExport: Boolean(exportAccess?.canExport),
                        lockedCode: exportAccess?.code,
                      }
                    )}`}
                  >
                    {buildExportStatusLabel({
                      isSupportContentView,
                      canExport: Boolean(exportAccess?.canExport),
                      lockedCode: exportAccess?.code,
                    })}
                  </span>
                </div>

                {isSupportContentView ? (
                  <p className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Support content access is active. This is a read-only,
                    time-limited, audited view.
                  </p>
                ) : exportAccess?.canExport ? (
                  <p className="max-w-3xl rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    Export is unlocked for this resume.
                  </p>
                ) : exportAccess?.code === "DOWNLOAD_LIMIT_REACHED" ? (
                  <p className="max-w-3xl rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
                    Your template access may still be active, but the PDF download
                    allowance has been used. Buy another export pack to download
                    again.
                  </p>
                ) : (
                  <p className="max-w-3xl rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    You can preview and edit for free. Unlock PDF export when you
                    are ready to download.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-start gap-2 lg:justify-end">
              {isSupportContentView ? (
                <Link
                  href="/admin/support-access"
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium"
                >
                  Back to Support
                </Link>
              ) : (
                <Link
                  href={`/resumes/${normalizedResume.id}/edit`}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium"
                >
                  Back to Edit
                </Link>
              )}

              {canOpenExportActions ? (
                <Link
                  href={`/resumes/${normalizedResume.id}/print`}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium"
                  target="_blank"
                >
                  Print View
                </Link>
              ) : null}

              {isSupportContentView ? (
                <a
                  href={`/api/resumes/${normalizedResume.id}/pdf`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Download PDF
                </a>
              ) : (
                <ExportButton
                  resumeId={normalizedResume.id}
                  canExport={Boolean(exportAccess?.canExport)}
                  remainingDownloads={exportAccess?.remainingDownloads}
                  downloadLimit={exportAccess?.downloadLimit}
                  downloadsUsed={exportAccess?.downloadsUsed}
                  lockedReason={exportAccess?.reason}
                  lockedCode={exportAccess?.code}
                  variant="compact"
                />
              )}

              <LogoutButton className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium" />
            </div>
          </div>
        </section>

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