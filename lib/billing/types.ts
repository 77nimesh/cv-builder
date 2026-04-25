export const BILLING_PLAN_CODES = {
  FREE: "free",
  SINGLE_EXPORT: "single_export",
  PRO_MONTHLY: "pro_monthly",
  PRO_YEARLY: "pro_yearly",
} as const;

export type BillingPlanCode =
  (typeof BILLING_PLAN_CODES)[keyof typeof BILLING_PLAN_CODES];

export const BILLING_PLAN_STATUSES = {
  ACTIVE: "active",
  PLANNED: "planned",
  ARCHIVED: "archived",
} as const;

export type BillingPlanStatus =
  (typeof BILLING_PLAN_STATUSES)[keyof typeof BILLING_PLAN_STATUSES];

export const BILLING_MODES = {
  FREE: "free",
  ONE_TIME: "one_time",
  SUBSCRIPTION: "subscription",
} as const;

export type BillingMode = (typeof BILLING_MODES)[keyof typeof BILLING_MODES];

export const PAYMENT_PROVIDERS = {
  PAYPAL: "paypal",
} as const;

export type PaymentProvider =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export const PAYMENT_PROVIDER_ENVIRONMENTS = {
  SANDBOX: "sandbox",
  LIVE: "live",
} as const;

export type PaymentProviderEnvironment =
  (typeof PAYMENT_PROVIDER_ENVIRONMENTS)[keyof typeof PAYMENT_PROVIDER_ENVIRONMENTS];

export const PAYMENT_STATUSES = {
  CREATED: "created",
  APPROVED: "approved",
  CAPTURED: "captured",
  CANCELLED: "cancelled",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const ENTITLEMENT_STATUSES = {
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
} as const;

export type EntitlementStatus =
  (typeof ENTITLEMENT_STATUSES)[keyof typeof ENTITLEMENT_STATUSES];

export const RECEIPT_STATUSES = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type ReceiptStatus =
  (typeof RECEIPT_STATUSES)[keyof typeof RECEIPT_STATUSES];

export const FREE_TEMPLATE_LIMIT = 2;
export const SINGLE_EXPORT_TEMPLATE_LIMIT = 10;
export const PRO_TEMPLATE_LIMIT = 14;
export const SINGLE_EXPORT_DOWNLOAD_LIMIT = 5;
export const SINGLE_EXPORT_ENTITLEMENT_DAYS = 7;

export type BillingPlanCatalogItem = {
  code: BillingPlanCode;
  name: string;
  description: string;
  status: BillingPlanStatus;
  billingMode: BillingMode;
  currency: string;
  amountCents: number;
  templateLimit: number;
  exportEnabled: boolean;
  exportResumeScoped: boolean;
  downloadLimit: number | null;
  entitlementDurationDays: number | null;
  isPublic: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
};