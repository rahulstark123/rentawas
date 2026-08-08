import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";
import {
  emptyUnreadCountResponse,
  isInAppNotificationDbError,
} from "@/lib/in-app-notification-api";

// GET /api/notifications/unread-count?userId=...
export async function GET(request: Request) {
  try {
    const profile = await resolveRequestProfile(request);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    let count = 0;
    try {
      count = await prisma.inAppNotification.count({
        where: {
          profileId: profile.id,
          readAt: null,
        },
      });
    } catch (dbError) {
      if (isInAppNotificationDbError(dbError)) {
        console.warn("[notifications] InAppNotification DB not ready:", dbError);
        return emptyUnreadCountResponse();
      }
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error: unknown) {
    if (isInAppNotificationDbError(error)) {
      return emptyUnreadCountResponse();
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/notifications/unread-count error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unread count.", details: message },
      { status: 500 }
    );
  }
}
