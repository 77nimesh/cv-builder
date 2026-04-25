import type { Plan } from "@prisma/client";
import PurchaseButton from "@/components/billing/purchase-button";
import { BILLING_MODES, BILLING_PLAN_CODES } from "@/lib/billing/types";

type PlanCardProps = {
  plan: Pick<
    Plan,
    | "code"
    | "name"
    | "description"
    | "billingMode"
    | "currency"
    | "amountCents"
    | "templateLimit"
    | "exportEnabled"
    | "downloadLimit"
    | "entitlementDurationDays"
    | "status"
    | "isPublic"
  >;
  resumeId?: string | null;
};

function formatPrice(plan: PlanCardProps["plan"]) {
  if (plan.amountCents <= 0) {
    return "Free";
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
  }).format(plan.amountCents / 100);

  if (plan.billingMode === BILLING_MODES.SUBSCRIPTION) {
    return `${amount} / month`;
  }

  return amount;
}

function describeExport(plan: PlanCardProps["plan"]) {
  if (!plan.exportEnabled) {
    return "Export locked";
  }

  if (plan.downloadLimit === null) {
    return "PDF export included";
  }

  return `${plan.downloadLimit} PDF downloads included`;
}

function describeDuration(plan: PlanCardProps["plan"]) {
  if (!plan.entitlementDurationDays) {
    return "No paid entitlement window";
  }

  return `${plan.entitlementDurationDays} day access window`;
}

export default function PlanCard({ plan, resumeId }: PlanCardProps) {
  const canPurchase =
    plan.code === BILLING_PLAN_CODES.SINGLE_EXPORT &&
    plan.isPublic &&
    plan.amountCents > 0 &&
    Boolean(resumeId);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">{plan.code}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">{plan.name}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {plan.description}
        </p>

        <p className="mt-6 text-3xl font-bold">{formatPrice(plan)}</p>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        <li>Templates included: {plan.templateLimit}</li>
        <li>{describeExport(plan)}</li>
        <li>{describeDuration(plan)}</li>
      </ul>

      <div className="mt-6 flex-1" />

      {plan.code === BILLING_PLAN_CODES.FREE ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600">
          Current default plan
        </div>
      ) : canPurchase ? (
        <PurchaseButton
          planCode={plan.code}
          resumeId={resumeId}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500">
          {plan.code === BILLING_PLAN_CODES.SINGLE_EXPORT
            ? "Open billing from a resume to buy this pack."
            : "Coming later"}
        </div>
      )}
    </article>
  );
}