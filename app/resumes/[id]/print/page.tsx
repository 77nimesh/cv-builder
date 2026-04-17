import { notFound } from "next/navigation";
import ResumePreview from "@/components/preview/resume-preview";
import { getResumeTemplateDefinitionForRecord } from "@/components/templates/template-registry";
import { prisma } from "@/lib/prisma";
import { normalizeResumeRecord } from "@/lib/resume/record";

type PrintResumePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function PrintResumePage({
  params,
}: PrintResumePageProps) {
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
    <main className="min-h-screen bg-white text-slate-900">
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        html, body {
          background: white;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .print-main-fragment {
            padding-top: 8mm;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
          }

          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div
        data-resume-template={templateDefinition.id}
        className={
          templateDefinition.printWrapperClassName ??
          "relative mx-auto w-[794px] bg-white print:w-full"
        }
      >
        {templateDefinition.printBackgroundClassName ? (
          <div
            aria-hidden
            className={templateDefinition.printBackgroundClassName}
          />
        ) : null}

        <div className="relative z-10">
          <ResumePreview resume={normalizedResume} />
        </div>
      </div>
    </main>
  );
}