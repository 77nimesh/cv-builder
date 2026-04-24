import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requestAccountDeletion } from "@/lib/privacy/privacy-requests";
import { PRIVACY_REQUEST_TYPES } from "@/lib/privacy/retention";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readReason(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latestRequest = await prisma.privacyRequest.findFirst({
      where: {
        subjectUserId: user.id,
        type: PRIVACY_REQUEST_TYPES.ACCOUNT_DELETION,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ privacyRequest: latestRequest });
  } catch (error) {
    console.error("Failed to fetch account deletion request:", error);
    return NextResponse.json(
      { error: "Failed to fetch account deletion request" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let reason = "";

    try {
      const body = await req.json();

      if (isRecord(body)) {
        reason = readReason(body.reason);
      }
    } catch {
      reason = "";
    }

    const privacyRequest = await requestAccountDeletion({
      actor: user,
      reason,
    });

    return NextResponse.json({ privacyRequest }, { status: 201 });
  } catch (error) {
    console.error("Failed to request account deletion:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to request account deletion",
      },
      { status: 400 }
    );
  }
}