import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id]/history - Fetch database past resident room history logs
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

    // Query real RoomHistory from PostgreSQL
    const historyLogs = await prisma.roomHistory.findMany({
      where: { unitId: unit.id },
      include: {
        tenant: true,
        property: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for client UI
    const formattedHistory = historyLogs.map((h) => ({
      id: h.id,
      name: h.name,
      period: h.period,
      rent: h.rent,
      status: h.status,
      review: h.review,
      rating: h.rating || 5,
      removalReason: h.removalReason,
      depositSettlement: h.depositSettlement,
      keysReturned: h.keysReturned,
      floorNumber: h.floorNumber || unit?.floorNumber || 1,
      tenantId: h.tenantId,
      propertyId: h.propertyId || unit?.propertyId,
    }));

    return NextResponse.json({
      success: true,
      unitId: unit.id,
      count: formattedHistory.length,
      data: formattedHistory,
    });
  } catch (error: any) {
    console.error("GET /api/units/[id]/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history logs", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/units/[id]/history - Record past resident exit / room history log
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: unitId } = await params;
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
      propertyId,
      moveIn,
      moveOut,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Resident name is required." }, { status: 400 });
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
      floorNumber: unit ? unit.floorNumber : 1,
      moveIn: moveIn ? new Date(moveIn) : null,
      moveOut: moveOut ? new Date(moveOut) : new Date(),
    };

    if (unit?.id) historyData.unit = { connect: { id: unit.id } };
    const resolvedPropId = unit ? unit.propertyId : propertyId;
    if (resolvedPropId) historyData.property = { connect: { id: resolvedPropId } };
    if (unit?.workspaceId) historyData.workspace = { connect: { wid: unit.workspaceId } };
    if (tenantId) historyData.tenant = { connect: { id: tenantId } };

    const historyRecord = await prisma.roomHistory.create({
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
        message: `Historical room record for "${historyRecord.name}" archived in database!`,
        data: historyRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/units/[id]/history error:", error);
    return NextResponse.json(
      { error: "Failed to record history log", details: error?.message },
      { status: 500 }
    );
  }
}
