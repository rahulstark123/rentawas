import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";
import { parsePagination, paginationMeta } from "@/lib/apiPagination";

function parseWorkspaceFilter(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("wid") || searchParams.get("workspaceId");
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !Number.isNaN(n) && n > 0 ? n : null;
}

// GET /api/notifications?page=1&limit=10&wid=3
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
    const workspaceId = parseWorkspaceFilter(searchParams);

    const where = {
      profileId: profile.id,
      ...(workspaceId ? { workspaceId } : {}),
    };

    const total = await prisma.inAppNotification.count({ where });

    const rows = await prisma.inAppNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    });

    const data = rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      type: row.type,
      workspaceId: row.workspaceId,
      data:
        row.data && typeof row.data === "object" && !Array.isArray(row.data)
          ? (row.data as Record<string, string>)
          : {},
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: paginationMeta(total, pagination, data.length),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications.", details: message },
      { status: 500 }
    );
  }
}
