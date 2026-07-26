import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/maintenance/[id] - Fetch single ticket
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ticket = await prisma.maintenance.findUnique({
      where: { id },
      include: { tenant: true, unit: true, property: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch ticket", details: error?.message }, { status: 500 });
  }
}

// PATCH /api/maintenance/[id] - Update ticket (Status, Category, Priority, Notes, Cost, LoggedBy)
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, category, priority, issue, notes, cost, loggedBy, tenantId } = body;

    const existing = await prisma.maintenance.findUnique({ where: { id } });
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

// DELETE /api/maintenance/[id] - Delete ticket
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.maintenance.findUnique({ where: { id } });
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
