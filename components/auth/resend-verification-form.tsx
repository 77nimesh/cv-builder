"use client";

import { useActionState } from "react";
import { resendVerificationEmailAction } from "@/lib/auth/actions";
import { initialMessageActionState } from "@/lib/auth/action-state";

export default function ResendVerificationForm() {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmailAction,
    initialMessageActionState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Preparing verification email..." : "Resend Verification Email"}
      </button>
    </form>
  );
}