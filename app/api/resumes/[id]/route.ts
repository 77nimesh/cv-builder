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
import {
  getCurrentUser,
  type AppSessionUser,
} from "@/lib/auth/session";
import {
  findAccessibleResume,
  findResumeWithContentAccess,
} from "@/lib/auth/resume-access";
import {
  findAccessibleResumePhotoAsset,
  resolveImageAssetPublicUrl,
} from "@/lib/assets/image-assets";
import { AUDIT_ACTIONS } from "@/lib/privacy/audit";

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

async function resolvePhotoSelection(input: {
  user: AppSessionUser;
  existingPhotoPath: string | null;
  existingPhotoAssetId: string | null;
  requestedPhotoPath?: string | null;
  requestedPhotoAssetId?: string | null;
}) {
  const {
    user,
    existingPhotoPath,
    existingPhotoAssetId,
    requestedPhotoPath,
    requestedPhotoAssetId,
  } = input;

  if (requestedPhotoAssetId !== undefined) {
    if (!requestedPhotoAssetId) {
      return {
        photoAssetId: null,
        photoPath: requestedPhotoPath ?? null,
      };
    }

    const asset = await findAccessibleResumePhotoAsset({
      assetId: requestedPhotoAssetId,
      viewerUserId: user.id,
    });

    if (!asset) {
      throw new Error("Selected photo was not found or is not accessible.");
    }

    return {
      photoAssetId: asset.id,
      photoPath: resolveImageAssetPublicUrl(asset),
    };
  }

  if (requestedPhotoPath !== undefined) {
    if (!requestedPhotoPath && existingPhotoAssetId) {
      return {
        photoAssetId: null,
        photoPath: null,
      };
    }

    return {
      photoAssetId: existingPhotoAssetId,
      photoPath: requestedPhotoPath,
    };
  }

  return {
    photoAssetId: existingPhotoAssetId,
    photoPath: existingPhotoPath,
  };
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const accessResult = await findResumeWithContentAccess(user, id, {
      supportAuditAction: AUDIT_ACTIONS.SUPPORT_CONTENT_VIEWED,
      supportAuditMetadata: {
        route: `GET /api/resumes/${id}`,
      },
    });

    if (!accessResult) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeResumeRecord(accessResult.resume));
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
    let requestedPhotoPath: string | null | undefined;
    let requestedPhotoAssetId: string | null | undefined;

    if (hasCanonicalSectionsPayload(rawBody)) {
      const rawRecord = rawBody as Record<string, unknown>;

      requestedPhotoPath = hasOwn(rawRecord, "photoPath")
        ? readNullableString(rawRecord.photoPath)
        : undefined;
      requestedPhotoAssetId = hasOwn(rawRecord, "photoAssetId")
        ? readNullableString(rawRecord.photoAssetId)
        : undefined;

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
        photoPath: requestedPhotoPath,
        photoAssetId: requestedPhotoAssetId,
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

      requestedPhotoPath =
        body.photoPath === undefined ? undefined : body.photoPath ?? null;
      requestedPhotoAssetId =
        body.photoAssetId === undefined ? undefined : body.photoAssetId ?? null;

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
        photoPath:
          requestedPhotoPath === undefined
            ? existingResume.photoPath
            : requestedPhotoPath,
        photoAssetId:
          requestedPhotoAssetId === undefined
            ? existingResume.photoAssetId
            : requestedPhotoAssetId,
        photoShape,
      });
    }

    const resolvedPhotoSelection = await resolvePhotoSelection({
      user,
      existingPhotoPath: existingResume.photoPath,
      existingPhotoAssetId: existingResume.photoAssetId,
      requestedPhotoPath,
      requestedPhotoAssetId,
    });

    const updatedResume = await prisma.resume.update({
      where: { id: existingResumeRaw.id },
      data: {
        title: payload.title,
        template: payload.template,
        themeColor: payload.themeColor,
        fontFamily: payload.fontFamily,
        photoPath: resolvedPhotoSelection.photoPath,
        photoAssetId: resolvedPhotoSelection.photoAssetId,
        data: toPrismaResumeData(payload.data),
      },
    });

    return NextResponse.json(normalizeResumeRecord(updatedResume));
  } catch (error) {
    console.error("Failed to update resume:", error);

    if (
      error instanceof Error &&
      error.message === "Selected photo was not found or is not accessible."
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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