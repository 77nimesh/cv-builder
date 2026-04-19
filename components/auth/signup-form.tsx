"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/lib/auth/action-state";

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="signup-name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Full name
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={state.fields.name ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.fields.email ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="signup-password"
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
          htmlFor="signup-confirm-password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Confirm password
        </label>
        <input
          id="signup-confirm-password"
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

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-slate-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}