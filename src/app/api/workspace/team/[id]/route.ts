import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/workspace/team/[id]?wid=3
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid") || searchParams.get("workspaceId");
    const wid = widParam ? parseInt(widParam, 10) : NaN;

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    if (!isNaN(wid) && wid > 0 && existing.workspaceId != null && existing.workspaceId !== wid) {
      return NextResponse.json(
        { error: "Forbidden: Team member does not belong to this workspace." },
        { status: 403 }
      );
    }

    if (existing.role === "Owner") {
      return NextResponse.json(
        { error: "Cannot remove Workspace Owner access." },
        { status: 400 }
      );
    }

    if (existing.workspaceId) {
      const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
      const teamDeleteDenied = await requireWorkspaceMutate(existing.workspaceId);
      if (teamDeleteDenied) return teamDeleteDenied;
    }

    await prisma.teamMember.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Access for team member "${existing.name}" revoked successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete team member", details: error?.message },
      { status: 500 }
    );
  }
}
