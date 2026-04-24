import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { revokeSupportAccessGrant } from "@/lib/privacy/support-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const grant = await revokeSupportAccessGrant({
      grantor: user,
      grantId: id,
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Failed to revoke support access grant:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to revoke support access grant",
      },
      { status: 400 }
    );
  }
}