import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserResumePhotoAssets } from "@/lib/assets/image-assets";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await listUserResumePhotoAssets(user.id);

    return NextResponse.json({
      assets,
    });
  } catch (error) {
    console.error("Failed to list image assets:", error);
    return NextResponse.json(
      { error: "Failed to load image library" },
      { status: 500 }
    );
  }
}