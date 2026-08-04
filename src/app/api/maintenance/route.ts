import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePagination, paginationMeta } from "@/lib/apiPagination";

function parseWorkspaceId(searchParams: URLSearchParams, bodyWid?: unknown): number | null {
  const raw =
    searchParams.get("workspaceId") ||
    searchParams.get("wid") ||
    (bodyWid != null ? String(bodyWid) : null);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

function workspaceScope(workspaceId: number) {
  return {
    OR: [
      { workspaceId },
      { property: { workspaceId } },
      { unit: { property: { workspaceId } } },
      { tenant: { workspaceId } },
    ],
  };
}

const maintenanceListSelect = {
  id: true,
  ticketNumber: true,
  issue: true,
  category: true,
  priority: true,
  status: true,
  cost: true,
  notes: true,
  loggedBy: true,
  floorNumber: true,
  workspaceId: true,
  tenantId: true,
  unitId: true,
  propertyId: true,
  createdAt: true,
  updatedAt: true,
  tenant: { select: { id: true, name: true } },
  unit: { select: { id: true, unitNumber: true, floorNumber: true } },
  property: { select: { id: true, name: true } },
} as const;

// GET /api/maintenance?workspaceId=3 — tickets for this workspace only
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = parseWorkspaceId(searchParams);
    const propertyId = searchParams.get("propertyId");
    const unitId = searchParams.get("unitId");
    const tenantId = searchParams.get("tenantId");
    const pagination = parsePagination(searchParams);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const whereClause: any = {
      AND: [workspaceScope(workspaceId)],
    };
    if (propertyId) whereClause.AND.push({ propertyId });
    if (unitId) whereClause.AND.push({ unitId });
    if (tenantId) whereClause.AND.push({ tenantId });

    const [total, tickets] = await Promise.all([
      prisma.maintenance.count({ where: whereClause }),
      prisma.maintenance.findMany({
        where: whereClause,
        select: maintenanceListSelect,
        orderBy: { createdAt: "desc" },
        ...(pagination.take != null
          ? { take: pagination.take, skip: pagination.skip }
          : {}),
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: tickets.length,
      pagination: paginationMeta(total, pagination, tickets.length),
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

// POST /api/maintenance - Log new maintenance ticket (scoped to workspace)
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
      workspaceId: bodyWorkspaceId,
      wid,
      notes,
      cost,
      floorNumber,
      loggedBy,
    } = body;

    const workspaceId = parseWorkspaceId(new URLSearchParams(), bodyWorkspaceId ?? wid);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    if (!issue || !issue.trim()) {
      return NextResponse.json({ error: "Maintenance issue description is required." }, { status: 400 });
    }

    // Prefer explicit property/unit workspace; fall back to body wid
    let resolvedWid = workspaceId;
    if (propertyId) {
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { workspaceId: true },
      });
      if (!prop || prop.workspaceId !== workspaceId) {
        return NextResponse.json(
          { error: "Property not found in this workspace." },
          { status: 403 }
        );
      }
      resolvedWid = prop.workspaceId;
    } else if (unitId) {
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
        select: { workspaceId: true, property: { select: { workspaceId: true } } },
      });
      const unitWid = unit?.workspaceId ?? unit?.property?.workspaceId;
      if (!unit || unitWid !== workspaceId) {
        return NextResponse.json(
          { error: "Unit not found in this workspace." },
          { status: 403 }
        );
      }
      resolvedWid = unitWid;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${randomNum}`;

    let submitterName = loggedBy || "Admin / Management";
    if (tenantId) {
      const t = await prisma.tenant.findFirst({
        where: {
          id: tenantId,
          OR: [
            { workspaceId: resolvedWid },
            { property: { workspaceId: resolvedWid } },
            { unit: { property: { workspaceId: resolvedWid } } },
          ],
        },
      });
      if (!t) {
        return NextResponse.json(
          { error: "Tenant not found in this workspace." },
          { status: 403 }
        );
      }
      submitterName = `${t.name} (Tenant)`;
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
      workspace: { connect: { wid: resolvedWid } },
    };

    if (tenantId) maintenanceData.tenant = { connect: { id: tenantId } };
    if (unitId) maintenanceData.unit = { connect: { id: unitId } };
    if (propertyId) maintenanceData.property = { connect: { id: propertyId } };

    const ticket = await prisma.maintenance.create({
      data: maintenanceData,
      select: maintenanceListSelect,
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
