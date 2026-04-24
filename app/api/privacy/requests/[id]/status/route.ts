import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updatePrivacyRequestStatus } from "@/lib/privacy/privacy-requests";
import { isPrivacyRequestStatus } from "@/lib/privacy/retention";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const status = readString(body.status);

    if (!isPrivacyRequestStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const privacyRequest = await updatePrivacyRequestStatus({
      actor: user,
      requestId: id,
      status,
      resolutionNotes: readString(body.resolutionNotes),
    });

    if (!privacyRequest) {
      return NextResponse.json(
        { error: "Privacy request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ privacyRequest });
  } catch (error) {
    console.error("Failed to update privacy request status:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update privacy request status",
      },
      { status: 400 }
    );
  }
}