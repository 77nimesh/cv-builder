import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { defaultResumeData } from "@/lib/default-resume";

export default async function NewResumePage() {
  const resume = await prisma.resume.create({
    data: {
      title: "Untitled Resume",
      template: "modern-1",
      data: defaultResumeData,
    },
  });

  redirect(`/resumes/${resume.id}/edit`);
}