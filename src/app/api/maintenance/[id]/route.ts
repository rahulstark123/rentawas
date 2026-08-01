import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

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

async function findTicketInWorkspace(id: string, workspaceId: number) {
  return prisma.maintenance.findFirst({
    where: {
      id,
      OR: [
        { workspaceId },
        { property: { workspaceId } },
        { unit: { property: { workspaceId } } },
        { tenant: { workspaceId } },
      ],
    },
    include: { tenant: true, unit: true, property: true },
  });
}

// GET /api/maintenance/[id]?workspaceId=3
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const workspaceId = parseWorkspaceId(request);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const ticket = await findTicketInWorkspace(id, workspaceId);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch ticket", details: error?.message }, { status: 500 });
  }
}

// PATCH /api/maintenance/[id] - Update ticket (scoped to workspace)
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, category, priority, issue, notes, cost, loggedBy, tenantId, workspaceId: bodyWid, wid } = body;
    const workspaceId = parseWorkspaceId(request, bodyWid ?? wid);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const existing = await findTicketInWorkspace(id, workspaceId);
    if (!existing) {
      return NextResponse.json({ error: "Maintenance ticket not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (issue !== undefined) updateData.issue = issue.trim();
    if (notes !== undefined) updateData.notes = notes;
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (loggedBy !== undefined) updateData.loggedBy = loggedBy;
    // Backfill workspace on older tickets that only had property/unit linkage
    if (existing.workspaceId == null) {
      updateData.workspace = { connect: { wid: workspaceId } };
    }

    if (tenantId) {
      updateData.tenant = { connect: { id: tenantId } };
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: updateData,
      include: { tenant: true, unit: true, property: true },
    });

    return NextResponse.json({
      success: true,
      message: `Maintenance ticket ${updated.ticketNumber} updated to "${updated.status}"!`,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/maintenance/[id] error:", error);
    return NextResponse.json({ error: "Failed to update ticket", details: error?.message }, { status: 500 });
  }
}

// DELETE /api/maintenance/[id]?workspaceId=3
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const workspaceId = parseWorkspaceId(request);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const existing = await findTicketInWorkspace(id, workspaceId);
    if (!existing) {
      return NextResponse.json({ error: "Maintenance ticket not found" }, { status: 404 });
    }

    await prisma.maintenance.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Maintenance ticket ${existing.ticketNumber} deleted successfully!`,
    });
  } catch (error: any) {
    console.error("DELETE /api/maintenance/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete ticket", details: error?.message }, { status: 500 });
  }
}
