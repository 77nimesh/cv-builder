import {
  BILLING_MODES,
  BILLING_PLAN_CODES,
  BILLING_PLAN_STATUSES,
  FREE_TEMPLATE_LIMIT,
  PRO_TEMPLATE_LIMIT,
  SINGLE_EXPORT_DOWNLOAD_LIMIT,
  SINGLE_EXPORT_ENTITLEMENT_DAYS,
  SINGLE_EXPORT_TEMPLATE_LIMIT,
  type BillingPlanCatalogItem,
  type BillingPlanCode,
} from "@/lib/billing/types";

export const BILLING_PLAN_CATALOG = [
  {
    code: BILLING_PLAN_CODES.FREE,
    name: "Free",
    description:
      "Create, edit, and preview resumes with access to the two free templates. Exports are locked until purchase.",
    status: BILLING_PLAN_STATUSES.ACTIVE,
    billingMode: BILLING_MODES.FREE,
    currency: "USD",
    amountCents: 0,
    templateLimit: FREE_TEMPLATE_LIMIT,
    exportEnabled: false,
    exportResumeScoped: false,
    downloadLimit: 0,
    entitlementDurationDays: null,
    isPublic: true,
    sortOrder: 10,
    metadata: {
      phase: "D",
      templates: "first_2",
      exports: "locked",
      photoAssetLimit: 5,
    },
  },
  {
    code: BILLING_PLAN_CODES.SINGLE_EXPORT,
    name: "Single Export Pack",
    description:
      "One-time purchase for one resume, unlocking up to ten templates and five PDF downloads for seven days.",
    status: BILLING_PLAN_STATUSES.ACTIVE,
    billingMode: BILLING_MODES.ONE_TIME,
    currency: "USD",
    amountCents: 599,
    templateLimit: SINGLE_EXPORT_TEMPLATE_LIMIT,
    exportEnabled: true,
    exportResumeScoped: true,
    downloadLimit: SINGLE_EXPORT_DOWNLOAD_LIMIT,
    entitlementDurationDays: SINGLE_EXPORT_ENTITLEMENT_DAYS,
    isPublic: true,
    sortOrder: 20,
    metadata: {
      phase: "D",
      priceLabel: "USD 5.99",
      templates: "first_10",
      exports: "resume_scoped",
      downloads: SINGLE_EXPORT_DOWNLOAD_LIMIT,
      durationDays: SINGLE_EXPORT_ENTITLEMENT_DAYS,
      receiptEmail: "dev_outbox_first",
    },
  },
  {
    code: BILLING_PLAN_CODES.PRO_MONTHLY,
    name: "Pro Monthly",
    description:
      "Future subscription tier for all templates and broader download access. Seeded now so entitlement code can target it later.",
    status: BILLING_PLAN_STATUSES.PLANNED,
    billingMode: BILLING_MODES.SUBSCRIPTION,
    currency: "USD",
    amountCents: 1299,
    templateLimit: PRO_TEMPLATE_LIMIT,
    exportEnabled: true,
    exportResumeScoped: false,
    downloadLimit: null,
    entitlementDurationDays: 31,
    isPublic: false,
    sortOrder: 30,
    metadata: {
      phase: "D_later",
      priceLabel: "USD 12.99 / month",
      templates: "all_14",
      exports: "broader_downloads",
      launchStatus: "planned_not_purchaseable_yet",
    },
  },
  {
    code: BILLING_PLAN_CODES.PRO_YEARLY,
    name: "Pro Yearly",
    description:
      "Future annual subscription tier. Kept planned until recurring billing is implemented.",
    status: BILLING_PLAN_STATUSES.PLANNED,
    billingMode: BILLING_MODES.SUBSCRIPTION,
    currency: "USD",
    amountCents: 8900,
    templateLimit: PRO_TEMPLATE_LIMIT,
    exportEnabled: true,
    exportResumeScoped: false,
    downloadLimit: null,
    entitlementDurationDays: 366,
    isPublic: false,
    sortOrder: 40,
    metadata: {
      phase: "D_later",
      priceLabel: "USD 89 / year",
      templates: "all_14",
      exports: "broader_downloads",
      launchStatus: "planned_not_purchaseable_yet",
    },
  },
] as const satisfies readonly BillingPlanCatalogItem[];

export const DEFAULT_BILLING_PLAN_CODE = BILLING_PLAN_CODES.FREE;

export function getBillingPlanCatalog() {
  return BILLING_PLAN_CATALOG;
}

export function getPublicBillingPlanCatalog() {
  return BILLING_PLAN_CATALOG.filter(
    (plan) => plan.isPublic && plan.status === BILLING_PLAN_STATUSES.ACTIVE
  );
}

export function findBillingPlanDefinition(code: string | null | undefined) {
  if (!code) {
    return null;
  }

  return BILLING_PLAN_CATALOG.find((plan) => plan.code === code) ?? null;
}

export function assertBillingPlanCode(code: string): BillingPlanCode {
  const plan = findBillingPlanDefinition(code);

  if (!plan) {
    throw new Error(`Unknown billing plan code: ${code}`);
  }

  return plan.code;
}