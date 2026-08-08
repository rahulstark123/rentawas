import { NextResponse } from "next/server";

/** DB migration pending or schema mismatch — don't break the mobile inbox UI. */
export function isInAppNotificationDbError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "P2021" || code === "P2010" || code === "P2022") return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/InAppNotification/i.test(message) && /does not exist|relation/i.test(message)) {
    return true;
  }
  // Column mismatch (e.g. workspaceId / wid not on table yet)
  if (/inAppNotification/i.test(message) && /column/i.test(message)) {
    return true;
  }
  return false;
}

export function emptyNotificationsResponse(pagination: {
  page: number;
  take: number | undefined;
  skip: number;
  all: boolean;
}) {
  const limit = pagination.take ?? 10;
  return NextResponse.json({
    success: true,
    data: [],
    pagination: {
      page: pagination.page,
      limit,
      total: 0,
      totalPages: 1,
      hasMore: false,
    },
    migrationPending: true,
  });
}

export function emptyUnreadCountResponse() {
  return NextResponse.json({
    success: true,
    data: { count: 0 },
    migrationPending: true,
  });
}

export function widFromNotificationData(data: unknown): number | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  const raw = record.wid ?? record.workspaceId;
  if (raw == null) return null;
  const n = parseInt(String(raw), 10);
  return !Number.isNaN(n) && n > 0 ? n : null;
}

/** Prisma select — avoids optional workspaceId column until migration is applied. */
export const IN_APP_NOTIFICATION_SELECT = {
  id: true,
  title: true,
  body: true,
  type: true,
  data: true,
  readAt: true,
  createdAt: true,
} as const;
