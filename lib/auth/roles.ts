export const APP_ROLES = {
  USER: "USER",
  ADMIN_SYSTEM: "ADMIN_SYSTEM",
  ADMIN_BILLING: "ADMIN_BILLING",
  SUPPORT_METADATA: "SUPPORT_METADATA",
  SUPPORT_CONTENT_ACCESS: "SUPPORT_CONTENT_ACCESS",
  PRIVACY_ADMIN: "PRIVACY_ADMIN",
} as const;

export const LEGACY_ADMIN_ROLE = "ADMIN" as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
export type LegacyAdminRole = typeof LEGACY_ADMIN_ROLE;
export type AppRoleLike = AppRole | LegacyAdminRole | string | null | undefined;

export const DEFAULT_APP_ROLE: AppRole = APP_ROLES.USER;

export const ALL_APP_ROLES: AppRole[] = Object.values(APP_ROLES);

export function normalizeAppRole(role: AppRoleLike): AppRole {
  if (role === LEGACY_ADMIN_ROLE) {
    return APP_ROLES.ADMIN_SYSTEM;
  }

  if (ALL_APP_ROLES.includes(role as AppRole)) {
    return role as AppRole;
  }

  return DEFAULT_APP_ROLE;
}

export function isAppRole(role: AppRoleLike): role is AppRole {
  return ALL_APP_ROLES.includes(role as AppRole);
}

export function isSystemAdminRole(role: AppRoleLike) {
  return normalizeAppRole(role) === APP_ROLES.ADMIN_SYSTEM;
}

export function isBillingAdminRole(role: AppRoleLike) {
  return normalizeAppRole(role) === APP_ROLES.ADMIN_BILLING;
}

export function isSupportMetadataRole(role: AppRoleLike) {
  return normalizeAppRole(role) === APP_ROLES.SUPPORT_METADATA;
}

export function isSupportContentAccessRole(role: AppRoleLike) {
  return normalizeAppRole(role) === APP_ROLES.SUPPORT_CONTENT_ACCESS;
}

export function isPrivacyAdminRole(role: AppRoleLike) {
  return normalizeAppRole(role) === APP_ROLES.PRIVACY_ADMIN;
}