import Link from "next/link";
import { notFound } from "next/navigation";
import ResumeForm from "@/components/forms/resume-form";
import DuplicateResumeButton from "@/components/actions/duplicate-resume-button";
import LogoutButton from "@/components/auth/logout-button";
import ExportButton from "@/components/billing/export-button";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { requireCurrentUser } from "@/lib/auth/session";
import { findAccessibleResume } from "@/lib/auth/resume-access";
import { getResumeExportAccess } from "@/lib/billing/export-access";
import { getResumeTemplateAccess } from "@/lib/billing/template-access";

type EditResumePageProps = {
  params: Promise<{ id: string }>;
};

function buildTemplateAccessMessage(input: {
  templateLimit: number;
  exportCanExport: boolean;
  exportCode?: string | null;
  planCode?: string | null;
}) {
  if (input.planCode === "admin_own_resume_exemption") {
    return "Admin own-resume exemption: all templates and export are available for this resume only.";
  }

  if (input.exportCode === "DOWNLOAD_LIMIT_REACHED") {
    return `This resume still has access to ${input.templateLimit} templates, but the PDF download allowance has been used.`;
  }

  if (input.exportCanExport) {
    return `${input.templateLimit} templates unlocked and PDF export available.`;
  }

  if (input.templateLimit > 2) {
    return `${input.templateLimit} templates are unlocked, but PDF export is not currently available.`;
  }

  return "Free plan: 2 templates unlocked. Paid plans unlock more templates and PDF export.";
}

function buildExportAccessMessage(input: {
  canExport: boolean;
  lockedCode?: string | null;
  lockedReason?: string | null;
}) {
  if (input.canExport) {
    return "PDF export is unlocked for this resume.";
  }

  if (input.lockedCode === "DOWNLOAD_LIMIT_REACHED") {
    return "The download allowance for this export pack has been used. Buy another pack to download again.";
  }

  return input.lockedReason ?? "PDF export is locked for your current plan.";
}

export default async function EditResumePage({
  params,
}: EditResumePageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;

  const resume = await findAccessibleResume(user, id);

  if (!resume) {
    notFound();
  }

  const normalizedResume = normalizeResumeRecord(resume);

  const exportAccess = await getResumeExportAccess({
    userId: user.id,
    userRole: user.role,
    resumeId: normalizedResume.id,
  });

  const templateAccess = await getResumeTemplateAccess({
    userId: user.id,
    userRole: user.role,
    resumeId: normalizedResume.id,
    template: normalizedResume.template,
  });

  const formRenderKey = `${normalizedResume.id}-${new Date(
    normalizedResume.updatedAt
  ).toISOString()}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Edit Resume
              </p>

              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight md:text-3xl">
                {normalizedResume.title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Update your resume details, template, theme, and section order.
              </p>
            </div>

            <div className="flex flex-wrap items-start justify-start gap-2 lg:justify-end">
              <Link
                href="/resumes"
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium"
              >
                Resumes
              </Link>

              <Link
                href={`/billing?resumeId=${encodeURIComponent(
                  normalizedResume.id
                )}`}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium"
              >
                Billing
              </Link>

              <DuplicateResumeButton
                resumeId={normalizedResume.id}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium"
              />

              <Link
                href={`/resumes/${normalizedResume.id}/preview`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Preview
              </Link>

              <LogoutButton className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium" />
            </div>
          </div>
        </section>

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Template access</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {buildTemplateAccessMessage({
                    templateLimit: templateAccess.templateLimit,
                    exportCanExport: exportAccess.canExport,
                    exportCode: exportAccess.code,
                    planCode: exportAccess.planCode,
                  })}
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {templateAccess.templateLimit} templates
              </span>
            </div>

            {!templateAccess.canUse ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Current template is locked for your plan. Choose an unlocked
                template or purchase access before saving.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Export access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {buildExportAccessMessage({
                canExport: exportAccess.canExport,
                lockedCode: exportAccess.code,
                lockedReason: exportAccess.reason,
              })}
            </p>

            <div className="mt-4">
              <ExportButton
                resumeId={normalizedResume.id}
                canExport={exportAccess.canExport}
                remainingDownloads={exportAccess.remainingDownloads}
                downloadLimit={exportAccess.downloadLimit}
                downloadsUsed={exportAccess.downloadsUsed}
                lockedReason={exportAccess.reason}
                lockedCode={exportAccess.code}
              />
            </div>
          </div>
        </div>

        <ResumeForm key={formRenderKey} resume={normalizedResume} />
      </div>
    </main>
  );
}