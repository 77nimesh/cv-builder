import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

type TokenStatus = "valid" | "invalid" | "expired" | "used";

function generateRawToken() {
  return randomBytes(32).toString("base64url");
}

function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createEmailVerificationToken(input: {
  userId: string;
  email: string;
  expiresInMs?: number;
}) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + (input.expiresInMs ?? EMAIL_VERIFICATION_TTL_MS)
  );

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: input.userId,
      usedAt: null,
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId: input.userId,
      email: input.email,
      tokenHash,
      expiresAt,
    },
  });

  return {
    rawToken,
    expiresAt,
  };
}

export async function createPasswordResetToken(input: {
  userId: string;
  email: string;
  expiresInMs?: number;
}) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + (input.expiresInMs ?? PASSWORD_RESET_TTL_MS)
  );

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: input.userId,
      usedAt: null,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: input.userId,
      email: input.email,
      tokenHash,
      expiresAt,
    },
  });

  return {
    rawToken,
    expiresAt,
  };
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord) {
    return {
      status: "invalid" as const,
    };
  }

  if (tokenRecord.usedAt) {
    return {
      status: "used" as const,
      email: tokenRecord.email,
    };
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    return {
      status: "expired" as const,
      email: tokenRecord.email,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: new Date() },
    });

    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: tokenRecord.userId,
        id: {
          not: tokenRecord.id,
        },
      },
    });
  });

  return {
    status: "success" as const,
    email: tokenRecord.email,
  };
}

export async function getPasswordResetTokenStatus(
  rawToken?: string | null
): Promise<TokenStatus> {
  if (!rawToken) {
    return "invalid";
  }

  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord) {
    return "invalid";
  }

  if (tokenRecord.usedAt) {
    return "used";
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    return "expired";
  }

  return "valid";
}

export async function consumePasswordResetToken(
  rawToken: string,
  password: string
) {
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord) {
    return {
      status: "invalid" as const,
    };
  }

  if (tokenRecord.usedAt) {
    return {
      status: "used" as const,
    };
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    return {
      status: "expired" as const,
    };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        userId: tokenRecord.userId,
        id: {
          not: tokenRecord.id,
        },
      },
    });
  });

  return {
    status: "success" as const,
    userId: tokenRecord.userId,
  };
}