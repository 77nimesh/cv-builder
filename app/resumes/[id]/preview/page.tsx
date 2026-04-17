import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PreviewEditor from "@/components/preview/preview-editor";
import { getResumeTemplateDefinitionForRecord } from "@/components/templates/template-registry";
import { normalizeResumeRecord } from "@/lib/resume/record";

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

  const normalizedResume = normalizeResumeRecord(resume);
  const templateDefinition =
    getResumeTemplateDefinitionForRecord(normalizedResume);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Previewing: {normalizedResume.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Active template: {templateDefinition.label}
            </p>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>

        <PreviewEditor resume={normalizedResume} />
      </div>
    </main>
  );
}