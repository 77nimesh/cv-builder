import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeResumeRecord } from "@/lib/resume/record";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function buildDuplicateTitle(title: string, existingTitles: string[]) {
  const baseTitle = `${title} (Copy)`;

  if (!existingTitles.includes(baseTitle)) {
    return baseTitle;
  }

  let copyNumber = 2;

  while (existingTitles.includes(`${title} (Copy ${copyNumber})`)) {
    copyNumber += 1;
  }

  return `${title} (Copy ${copyNumber})`;
}

export async function POST(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const sourceResumeRaw = await prisma.resume.findUnique({
      where: { id },
    });

    if (!sourceResumeRaw) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const sourceResume = normalizeResumeRecord(sourceResumeRaw);

    const existingResumes = await prisma.resume.findMany({
      select: { title: true },
    });

    const duplicatedResume = await prisma.resume.create({
      data: {
        title: buildDuplicateTitle(
          sourceResume.title,
          existingResumes.map((resume) => resume.title)
        ),
        template: sourceResume.data.layout.template,
        themeColor: sourceResume.data.layout.themeColor,
        fontFamily: sourceResume.data.layout.fontFamily,
        photoPath: sourceResume.photoPath,
        data: sourceResume.data,
      },
    });

    return NextResponse.json(normalizeResumeRecord(duplicatedResume), {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to duplicate resume:", error);
    return NextResponse.json(
      { error: "Failed to duplicate resume" },
      { status: 500 }
    );
  }
}
