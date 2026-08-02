import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id]/units?wid=1
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, workspaceId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (widParam) {
      const wid = parseInt(widParam, 10);
      if (isNaN(wid) || property.workspaceId !== wid) {
        return NextResponse.json(
          { error: "Forbidden: Property does not belong to specified workspace ID." },
          { status: 403 }
        );
      }
    }

    const units = await prisma.unit.findMany({
      where: { propertyId: id },
      include: {
        tenants: true,
      },
      orderBy: [{ floorNumber: "asc" }, { unitNumber: "asc" }],
    });

    return NextResponse.json({
      success: true,
      propertyId: id,
      workspaceId: property.workspaceId,
      count: units.length,
      data: units,
    });
  } catch (error: any) {
    console.error("GET /api/properties/[id]/units error:", error);
    return NextResponse.json(
      { error: "Failed to fetch units", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/units
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: propertyId } = await params;
    const body = await request.json();
    const { unitNumber, floorNumber = 1, rent = 0, isOccupied = false, wid } = body;

    if (!unitNumber) {
      return NextResponse.json(
        { error: "unitNumber is required." },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, workspaceId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (wid != null) {
      const workspaceId = parseInt(String(wid), 10);
      if (!isNaN(workspaceId) && property.workspaceId !== workspaceId) {
        return NextResponse.json(
          { error: "Forbidden: Property does not belong to specified workspace ID." },
          { status: 403 }
        );
      }
    }

    const targetFloor = parseInt(floorNumber, 10) || 1;

    const { assertWorkspaceQuota } = await import("@/lib/planQuotaServer");
    const quota = await assertWorkspaceQuota({
      workspaceId: property.workspaceId,
      action: "unit",
      unitsToAdd: 1,
    });
    if (!quota.ok) {
      return NextResponse.json(
        { error: quota.message, code: quota.code },
        { status: 403 }
      );
    }

    // Check duplicate unit on same floor for this property
    const existing = await prisma.unit.findFirst({
      where: {
        propertyId,
        floorNumber: targetFloor,
        unitNumber,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Unit "${unitNumber}" already exists on Floor ${targetFloor}.` },
        { status: 400 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId,
        workspaceId: property.workspaceId,
        unitNumber,
        floorNumber: parseInt(floorNumber, 10) || 1,
        rent: parseFloat(rent) || 0,
        isOccupied: Boolean(isOccupied),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Unit "${unit.unitNumber}" added to Property!`,
        data: unit,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/properties/[id]/units error:", error);
    return NextResponse.json(
      { error: "Failed to create unit", details: error?.message },
      { status: 500 }
    );
  }
}
