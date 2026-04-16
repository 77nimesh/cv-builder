import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Photo file is required" },
        { status: 400 }
      );
    }

    const extension = ALLOWED_MIME_TYPES.get(file.type);

    if (!extension) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Photo must be 5MB or smaller" },
        { status: 400 }
      );
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "resume-photos"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}${extension}`;
    const absoluteFilePath = path.join(uploadDirectory, filename);
    const arrayBuffer = await file.arrayBuffer();

    await writeFile(absoluteFilePath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      photoPath: `/uploads/resume-photos/${filename}`,
    });
  } catch (error) {
    console.error("Failed to upload resume photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}