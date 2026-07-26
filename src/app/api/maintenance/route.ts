import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/maintenance - Fetch all maintenance tickets filtered by workspaceId, propertyId, unitId, or tenantId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const propertyId = searchParams.get("propertyId");
    const unitId = searchParams.get("unitId");
    const tenantId = searchParams.get("tenantId");

    const whereClause: any = {};
    if (workspaceId) whereClause.workspaceId = Number(workspaceId);
    if (propertyId) whereClause.propertyId = propertyId;
    if (unitId) whereClause.unitId = unitId;
    if (tenantId) whereClause.tenantId = tenantId;

    const tickets = await prisma.maintenance.findMany({
      where: whereClause,
      include: {
        tenant: true,
        unit: true,
        property: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error: any) {
    console.error("GET /api/maintenance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance tickets", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Log new maintenance ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      issue,
      category,
      priority,
      status,
      tenantId,
      unitId,
      propertyId,
      workspaceId,
      notes,
      cost,
      floorNumber,
      loggedBy,
    } = body;

    if (!issue || !issue.trim()) {
      return NextResponse.json({ error: "Maintenance issue description is required." }, { status: 400 });
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
      floorNumber: floorNumber ? Number(floorNumber) : 1,
    };

    if (tenantId) maintenanceData.tenant = { connect: { id: tenantId } };
    if (unitId) maintenanceData.unit = { connect: { id: unitId } };
    if (propertyId) maintenanceData.property = { connect: { id: propertyId } };
    if (workspaceId) maintenanceData.workspace = { connect: { wid: Number(workspaceId) } };

    const ticket = await prisma.maintenance.create({
      data: maintenanceData,
      include: {
        tenant: true,
        unit: true,
        property: true,
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
    console.error("POST /api/maintenance error:", error);
    return NextResponse.json(
      { error: "Failed to log maintenance ticket", details: error?.message },
      { status: 500 }
    );
  }
}
