import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";

type BillingSuccessPageProps = {
  searchParams: Promise<{ paymentId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function BillingSuccessPage({
  searchParams,
}: BillingSuccessPageProps) {
  const user = await requireCurrentUser();
  const { paymentId } = await searchParams;

  const payment = paymentId
    ? await prisma.payment.findFirst({
        where: {
          id: paymentId,
          userId: user.id,
        },
        include: {
          plan: true,
          receipt: true,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
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

          {payment ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5 text-sm text-slate-700">
              <h2 className="font-semibold text-slate-900">Purchase summary</h2>
              <dl className="mt-3 grid gap-2">
                <div className="flex justify-between gap-4">
                  <dt>Plan</dt>
                  <dd className="font-medium text-slate-900">
                    {payment.plan.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Status</dt>
                  <dd className="font-medium text-slate-900">
                    {payment.status}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Receipt</dt>
                  <dd className="font-medium text-slate-900">
                    {payment.receipt?.receiptNumber ?? "Preparing receipt"}
                  </dd>
                </div>
              </dl>

              {payment.receipt?.devEmailPreviewUrl ? (
                <Link
                  href={payment.receipt.devEmailPreviewUrl}
                  className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Open dev receipt email
                </Link>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Receipt email preview is not available yet. Check /dev/emails
                  if the payment was just completed.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-5 text-sm text-amber-900">
              Payment details were not found in this session, but you can return
              to your resume list and check the export state.
            </div>
          )}

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

            <Link
              href="/dev/emails"
              className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-900"
            >
              Dev emails
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}