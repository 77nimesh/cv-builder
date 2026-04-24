import {
  APP_ROLES,
  isBillingAdminRole,
  isPrivacyAdminRole,
  isSupportContentAccessRole,
  isSupportMetadataRole,
  isSystemAdminRole,
  normalizeAppRole,
  type AppRoleLike,
} from "@/lib/auth/roles";

export type PermissionActor = {
  id: string;
  role?: AppRoleLike;
};

export function getActorRole(actor: PermissionActor | null | undefined) {
  return normalizeAppRole(actor?.role);
}

export function isResourceOwner(
  actor: PermissionActor | null | undefined,
  ownerUserId: string | null | undefined
) {
  return Boolean(actor?.id && ownerUserId && actor.id === ownerUserId);
}

export function canViewOwnResource(
  actor: PermissionActor | null | undefined,
  ownerUserId: string | null | undefined
) {
  return isResourceOwner(actor, ownerUserId);
}

export function canViewUserMetadata(
  actor: PermissionActor | null | undefined,
  targetUserId: string | null | undefined
) {
  if (isResourceOwner(actor, targetUserId)) {
    return true;
  }

  const role = getActorRole(actor);

  return (
    role === APP_ROLES.ADMIN_SYSTEM ||
    role === APP_ROLES.ADMIN_BILLING ||
    role === APP_ROLES.SUPPORT_METADATA ||
    role === APP_ROLES.SUPPORT_CONTENT_ACCESS ||
    role === APP_ROLES.PRIVACY_ADMIN
  );
}

export function canViewResumeContentByDefault(
  actor: PermissionActor | null | undefined,
  resumeOwnerUserId: string | null | undefined
) {
  return isResourceOwner(actor, resumeOwnerUserId);
}

export function canUseSupportContentGrantRole(
  actor: PermissionActor | null | undefined
) {
  return isSupportContentAccessRole(actor?.role);
}

export function canManageSupportAccessGrants(
  actor: PermissionActor | null | undefined
) {
  return isSystemAdminRole(actor?.role) || isPrivacyAdminRole(actor?.role);
}

export function canViewPrivacyAuditLogs(
  actor: PermissionActor | null | undefined
) {
  return isPrivacyAdminRole(actor?.role) || isSystemAdminRole(actor?.role);
}

export function canManagePrivacyRequests(
  actor: PermissionActor | null | undefined
) {
  return isPrivacyAdminRole(actor?.role) || isSystemAdminRole(actor?.role);
}

export function canViewPrivacyRequests(
  actor: PermissionActor | null | undefined
) {
  return isPrivacyAdminRole(actor?.role) || isSystemAdminRole(actor?.role);
}

export function canManageBilling(
  actor: PermissionActor | null | undefined
) {
  return isBillingAdminRole(actor?.role) || isSystemAdminRole(actor?.role);
}

export function canViewSupportMetadata(
  actor: PermissionActor | null | undefined
) {
  return (
    isSupportMetadataRole(actor?.role) ||
    isSupportContentAccessRole(actor?.role) ||
    isPrivacyAdminRole(actor?.role) ||
    isSystemAdminRole(actor?.role)
  );
}