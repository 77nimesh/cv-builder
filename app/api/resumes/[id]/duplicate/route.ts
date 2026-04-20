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

  while (existingTitles.includes(`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>t</mi><mi>i</mi><mi>t</mi><mi>l</mi><mi>e</mi></mrow><mo stretchy="false">(</mo><mi>C</mi><mi>o</mi><mi>p</mi><mi>y</mi></mrow><annotation encoding="application/x-tex">{title} (Copy</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.01968em;">tl</span><span class="mord mathnormal">e</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.07153em;">C</span><span class="mord mathnormal">o</span><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.03588em;">y</span></span></span></span>{copyNumber})`)) {
    copyNumber += 1;
  }

  return `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>t</mi><mi>i</mi><mi>t</mi><mi>l</mi><mi>e</mi></mrow><mo stretchy="false">(</mo><mi>C</mi><mi>o</mi><mi>p</mi><mi>y</mi></mrow><annotation encoding="application/x-tex">{title} (Copy</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.01968em;">tl</span><span class="mord mathnormal">e</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.07153em;">C</span><span class="mord mathnormal">o</span><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.03588em;">y</span></span></span></span>{copyNumber})`;
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
    const targetOwnerUserId = sourceResumeRaw.userId ?? user.id;
    const existingTitles = await listResumeTitlesForOwner(targetOwnerUserId);

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
        userId: targetOwnerUserId,
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