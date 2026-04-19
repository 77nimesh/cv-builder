import Link from "next/link";
import { notFound } from "next/navigation";
import { listStoredEmails } from "@/lib/email/mailer";

export default async function DevEmailsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const emails = await listStoredEmails();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dev Emails</h1>
            <p className="mt-2 text-slate-600">
              Local email previews prepared by the app.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Home
            </Link>
            <Link
              href="/account"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              Account
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {emails.length === 0 ? (
            <p className="text-slate-600">No dev emails have been prepared yet.</p>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{email.subject}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        To: {email.to}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(email.createdAt).toLocaleString()} · {email.purpose}
                      </p>
                    </div>

                    <Link
                      href={`/dev/emails/${email.id}`}
                      className="rounded-xl border border-slate-300 px-4 py-2"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}