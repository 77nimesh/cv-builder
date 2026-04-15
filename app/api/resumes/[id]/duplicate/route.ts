import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeResumeData } from "@/lib/resume/normalizers";

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

    const sourceResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!sourceResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const existingResumes = await prisma.resume.findMany({
      select: { title: true },
    });

    const normalizedData = normalizeResumeData(sourceResume.data, {
      template: sourceResume.template,
      themeColor: sourceResume.themeColor,
      fontFamily: sourceResume.fontFamily,
    });

    const duplicatedResume = await prisma.resume.create({
      data: {
        title: buildDuplicateTitle(
          sourceResume.title,
          existingResumes.map((resume) => resume.title)
        ),
        template: sourceResume.template,
        themeColor: sourceResume.themeColor,
        fontFamily: sourceResume.fontFamily,
        photoPath: sourceResume.photoPath,
        data: normalizedData,
      },
    });

    return NextResponse.json(
      {
        ...duplicatedResume,
        data: normalizeResumeData(duplicatedResume.data, {
          template: duplicatedResume.template,
          themeColor: duplicatedResume.themeColor,
          fontFamily: duplicatedResume.fontFamily,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to duplicate resume:", error);
    return NextResponse.json(
      { error: "Failed to duplicate resume" },
      { status: 500 }
    );
  }
}