import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createDefaultResumeData } from "@/lib/default-resume";
import { requireCurrentUser } from "@/lib/auth/session";

export default async function NewResumePage() {
  const user = await requireCurrentUser();
  const data = createDefaultResumeData({ template: "modern-1" });
  const jsonData = JSON.parse(JSON.stringify(data)) as Prisma.InputJsonObject;

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
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