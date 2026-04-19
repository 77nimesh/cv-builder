import Link from "next/link";
import LogoutButton from "@/components/auth/logout-button";
import ChangePasswordForm from "@/components/auth/change-password-form";
import ResendVerificationForm from "@/components/auth/resend-verification-form";
import { requireCurrentUser } from "@/lib/auth/session";

function readDisplayName(name: string | null, email: string | null | undefined) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return email ?? "your account";
}

export default async function AccountPage() {
  const user = await requireCurrentUser();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account</h1>
            <p className="mt-2 text-slate-600">
              Manage your login, password, and verification status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Home
            </Link>
            <Link
              href="/resumes"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Resumes
            </Link>
            <LogoutButton className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Profile</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-slate-700">Name</dt>
                <dd className="text-slate-600">
                  {readDisplayName(user.name ?? null, user.email)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Email</dt>
                <dd className="text-slate-600">{user.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Verification</dt>
                <dd className="text-slate-600">
                  {user.isEmailVerified
                    ? "Verified"
                    : "Not verified yet"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Email Verification</h2>
            <p className="mt-2 text-sm text-slate-600">
              {user.isEmailVerified
                ? "Your email address has already been verified."
                : "Resend the verification email if you still need to verify your account."}
            </p>

            {!user.isEmailVerified ? (
              <div className="mt-5 space-y-4">
                <ResendVerificationForm />
                <p className="text-sm text-slate-500">
                  In local development, verification emails appear under{" "}
                  <Link href="/dev/emails" className="underline">
                    /dev/emails
                  </Link>
                  .
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="mt-2 text-sm text-slate-600">
              After changing your password, you will be logged out and asked to sign in again.
            </p>

            <div className="mt-5">
              <ChangePasswordForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}