import Link from "next/link";
import { PRIVACY_RETENTION_PLACEHOLDERS } from "@/lib/privacy/retention";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Privacy Notice Foundation
            </h1>
            <p className="mt-2 text-slate-600">
              This page is a launch-readiness placeholder for the product privacy
              notice. It is not a final legal privacy policy.
            </p>
          </div>

          <Link
            href="/account"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            Account
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Current privacy model</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-700">
            <p>
              Resume content and image assets are owner-only by default. Admins
              and support users do not automatically receive customer resume
              content access.
            </p>
            <p>
              Support content access requires an explicit, reasoned, time-limited
              grant and is audited.
            </p>
            <p>
              Account deletion is currently request-based. A privacy admin must
              review the request before any future destructive deletion workflow
              is executed.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Retention placeholders</h2>
          <div className="mt-4 grid gap-3 text-sm">
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
              <strong>Data export:</strong>{" "}
              {PRIVACY_RETENTION_PLACEHOLDERS.exports}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Before public launch</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Replace this placeholder with a real privacy policy.</li>
            <li>Add final collection notices at signup and upload points.</li>
            <li>Implement actual deletion execution and retention jobs.</li>
            <li>Document backup retention and deletion propagation timing.</li>
            <li>Document subprocessors and hosting regions.</li>
            <li>Add data export workflow if required for launch region.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}