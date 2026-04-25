import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  capturePayPalOrder,
  findCompletedPayPalCapture,
  paypalAmountValueToCents,
  PayPalApiError,
} from "@/lib/billing/paypal";
import {
  markPaymentFailed,
  markPayPalPaymentCapturedAndIssueEntitlement,
} from "@/lib/billing/payments";
import { sendPaymentReceiptForPayment } from "@/lib/billing/receipts";

function redirectWithStatus(
  req: NextRequest,
  status: string,
  paymentId?: string
) {
  const redirectUrl = new URL("/resumes", req.url);
  redirectUrl.searchParams.set("payment", status);

  if (paymentId) {
    redirectUrl.searchParams.set("paymentId", paymentId);
  }

  return NextResponse.redirect(redirectUrl);
}

function redirectToSuccess(req: NextRequest, paymentId: string) {
  const redirectUrl = new URL("/billing/success", req.url);
  redirectUrl.searchParams.set("paymentId", paymentId);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const paymentId = req.nextUrl.searchParams.get("paymentId");
  const token = req.nextUrl.searchParams.get("token");

  if (!paymentId || !token) {
    return redirectWithStatus(req, "missing_payment");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      providerOrderId: token,
      userId: user.id,
    },
    include: {
      plan: true,
    },
  });

  if (!payment) {
    return redirectWithStatus(req, "not_found");
  }

  try {
    const captureOrder = await capturePayPalOrder({
      providerOrderId: token,
      idempotencyKey: `${payment.id}-capture`,
    });

    const capture = findCompletedPayPalCapture(captureOrder);

    if (captureOrder.status !== "COMPLETED" || !capture?.id) {
      await markPaymentFailed({
        paymentId: payment.id,
        reason: "PayPal order was not completed.",
        metadata: captureOrder as Prisma.InputJsonValue,
      });

      return redirectWithStatus(req, "failed", payment.id);
    }

    const captureCurrency = capture.amount?.currency_code;
    const captureValue = capture.amount?.value;

    if (!captureCurrency || !captureValue) {
      await markPaymentFailed({
        paymentId: payment.id,
        reason: "PayPal capture did not include amount details.",
        metadata: captureOrder as Prisma.InputJsonValue,
      });

      return redirectWithStatus(req, "failed", payment.id);
    }

    const capturedAmountCents = paypalAmountValueToCents(captureValue);

    if (
      captureCurrency !== payment.currency ||
      capturedAmountCents !== payment.amountCents
    ) {
      await markPaymentFailed({
        paymentId: payment.id,
        reason: "PayPal capture amount or currency mismatch.",
        metadata: {
          expected: {
            amountCents: payment.amountCents,
            currency: payment.currency,
          },
          actual: {
            amountCents: capturedAmountCents,
            currency: captureCurrency,
          },
          captureOrder,
        } as Prisma.InputJsonValue,
      });

      return redirectWithStatus(req, "amount_mismatch", payment.id);
    }

    const captureResult = await markPayPalPaymentCapturedAndIssueEntitlement({
      paymentId: payment.id,
      providerOrderId: token,
      providerCaptureId: capture.id,
      providerPayerId: captureOrder.payer?.payer_id ?? null,
      rawProviderStatus: captureOrder.status ?? null,
      providerCapturePayload: captureOrder as Prisma.InputJsonValue,
    });

    await sendPaymentReceiptForPayment({
      paymentId: captureResult.payment.id,
    }).catch((receiptError) => {
      console.error("Payment captured but receipt email failed:", receiptError);
    });

    return redirectToSuccess(req, captureResult.payment.id);
  } catch (error) {
    console.error("Failed to capture PayPal payment:", error);

    await markPaymentFailed({
      paymentId: payment.id,
      reason:
        error instanceof Error
          ? error.message
          : "Unknown PayPal capture failure.",
    }).catch((updateError) => {
      console.error("Failed to mark PayPal payment failed:", updateError);
    });

    if (error instanceof PayPalApiError) {
      return redirectWithStatus(req, "paypal_error", payment.id);
    }

    return redirectWithStatus(req, "failed", payment.id);
  }
}