"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { normalizeEmail } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/auth/user";
import type { AuthActionState } from "@/lib/auth/action-state";

function readTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPasswordValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = readTextValue(formData, "email");
  const password = readPasswordValue(formData, "password");

  if (!email || !password) {
    return {
      error: "Email and password are required.",
      fields: { email },
    };
  }

  try {
    await signIn("credentials", {
      email: normalizeEmail(email),
      password,
      redirectTo: "/resumes",
    });

    return {
      error: null,
      fields: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Invalid email or password.",
          fields: { email },
        };
      }

      return {
        error: "Unable to sign in right now.",
        fields: { email },
      };
    }

    throw error;
  }
}

export async function signupAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = readTextValue(formData, "name");
  const email = readTextValue(formData, "email");
  const password = readPasswordValue(formData, "password");
  const confirmPassword = readPasswordValue(formData, "confirmPassword");

  if (!email || !password || !confirmPassword) {
    return {
      error: "Email, password, and confirm password are required.",
      fields: { name, email },
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      fields: { name, email },
    };
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
      fields: { name, email: normalizedEmail },
    };
  }

  try {
    await createUser({
      name,
      email: normalizedEmail,
      password,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "An account with that email already exists.",
        fields: { name, email: normalizedEmail },
      };
    }

    if (error instanceof Error) {
      return {
        error: error.message,
        fields: { name, email: normalizedEmail },
      };
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/resumes",
    });

    return {
      error: null,
      fields: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Account created, but automatic login failed. Please log in.",
        fields: { email: normalizedEmail },
      };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}