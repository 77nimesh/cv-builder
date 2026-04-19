import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createDefaultResumeData } from "@/lib/default-resume";
import type { Prisma } from "@prisma/client";

export default async function NewResumePage() {
  const data = createDefaultResumeData({ template: "modern-1" });

  // Convert to plain JSON and cast for Prisma Json input typing
  const jsonData = JSON.parse(JSON.stringify(data)) as Prisma.InputJsonObject;

  const resume = await prisma.resume.create({
    data: {
      title: "Untitled Resume",
      template: data.layout.template,
      themeColor: data.layout.themeColor,
      fontFamily: data.layout.fontFamily,
      photoPath: null,
      data: jsonData,
    },
  });

  redirect(`/resumes/${resume.id}/edit`);
}
