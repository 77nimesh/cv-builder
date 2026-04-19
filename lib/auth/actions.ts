"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import type {
  AuthActionState,
  MessageActionState,
} from "@/lib/auth/action-state";
import { assertValidPassword, normalizeEmail } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth/session";
import {
  consumePasswordResetToken,
  createEmailVerificationToken,
  createPasswordResetToken,
} from "@/lib/auth/tokens";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  verifyUserPassword,
} from "@/lib/auth/user";
import { sendAppEmail, buildAbsoluteUrl } from "@/lib/email/mailer";
import {
  buildEmailVerificationEmail,
  buildPasswordResetEmail,
} from "@/lib/email/templates";

function readTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPasswordValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function sendVerificationEmailToUser(user: {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
}) {
  if (user.emailVerified) {
    return null;
  }

  const { rawToken } = await createEmailVerificationToken({
    userId: user.id,
    email: user.email,
  });

  const verificationUrl = buildAbsoluteUrl(
    `/verify-email?token=${encodeURIComponent(rawToken)}`
  );

  const emailContent = buildEmailVerificationEmail({
    name: user.name,
    verificationUrl,
  });

  return sendAppEmail({
    to: user.email,
    purpose: "verify-email",
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
}

async function sendPasswordResetEmailToUser(user: {
  id: string;
  email: string;
  name: string | null;
}) {
  const { rawToken } = await createPasswordResetToken({
    userId: user.id,
    email: user.email,
  });

  const resetUrl = buildAbsoluteUrl(
    `/reset-password?token=${encodeURIComponent(rawToken)}`
  );

  const emailContent = buildPasswordResetEmail({
    name: user.name,
    resetUrl,
  });

  return sendAppEmail({
    to: user.email,
    purpose: "reset-password",
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
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
      success: null,
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
      success: null,
      fields: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Invalid email or password.",
          success: null,
          fields: { email },
        };
      }

      return {
        error: "Unable to sign in right now.",
        success: null,
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
      success: null,
      fields: { name, email },
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      success: null,
      fields: { name, email },
    };
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
      success: null,
      fields: { name, email: normalizedEmail },
    };
  }

  let createdUser: Awaited<ReturnType<typeof createUser>>;

  try {
    createdUser = await createUser({
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
        success: null,
        fields: { name, email: normalizedEmail },
      };
    }

    if (error instanceof Error) {
      return {
        error: error.message,
        success: null,
        fields: { name, email: normalizedEmail },
      };
    }

    throw error;
  }

  try {
    await sendVerificationEmailToUser(createdUser);
  } catch (error) {
    console.error("Failed to prepare verification email:", error);
  }

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/resumes",
    });

    return {
      error: null,
      success: null,
      fields: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Account created, but automatic login failed. Please log in.",
        success: null,
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

export async function resendVerificationEmailAction(
  _: MessageActionState
): Promise<MessageActionState> {
  const sessionUser = await getCurrentUser();

  if (!sessionUser?.id) {
    return {
      error: "You must be logged in to resend a verification email.",
      success: null,
    };
  }

  const user = await findUserById(sessionUser.id);

  if (!user) {
    return {
      error: "Account not found.",
      success: null,
    };
  }

  if (user.emailVerified) {
    return {
      error: null,
      success: "Your email address is already verified.",
    };
  }

  try {
    await sendVerificationEmailToUser(user);

    return {
      error: null,
      success:
        "Verification email prepared. In local development, open /dev/emails.",
    };
  } catch (error) {
    console.error("Failed to resend verification email:", error);

    return {
      error: "Unable to prepare the verification email right now.",
      success: null,
    };
  }
}

export async function forgotPasswordAction(
  _: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const email = readTextValue(formData, "email");

  if (!email) {
    return {
      error: "Email is required.",
      success: null,
    };
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);

  if (user) {
    try {
      await sendPasswordResetEmailToUser(user);
    } catch (error) {
      console.error("Failed to prepare password reset email:", error);

      return {
        error: "Unable to prepare the password reset email right now.",
        success: null,
      };
    }
  }

  return {
    error: null,
    success:
      "If an account exists for that email, a reset link has been prepared. In local development, open /dev/emails.",
  };
}

export async function resetPasswordAction(
  _: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const token = readTextValue(formData, "token");
  const password = readPasswordValue(formData, "password");
  const confirmPassword = readPasswordValue(formData, "confirmPassword");

  if (!token || !password || !confirmPassword) {
    return {
      error: "Token, password, and confirm password are required.",
      success: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      success: null,
    };
  }

  try {
    assertValidPassword(password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid password.",
      success: null,
    };
  }

  const result = await consumePasswordResetToken(token, password);

  if (result.status === "invalid") {
    return {
      error: "This reset link is invalid.",
      success: null,
    };
  }

  if (result.status === "used") {
    return {
      error: "This reset link has already been used.",
      success: null,
    };
  }

  if (result.status === "expired") {
    return {
      error: "This reset link has expired.",
      success: null,
    };
  }

  redirect("/login?reset=1");
}

export async function changePasswordAction(
  _: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const sessionUser = await getCurrentUser();

  if (!sessionUser?.id) {
    return {
      error: "You must be logged in to change your password.",
      success: null,
    };
  }

  const currentPassword = readPasswordValue(formData, "currentPassword");
  const newPassword = readPasswordValue(formData, "newPassword");
  const confirmPassword = readPasswordValue(formData, "confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      error: "All password fields are required.",
      success: null,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      error: "New passwords do not match.",
      success: null,
    };
  }

  try {
    assertValidPassword(newPassword);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid password.",
      success: null,
    };
  }

  const isCurrentPasswordValid = await verifyUserPassword(
    sessionUser.id,
    currentPassword
  );

  if (!isCurrentPasswordValid) {
    return {
      error: "Current password is incorrect.",
      success: null,
    };
  }

  await updateUserPassword(sessionUser.id, newPassword);

  await signOut({
    redirectTo: "/login?passwordChanged=1",
  });

  return {
    error: null,
    success: "Password changed successfully.",
  };
}