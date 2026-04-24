import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { canViewPrivacyAuditLogs } from "@/lib/auth/permissions";
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
  writeAuditLog,
} from "@/lib/privacy/audit";

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

function stringifyMetadata(value: unknown) {
  if (!value) {
    return "—";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "Unable to display metadata";
  }
}

export default async function PrivacyAuditLogsPage() {
  const user = await requireCurrentUser();

  if (!canViewPrivacyAuditLogs(user)) {
    notFound();
  }

  await writeAuditLog({
    actor: user,
    action: AUDIT_ACTIONS.PRIVACY_AUDIT_VIEWED,
    targetType: AUDIT_TARGET_TYPES.AUDIT_LOG,
    metadata: {
      page: "/admin/privacy/audit-logs",
    },
  }).catch((error) => {
    console.error("Failed to write privacy audit view log:", error);
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    include: {
      actorUser: {
        select: {
          name: true,
          email: true,
        },
      },
      targetOwnerUser: {
        select: {
          name: true,
          email: true,
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
              Privacy Audit Logs
            </h1>
            <p className="mt-2 max-w-lg text-slate-600">
              Review sensitive support/admin actions such as support grant
              creation, revocation, content viewing, PDF generation, privacy
              requests, and privacy audit access.
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-start justify-end gap-3">
            <div className="max-w-[360px] rounded-xl border border-slate-200 bg-white px-4 py-2">
              <p className="text-xs font-medium text-slate-500">Signed in</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name?.trim() || "Unknown user"}
              </p>
              <p className="truncate text-xs text-slate-600">
                {user.email || "—"}
              </p>
              <p className="truncate text-xs text-slate-600">Role : {user.role}</p>
            </div>
            <Link
              href="/admin/privacy/requests"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              Privacy Requests
            </Link>
            <Link
              href="/admin/support-access"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Support Access
            </Link>
            <Link
              href="/resumes"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Resumes
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Latest 100 events</h2>

          <div className="mt-4 max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Time</th>
                  <th className="py-3 pr-4">Actor</th>
                  <th className="py-3 pr-4">Actor role</th>
                  <th className="py-3 pr-4">Action</th>
                  <th className="py-3 pr-4">Target</th>
                  <th className="py-3 pr-4">Target owner</th>
                  <th className="py-3 pr-4">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{formatDateTime(log.createdAt)}</td>
                    <td className="py-3 pr-4">
                      {readDisplayName(log.actorUser)}
                    </td>
                    <td className="py-3 pr-4">{log.actorRole ?? "—"}</td>
                    <td className="py-3 pr-4">{log.action}</td>
                    <td className="py-3 pr-4">
                      {log.targetType}
                      {log.targetId ? ` / ${log.targetId}` : ""}
                    </td>
                    <td className="py-3 pr-4">
                      {readDisplayName(log.targetOwnerUser)}
                    </td>
                    <td className="max-w-md truncate py-3 pr-4 font-mono text-xs">
                      {stringifyMetadata(log.metadata)}
                    </td>
                  </tr>
                ))}

                {auditLogs.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={7}>
                      No audit events yet.
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