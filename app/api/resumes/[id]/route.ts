import { NextRequest, NextResponse } from "next/server";
import type { ResumePhotoShape } from "@/lib/types";
import { buildResumeDataFromFormData } from "@/lib/resume/normalizers";
import {
  buildResumeUpdatePayload,
  normalizeResumeRecord,
} from "@/lib/resume/record";
import { toPrismaResumeData } from "@/lib/resume/prisma-json";
import { resumeFormSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { findAccessibleResume } from "@/lib/auth/resume-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

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
  data: { sections: unknown[]; layout?: { photoShape?: ResumePhotoShape } };
} {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;
  return isRecord(data) && Array.isArray(data.sections);
}

function readCanonicalPayloadPhotoShape(rawBody: Record<string, unknown>) {
  const directPhotoShape = readPhotoShape(rawBody.photoShape);

  if (directPhotoShape) {
    return directPhotoShape;
  }

  const data = rawBody.data;

  if (!isRecord(data)) {
    return undefined;
  }

  const layout = (data as { layout?: { photoShape?: unknown } }).layout;
  return readPhotoShape(layout?.photoShape);
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const resume = await findAccessibleResume(user, id);

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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingResumeRaw = await findAccessibleResume(user, id);

    if (!existingResumeRaw) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const existingResume = normalizeResumeRecord(existingResumeRaw);
    const rawBody = await req.json();

    let payload: ReturnType<typeof buildResumeUpdatePayload>;

    if (hasCanonicalSectionsPayload(rawBody)) {
      const rawRecord = rawBody as Record<string, unknown>;

      payload = buildResumeUpdatePayload(existingResume, rawRecord.data, {
        title: hasOwn(rawRecord, "title")
          ? readString(rawRecord.title, existingResume.title)
          : undefined,
        template: hasOwn(rawRecord, "template")
          ? readString(rawRecord.template, existingResume.template)
          : undefined,
        themeColor: hasOwn(rawRecord, "themeColor")
          ? readNullableString(rawRecord.themeColor)
          : undefined,
        fontFamily: hasOwn(rawRecord, "fontFamily")
          ? readNullableString(rawRecord.fontFamily)
          : undefined,
        photoPath: hasOwn(rawRecord, "photoPath")
          ? readNullableString(rawRecord.photoPath)
          : undefined,
        photoShape: readCanonicalPayloadPhotoShape(rawRecord),
      });
    } else {
      const body = resumeFormSchema.parse(rawBody);
      const themeColor =
        body.themeColor === undefined
          ? existingResume.themeColor
          : body.themeColor ?? null;
      const fontFamily =
        body.fontFamily === undefined
          ? existingResume.fontFamily
          : body.fontFamily ?? null;
      const photoPath =
        body.photoPath === undefined
          ? existingResume.photoPath
          : body.photoPath ?? null;
      const photoShape =
        body.photoShape ?? existingResume.data.layout.photoShape ?? "square";

      const nextData = buildResumeDataFromFormData(body.data, {
        template: body.template,
        themeColor,
        fontFamily,
        photoShape,
      });

      payload = buildResumeUpdatePayload(existingResume, nextData, {
        title: body.title,
        template: body.template,
        themeColor,
        fontFamily,
        photoPath,
        photoShape,
      });
    }

    const updatedResume = await prisma.resume.update({
      where: { id: existingResumeRaw.id },
      data: {
        title: payload.title,
        template: payload.template,
        themeColor: payload.themeColor,
        fontFamily: payload.fontFamily,
        photoPath: payload.photoPath,
        data: toPrismaResumeData(payload.data),
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const resume = await findAccessibleResume(user, id);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({
      where: { id: resume.id },
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