import { prisma } from "@/lib/prisma";
import {
  MAX_IMAGE_ASSETS_PER_USER,
  RESUME_PHOTO_ASSET_KIND,
} from "@/lib/assets/constants";
import {
  deleteLocalAssetByStorageKey,
  resolveAssetPublicUrl,
} from "@/lib/assets/storage";

export class ImageAssetLimitError extends Error {
  constructor(message = `You can store up to ${MAX_IMAGE_ASSETS_PER_USER} photos.`) {
    super(message);
    this.name = "ImageAssetLimitError";
  }
}

export class ImageAssetInUseError extends Error {
  resumeUsageCount: number;

  constructor(resumeUsageCount: number) {
    super(
      resumeUsageCount === 1
        ? "This photo is currently used by 1 resume and cannot be deleted."
        : `This photo is currently used by ${resumeUsageCount} resumes and cannot be deleted.`
    );
    this.name = "ImageAssetInUseError";
    this.resumeUsageCount = resumeUsageCount;
  }
}

export type ResumePhotoAssetListItem = {
  id: string;
  photoPath: string;
  sourceFileName: string | null;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
  resumeUsageCount: number;
  canDelete: boolean;
};

export function resolveImageAssetPublicUrl(asset: {
  storageProvider: string;
  storageKey: string;
}) {
  return resolveAssetPublicUrl({
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
  });
}

export async function assertUserCanCreateResumePhotoAsset(userId: string) {
  const assetCount = await prisma.imageAsset.count({
    where: {
      userId,
      kind: RESUME_PHOTO_ASSET_KIND,
    },
  });

  if (assetCount >= MAX_IMAGE_ASSETS_PER_USER) {
    throw new ImageAssetLimitError();
  }

  return assetCount;
}

export async function findAccessibleResumePhotoAsset(input: {
  assetId: string;
  viewerUserId: string;
}) {
  return prisma.imageAsset.findFirst({
    where: {
      id: input.assetId,
      kind: RESUME_PHOTO_ASSET_KIND,
      userId: input.viewerUserId,
    },
  });
}

export async function listUserResumePhotoAssets(
  userId: string
): Promise<ResumePhotoAssetListItem[]> {
  const assets = await prisma.imageAsset.findMany({
    where: {
      userId,
      kind: RESUME_PHOTO_ASSET_KIND,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          resumes: true,
        },
      },
    },
  });

  return assets.map((asset) => ({
    id: asset.id,
    photoPath: resolveImageAssetPublicUrl(asset),
    sourceFileName: asset.sourceFileName,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    width: asset.width,
    height: asset.height,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    resumeUsageCount: asset._count.resumes,
    canDelete: asset._count.resumes === 0,
  }));
}

export async function deleteUserResumePhotoAsset(input: {
  assetId: string;
  userId: string;
}) {
  const asset = await prisma.imageAsset.findFirst({
    where: {
      id: input.assetId,
      userId: input.userId,
      kind: RESUME_PHOTO_ASSET_KIND,
    },
    include: {
      _count: {
        select: {
          resumes: true,
        },
      },
    },
  });

  if (!asset) {
    return null;
  }

  if (asset._count.resumes > 0) {
    throw new ImageAssetInUseError(asset._count.resumes);
  }

  await prisma.imageAsset.delete({
    where: {
      id: asset.id,
    },
  });

  await deleteLocalAssetByStorageKey(asset.storageKey).catch((error) => {
    console.error("Failed to delete local image asset file:", error);
  });

  return {
    id: asset.id,
  };
}