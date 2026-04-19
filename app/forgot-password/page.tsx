import Link from "next/link";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Link href="/login" className="text-sm text-slate-500">
              ← Back to login
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Forgot Password
            </h1>
            <p className="mt-2 text-slate-600">
              Enter your email and we will prepare a password reset link.
            </p>
          </div>

          <ForgotPasswordForm />

          <p className="mt-6 text-sm text-slate-500">
            In local development, prepared emails appear under{" "}
            <Link href="/dev/emails" className="underline">
              /dev/emails
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

