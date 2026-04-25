function readGreetingName(name: string | null | undefined) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "there";
  }

  return trimmedName;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(input: { amountCents: number; currency: string }) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency,
  }).format(input.amountCents / 100);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function describeDownloadLimit(downloadLimit: number | null) {
  if (downloadLimit === null) {
    return "Unlimited PDF downloads while the entitlement is active";
  }

  if (downloadLimit === 0) {
    return "PDF downloads are not included";
  }

  return `${downloadLimit} PDF downloads included`;
}

function describeDuration(entitlementDurationDays: number | null) {
  if (!entitlementDurationDays) {
    return "No paid access window";
  }

  if (entitlementDurationDays === 1) {
    return "1 day access window";
  }

  return `${entitlementDurationDays} day access window`;
}

export function buildEmailVerificationEmail(input: {
  name: string | null | undefined;
  verificationUrl: string;
}) {
  const greetingName = readGreetingName(input.name);
  const safeGreetingName = escapeHtml(greetingName);
  const safeVerificationUrl = escapeHtml(input.verificationUrl);

  return {
    subject: "Verify your CV Builder email address",
    text: [
      `Hi ${greetingName},`,
      "",
      "Please verify your email address for CV Builder by opening the link below:",
      input.verificationUrl,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${safeGreetingName},</p>
        <p>Please verify your email address for <strong>CV Builder</strong> by clicking the button below.</p>
        <p>
          <a
            href="${safeVerificationUrl}"
            style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:12px;"
          >
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p><a href="${safeVerificationUrl}">${safeVerificationUrl}</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  };
}

export function buildPasswordResetEmail(input: {
  name: string | null | undefined;
  resetUrl: string;
}) {
  const greetingName = readGreetingName(input.name);
  const safeGreetingName = escapeHtml(greetingName);
  const safeResetUrl = escapeHtml(input.resetUrl);

  return {
    subject: "Reset your CV Builder password",
    text: [
      `Hi ${greetingName},`,
      "",
      "A password reset was requested for your CV Builder account.",
      "Open the link below to set a new password:",
      input.resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${safeGreetingName},</p>
        <p>A password reset was requested for your <strong>CV Builder</strong> account.</p>
        <p>
          <a
            href="${safeResetUrl}"
            style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:12px;"
          >
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p><a href="${safeResetUrl}">${safeResetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  };
}

export function buildPaymentReceiptEmail(input: {
  name: string | null | undefined;
  receiptNumber: string;
  planName: string;
  planDescription: string;
  amountCents: number;
  currency: string;
  provider: string;
  providerEnvironment: string;
  providerOrderId: string | null;
  providerCaptureId: string | null;
  capturedAt: Date;
  entitlementSummary: string;
  templateLimit: number;
  downloadLimit: number | null;
  entitlementDurationDays: number | null;
}) {
  const greetingName = readGreetingName(input.name);
  const amount = formatMoney({
    amountCents: input.amountCents,
    currency: input.currency,
  });
  const capturedAt = formatDateTime(input.capturedAt);
  const downloadLimit = describeDownloadLimit(input.downloadLimit);
  const duration = describeDuration(input.entitlementDurationDays);

  const providerLabel =
    input.providerEnvironment === "sandbox"
      ? `${input.provider} sandbox`
      : input.provider;

  const textLines = [
    `Hi ${greetingName},`,
    "",
    "Thanks for your CV Builder purchase.",
    "",
    `Receipt: ${input.receiptNumber}`,
    `Plan: ${input.planName}`,
    `Amount: ${amount}`,
    `Paid at: ${capturedAt}`,
    `Payment provider: ${providerLabel}`,
    input.providerOrderId ? `Provider order ID: ${input.providerOrderId}` : null,
    input.providerCaptureId
      ? `Provider capture ID: ${input.providerCaptureId}`
      : null,
    "",
    "Entitlement details:",
    `- ${input.entitlementSummary}`,
    `- Templates unlocked: ${input.templateLimit}`,
    `- ${downloadLimit}`,
    `- ${duration}`,
    "",
    "This receipt does not include resume body content.",
    "",
    "This is currently delivered through the local development email preview system.",
  ].filter(Boolean);

  const safeGreetingName = escapeHtml(greetingName);
  const safeReceiptNumber = escapeHtml(input.receiptNumber);
  const safePlanName = escapeHtml(input.planName);
  const safePlanDescription = escapeHtml(input.planDescription);
  const safeAmount = escapeHtml(amount);
  const safeCapturedAt = escapeHtml(capturedAt);
  const safeProviderLabel = escapeHtml(providerLabel);
  const safeProviderOrderId = input.providerOrderId
    ? escapeHtml(input.providerOrderId)
    : null;
  const safeProviderCaptureId = input.providerCaptureId
    ? escapeHtml(input.providerCaptureId)
    : null;
  const safeEntitlementSummary = escapeHtml(input.entitlementSummary);
  const safeDownloadLimit = escapeHtml(downloadLimit);
  const safeDuration = escapeHtml(duration);

  return {
    subject: `Receipt ${input.receiptNumber} — ${input.planName}`,
    text: textLines.join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 680px;">
        <p>Hi ${safeGreetingName},</p>
        <p>Thanks for your <strong>CV Builder</strong> purchase.</p>

        <div style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;margin:20px 0;background:#f8fafc;">
          <h1 style="font-size:20px;margin:0 0 12px;">Receipt ${safeReceiptNumber}</h1>
          <p style="margin:4px 0;"><strong>Plan:</strong> ${safePlanName}</p>
          <p style="margin:4px 0;"><strong>Description:</strong> ${safePlanDescription}</p>
          <p style="margin:4px 0;"><strong>Amount:</strong> ${safeAmount}</p>
          <p style="margin:4px 0;"><strong>Paid at:</strong> ${safeCapturedAt}</p>
          <p style="margin:4px 0;"><strong>Payment provider:</strong> ${safeProviderLabel}</p>
          ${
            safeProviderOrderId
              ? `<p style="margin:4px 0;"><strong>Provider order ID:</strong> ${safeProviderOrderId}</p>`
              : ""
          }
          ${
            safeProviderCaptureId
              ? `<p style="margin:4px 0;"><strong>Provider capture ID:</strong> ${safeProviderCaptureId}</p>`
              : ""
          }
        </div>

        <div style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;margin:20px 0;">
          <h2 style="font-size:16px;margin:0 0 12px;">Entitlement details</h2>
          <ul style="margin:0;padding-left:20px;">
            <li>${safeEntitlementSummary}</li>
            <li>Templates unlocked: ${input.templateLimit}</li>
            <li>${safeDownloadLimit}</li>
            <li>${safeDuration}</li>
          </ul>
        </div>

        <p style="font-size:13px;color:#475569;">
          This receipt does not include resume body content.
        </p>
        <p style="font-size:13px;color:#475569;">
          This is currently delivered through the local development email preview system.
        </p>
      </div>
    `,
  };
}