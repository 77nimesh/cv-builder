import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResumeForm from "@/components/forms/resume-form";
import DuplicateResumeButton from "@/components/actions/duplicate-resume-button";
import type { ResumeRecord } from "@/lib/types";
import { normalizeResumeData } from "@/lib/resume/normalizers";

type EditResumePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditResumePage({
  params,
}: EditResumePageProps) {
  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id },
  });

  if (!resume) {
    notFound();
  }

  const normalizedResume: ResumeRecord = {
    ...resume,
    data: normalizeResumeData(resume.data, {
      template: resume.template,
      themeColor: resume.themeColor,
      fontFamily: resume.fontFamily,
    }),
  };

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

          <div className="flex items-center gap-3">
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
          </div>
        </div>

        <ResumeForm resume={normalizedResume} />
      </div>
    </main>
  );
}