import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createDefaultResumeData } from "@/lib/default-resume";

export default async function NewResumePage() {
  const data = createDefaultResumeData({ template: "modern-1" });

  const resume = await prisma.resume.create({
    data: {
      title: "Untitled Resume",
      template: data.layout.template,
      themeColor: data.layout.themeColor,
      fontFamily: data.layout.fontFamily,
      photoPath: null,
      data,
    },
  });

  redirect(`/resumes/${resume.id}/edit`);
}
