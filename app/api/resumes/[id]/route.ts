import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildResumeDataFromFormData,
  normalizeResumeData,
} from "@/lib/resume/normalizers";
import { resumeFormSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function hasCanonicalSectionsPayload(value: unknown): value is {
  title?: string;
  template?: string;
  themeColor?: string | null;
  fontFamily?: string | null;
  photoPath?: string | null;
  photoShape?: string | null;
  data: { sections: unknown[] };
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const data = record.data;

  if (typeof data !== "object" || data === null) {
    return false;
  }

  const dataRecord = data as Record<string, unknown>;
  return Array.isArray(dataRecord.sections);
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...resume,
      data: normalizeResumeData(resume.data, {
        template: resume.template,
        themeColor: resume.themeColor,
        fontFamily: resume.fontFamily,
      }),
    });
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const rawBody = await req.json();

    if (hasCanonicalSectionsPayload(rawBody)) {
      const title = readString(rawBody.title, "Untitled Resume");
      const template = readString(rawBody.template, "modern-1");
      const themeColor = readNullableString(rawBody.themeColor);
      const fontFamily = readNullableString(rawBody.fontFamily);
      const photoPath = readNullableString(rawBody.photoPath);
      const photoShape =
        rawBody.photoShape === "circle"
          ? "circle"
          : rawBody.photoShape === "square"
            ? "square"
            : undefined;

      const data = normalizeResumeData(rawBody.data, {
        template,
        themeColor,
        fontFamily,
        photoShape,
      });

      const updatedResume = await prisma.resume.update({
        where: { id },
        data: {
          title,
          template,
          themeColor,
          fontFamily,
          data,
          photoPath,
        },
      });

      return NextResponse.json({
        ...updatedResume,
        data: normalizeResumeData(updatedResume.data, {
          template: updatedResume.template,
          themeColor: updatedResume.themeColor,
          fontFamily: updatedResume.fontFamily,
        }),
      });
    }

    const body = resumeFormSchema.parse(rawBody);

    const data = buildResumeDataFromFormData(body.data, {
      template: body.template,
      themeColor: body.themeColor ?? null,
      fontFamily: body.fontFamily ?? null,
      photoShape: body.photoShape === "circle" ? "circle" : "square",
    });

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        title: body.title,
        template: body.template,
        themeColor: body.themeColor || null,
        fontFamily: body.fontFamily || null,
        data,
        photoPath: body.photoPath || null,
      },
    });

    return NextResponse.json({
      ...updatedResume,
      data: normalizeResumeData(updatedResume.data, {
        template: updatedResume.template,
        themeColor: updatedResume.themeColor,
        fontFamily: updatedResume.fontFamily,
      }),
    });
  } catch (error) {
    console.error("Failed to update resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}