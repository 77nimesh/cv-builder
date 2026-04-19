import Link from "next/link";
import LogoutButton from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/auth/session";

function readDisplayName(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) {
    return "";
  }

  const trimmedName = user.name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return user.email ?? "your account";
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const displayName = readDisplayName(user);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">CV Builder</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Local-first resume builder with live preview and PDF export.
            </p>

            {user ? (
              <p className="mt-3 text-sm text-slate-500">
                Signed in as {displayName}
                {user.isEmailVerified ? " · Email verified" : " · Email not yet verified"}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="rounded-xl border border-slate-300 px-4 py-2"
                >
                  Account
                </Link>
                <LogoutButton className="rounded-xl border border-slate-300 px-4 py-2" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-white"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {user ? (
            <>
              <Link
                href="/resumes"
                className="rounded-xl bg-slate-900 px-5 py-3 text-white"
              >
                View Resumes
              </Link>
              <Link
                href="/resumes/new"
                className="rounded-xl border border-slate-300 px-5 py-3"
              >
                Create Resume
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-xl bg-slate-900 px-5 py-3 text-white"
              >
                Create Your Account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 px-5 py-3"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {!user ? (
          <p className="mt-6 text-sm text-slate-500">
            Password reset, email verification, and account recovery are now built in.
          </p>
        ) : null}
      </div>
    </main>
  );
}