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

    let targetUnitId = unitId;
    let targetPropId = propertyId;
    let targetWid = workspaceId ? Number(workspaceId) : null;
    let targetFloor = floorNumber ? Number(floorNumber) : 1;

    // Resolve unit from database if unitId is a unit number string or cuid
    if (unitId && typeof unitId === "string") {
      let u = await prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });
      if (!u) {
        u = await prisma.unit.findFirst({
          where: {
            OR: [
              { unitNumber: unitId },
              { unitNumber: `Unit ${unitId}` },
              { unitNumber: unitId.replace("Unit ", "") },
            ],
            ...(propertyId ? { propertyId } : {}),
          },
          include: { property: true },
        });
      }
      if (u) {
        targetUnitId = u.id;
        targetPropId = targetPropId || u.propertyId;
        targetWid = targetWid || u.workspaceId || u.property?.workspaceId || null;
        targetFloor = u.floorNumber || targetFloor;
      }
    }

    if (!targetWid) {
      return NextResponse.json(
        { success: false, error: "Workspace ID (workspaceId) is required." },
        { status: 400 }
      );
    }

    const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
    const historyDenied = await requireWorkspaceMutate(targetWid);
    if (historyDenied) return historyDenied;

    const historyData: any = {
      name: name.trim(),
      period: period || "2025 - 2026",
      rent: rent ? (typeof rent === "number" ? `$${rent.toLocaleString()}/mo` : rent) : "$0/mo",
      status: status || "Lease Completed",
      review: review || null,
      rating: rating ? Number(rating) : 5,
      healthScore: body.healthScore ? Number(body.healthScore) : (status === "Removed / Evicted" ? 45 : 85),
      removalReason: removalReason || null,
      depositSettlement: depositSettlement || "Full Deposit Refunded",
      keysReturned: keysReturned !== false,
      floorNumber: targetFloor,
      moveIn: moveIn ? new Date(moveIn) : null,
      moveOut: moveOut ? new Date(moveOut) : new Date(),
    };

    if (tenantId) historyData.tenant = { connect: { id: tenantId } };
    if (targetUnitId) historyData.unit = { connect: { id: targetUnitId } };
    if (targetPropId) historyData.property = { connect: { id: targetPropId } };
    if (targetWid) historyData.workspace = { connect: { wid: targetWid } };

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
