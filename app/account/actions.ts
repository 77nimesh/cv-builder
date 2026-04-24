"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import { requestAccountDeletion } from "@/lib/privacy/privacy-requests";

function readTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectToAccountWithMessage(type: "privacyMessage" | "privacyError", value: string): never {
  const params = new URLSearchParams({
    [type]: value,
  });

  redirect(`/account?${params.toString()}`);
}

export async function requestAccountDeletionAction(formData: FormData) {
  const user = await requireCurrentUser();
  const reason = readTextValue(formData, "reason");

  try {
    await requestAccountDeletion({
      actor: user,
      reason,
    });
  } catch (error) {
    console.error("Failed to request account deletion:", error);

    redirectToAccountWithMessage(
      "privacyError",
      error instanceof Error
        ? error.message
        : "Failed to request account deletion."
    );
  }

  revalidatePath("/account");
  redirectToAccountWithMessage(
    "privacyMessage",
    "Account deletion request submitted for privacy review."
  );
}