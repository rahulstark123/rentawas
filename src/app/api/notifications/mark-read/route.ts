import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";

// POST /api/notifications/mark-read — body: { ids?: string[], all?: boolean, wid?: number }
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const profile = await resolveRequestProfile(request, body);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id)).filter(Boolean)
      : [];
    const markAll = Boolean(body.all);
    const widRaw = body.wid ?? body.workspaceId;
    const workspaceId =
      widRaw != null && !Number.isNaN(parseInt(String(widRaw), 10))
        ? parseInt(String(widRaw), 10)
        : null;

    const baseWhere = {
      profileId: profile.id,
      readAt: null,
      ...(workspaceId ? { workspaceId } : {}),
    };

    if (!markAll && ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provide notification ids or all: true." },
        { status: 400 }
      );
    }

    const result = await prisma.inAppNotification.updateMany({
      where: markAll
        ? baseWhere
        : {
            ...baseWhere,
            id: { in: ids },
          },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: { updated: result.count },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/notifications/mark-read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications read.", details: message },
      { status: 500 }
    );
  }
}
