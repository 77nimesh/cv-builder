import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ResumeRecord } from "@/lib/types";
import PreviewEditor from "@/components/preview/preview-editor";
import { normalizeResumeData } from "@/lib/resume/normalizers";

type PreviewResumePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreviewResumePage({
  params,
}: PreviewResumePageProps) {
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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Previewing: {normalizedResume.title}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/resumes/${normalizedResume.id}/edit`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              Back to Edit
            </Link>

            <a
              href={`/api/resumes/${normalizedResume.id}/pdf`}
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            >
              Download PDF
            </a>
          </div>
        </div>

        <PreviewEditor resume={normalizedResume} />
      </div>
    </main>
  );
}