"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  createSupportAccessGrant,
  revokeSupportAccessGrant,
} from "@/lib/privacy/support-access";

function readTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(type: "message" | "error", value: string): never {
  const params = new URLSearchParams({
    [type]: value,
  });

  redirect(`/admin/support-access?${params.toString()}`);
}

export async function createSupportAccessGrantAction(formData: FormData) {
  const user = await requireCurrentUser();

  const supportUserId = readTextValue(formData, "supportUserId");
  const targetUserId = readTextValue(formData, "targetUserId");
  const targetResumeId = readTextValue(formData, "targetResumeId") || null;
  const reason = readTextValue(formData, "reason");
  const expiresInMinutesRaw = readTextValue(formData, "expiresInMinutes") || "30";
  const expiresInMinutes = Number(expiresInMinutesRaw);

  if (!supportUserId || !targetUserId || !reason) {
    redirectWithMessage(
      "error",
      "Support user, target user, and reason are required."
    );
  }

  if (!Number.isFinite(expiresInMinutes) || expiresInMinutes <= 0) {
    redirectWithMessage("error", "Expiry must be a positive number of minutes.");
  }

  try {
    await createSupportAccessGrant({
      grantor: user,
      supportUserId,
      targetUserId,
      targetResumeId,
      reason,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });

    revalidatePath("/admin/support-access");
    redirectWithMessage("message", "Support content access grant created.");
  } catch (error) {
    console.error("Failed to create support access grant:", error);

    redirectWithMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Failed to create support content access grant."
    );
  }
}

export async function revokeSupportAccessGrantAction(formData: FormData) {
  const user = await requireCurrentUser();
  const grantId = readTextValue(formData, "grantId");

  if (!grantId) {
    redirectWithMessage("error", "Grant id is required.");
  }

  try {
    await revokeSupportAccessGrant({
      grantor: user,
      grantId,
    });

    revalidatePath("/admin/support-access");
    redirectWithMessage("message", "Support content access grant revoked.");
  } catch (error) {
    console.error("Failed to revoke support access grant:", error);

    redirectWithMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Failed to revoke support content access grant."
    );
  }
}