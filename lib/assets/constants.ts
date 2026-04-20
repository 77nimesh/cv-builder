export const LOCAL_ASSET_STORAGE_PROVIDER = "local" as const;
export const RESUME_PHOTO_ASSET_KIND = "resume-photo" as const;

export const MAX_IMAGE_ASSETS_PER_USER = 5;
export const MAX_RESUME_PHOTO_UPLOAD_BYTES = 10 * 1024 * 1024;

export const TARGET_CANONICAL_PHOTO_MAX_BYTES = 1_000_000;
export const TARGET_CANONICAL_PHOTO_MAX_DIMENSION = 1200;
export const CANONICAL_RESUME_PHOTO_MIME_TYPE = "image/jpeg";
export const CANONICAL_RESUME_PHOTO_EXTENSION = ".jpg";

export const ALLOWED_RESUME_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const PUBLIC_UPLOADS_ROOT = "/uploads";
export const LOCAL_ASSET_ROOT_DIRECTORY = "uploads";
export const LOCAL_IMAGE_ASSET_DIRECTORY = "image-assets";