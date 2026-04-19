import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { consumeEmailVerificationToken } from "@/lib/auth/tokens";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const token = typeof query.token === "string" ? query.token : "";

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight">Verify Email</h1>
            <p className="mt-3 text-slate-600">
              No verification token was provided.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={user ? "/account" : "/login"}
                className="rounded-xl border border-slate-300 px-4 py-3"
              >
                {user ? "Go to account" : "Go to login"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const result = await consumeEmailVerificationToken(token);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Verify Email</h1>

          {result.status === "success" ? (
            <>
              <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Your email address was verified successfully.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={user ? "/resumes" : "/login?verified=1"}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-white"
                >
                  {user ? "Go to resumes" : "Continue to login"}
                </Link>
              </div>
            </>
          ) : null}

          {result.status === "used" ? (
            <>
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This verification link has already been used.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={user ? "/account" : "/login"}
                  className="rounded-xl border border-slate-300 px-4 py-3"
                >
                  {user ? "Go to account" : "Go to login"}
                </Link>
              </div>
            </>
          ) : null}

          {result.status === "expired" ? (
            <>
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                This verification link has expired.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={user ? "/account" : "/login"}
                  className="rounded-xl border border-slate-300 px-4 py-3"
                >
                  {user ? "Go to account" : "Go to login"}
                </Link>
              </div>
            </>
          ) : null}

          {result.status === "invalid" ? (
            <>
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                This verification link is invalid.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={user ? "/account" : "/login"}
                  className="rounded-xl border border-slate-300 px-4 py-3"
                >
                  {user ? "Go to account" : "Go to login"}
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}