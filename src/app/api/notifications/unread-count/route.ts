import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";

function parseWorkspaceFilter(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("wid") || searchParams.get("workspaceId");
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !Number.isNaN(n) && n > 0 ? n : null;
}

// GET /api/notifications/unread-count?wid=3
export async function GET(request: Request) {
  try {
    const profile = await resolveRequestProfile(request);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = parseWorkspaceFilter(searchParams);

    const count = await prisma.inAppNotification.count({
      where: {
        profileId: profile.id,
        readAt: null,
        ...(workspaceId ? { workspaceId } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/notifications/unread-count error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unread count.", details: message },
      { status: 500 }
    );
  }
}
