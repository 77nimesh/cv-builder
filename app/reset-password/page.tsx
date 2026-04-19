import Link from "next/link";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { getPasswordResetTokenStatus } from "@/lib/auth/tokens";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

function readTokenMessage(status: "invalid" | "expired" | "used") {
  if (status === "expired") {
    return "This reset link has expired.";
  }

  if (status === "used") {
    return "This reset link has already been used.";
  }

  return "This reset link is invalid.";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const status = await getPasswordResetTokenStatus(token);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Link href="/login" className="text-sm text-slate-500">
              ← Back to login
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Reset Password
            </h1>
            <p className="mt-2 text-slate-600">
              Set a new password for your account.
            </p>
          </div>

          {status === "valid" ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {readTokenMessage(status)}
              </p>

              <Link
                href="/forgot-password"
                className="inline-flex rounded-xl border border-slate-300 px-4 py-3"
              >
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}