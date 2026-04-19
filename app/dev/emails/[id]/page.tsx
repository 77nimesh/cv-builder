import Link from "next/link";
import { notFound } from "next/navigation";
import { readStoredEmail } from "@/lib/email/mailer";

type DevEmailPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DevEmailPreviewPage({
  params,
}: DevEmailPreviewPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { id } = await params;
  const email = await readStoredEmail(id);

  if (!email) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Preview</h1>
            <p className="mt-2 text-slate-600">{email.subject}</p>
            <p className="mt-1 text-sm text-slate-500">To: {email.to}</p>
          </div>

          <Link
            href="/dev/emails"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            Back to dev emails
          </Link>
        </div>

        <div className="mt-8 grid gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Plain Text</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-slate-700">
              {email.text}
            </pre>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">HTML Preview</h2>
            <div
              className="prose mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: email.html }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}