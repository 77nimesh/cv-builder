import type { Payment, Plan, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ENTITLEMENT_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/billing/types";

type CapturedPaymentWithPlan = Payment & {
  plan: Plan;
};

export class BillingPaymentError extends Error {
  status: number;

  constructor(input: { message: string; status?: number }) {
    super(input.message);
    this.name = "BillingPaymentError";
    this.status = input.status ?? 400;
  }
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildEntitlementDates(plan: Pick<Plan, "entitlementDurationDays">) {
  const startsAt = new Date();
  const expiresAt =
    plan.entitlementDurationDays === null
      ? null
      : addDays(startsAt, plan.entitlementDurationDays);

  return {
    startsAt,
    expiresAt,
  };
}

async function issueEntitlementForCapturedPaymentTx(
  tx: Prisma.TransactionClient,
  payment: CapturedPaymentWithPlan
) {
  const existingEntitlement = await tx.entitlement.findFirst({
    where: {
      paymentId: payment.id,
      status: ENTITLEMENT_STATUSES.ACTIVE,
    },
  });

  if (existingEntitlement) {
    return existingEntitlement;
  }

  const { startsAt, expiresAt } = buildEntitlementDates(payment.plan);

  return tx.entitlement.create({
    data: {
      userId: payment.userId,
      planId: payment.planId,
      paymentId: payment.id,
      resumeId: payment.resumeId,
      status: ENTITLEMENT_STATUSES.ACTIVE,
      source: "payment",
      templateLimit: payment.plan.templateLimit,
      exportEnabled: payment.plan.exportEnabled,
      exportResumeScoped: payment.plan.exportResumeScoped,
      downloadLimit: payment.plan.downloadLimit,
      downloadsUsed: 0,
      startsAt,
      expiresAt,
      metadata: {
        provider: payment.provider,
        providerEnvironment: payment.providerEnvironment,
        planCode: payment.plan.code,
      },
    },
  });
}

export async function markPayPalPaymentCapturedAndIssueEntitlement(input: {
  paymentId: string;
  providerOrderId: string;
  providerCaptureId: string;
  providerPayerId: string | null;
  rawProviderStatus: string | null;
  providerCapturePayload: Prisma.InputJsonValue;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: {
        id: input.paymentId,
        providerOrderId: input.providerOrderId,
      },
      include: {
        plan: true,
      },
    });

    if (!payment) {
      throw new BillingPaymentError({
        message: "Payment record was not found.",
        status: 404,
      });
    }

    if (payment.status === PAYMENT_STATUSES.CAPTURED) {
      const entitlement = await issueEntitlementForCapturedPaymentTx(
        tx,
        payment
      );

      return {
        payment,
        entitlement,
      };
    }

    if (
      payment.status !== PAYMENT_STATUSES.CREATED &&
      payment.status !== PAYMENT_STATUSES.APPROVED
    ) {
      throw new BillingPaymentError({
        message: `Payment cannot be captured from status: ${payment.status}`,
        status: 409,
      });
    }

    const capturedPayment = await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PAYMENT_STATUSES.CAPTURED,
        providerCaptureId: input.providerCaptureId,
        providerPayerId: input.providerPayerId,
        rawProviderStatus: input.rawProviderStatus,
        providerCapturePayload: input.providerCapturePayload,
        approvedAt: payment.approvedAt ?? new Date(),
        capturedAt: new Date(),
        failedAt: null,
        cancelledAt: null,
      },
      include: {
        plan: true,
      },
    });

    const entitlement = await issueEntitlementForCapturedPaymentTx(
      tx,
      capturedPayment
    );

    return {
      payment: capturedPayment,
      entitlement,
    };
  });
}

export async function markPaymentFailed(input: {
  paymentId: string;
  reason: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.payment.updateMany({
    where: {
      id: input.paymentId,
      status: {
        in: [PAYMENT_STATUSES.CREATED, PAYMENT_STATUSES.APPROVED],
      },
    },
    data: {
      status: PAYMENT_STATUSES.FAILED,
      failedAt: new Date(),
      metadata: input.metadata ?? {
        reason: input.reason,
      },
    },
  });
}

export async function markPaymentCancelled(input: {
  paymentId: string;
  providerOrderId?: string | null;
}) {
  await prisma.payment.updateMany({
    where: {
      id: input.paymentId,
      providerOrderId: input.providerOrderId ?? undefined,
      status: {
        in: [PAYMENT_STATUSES.CREATED, PAYMENT_STATUSES.APPROVED],
      },
    },
    data: {
      status: PAYMENT_STATUSES.CANCELLED,
      cancelledAt: new Date(),
    },
  });
}