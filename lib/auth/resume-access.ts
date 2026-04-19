import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const PRINT_ACCESS_TOKEN_TTL_MS = 2 * 60 * 1000;

type ResumePrintAccessPayload = {
  resumeId: string;
  userId: string;
  expiresAt: number;
};

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

export async function findOwnedResume(userId: string, resumeId: string) {
  return prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });
}

export async function listOwnedResumeTitles(userId: string) {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: { title: true },
  });

  return resumes.map((resume) => resume.title);
}

export function createResumePrintAccessToken(input: {
  resumeId: string;
  userId: string;
  expiresInMs?: number;
}) {
  const payload: ResumePrintAccessPayload = {
    resumeId: input.resumeId,
    userId: input.userId,
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

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<ResumePrintAccessPayload>;

    if (
      typeof parsed.resumeId !== "string" ||
      typeof parsed.userId !== "string" ||
      typeof parsed.expiresAt !== "number"
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