import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Payment confirmed
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Your export entitlement is active
          </h1>
          <p className="mt-3 text-emerald-900">
            You can now return to your resume preview and download the PDF if
            the entitlement applies to that resume.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/resumes"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Back to resumes
            </Link>

            <Link
              href="/billing"
              className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-900"
            >
              View billing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}