import { notFound } from "next/navigation";
import ResumePreview from "@/components/preview/resume-preview";
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
      `}</style>

      <ResumePreview resume={normalizedResume} mode="print" />
    </main>
  );
}