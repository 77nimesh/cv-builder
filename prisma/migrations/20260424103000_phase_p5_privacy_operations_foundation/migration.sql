CREATE TABLE "PrivacyRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "subjectUserId" TEXT NOT NULL,
    "requestedByUserId" TEXT,
    "assignedToUserId" TEXT,
    "resolvedByUserId" TEXT,
    "reason" TEXT,
    "requestDetails" JSONB,
    "resolutionNotes" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrivacyRequest_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrivacyRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrivacyRequest_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrivacyRequest_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PrivacyRequest_type_status_idx" ON "PrivacyRequest"("type", "status");
CREATE INDEX "PrivacyRequest_subjectUserId_idx" ON "PrivacyRequest"("subjectUserId");
CREATE INDEX "PrivacyRequest_requestedByUserId_idx" ON "PrivacyRequest"("requestedByUserId");
CREATE INDEX "PrivacyRequest_assignedToUserId_idx" ON "PrivacyRequest"("assignedToUserId");
CREATE INDEX "PrivacyRequest_resolvedByUserId_idx" ON "PrivacyRequest"("resolvedByUserId");
CREATE INDEX "PrivacyRequest_dueAt_idx" ON "PrivacyRequest"("dueAt");
CREATE INDEX "PrivacyRequest_createdAt_idx" ON "PrivacyRequest"("createdAt");