import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ResumePhotoShape } from "@/lib/types";
import { buildResumeDataFromFormData } from "@/lib/resume/normalizers";
import { normalizeResumeRecord } from "@/lib/resume/record";
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

function readPhotoShape(value: unknown): ResumePhotoShape | undefined {
  if (value === "circle" || value === "square") {
    return value;
  }

  return undefined;
}

function hasCanonicalSectionsPayload(value: unknown): value is {
  title?: string;
  template?: string;
  themeColor?: string | null;
  fontFamily?: string | null;
  photoPath?: string | null;
  photoShape?: ResumePhotoShape | null;
  data: { sections: unknown[]; layout?: { photoShape?: ResumePhotoShape } };
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

function readCanonicalPayloadPhotoShape(rawBody: Record<string, unknown>) {
  const directPhotoShape = readPhotoShape(rawBody.photoShape);

  if (directPhotoShape) {
    return directPhotoShape;
  }

  const data = rawBody.data;

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return undefined;
  }

  const layout = (data as { layout?: { photoShape?: unknown } }).layout;
  return readPhotoShape(layout?.photoShape);
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

    return NextResponse.json(normalizeResumeRecord(resume));
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
      const rawRecord = rawBody as Record<string, unknown>;
      const title = readString(rawRecord.title, "Untitled Resume");
      const template = readString(rawRecord.template, "modern-1");
      const themeColor = readNullableString(rawRecord.themeColor);
      const fontFamily = readNullableString(rawRecord.fontFamily);
      const photoPath = readNullableString(rawRecord.photoPath);
      const photoShape = readCanonicalPayloadPhotoShape(rawRecord);

      const data = normalizeResumeRecord({
        id,
        title,
        template,
        themeColor,
        fontFamily,
        photoPath,
        createdAt: new Date(),
        updatedAt: new Date(),
        data: rawRecord.data,
      }).data;

      const normalizedData =
        photoShape === undefined
          ? data
          : {
              ...data,
              layout: {
                ...data.layout,
                photoShape,
              },
            };

      const updatedResume = await prisma.resume.update({
        where: { id },
        data: {
          title,
          template,
          themeColor,
          fontFamily,
          data: normalizedData,
          photoPath,
        },
      });

      return NextResponse.json(normalizeResumeRecord(updatedResume));
    }

    const body = resumeFormSchema.parse(rawBody);
    const photoShape = body.photoShape === "circle" ? "circle" : "square";

    const data = buildResumeDataFromFormData(body.data, {
      template: body.template,
      themeColor: body.themeColor ?? null,
      fontFamily: body.fontFamily ?? null,
      photoShape,
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

    return NextResponse.json(normalizeResumeRecord(updatedResume));
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