import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { markPaymentCancelled } from "@/lib/billing/payments";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const paymentId = req.nextUrl.searchParams.get("paymentId");
  const token = req.nextUrl.searchParams.get("token");

  if (paymentId) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id,
      },
      select: {
        id: true,
        providerOrderId: true,
      },
    });

    if (payment) {
      await markPaymentCancelled({
        paymentId: payment.id,
        providerOrderId: token ?? payment.providerOrderId,
      }).catch((error) => {
        console.error("Failed to mark payment as cancelled:", error);
      });
    }
  }

  return NextResponse.redirect(new URL("/resumes?payment=cancelled", req.url));
}