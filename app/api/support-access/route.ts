import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  canManageSupportAccessGrants,
  canViewSupportMetadata,
} from "@/lib/auth/permissions";
import {
  createSupportAccessGrant,
} from "@/lib/privacy/support-access";
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
  writeAuditLog,
} from "@/lib/privacy/audit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown) {
  const stringValue = readString(value);
  return stringValue || null;
}

function readExpiresAt(body: Record<string, unknown>) {
  const expiresAtRaw = readString(body.expiresAt);

  if (expiresAtRaw) {
    const expiresAt = new Date(expiresAtRaw);

    if (!Number.isNaN(expiresAt.getTime())) {
      return expiresAt;
    }
  }

  const expiresInMinutesRaw = body.expiresInMinutes;
  const expiresInMinutes =
    typeof expiresInMinutesRaw === "number"
      ? expiresInMinutesRaw
      : Number(readString(expiresInMinutesRaw));

  if (Number.isFinite(expiresInMinutes) && expiresInMinutes > 0) {
    return new Date(Date.now() + expiresInMinutes * 60 * 1000);
  }

  return undefined;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canViewSupportMetadata(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await writeAuditLog({
      actor: user,
      action: AUDIT_ACTIONS.SUPPORT_METADATA_VIEWED,
      targetType: AUDIT_TARGET_TYPES.SUPPORT_ACCESS_GRANT,
      metadata: {
        route: "GET /api/support-access",
      },
    }).catch((error) => {
      console.error("Failed to write support access list audit log:", error);
    });

    const grants = await prisma.supportAccessGrant.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        targetResume: {
          select: {
            id: true,
            title: true,
          },
        },
        supportUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        grantedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ grants });
  } catch (error) {
    console.error("Failed to list support access grants:", error);
    return NextResponse.json(
      { error: "Failed to list support access grants" },
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

    if (!canManageSupportAccessGrants(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const grant = await createSupportAccessGrant({
      grantor: user,
      supportUserId: readString(body.supportUserId),
      targetUserId: readString(body.targetUserId),
      targetResumeId: readNullableString(body.targetResumeId),
      reason: readString(body.reason),
      expiresAt: readExpiresAt(body),
    });

    return NextResponse.json({ grant }, { status: 201 });
  } catch (error) {
    console.error("Failed to create support access grant:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create support access grant",
      },
      { status: 400 }
    );
  }
}