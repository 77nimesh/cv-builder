import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import {
  LOCAL_ASSET_ROOT_DIRECTORY,
  LOCAL_ASSET_STORAGE_PROVIDER,
  LOCAL_IMAGE_ASSET_DIRECTORY,
  PUBLIC_UPLOADS_ROOT,
  RESUME_PHOTO_ASSET_KIND,
} from "@/lib/assets/constants";

export type AssetStorageProvider = typeof LOCAL_ASSET_STORAGE_PROVIDER;
export type ImageAssetKind = typeof RESUME_PHOTO_ASSET_KIND;

export type CreateAssetStorageInput = {
  userId: string;
  extension: string;
  kind?: ImageAssetKind;
  filenameBase?: string;
};

export type PreparedLocalAssetDestination = {
  storageProvider: AssetStorageProvider;
  storageKey: string;
  absoluteFilePath: string;
  publicUrl: string;
};

function normalizePathSegment(segment: string) {
  return (
    segment
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "asset"
  );
}

function normalizeExtension(extension: string) {
  if (!extension) {
    return ".bin";
  }

  return extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;
}

export function buildImageAssetStorageKey({
  userId,
  extension,
  kind = RESUME_PHOTO_ASSET_KIND,
  filenameBase = "resume-photo",
}: CreateAssetStorageInput) {
  const safeUserId = normalizePathSegment(userId);
  const safeKind = normalizePathSegment(kind);
  const safeFilenameBase = normalizePathSegment(filenameBase);
  const safeExtension = normalizeExtension(extension);

  return path.posix.join(
    LOCAL_IMAGE_ASSET_DIRECTORY,
    safeKind,
    safeUserId,
    `${Date.now()}-${randomUUID()}-${safeFilenameBase}${safeExtension}`
  );
}

export function resolveLocalAssetAbsolutePath(storageKey: string) {
  return path.join(
    process.cwd(),
    "public",
    LOCAL_ASSET_ROOT_DIRECTORY,
    storageKey
  );
}

export function resolveAssetPublicUrl({
  storageProvider,
  storageKey,
}: {
  storageProvider: string;
  storageKey: string;
}) {
  if (storageProvider !== LOCAL_ASSET_STORAGE_PROVIDER) {
    throw new Error(`Unsupported asset storage provider: ${storageProvider}`);
  }

  const normalizedStorageKey = storageKey.replace(/^\/+/, "");
  return `${PUBLIC_UPLOADS_ROOT}/${normalizedStorageKey}`;
}

export async function prepareLocalAssetDestination(
  input: CreateAssetStorageInput
): Promise<PreparedLocalAssetDestination> {
  const storageKey = buildImageAssetStorageKey(input);
  const absoluteFilePath = resolveLocalAssetAbsolutePath(storageKey);

  await mkdir(path.dirname(absoluteFilePath), { recursive: true });

  return {
    storageProvider: LOCAL_ASSET_STORAGE_PROVIDER,
    storageKey,
    absoluteFilePath,
    publicUrl: resolveAssetPublicUrl({
      storageProvider: LOCAL_ASSET_STORAGE_PROVIDER,
      storageKey,
    }),
  };
}

export async function deleteLocalAssetByStorageKey(storageKey: string) {
  const absoluteFilePath = resolveLocalAssetAbsolutePath(storageKey);
  await rm(absoluteFilePath, { force: true });
}