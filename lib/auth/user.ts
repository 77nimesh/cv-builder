import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";

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