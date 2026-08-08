import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";
import { parsePagination, paginationMeta } from "@/lib/apiPagination";
import {
  emptyNotificationsResponse,
  isInAppNotificationDbError,
  IN_APP_NOTIFICATION_SELECT,
  widFromNotificationData,
} from "@/lib/in-app-notification-api";

// GET /api/notifications?page=1&limit=10&userId=...
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
    const pagination = parsePagination(searchParams);

    const where = { profileId: profile.id };

    let total = 0;
    let rows: Array<{
      id: string;
      title: string;
      body: string;
      type: string;
      data: unknown;
      readAt: Date | null;
      createdAt: Date;
    }> = [];

    try {
      total = await prisma.inAppNotification.count({ where });
      rows = await prisma.inAppNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
        select: IN_APP_NOTIFICATION_SELECT,
      });
    } catch (dbError) {
      if (isInAppNotificationDbError(dbError)) {
        console.warn("[notifications] InAppNotification DB not ready:", dbError);
        return emptyNotificationsResponse(pagination);
      }
      throw dbError;
    }

    const data = rows.map((row) => {
      const payload =
        row.data && typeof row.data === "object" && !Array.isArray(row.data)
          ? (row.data as Record<string, string>)
          : {};

      return {
        id: row.id,
        title: row.title,
        body: row.body,
        type: row.type,
        workspaceId: widFromNotificationData(row.data),
        data: payload,
        readAt: row.readAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: paginationMeta(total, pagination, data.length),
    });
  } catch (error: unknown) {
    if (isInAppNotificationDbError(error)) {
      const { searchParams } = new URL(request.url);
      const pagination = parsePagination(searchParams);
      return emptyNotificationsResponse(pagination);
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications.", details: message },
      { status: 500 }
    );
  }
}
