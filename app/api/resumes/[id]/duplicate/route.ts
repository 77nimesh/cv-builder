import { NextResponse } from "next/server";
import type { ResumeData, ResumeRecord } from "@/lib/types";
import { normalizeResumeRecord } from "@/lib/resume/record";
import { toPrismaResumeData } from "@/lib/resume/prisma-json";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  findAccessibleResume,
  listResumeTitlesForOwner,
} from "@/lib/auth/resume-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function buildDuplicateTitle(title: string, existingTitles: string[]) {
  const baseTitle = `${title} (Copy)`;

  if (!existingTitles.includes(baseTitle)) {
    return baseTitle;
  }

  let copyNumber = 2;
  let candidateTitle = `${title} (Copy ${copyNumber})`;

  while (existingTitles.includes(candidateTitle)) {
    copyNumber += 1;
    candidateTitle = `${title} (Copy ${copyNumber})`;
  }

  return candidateTitle;
}

function cloneResumeData(data: ResumeData): ResumeData {
  return JSON.parse(JSON.stringify(data)) as ResumeData;
}

function readActiveTemplate(resume: ResumeRecord) {
  const layoutTemplate = resume.data.layout.template?.trim();

  if (layoutTemplate) {
    return layoutTemplate;
  }

  return resume.template;
}

function readSyncedThemeColor(resume: ResumeRecord) {
  return resume.themeColor ?? resume.data.layout.themeColor ?? null;
}

function readSyncedFontFamily(resume: ResumeRecord) {
  return resume.fontFamily ?? resume.data.layout.fontFamily ?? null;
}

export async function POST(_: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const sourceResumeRaw = await findAccessibleResume(user, id);

    if (!sourceResumeRaw) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const sourceResume = normalizeResumeRecord(sourceResumeRaw);
    const existingTitles = await listResumeTitlesForOwner(user.id);

    const template = readActiveTemplate(sourceResume);
    const themeColor = readSyncedThemeColor(sourceResume);
    const fontFamily = readSyncedFontFamily(sourceResume);

    const duplicatedData = cloneResumeData({
      ...sourceResume.data,
      layout: {
        ...sourceResume.data.layout,
        template,
        themeColor,
        fontFamily,
      },
    });

    const duplicatedResume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: buildDuplicateTitle(sourceResume.title, existingTitles),
        template,
        themeColor,
        fontFamily,
        photoPath: sourceResume.photoPath,
        photoAssetId: sourceResume.photoAssetId,
        data: toPrismaResumeData(duplicatedData),
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