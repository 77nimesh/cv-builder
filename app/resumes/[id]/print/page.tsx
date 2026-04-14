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
        }
      `}</style>

      <div className="mx-auto w-[794px] bg-white print:w-full">
        <ResumePreview resume={normalizedResume} />
      </div>
    </main>
  );
}
