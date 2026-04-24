import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { canViewPrivacyRequests } from "@/lib/auth/permissions";
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
  writeAuditLog,
} from "@/lib/privacy/audit";
import {
  PRIVACY_REQUEST_STATUSES,
  PRIVACY_RETENTION_PLACEHOLDERS,
} from "@/lib/privacy/retention";
import { updatePrivacyRequestStatusAction } from "@/app/admin/privacy/requests/actions";

type PrivacyRequestsPageProps = {
  searchParams?: Promise<{
    message?: string;
    error?: string;
  }>;
};

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.toLocaleString();
}

function readDisplayName(user: {
  name: string | null;
  email: string | null;
} | null) {
  if (!user) {
    return "System/unknown";
  }

  return user.name?.trim() || user.email || "Unknown user";
}

export default async function PrivacyRequestsPage({
  searchParams,
}: PrivacyRequestsPageProps) {
  const user = await requireCurrentUser();

  if (!canViewPrivacyRequests(user)) {
    notFound();
  }

  const params = await searchParams;

  await writeAuditLog({
    actor: user,
    action: AUDIT_ACTIONS.PRIVACY_REQUEST_VIEWED,
    targetType: AUDIT_TARGET_TYPES.PRIVACY_REQUEST,
    metadata: {
      page: "/admin/privacy/requests",
    },
  }).catch((error) => {
    console.error("Failed to write privacy request view audit log:", error);
  });

  const privacyRequests = await prisma.privacyRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    include: {
      subjectUser: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      requestedByUser: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      resolvedByUser: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Privacy Requests
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Review account deletion and future data rights requests. This
              foundation stage records and tracks requests but does not
              automatically delete customer data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/privacy/audit-logs"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              Audit Logs
            </Link>
            <Link
              href="/admin/support-access"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              Support Access
            </Link>
            <Link
              href="/privacy"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              Privacy Notice
            </Link>
          </div>
        </div>

        {params?.message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            {params.message}
          </div>
        ) : null}

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
            {params.error}
          </div>
        ) : null}

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Retention placeholders</h2>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <p>
              <strong>Account deletion:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.accountDeletion}
            </p>
            <p>
              <strong>Resume data:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.resumeData}
            </p>
            <p>
              <strong>Image assets:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.imageAssets}
            </p>
            <p>
              <strong>Audit logs:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.auditLogs}
            </p>
            <p>
              <strong>Backups:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.backups}
            </p>
            <p>
              <strong>Exports:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.exports}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Latest privacy requests</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Subject user</th>
                  <th className="py-3 pr-4">Requested by</th>
                  <th className="py-3 pr-4">Reason</th>
                  <th className="py-3 pr-4">Due</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 pr-4">Resolved</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {privacyRequests.map((privacyRequest) => (
                  <tr
                    key={privacyRequest.id}
                    className="border-b border-slate-100 align-top"
                  >
                    <td className="py-3 pr-4">{privacyRequest.type}</td>
                    <td className="py-3 pr-4">{privacyRequest.status}</td>
                    <td className="py-3 pr-4">
                      {readDisplayName(privacyRequest.subjectUser)}
                    </td>
                    <td className="py-3 pr-4">
                      {readDisplayName(privacyRequest.requestedByUser)}
                    </td>
                    <td className="max-w-xs py-3 pr-4">
                      {privacyRequest.reason || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDateTime(privacyRequest.dueAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDateTime(privacyRequest.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDateTime(privacyRequest.resolvedAt)}
                    </td>
                    <td className="space-y-2 py-3 pr-4">
                      <form action={updatePrivacyRequestStatusAction}>
                        <input
                          type="hidden"
                          name="requestId"
                          value={privacyRequest.id}
                        />
                        <input
                          type="hidden"
                          name="status"
                          value={PRIVACY_REQUEST_STATUSES.IN_REVIEW}
                        />
                        <button
                          type="submit"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                        >
                          Mark in review
                        </button>
                      </form>

                      <form action={updatePrivacyRequestStatusAction}>
                        <input
                          type="hidden"
                          name="requestId"
                          value={privacyRequest.id}
                        />
                        <input
                          type="hidden"
                          name="status"
                          value={PRIVACY_REQUEST_STATUSES.COMPLETED}
                        />
                        <button
                          type="submit"
                          className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800"
                        >
                          Mark completed
                        </button>
                      </form>

                      <form action={updatePrivacyRequestStatusAction}>
                        <input
                          type="hidden"
                          name="requestId"
                          value={privacyRequest.id}
                        />
                        <input
                          type="hidden"
                          name="status"
                          value={PRIVACY_REQUEST_STATUSES.REJECTED}
                        />
                        <button
                          type="submit"
                          className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700"
                        >
                          Reject
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {privacyRequests.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={9}>
                      No privacy requests yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}