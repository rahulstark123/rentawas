import { prisma } from "@/lib/prisma";

export type InAppNotificationPayload = {
  title: string;
  body: string;
  type?: string;
  workspaceId?: number | null;
  data?: Record<string, string>;
};

function inferNotificationType(data?: Record<string, string>): string {
  if (!data) return "general";
  if (data.type) return String(data.type);
  const screen = String(data.screen || "").toLowerCase();
  if (!screen) return "general";
  return screen;
}

function inferWorkspaceId(
  data?: Record<string, string>,
  explicit?: number | null
): number | null {
  if (explicit != null && !Number.isNaN(explicit)) return explicit;
  const raw = data?.wid || data?.workspaceId;
  if (!raw) return null;
  const n = parseInt(String(raw), 10);
  return !Number.isNaN(n) && n > 0 ? n : null;
}

/** Persist inbox rows for profiles (independent of FCM device registration). */
export async function createInAppNotificationsForProfiles(
  profileIds: string[],
  payload: InAppNotificationPayload
) {
  const uniqueIds = [...new Set(profileIds.filter(Boolean))];
  if (uniqueIds.length === 0) return { count: 0 };

  const type = payload.type || inferNotificationType(payload.data);
  const workspaceId = inferWorkspaceId(payload.data, payload.workspaceId);

  try {
    const result = await prisma.inAppNotification.createMany({
      data: uniqueIds.map((profileId) => ({
        profileId,
        workspaceId,
        title: payload.title,
        body: payload.body,
        type,
        data: payload.data ?? {},
      })),
    });
    return result;
  } catch (error) {
    // Non-blocking: live pushes must keep working if migration is pending
    console.warn("[in-app-notifications] Could not persist inbox row:", error);
    return { count: 0 };
  }
}

export function buildInAppPayloadFromPush(payload: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): InAppNotificationPayload {
  return {
    title: payload.title,
    body: payload.body,
    type: inferNotificationType(payload.data),
    workspaceId: inferWorkspaceId(payload.data),
    data: payload.data,
  };
}
