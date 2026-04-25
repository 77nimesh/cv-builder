import type { PaymentReceipt, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendAppEmail, type StoredEmail } from "@/lib/email/mailer";
import { buildPaymentReceiptEmail } from "@/lib/email/templates";
import {
  PAYMENT_STATUSES,
  RECEIPT_STATUSES,
} from "@/lib/billing/types";

type ReceiptSendResult = {
  receipt: PaymentReceipt;
  email: StoredEmail | null;
  alreadySent: boolean;
};

function formatReceiptDatePart(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function buildReceiptNumber(input: { paymentId: string; date: Date }) {
  const suffix = input.paymentId.slice(-8).toUpperCase();
  return `RB-${formatReceiptDatePart(input.date)}-${suffix}`;
}

function toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function sendPaymentReceiptForPayment(input: {
  paymentId: string;
}): Promise<ReceiptSendResult> {
  const payment = await prisma.payment.findUnique({
    where: {
      id: input.paymentId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      plan: true,
      receipt: true,
    },
  });

  if (!payment) {
    throw new Error("Payment was not found.");
  }

  if (payment.status !== PAYMENT_STATUSES.CAPTURED) {
    throw new Error("Receipt can only be sent after payment capture.");
  }

  if (payment.receipt?.status === RECEIPT_STATUSES.SENT) {
    return {
      receipt: payment.receipt,
      email: null,
      alreadySent: true,
    };
  }

  const capturedAt = payment.capturedAt ?? new Date();
  const receiptNumber =
    payment.receipt?.receiptNumber ??
    buildReceiptNumber({
      paymentId: payment.id,
      date: capturedAt,
    });

  const subject = `Receipt ${receiptNumber} — ${payment.plan.name}`;

  const receipt =
    payment.receipt ??
    (await prisma.paymentReceipt.create({
      data: {
        paymentId: payment.id,
        userId: payment.userId,
        receiptNumber,
        status: RECEIPT_STATUSES.PENDING,
        emailTo: payment.user.email,
        subject,
        metadata: toJsonValue({
          paymentId: payment.id,
          planCode: payment.plan.code,
          provider: payment.provider,
          providerEnvironment: payment.providerEnvironment,
          providerOrderId: payment.providerOrderId,
          providerCaptureId: payment.providerCaptureId,
          resumeScoped: Boolean(payment.resumeId),
          note: "Development receipt generated through local email preview.",
        }),
      },
    }));

  const emailTemplate = buildPaymentReceiptEmail({
    name: payment.user.name,
    receiptNumber,
    planName: payment.plan.name,
    planDescription: payment.plan.description,
    amountCents: payment.amountCents,
    currency: payment.currency,
    provider: payment.provider,
    providerEnvironment: payment.providerEnvironment,
    providerOrderId: payment.providerOrderId,
    providerCaptureId: payment.providerCaptureId,
    capturedAt,
    entitlementSummary: payment.plan.exportResumeScoped
      ? "Resume-scoped export entitlement"
      : "Account export entitlement",
    templateLimit: payment.plan.templateLimit,
    downloadLimit: payment.plan.downloadLimit,
    entitlementDurationDays: payment.plan.entitlementDurationDays,
  });

  try {
    const email = await sendAppEmail({
      to: payment.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
      purpose: "payment_receipt",
    });

    const updatedReceipt = await prisma.paymentReceipt.update({
      where: {
        id: receipt.id,
      },
      data: {
        status: RECEIPT_STATUSES.SENT,
        emailTo: payment.user.email,
        subject: emailTemplate.subject,
        devEmailPreviewId: email.id,
        devEmailPreviewUrl: email.previewUrl,
        sentAt: new Date(),
        metadata: toJsonValue({
          paymentId: payment.id,
          planCode: payment.plan.code,
          provider: payment.provider,
          providerEnvironment: payment.providerEnvironment,
          providerOrderId: payment.providerOrderId,
          providerCaptureId: payment.providerCaptureId,
          resumeScoped: Boolean(payment.resumeId),
          devEmailPreviewId: email.id,
          devEmailPreviewUrl: email.previewUrl,
        }),
      },
    });

    return {
      receipt: updatedReceipt,
      email,
      alreadySent: false,
    };
  } catch (error) {
    await prisma.paymentReceipt.update({
      where: {
        id: receipt.id,
      },
      data: {
        status: RECEIPT_STATUSES.FAILED,
        metadata: toJsonValue({
          paymentId: payment.id,
          planCode: payment.plan.code,
          error:
            error instanceof Error
              ? error.message
              : "Unknown receipt email failure.",
        }),
      },
    });

    throw error;
  }
}