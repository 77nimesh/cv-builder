import Link from "next/link";
import { notFound } from "next/navigation";
import ResumeForm from "@/components/forms/resume-form";
import DuplicateResumeButton from "@/components/actions/duplicate-resume-button";
import LogoutButton from "@/components/auth/logout-button";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { requireCurrentUser } from "@/lib/auth/session";
import { findOwnedResume } from "@/lib/auth/resume-access";

type EditResumePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditResumePage({
  params,
}: EditResumePageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;

  const resume = await findOwnedResume(user.id, id);

  if (!resume) {
    notFound();
  }

  const normalizedResume = normalizeResumeRecord(resume);
  const formRenderKey = `${normalizedResume.id}-${new Date(
    normalizedResume.updatedAt
  ).toISOString()}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Resume</h1>
            <p className="mt-2 text-slate-600">
              Update your core resume details and save changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            <Link
              href="/resumes"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Resumes
            </Link>

           

            <DuplicateResumeButton
              resumeId={normalizedResume.id}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            />

            <Link
              href={`/resumes/${normalizedResume.id}/preview`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Preview
            </Link>

             <LogoutButton className="rounded-xl border border-slate-300 bg-white px-4 py-3" />

          </div>
        </div>

        <ResumeForm key={formRenderKey} resume={normalizedResume} />
      </div>
    </main>
  );
}