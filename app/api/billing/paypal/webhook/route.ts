import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let eventPayload: unknown = null;

  try {
    eventPayload = await req.json();
  } catch {
    eventPayload = null;
  }

  console.warn(
    "PayPal webhook received but not processed yet. Signature verification will be implemented before trusting webhook events.",
    eventPayload
  );

  return NextResponse.json(
    {
      received: false,
      processed: false,
      reason:
        "PayPal webhook signature verification is not implemented in Stage D.4.",
    },
    { status: 501 }
  );
}