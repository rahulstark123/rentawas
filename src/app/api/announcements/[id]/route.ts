import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseWorkspaceId(request: Request, bodyWid?: unknown): number | null {
  const { searchParams } = new URL(request.url);
  const raw =
    searchParams.get("workspaceId") ||
    searchParams.get("wid") ||
    (bodyWid != null ? String(bodyWid) : null);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

async function findInWorkspace(id: string, workspaceId: number) {
  return prisma.announcement.findFirst({
    where: { id, workspaceId },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workspaceId = parseWorkspaceId(request);

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const existing = await findInWorkspace(id, workspaceId);
    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
    const announcementDeleteDenied = await requireWorkspaceMutate(workspaceId);
    if (announcementDeleteDenied) return announcementDeleteDenied;

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/announcements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const workspaceId = parseWorkspaceId(request, body.workspaceId ?? body.wid);

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const existing = await findInWorkspace(id, workspaceId);
    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
    const announcementPatchDenied = await requireWorkspaceMutate(workspaceId);
    if (announcementPatchDenied) return announcementPatchDenied;

    const {
      title,
      content,
      category,
      priority,
      targetScope,
      targetProperties,
      targetTenants,
      isPinned,
      creatorName,
    } = body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(targetScope !== undefined ? { targetScope } : {}),
        ...(targetProperties !== undefined ? { targetProperties } : {}),
        ...(targetTenants !== undefined ? { targetTenants } : {}),
        ...(isPinned !== undefined ? { isPinned } : {}),
        ...(creatorName !== undefined ? { creatorName } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Announcement updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/announcements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update announcement", details: error?.message },
      { status: 500 }
    );
  }
}
