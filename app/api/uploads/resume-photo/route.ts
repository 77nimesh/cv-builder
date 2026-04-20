import { writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  ALLOWED_RESUME_PHOTO_MIME_TYPES,
  MAX_RESUME_PHOTO_UPLOAD_BYTES,
  RESUME_PHOTO_ASSET_KIND,
} from "@/lib/assets/constants";
import {
  assertUserCanCreateResumePhotoAsset,
  ImageAssetLimitError,
} from "@/lib/assets/image-assets";
import { optimizeCanonicalResumePhoto } from "@/lib/assets/image-optimizer";
import {
  deleteLocalAssetByStorageKey,
  prepareLocalAssetDestination,
} from "@/lib/assets/storage";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function buildFilenameBase(originalName: string) {
  return originalName.replace(/\.[^.]+$/, "") || "resume-photo";
}

export async function POST(request: Request) {
  let preparedDestination:
    | Awaited<ReturnType<typeof prepareLocalAssetDestination>>
    | null = null;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Photo file is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_RESUME_PHOTO_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_RESUME_PHOTO_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Photo must be 10MB or smaller" },
        { status: 400 }
      );
    }

    await assertUserCanCreateResumePhotoAsset(user.id);

    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const optimizedPhoto = await optimizeCanonicalResumePhoto(sourceBuffer);

    preparedDestination = await prepareLocalAssetDestination({
      userId: user.id,
      extension: optimizedPhoto.extension,
      kind: RESUME_PHOTO_ASSET_KIND,
      filenameBase: buildFilenameBase(file.name),
    });

    await writeFile(preparedDestination.absoluteFilePath, optimizedPhoto.buffer);

    const imageAsset = await prisma.imageAsset.create({
      data: {
        userId: user.id,
        kind: RESUME_PHOTO_ASSET_KIND,
        storageProvider: preparedDestination.storageProvider,
        storageKey: preparedDestination.storageKey,
        sourceFileName: file.name,
        mimeType: optimizedPhoto.mimeType,
        byteSize: optimizedPhoto.byteSize,
        width: optimizedPhoto.width,
        height: optimizedPhoto.height,
      },
    });

    return NextResponse.json({
      photoAssetId: imageAsset.id,
      photoPath: preparedDestination.publicUrl,
      mimeType: imageAsset.mimeType,
      byteSize: imageAsset.byteSize,
      width: imageAsset.width,
      height: imageAsset.height,
    });
  } catch (error) {
    console.error("Failed to upload resume photo:", error);

    if (preparedDestination) {
      await deleteLocalAssetByStorageKey(preparedDestination.storageKey).catch(
        () => undefined
      );
    }

    if (error instanceof ImageAssetLimitError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}