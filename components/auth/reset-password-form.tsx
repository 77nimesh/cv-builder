"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/auth/actions";
import { initialMessageActionState } from "@/lib/auth/action-state";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialMessageActionState
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div>
        <label
          htmlFor="reset-password-new"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          New password
        </label>
        <input
          id="reset-password-new"
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div>
        <label
          htmlFor="reset-password-confirm"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Confirm new password
        </label>
        <input
          id="reset-password-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="Re-enter your password"
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
        {isPending ? "Resetting password..." : "Reset Password"}
      </button>
    </form>
  );
}