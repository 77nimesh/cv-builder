import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth/password";

type CreateUserInput = {
  name?: string;
  email: string;
  password: string;
};

function normalizeDisplayName(name?: string) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return null;
  }

  return trimmedName;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({
    data: {
      name: normalizeDisplayName(input.name),
      email: normalizeEmail(input.email),
      passwordHash: await hashPassword(input.password),
      role: "USER",
      emailVerified: null,
    },
  });
}

export async function updateUserPassword(userId: string, password: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
    },
  });
}

export async function markUserEmailVerified(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: new Date(),
    },
  });
}

export async function verifyUserPassword(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    return false;
  }

  return verifyPassword(password, user.passwordHash);
}