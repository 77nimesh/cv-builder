import Link from "next/link";
import { notFound } from "next/navigation";
import PreviewEditor from "@/components/preview/preview-editor";
import LogoutButton from "@/components/auth/logout-button";
import { getResumeTemplateDefinitionForRecord } from "@/components/templates/template-registry";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { isAdminUser, requireCurrentUser } from "@/lib/auth/session";
import { findAccessibleResume } from "@/lib/auth/resume-access";

type PreviewResumePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreviewResumePage({
  params,
}: PreviewResumePageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;

  const resume = await findAccessibleResume(user, id);

  if (!resume) {
    notFound();
  }

  const adminOverrideActive =
    isAdminUser(user) && resume.userId !== null && resume.userId !== user.id;

  const normalizedResume = normalizeResumeRecord(resume);
  const templateDefinition =
    getResumeTemplateDefinitionForRecord(normalizedResume);

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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/resumes/${normalizedResume.id}/edit`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              Back to Edit
            </Link>

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

        {adminOverrideActive ? (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <p className="font-medium">Admin access override is active.</p>
            <p className="mt-1 text-sm">
              You are previewing a resume that belongs to another user.
            </p>
          </div>
        ) : null}

        <PreviewEditor resume={normalizedResume} />
      </div>
    </main>
  );
}