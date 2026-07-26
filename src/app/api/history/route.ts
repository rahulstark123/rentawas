import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/history - Fetch room history records filtered by workspaceId, propertyId, unitId, or tenantId
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

    const historyRecords = await prisma.roomHistory.findMany({
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
      count: historyRecords.length,
      data: historyRecords,
    });
  } catch (error: any) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room history", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/history - Record past resident exit / room history log
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      period,
      rent,
      status,
      review,
      rating,
      removalReason,
      depositSettlement,
      keysReturned,
      tenantId,
      unitId,
      propertyId,
      workspaceId,
      floorNumber,
      moveIn,
      moveOut,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Resident name is required." }, { status: 400 });
    }

    const historyData: any = {
      name: name.trim(),
      period: period || "2025 - 2026",
      rent: rent ? (typeof rent === "number" ? `$${rent.toLocaleString()}/mo` : rent) : "$0/mo",
      status: status || "Lease Completed",
      review: review || null,
      rating: rating ? Number(rating) : 5,
      removalReason: removalReason || null,
      depositSettlement: depositSettlement || "Full Deposit Refunded",
      keysReturned: keysReturned !== false,
      floorNumber: floorNumber ? Number(floorNumber) : 1,
      moveIn: moveIn ? new Date(moveIn) : null,
      moveOut: moveOut ? new Date(moveOut) : new Date(),
    };

    if (tenantId) historyData.tenant = { connect: { id: tenantId } };
    if (unitId) historyData.unit = { connect: { id: unitId } };
    if (propertyId) historyData.property = { connect: { id: propertyId } };
    if (workspaceId) historyData.workspace = { connect: { wid: Number(workspaceId) } };

    const record = await prisma.roomHistory.create({
      data: historyData,
      include: {
        tenant: true,
        unit: true,
        property: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Historical record for "${record.name}" saved successfully!`,
        data: record,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/history error:", error);
    return NextResponse.json(
      { error: "Failed to record room history", details: error?.message },
      { status: 500 }
    );
  }
}
