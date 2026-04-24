-- Phase P.2 — role and audit foundation
-- Keep User.role as TEXT for compatibility, but migrate the legacy broad ADMIN value
-- to the new ADMIN_SYSTEM vocabulary.
UPDATE "User"
SET "role" = 'ADMIN_SYSTEM'
WHERE "role" = 'ADMIN';

CREATE TABLE "SupportAccessGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetUserId" TEXT NOT NULL,
    "targetResumeId" TEXT,
    "supportUserId" TEXT NOT NULL,
    "grantedByUserId" TEXT,
    "reason" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportAccessGrant_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportAccessGrant_targetResumeId_fkey" FOREIGN KEY ("targetResumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportAccessGrant_supportUserId_fkey" FOREIGN KEY ("supportUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportAccessGrant_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorUserId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetOwnerUserId" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_targetOwnerUserId_fkey" FOREIGN KEY ("targetOwnerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "SupportAccessGrant_targetUserId_idx" ON "SupportAccessGrant"("targetUserId");
CREATE INDEX "SupportAccessGrant_targetResumeId_idx" ON "SupportAccessGrant"("targetResumeId");
CREATE INDEX "SupportAccessGrant_supportUserId_idx" ON "SupportAccessGrant"("supportUserId");
CREATE INDEX "SupportAccessGrant_grantedByUserId_idx" ON "SupportAccessGrant"("grantedByUserId");
CREATE INDEX "SupportAccessGrant_expiresAt_idx" ON "SupportAccessGrant"("expiresAt");
CREATE INDEX "SupportAccessGrant_revokedAt_idx" ON "SupportAccessGrant"("revokedAt");

CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX "AuditLog_targetOwnerUserId_idx" ON "AuditLog"("targetOwnerUserId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");