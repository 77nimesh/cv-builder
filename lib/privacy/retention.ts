export const PRIVACY_REQUEST_TYPES = {
  ACCOUNT_DELETION: "ACCOUNT_DELETION",
  DATA_EXPORT: "DATA_EXPORT",
  DATA_RECTIFICATION: "DATA_RECTIFICATION",
} as const;

export const PRIVACY_REQUEST_STATUSES = {
  OPEN: "OPEN",
  IN_REVIEW: "IN_REVIEW",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type PrivacyRequestType =
  (typeof PRIVACY_REQUEST_TYPES)[keyof typeof PRIVACY_REQUEST_TYPES];

export type PrivacyRequestStatus =
  (typeof PRIVACY_REQUEST_STATUSES)[keyof typeof PRIVACY_REQUEST_STATUSES];

export const ACTIVE_PRIVACY_REQUEST_STATUSES: PrivacyRequestStatus[] = [
  PRIVACY_REQUEST_STATUSES.OPEN,
  PRIVACY_REQUEST_STATUSES.IN_REVIEW,
];

export const DEFAULT_PRIVACY_REQUEST_DUE_DAYS = 30;

export const PRIVACY_RETENTION_PLACEHOLDERS = {
  accountDeletion:
    "Account deletion is request-based in this foundation stage. A privacy admin must review and complete deletion manually until the destructive deletion workflow is implemented.",
  resumeData:
    "Resume data remains owner-only by default. Future deletion execution should remove or anonymize resumes owned by the deleted account according to the final retention policy.",
  imageAssets:
    "Image assets remain owner-only by default. Future deletion execution should remove owned image assets from DB metadata and local/object storage.",
  auditLogs:
    "Audit logs should be retained for security and compliance review. Future policy should define retention period and legal basis.",
  backups:
    "Backups are not managed by this local development implementation. Production launch requires encrypted backups and documented deletion propagation timing.",
  exports:
    "Data export is tracked as a future privacy request type but is not implemented yet.",
} as const;

export function calculatePrivacyRequestDueAt(
  from = new Date(),
  days = DEFAULT_PRIVACY_REQUEST_DUE_DAYS
) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isPrivacyRequestStatus(value: string): value is PrivacyRequestStatus {
  return Object.values(PRIVACY_REQUEST_STATUSES).includes(
    value as PrivacyRequestStatus
  );
}

export function isActivePrivacyRequestStatus(status: string) {
  return ACTIVE_PRIVACY_REQUEST_STATUSES.includes(status as PrivacyRequestStatus);
}