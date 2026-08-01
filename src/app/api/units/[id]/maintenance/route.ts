import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id]/maintenance - Fetch database maintenance tickets for unit
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    let unit = await prisma.unit.findUnique({
      where: { id },
      include: { tenants: true },
    });

    if (!unit) {
      unit = await prisma.unit.findFirst({
        where: {
          AND: [
            {
              OR: [
                { unitNumber: id },
                { unitNumber: `Unit ${id}` },
                { unitNumber: id.replace("Unit ", "") },
              ],
            },
            ...(propertyId ? [{ propertyId }] : []),
          ],
        },
        include: { tenants: true },
      });
    }

    if (!unit) {
      return NextResponse.json({
        success: true,
        unitId: id,
        count: 0,
        data: [],
      });
    }

    // Query real maintenance records from PostgreSQL
    const tickets = await prisma.maintenance.findMany({
      where: { unitId: unit.id },
      include: {
        tenant: true,
        property: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for client UI
    const formattedTickets = tickets.map((t) => ({
      id: t.ticketNumber || t.id,
      realId: t.id,
      ticketNumber: t.ticketNumber,
      issue: t.issue,
      category: t.category,
      priority: t.priority,
      status: t.status,
      cost: t.cost,
      notes: t.notes,
      floorNumber: t.floorNumber || unit?.floorNumber || 1,
      loggedBy: t.loggedBy || t.tenant?.name || "Resident",
      tenantId: t.tenantId,
      tenantName: t.tenant?.name,
      createdDate: new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    }));

    return NextResponse.json({
      success: true,
      unitId: unit.id,
      count: formattedTickets.length,
      data: formattedTickets,
    });
  } catch (error: any) {
    console.error("GET /api/units/[id]/maintenance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance tickets", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/units/[id]/maintenance - Create new maintenance ticket in database
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: unitId } = await params;
    const body = await request.json();
    const { issue, category, priority, status, tenantId, notes, cost, propertyId, loggedBy } = body;

    if (!issue || !issue.trim()) {
      return NextResponse.json({ error: "Maintenance issue description is required." }, { status: 400 });
    }

    let unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      unit = await prisma.unit.findFirst({
        where: {
          AND: [
            {
              OR: [
                { unitNumber: unitId },
                { unitNumber: `Unit ${unitId}` },
                { unitNumber: unitId.replace("Unit ", "") },
              ],
            },
            ...(propertyId ? [{ propertyId }] : []),
          ],
        },
      });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${randomNum}`;

    let submitterName = loggedBy || "Admin / Management";
    if (tenantId) {
      const t = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (t) submitterName = `${t.name} (Tenant)`;
    }

    const maintenanceData: any = {
      ticketNumber,
      issue: issue.trim(),
      category: category || "General Repair",
      priority: priority || "Normal",
      status: status || "Open",
      cost: cost ? parseFloat(cost) : 0,
      notes: notes || null,
      loggedBy: submitterName,
      floorNumber: unit ? unit.floorNumber : 1,
    };

    if (unit?.id) maintenanceData.unit = { connect: { id: unit.id } };
    const resolvedPropId = unit ? unit.propertyId : propertyId;
    if (resolvedPropId) maintenanceData.property = { connect: { id: resolvedPropId } };

    let resolvedWid = unit?.workspaceId ?? null;
    if (!resolvedWid && resolvedPropId) {
      const prop = await prisma.property.findUnique({
        where: { id: resolvedPropId },
        select: { workspaceId: true },
      });
      resolvedWid = prop?.workspaceId ?? null;
    }
    if (resolvedWid) maintenanceData.workspace = { connect: { wid: resolvedWid } };

    if (tenantId) maintenanceData.tenant = { connect: { id: tenantId } };

    const ticket = await prisma.maintenance.create({
      data: maintenanceData,
      include: {
        tenant: true,
        property: true,
        unit: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Maintenance Ticket ${ticket.ticketNumber} logged successfully!`,
        data: ticket,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/units/[id]/maintenance error:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance ticket", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/units/[id]/maintenance - Update ticket status or details
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status, category, priority, notes, cost } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required for update." }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (cost !== undefined) updateData.cost = parseFloat(cost);

    const updated = await prisma.maintenance.update({
      where: { id: ticketId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Ticket updated successfully!`,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/units/[id]/maintenance error:", error);
    return NextResponse.json({ error: "Failed to update ticket", details: error?.message }, { status: 500 });
  }
}

// DELETE /api/units/[id]/maintenance - Delete ticket by ticketId
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId parameter is required." }, { status: 400 });
    }

    await prisma.maintenance.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({
      success: true,
      message: "Maintenance ticket deleted successfully!",
    });
  } catch (error: any) {
    console.error("DELETE /api/units/[id]/maintenance error:", error);
    return NextResponse.json({ error: "Failed to delete ticket", details: error?.message }, { status: 500 });
  }
}
