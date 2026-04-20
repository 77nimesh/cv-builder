import { NextRequest, NextResponse } from "next/server";
import {
  deleteUserResumePhotoAsset,
  ImageAssetInUseError,
} from "@/lib/assets/image-assets";
import { getCurrentUser } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const deletedAsset = await deleteUserResumePhotoAsset({
      assetId: id,
      userId: user.id,
    });

    if (!deletedAsset) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedAssetId: deletedAsset.id,
    });
  } catch (error) {
    console.error("Failed to delete image asset:", error);

    if (error instanceof ImageAssetInUseError) {
      return NextResponse.json(
        {
          error: error.message,
          resumeUsageCount: error.resumeUsageCount,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}