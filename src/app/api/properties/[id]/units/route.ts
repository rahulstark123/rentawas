import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id]/units
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

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
    const { unitNumber, floorNumber = 1, rent = 0, isOccupied = false } = body;

    if (!unitNumber) {
      return NextResponse.json(
        { error: "unitNumber is required." },
        { status: 400 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId,
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
