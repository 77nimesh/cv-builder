"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/lib/auth/action-state";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="login-email"
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
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="Enter your password"
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
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}