import sharp from "sharp";
import {
  CANONICAL_RESUME_PHOTO_EXTENSION,
  CANONICAL_RESUME_PHOTO_MIME_TYPE,
  TARGET_CANONICAL_PHOTO_MAX_BYTES,
  TARGET_CANONICAL_PHOTO_MAX_DIMENSION,
} from "@/lib/assets/constants";

export type OptimizedResumePhoto = {
  buffer: Buffer;
  byteSize: number;
  width: number;
  height: number;
  mimeType: typeof CANONICAL_RESUME_PHOTO_MIME_TYPE;
  extension: typeof CANONICAL_RESUME_PHOTO_EXTENSION;
};

export async function optimizeCanonicalResumePhoto(
  sourceBuffer: Buffer
): Promise<OptimizedResumePhoto> {
  const metadata = await sharp(sourceBuffer, { failOn: "none" })
    .rotate()
    .metadata();

  const initialWidth =
    typeof metadata.width === "number" && metadata.width > 0
      ? metadata.width
      : TARGET_CANONICAL_PHOTO_MAX_DIMENSION;
  const initialHeight =
    typeof metadata.height === "number" && metadata.height > 0
      ? metadata.height
      : TARGET_CANONICAL_PHOTO_MAX_DIMENSION;

  let currentMaxDimension = Math.min(
    Math.max(initialWidth, initialHeight),
    TARGET_CANONICAL_PHOTO_MAX_DIMENSION
  );

  const minMaxDimension = Math.max(
    1,
    Math.min(800, Math.min(initialWidth, initialHeight))
  );

  let quality = 86;

  while (true) {
    const transformed = sharp(sourceBuffer, { failOn: "none" })
      .rotate()
      .resize({
        width: currentMaxDimension,
        height: currentMaxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({
        quality,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
      });

    const { data, info } = await transformed.toBuffer({ resolveWithObject: true });

    if (
      data.byteLength <= TARGET_CANONICAL_PHOTO_MAX_BYTES ||
      (quality <= 62 && currentMaxDimension <= minMaxDimension)
    ) {
      return {
        buffer: data,
        byteSize: data.byteLength,
        width: info.width,
        height: info.height,
        mimeType: CANONICAL_RESUME_PHOTO_MIME_TYPE,
        extension: CANONICAL_RESUME_PHOTO_EXTENSION,
      };
    }

    if (quality > 62) {
      quality -= 6;
      continue;
    }

    if (currentMaxDimension <= minMaxDimension) {
      return {
        buffer: data,
        byteSize: data.byteLength,
        width: info.width,
        height: info.height,
        mimeType: CANONICAL_RESUME_PHOTO_MIME_TYPE,
        extension: CANONICAL_RESUME_PHOTO_EXTENSION,
      };
    }

    currentMaxDimension = Math.max(
      minMaxDimension,
      Math.floor(currentMaxDimension * 0.9)
    );
    quality = 72;
  }
}