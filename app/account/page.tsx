import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/logout-button";
import ChangePasswordForm from "@/components/auth/change-password-form";
import ResendVerificationForm from "@/components/auth/resend-verification-form";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  ACTIVE_PRIVACY_REQUEST_STATUSES,
  PRIVACY_REQUEST_TYPES,
} from "@/lib/privacy/retention";
import { requestAccountDeletionAction } from "@/app/account/actions";

type AccountPageProps = {
  searchParams?: Promise<{
    privacyMessage?: string;
    privacyError?: string;
  }>;
};

function readDisplayName(name: string | null, email: string | null | undefined) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return email ?? "your account";
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.toLocaleString();
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireCurrentUser();
  const params = await searchParams;

  const latestDeletionRequest = await prisma.privacyRequest.findFirst({
    where: {
      subjectUserId: user.id,
      type: PRIVACY_REQUEST_TYPES.ACCOUNT_DELETION,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const hasActiveDeletionRequest =
    latestDeletionRequest &&
    ACTIVE_PRIVACY_REQUEST_STATUSES.includes(
      latestDeletionRequest.status as (typeof ACTIVE_PRIVACY_REQUEST_STATUSES)[number]
    );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account</h1>
            <p className="mt-2 text-slate-600">
              Manage your login, password, verification, and privacy requests.
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
            <Link
              href="/privacy"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Privacy
            </Link>
            <LogoutButton className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
          </div>
        </div>

        {params?.privacyMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            {params.privacyMessage}
          </div>
        ) : null}

        {params?.privacyError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
            {params.privacyError}
          </div>
        ) : null}

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
                  {user.isEmailVerified ? "Verified" : "Not verified yet"}
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
              After changing your password, you will be logged out and asked to
              sign in again.
            </p>

            <div className="mt-5">
              <ChangePasswordForm />
            </div>
          </section>

          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-red-700">
              Account deletion request
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This foundation stage records your deletion request for privacy
              review. It does not automatically delete your account, resumes, or
              image assets yet.
            </p>

            {latestDeletionRequest ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p>
                  <strong>Latest request status:</strong>{" "}
                  {latestDeletionRequest.status}
                </p>
                <p className="mt-1">
                  <strong>Requested:</strong>{" "}
                  {formatDateTime(latestDeletionRequest.createdAt)}
                </p>
                <p className="mt-1">
                  <strong>Due:</strong>{" "}
                  {formatDateTime(latestDeletionRequest.dueAt)}
                </p>
              </div>
            ) : null}

            {hasActiveDeletionRequest ? (
              <p className="mt-4 text-sm text-slate-600">
                You already have an active account deletion request. A privacy
                admin can review it from the privacy requests dashboard.
              </p>
            ) : (
              <form action={requestAccountDeletionAction} className="mt-5">
                <label htmlFor="reason" className="block text-sm font-medium">
                  Optional reason
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Optional: tell us why you want the account deleted."
                />
                <button
                  type="submit"
                  className="mt-4 rounded-xl bg-red-700 px-5 py-3 text-white"
                >
                  Request account deletion
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}