-- Phase D.2 — billing plan, payment, entitlement, and receipt foundation

CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingMode" TEXT NOT NULL DEFAULT 'free',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "templateLimit" INTEGER NOT NULL DEFAULT 2,
    "exportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "exportResumeScoped" BOOLEAN NOT NULL DEFAULT false,
    "downloadLimit" INTEGER,
    "entitlementDurationDays" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "resumeId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'paypal',
    "providerEnvironment" TEXT NOT NULL DEFAULT 'sandbox',
    "providerOrderId" TEXT,
    "providerCaptureId" TEXT,
    "providerPayerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rawProviderStatus" TEXT,
    "approvalUrl" TEXT,
    "idempotencyKey" TEXT,
    "webhookEventId" TEXT,
    "providerOrderPayload" JSONB,
    "providerCapturePayload" JSONB,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "capturedAt" DATETIME,
    "cancelledAt" DATETIME,
    "failedAt" DATETIME,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "paymentId" TEXT,
    "resumeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'payment',
    "templateLimit" INTEGER NOT NULL DEFAULT 2,
    "exportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "exportResumeScoped" BOOLEAN NOT NULL DEFAULT false,
    "downloadLimit" INTEGER,
    "downloadsUsed" INTEGER NOT NULL DEFAULT 0,
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PaymentReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "emailTo" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "devEmailPreviewId" TEXT,
    "devEmailPreviewUrl" TEXT,
    "sentAt" DATETIME,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentReceipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");
CREATE INDEX "Plan_status_isPublic_idx" ON "Plan"("status", "isPublic");
CREATE INDEX "Plan_billingMode_idx" ON "Plan"("billingMode");
CREATE INDEX "Plan_sortOrder_idx" ON "Plan"("sortOrder");

CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment"("providerOrderId");
CREATE UNIQUE INDEX "Payment_providerCaptureId_key" ON "Payment"("providerCaptureId");
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
CREATE UNIQUE INDEX "Payment_webhookEventId_key" ON "Payment"("webhookEventId");
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");
CREATE INDEX "Payment_planId_idx" ON "Payment"("planId");
CREATE INDEX "Payment_resumeId_idx" ON "Payment"("resumeId");
CREATE INDEX "Payment_provider_providerEnvironment_idx" ON "Payment"("provider", "providerEnvironment");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

CREATE INDEX "Entitlement_userId_status_idx" ON "Entitlement"("userId", "status");
CREATE INDEX "Entitlement_userId_resumeId_idx" ON "Entitlement"("userId", "resumeId");
CREATE INDEX "Entitlement_planId_idx" ON "Entitlement"("planId");
CREATE INDEX "Entitlement_paymentId_idx" ON "Entitlement"("paymentId");
CREATE INDEX "Entitlement_resumeId_idx" ON "Entitlement"("resumeId");
CREATE INDEX "Entitlement_expiresAt_idx" ON "Entitlement"("expiresAt");
CREATE INDEX "Entitlement_createdAt_idx" ON "Entitlement"("createdAt");

CREATE UNIQUE INDEX "PaymentReceipt_paymentId_key" ON "PaymentReceipt"("paymentId");
CREATE UNIQUE INDEX "PaymentReceipt_receiptNumber_key" ON "PaymentReceipt"("receiptNumber");
CREATE INDEX "PaymentReceipt_userId_idx" ON "PaymentReceipt"("userId");
CREATE INDEX "PaymentReceipt_status_idx" ON "PaymentReceipt"("status");
CREATE INDEX "PaymentReceipt_createdAt_idx" ON "PaymentReceipt"("createdAt");