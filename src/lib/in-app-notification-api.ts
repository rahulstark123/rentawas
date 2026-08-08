import { NextResponse } from "next/server";

/** DB migration pending — don't break the mobile inbox UI. */
export function isMissingInAppNotificationTable(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "P2021" || code === "P2010") return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /InAppNotification/i.test(message) && /does not exist|relation/i.test(message);
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
