import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { APP_ROLES } from "@/lib/auth/roles";
import { requireCurrentUser } from "@/lib/auth/session";
import LogoutButton from "@/components/auth/logout-button";
import {
  canManageSupportAccessGrants,
  canViewSupportMetadata,
} from "@/lib/auth/permissions";
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
  writeAuditLog,
} from "@/lib/privacy/audit";
import {
  createSupportAccessGrantAction,
  revokeSupportAccessGrantAction,
} from "@/app/admin/support-access/actions";

type SupportAccessPageProps = {
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
  name: string | null | undefined;
  email: string | null | undefined;
}) {
  return user.name?.trim() || user.email || "Unknown user";
}

function readGrantStatus(grant: {
  startsAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}) {
  const now = new Date();

  if (grant.revokedAt) {
    return "Revoked";
  }

  if (grant.startsAt > now) {
    return "Scheduled";
  }

  if (grant.expiresAt <= now) {
    return "Expired";
  }

  return "Active";
}

export default async function SupportAccessPage({
  searchParams,
}: SupportAccessPageProps) {
  const user = await requireCurrentUser();

  if (!canViewSupportMetadata(user)) {
    notFound();
  }

  const canManageGrants = canManageSupportAccessGrants(user);
  const params = await searchParams;

  await writeAuditLog({
    actor: user,
    action: AUDIT_ACTIONS.SUPPORT_METADATA_VIEWED,
    targetType: AUDIT_TARGET_TYPES.USER,
    metadata: {
      page: "/admin/support-access",
    },
  }).catch((error) => {
    console.error("Failed to write support metadata audit log:", error);
  });

  const [users, resumes, supportUsers, grants] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            resumes: true,
            imageAssets: true,
          },
        },
      },
    }),
    prisma.resume.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        userId: true,
        title: true,
        template: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: APP_ROLES.SUPPORT_CONTENT_ACCESS,
      },
      orderBy: {
        email: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    }),
    prisma.supportAccessGrant.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        targetUser: {
          select: {
            name: true,
            email: true,
          },
        },
        targetResume: {
          select: {
            title: true,
          },
        },
        supportUser: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        grantedByUser: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Support Access
            </h1>
            <p className="mt-2 max-w-lg text-slate-600">
              Review customer metadata and manage explicit, time-limited support
              content grants. Metadata support does not include resume body
              access.
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-start justify-end gap-3">
            <div className="max-w-[260px] rounded-xl border border-slate-200 bg-white px-4 py-2">
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
              href="/resumes"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Resumes
            </Link>
            <Link
              href="/admin/privacy/requests"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Privacy Requests
            </Link>
            <Link
              href="/admin/privacy/audit-logs"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Audit Logs
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

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Role separation</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <strong>SUPPORT_METADATA:</strong> can inspect account/resume
              metadata only.
            </p>
            <p>
              <strong>SUPPORT_CONTENT_ACCESS:</strong> can view content only
              with an active grant.
            </p>
            <p>
              <strong>PRIVACY_ADMIN:</strong> can manage grants and review audit
              trails.
            </p>
            <p>
              <strong>ADMIN_SYSTEM:</strong> can manage operational foundations
              but does not receive automatic resume content access.
            </p>
          </div>
        </section>

        {canManageGrants ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Create support content grant
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Grants require a reason and a short expiry. Only users with the{" "}
              <code>SUPPORT_CONTENT_ACCESS</code> role can receive grants.
            </p>

            <form
              action={createSupportAccessGrantAction}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="supportUserId"
                  className="mb-2 block text-sm font-medium"
                >
                  Support content user
                </label>
                <select
                  id="supportUserId"
                  name="supportUserId"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="">Select support user</option>
                  {supportUsers.map((supportUser) => (
                    <option key={supportUser.id} value={supportUser.id}>
                      {readDisplayName(supportUser)} — {supportUser.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="targetUserId"
                  className="mb-2 block text-sm font-medium"
                >
                  Target customer
                </label>
                <select
                  id="targetUserId"
                  name="targetUserId"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="">Select customer</option>
                  {users.map((targetUser) => (
                    <option key={targetUser.id} value={targetUser.id}>
                      {readDisplayName(targetUser)} — {targetUser.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="targetResumeId"
                  className="mb-2 block text-sm font-medium"
                >
                  Optional target resume
                </label>
                <select
                  id="targetResumeId"
                  name="targetResumeId"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="">All resumes for selected customer</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} —{" "}
                      {resume.user ? readDisplayName(resume.user) : "No owner"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="expiresInMinutes"
                  className="mb-2 block text-sm font-medium"
                >
                  Expires in minutes
                </label>
                <input
                  id="expiresInMinutes"
                  name="expiresInMinutes"
                  type="number"
                  min={1}
                  max={120}
                  defaultValue={30}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-medium"
                >
                  Reason
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  required
                  rows={3}
                  placeholder="Example: Customer asked support to inspect formatting issue in resume preview."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-white"
                >
                  Create grant
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <h2 className="text-lg font-semibold">Metadata-only mode</h2>
            <p className="mt-2 text-sm">
              Your role can view metadata for support, but cannot create or
              revoke content access grants.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recent support grants</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Support user</th>
                  <th className="py-3 pr-4">Target customer</th>
                  <th className="py-3 pr-4">Target resume</th>
                  <th className="py-3 pr-4">Reason</th>
                  <th className="py-3 pr-4">Expires</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant) => {
                  const status = readGrantStatus(grant);

                  return (
                    <tr key={grant.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">{status}</td>
                      <td className="py-3 pr-4">
                        {readDisplayName(grant.supportUser)}
                      </td>
                      <td className="py-3 pr-4">
                        {readDisplayName(grant.targetUser)}
                      </td>
                      <td className="py-3 pr-4">
                        {grant.targetResume?.title ?? "All customer resumes"}
                      </td>
                      <td className="py-3 pr-4">{grant.reason}</td>
                      <td className="py-3 pr-4">
                        {formatDateTime(grant.expiresAt)}
                      </td>
                      <td className="py-3 pr-4">
                        {canManageGrants && status === "Active" ? (
                          <form action={revokeSupportAccessGrantAction}>
                            <input
                              type="hidden"
                              name="grantId"
                              value={grant.id}
                            />
                            <button
                              type="submit"
                              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700"
                            >
                              Revoke
                            </button>
                          </form>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {grants.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={7}>
                      No support content access grants yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Customer metadata</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Verified</th>
                  <th className="py-3 pr-4">Resumes</th>
                  <th className="py-3 pr-4">Images</th>
                  <th className="py-3 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((targetUser) => (
                  <tr key={targetUser.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{readDisplayName(targetUser)}</td>
                    <td className="py-3 pr-4">{targetUser.role}</td>
                    <td className="py-3 pr-4">
                      {targetUser.emailVerified ? "Yes" : "No"}
                    </td>
                    <td className="py-3 pr-4">
                      {targetUser._count.resumes}
                    </td>
                    <td className="py-3 pr-4">
                      {targetUser._count.imageAssets}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDateTime(targetUser.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Resume metadata</h2>
          <p className="mt-2 text-sm text-slate-600">
            Opening a preview requires the{" "}
            <code>SUPPORT_CONTENT_ACCESS</code> role and an active grant.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Resume</th>
                  <th className="py-3 pr-4">Owner</th>
                  <th className="py-3 pr-4">Template</th>
                  <th className="py-3 pr-4">Updated</th>
                  <th className="py-3 pr-4">Content</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <tr key={resume.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{resume.title}</td>
                    <td className="py-3 pr-4">
                      {resume.user ? readDisplayName(resume.user) : "No owner"}
                    </td>
                    <td className="py-3 pr-4">{resume.template}</td>
                    <td className="py-3 pr-4">
                      {formatDateTime(resume.updatedAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/resumes/${resume.id}/preview`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      >
                        Try preview
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}