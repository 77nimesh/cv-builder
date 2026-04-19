"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/auth/actions";
import { initialMessageActionState } from "@/lib/auth/action-state";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialMessageActionState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="change-password-current"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Current password
        </label>
        <input
          id="change-password-current"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="Current password"
          required
        />
      </div>

      <div>
        <label
          htmlFor="change-password-new"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          New password
        </label>
        <input
          id="change-password-new"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div>
        <label
          htmlFor="change-password-confirm"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Confirm new password
        </label>
        <input
          id="change-password-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="Re-enter your new password"
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
        className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Changing password..." : "Change Password"}
      </button>
    </form>
  );
}