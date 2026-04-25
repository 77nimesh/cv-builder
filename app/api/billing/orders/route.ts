import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { findAccessibleResume } from "@/lib/auth/resume-access";
import { buildAbsoluteUrl } from "@/lib/email/mailer";
import {
  BILLING_MODES,
  BILLING_PLAN_CODES,
  BILLING_PLAN_STATUSES,
  PAYMENT_PROVIDER_ENVIRONMENTS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "@/lib/billing/types";
import {
  createPayPalOrder,
  findPayPalApprovalUrl,
  PayPalApiError,
} from "@/lib/billing/paypal";

const createBillingOrderSchema = z.object({
  planCode: z.string().trim().min(1),
  resumeId: z.string().trim().min(1).optional(),
});

function getPayPalEnvironment() {
  return process.env.PAYPAL_ENV === "live"
    ? PAYMENT_PROVIDER_ENVIRONMENTS.LIVE
    : PAYMENT_PROVIDER_ENVIRONMENTS.SANDBOX;
}

export async function POST(req: NextRequest) {
  let paymentId: string | null = null;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createBillingOrderSchema.parse(await req.json());

    if (body.planCode !== BILLING_PLAN_CODES.SINGLE_EXPORT) {
      return NextResponse.json(
        {
          error:
            "Only the Single Export Pack is available for PayPal sandbox purchases in this stage.",
        },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: {
        code: body.planCode,
      },
    });

    if (!plan) {
      return NextResponse.json(
        {
          error:
            "Billing plan was not found. Run npm run db:seed after the D.2 migration.",
        },
        { status: 404 }
      );
    }

    if (
      plan.status !== BILLING_PLAN_STATUSES.ACTIVE ||
      !plan.isPublic ||
      plan.billingMode !== BILLING_MODES.ONE_TIME ||
      plan.amountCents <= 0
    ) {
      return NextResponse.json(
        {
          error: "This plan is not available for purchase.",
        },
        { status: 400 }
      );
    }

    if (plan.exportResumeScoped && !body.resumeId) {
      return NextResponse.json(
        {
          error: "This plan requires a resumeId.",
        },
        { status: 400 }
      );
    }

    if (body.resumeId) {
      const resume = await findAccessibleResume(user, body.resumeId);

      if (!resume) {
        return NextResponse.json(
          {
            error: "Resume not found.",
          },
          { status: 404 }
        );
      }
    }

    const idempotencyKey = randomUUID();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        resumeId: body.resumeId ?? null,
        provider: PAYMENT_PROVIDERS.PAYPAL,
        providerEnvironment: getPayPalEnvironment(),
        status: PAYMENT_STATUSES.CREATED,
        amountCents: plan.amountCents,
        currency: plan.currency,
        idempotencyKey,
        metadata: {
          planCode: plan.code,
          phase: "D.4",
          receiptEmailPendingUntilStage: "D.6",
        },
      },
    });

    paymentId = payment.id;

    const order = await createPayPalOrder({
      paymentId: payment.id,
      idempotencyKey,
      plan,
      returnUrl: buildAbsoluteUrl(
        `/billing/paypal/return?paymentId=${encodeURIComponent(payment.id)}`
      ),
      cancelUrl: buildAbsoluteUrl(
        `/billing/paypal/cancel?paymentId=${encodeURIComponent(payment.id)}`
      ),
    });

    const approvalUrl = findPayPalApprovalUrl(order);

    if (!approvalUrl || !order.id) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PAYMENT_STATUSES.FAILED,
          failedAt: new Date(),
          providerOrderPayload: order as Prisma.InputJsonValue,
          rawProviderStatus: order.status ?? null,
          metadata: {
            error: "PayPal order did not include an approval URL.",
          },
        },
      });

      return NextResponse.json(
        {
          error: "PayPal order did not include an approval URL.",
        },
        { status: 502 }
      );
    }

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        providerOrderId: order.id,
        rawProviderStatus: order.status ?? null,
        approvalUrl,
        providerOrderPayload: order as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      providerOrderId: order.id,
      approvalUrl,
    });
  } catch (error) {
    console.error("Failed to create billing order:", error);

    if (paymentId) {
      await prisma.payment
        .updateMany({
          where: {
            id: paymentId,
            status: PAYMENT_STATUSES.CREATED,
          },
          data: {
            status: PAYMENT_STATUSES.FAILED,
            failedAt: new Date(),
            metadata: {
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown order creation failure.",
            },
          },
        })
        .catch((updateError) => {
          console.error("Failed to mark payment as failed:", updateError);
        });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid billing order request.",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof PayPalApiError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create billing order.",
      },
      { status: 500 }
    );
  }
}