import { createHmac, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAssetPublicUrl } from "@/lib/assets/storage";

const PRINT_ACCESS_TOKEN_TTL_MS = 2 * 60 * 1000;

export type ResumeAccessViewer = {
  id: string;
  role?: string | null;
};

type ResumePrintAccessPayload = {
  resumeId: string;
  resumeUserId: string | null;
  expiresAt: number;
};

const accessibleResumeInclude = {
  photoAsset: {
    select: {
      storageProvider: true,
      storageKey: true,
    },
  },
} satisfies Prisma.ResumeInclude;

type AccessibleResumeWithPhotoAsset = Prisma.ResumeGetPayload<{
  include: typeof accessibleResumeInclude;
}>;

function isAdminViewer(viewer: ResumeAccessViewer | null | undefined) {
  return viewer?.role === "ADMIN";
}

function getPrintAccessSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET must be set for protected PDF generation.");
  }

  return secret;
}

function signValue(value: string) {
  return createHmac("sha256", getPrintAccessSecret())
    .update(value)
    .digest("base64url");
}

function resolveResumePhotoPath(resume: AccessibleResumeWithPhotoAsset) {
  const { photoAsset, ...rest } = resume;

  return {
    ...rest,
    photoPath: photoAsset
      ? resolveAssetPublicUrl({
          storageProvider: photoAsset.storageProvider,
          storageKey: photoAsset.storageKey,
        })
      : (resume.photoPath ?? null),
  };
}

export function buildAccessibleResumeWhere(
  viewer: ResumeAccessViewer,
  resumeId?: string
): Prisma.ResumeWhereInput {
  if (isAdminViewer(viewer)) {
    return resumeId ? { id: resumeId } : {};
  }

  return resumeId
    ? { id: resumeId, userId: viewer.id }
    : { userId: viewer.id };
}

export async function findAccessibleResume(
  viewer: ResumeAccessViewer,
  resumeId: string
) {
  const resume = await prisma.resume.findFirst({
    where: buildAccessibleResumeWhere(viewer, resumeId),
    include: accessibleResumeInclude,
  });

  if (!resume) {
    return null;
  }

  return resolveResumePhotoPath(resume);
}

export async function listAccessibleResumes(viewer: ResumeAccessViewer) {
  const resumes = await prisma.resume.findMany({
    where: buildAccessibleResumeWhere(viewer),
    include: accessibleResumeInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });

  return resumes.map(resolveResumePhotoPath);
}

export async function listResumeTitlesForOwner(
  ownerUserId: string | null | undefined
) {
  if (!ownerUserId) {
    return [];
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: ownerUserId },
    select: { title: true },
  });

  return resumes.map((resume) => resume.title);
}

export function createResumePrintAccessToken(input: {
  resumeId: string;
  resumeUserId: string | null;
  expiresInMs?: number;
}) {
  const payload: ResumePrintAccessPayload = {
    resumeId: input.resumeId,
    resumeUserId: input.resumeUserId,
    expiresAt: Date.now() + (input.expiresInMs ?? PRINT_ACCESS_TOKEN_TTL_MS),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyResumePrintAccessToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const providedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<ResumePrintAccessPayload>;

    if (
      typeof parsed.resumeId !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    if (
      parsed.resumeUserId !== null &&
      typeof parsed.resumeUserId !== "string"
    ) {
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      return null;
    }

    return parsed as ResumePrintAccessPayload;
  } catch {
    return null;
  }
}

export async function findResumeFromPrintAccessPayload(
  payload: ResumePrintAccessPayload
) {
  const resume = await prisma.resume.findFirst({
    where:
      payload.resumeUserId === null
        ? {
            id: payload.resumeId,
            userId: null,
          }
        : {
            id: payload.resumeId,
            userId: payload.resumeUserId,
          },
    include: accessibleResumeInclude,
  });

  if (!resume) {
    return null;
  }

  return resolveResumePhotoPath(resume);
}