"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { initialMessageActionState } from "@/lib/auth/action-state";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialMessageActionState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="forgot-password-email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="forgot-password-email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="you@example.com"
          required
        />
      </div>

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
        className="w-full rounded-xl bg-slate-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Preparing reset link..." : "Send Reset Link"}
      </button>
    </form>
  );
}