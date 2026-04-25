"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  executeAccountDeletionAnonymization,
  updatePrivacyRequestStatus,
} from "@/lib/privacy/privacy-requests";
import {
  PRIVACY_REQUEST_STATUSES,
  isPrivacyRequestStatus,
} from "@/lib/privacy/retention";

function readTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(type: "message" | "error", value: string): never {
  const params = new URLSearchParams({
    [type]: value,
  });

  redirect(`/admin/privacy/requests?${params.toString()}`);
}

export async function updatePrivacyRequestStatusAction(formData: FormData) {
  const user = await requireCurrentUser();

  const requestId = readTextValue(formData, "requestId");
  const status = readTextValue(formData, "status");
  const resolutionNotes = readTextValue(formData, "resolutionNotes");

  if (!requestId) {
    redirectWithMessage("error", "Privacy request id is required.");
  }

  if (!isPrivacyRequestStatus(status)) {
    redirectWithMessage("error", "Invalid privacy request status.");
  }

  try {
    await updatePrivacyRequestStatus({
      actor: user,
      requestId,
      status,
      resolutionNotes:
        resolutionNotes ||
        (status === PRIVACY_REQUEST_STATUSES.COMPLETED
          ? "Marked completed manually. No automatic destructive deletion was performed by this foundation stage."
          : null),
    });
  } catch (error) {
    console.error("Failed to update privacy request:", error);

    redirectWithMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Failed to update privacy request."
    );
  }

  revalidatePath("/admin/privacy/requests");
  redirectWithMessage("message", "Privacy request updated.");
}

export async function executeAccountDeletionAnonymizationAction(
  formData: FormData
) {
  const user = await requireCurrentUser();
  const requestId = readTextValue(formData, "requestId");

  if (!requestId) {
    redirectWithMessage("error", "Privacy request id is required.");
  }

  try {
    await executeAccountDeletionAnonymization({
      actor: user,
      requestId,
    });
  } catch (error) {
    console.error("Failed to execute account anonymization:", error);

    redirectWithMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Failed to execute account anonymization."
    );
  }

  revalidatePath("/admin/privacy/requests");
  redirectWithMessage("message", "Account anonymized and request completed.");
}