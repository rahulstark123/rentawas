import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string; unitId: string }>;
}

// PATCH /api/properties/[id]/units/[unitId]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id: propertyId, unitId } = await params;
    const body = await request.json();
    const { unitNumber, floorNumber, rent, isOccupied } = body;

    const existingUnit = await prisma.unit.findFirst({
      where: {
        AND: [
          ...(propertyId ? [{ propertyId }] : []),
          {
            OR: [
              { id: unitId },
              { unitNumber: unitId },
              { unitNumber: `Unit ${unitId}` },
              { unitNumber: unitId.replace("Unit ", "") },
            ],
          },
        ],
      },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { error: "Unit not found for this property" },
        { status: 404 }
      );
    }

    const updatedUnit = await prisma.unit.update({
      where: { id: existingUnit.id },
      data: {
        ...(unitNumber && { unitNumber }),
        ...(floorNumber !== undefined && { floorNumber: parseInt(floorNumber, 10) }),
        ...(rent !== undefined && { rent: parseFloat(rent) }),
        ...(isOccupied !== undefined && { isOccupied: Boolean(isOccupied) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Unit "${updatedUnit.unitNumber}" updated!`,
      data: updatedUnit,
    });
  } catch (error: any) {
    console.error("PATCH /api/properties/[id]/units/[unitId] error:", error);
    return NextResponse.json(
      { error: "Failed to update unit", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]/units/[unitId]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id: propertyId, unitId } = await params;

    const existingUnit = await prisma.unit.findFirst({
      where: {
        AND: [
          ...(propertyId ? [{ propertyId }] : []),
          {
            OR: [
              { id: unitId },
              { unitNumber: unitId },
              { unitNumber: `Unit ${unitId}` },
              { unitNumber: unitId.replace("Unit ", "") },
            ],
          },
        ],
      },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { error: "Unit not found for this property" },
        { status: 404 }
      );
    }

    await prisma.unit.delete({
      where: { id: existingUnit.id },
    });

    return NextResponse.json({
      success: true,
      message: `Unit "${existingUnit.unitNumber}" deleted!`,
    });
  } catch (error: any) {
    console.error("DELETE /api/properties/[id]/units/[unitId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete unit", details: error?.message },
      { status: 500 }
    );
  }
}
