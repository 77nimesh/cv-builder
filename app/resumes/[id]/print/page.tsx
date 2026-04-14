import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ResumeRecord } from "@/lib/types";
import ResumePreview from "@/components/preview/resume-preview";
import { normalizeResumeData } from "@/lib/resume/normalizers";

type PrintResumePageProps = {
  params: Promise<{ id: string }>;
};

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

  const normalizedResume: ResumeRecord = {
    ...resume,
    data: normalizeResumeData(resume.data, {
      template: resume.template,
      themeColor: resume.themeColor,
      fontFamily: resume.fontFamily,
    }),
  };

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

      <div className="relative mx-auto w-[794px] bg-white print:w-full">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-y-0 left-0 hidden w-[280px] bg-slate-900 print:block"
        />

        <div className="relative z-10">
          <ResumePreview resume={normalizedResume} />
        </div>
      </div>
    </main>
  );
}