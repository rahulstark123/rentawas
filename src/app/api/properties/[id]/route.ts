import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id]?wid=1
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            tenants: true,
          },
          orderBy: [{ floorNumber: "asc" }, { unitNumber: "asc" }],
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Workspace scoping check if wid is provided
    if (widParam) {
      const wid = parseInt(widParam, 10);
      if (!isNaN(wid) && property.workspaceId !== wid) {
        return NextResponse.json(
          { error: "Forbidden: Property does not belong to specified workspace ID." },
          { status: 403 }
        );
      }
    }

    // Group units by floor number
    const floorMap: Record<number, any[]> = {};
    property.units.forEach((unit) => {
      if (!floorMap[unit.floorNumber]) {
        floorMap[unit.floorNumber] = [];
      }
      floorMap[unit.floorNumber].push(unit);
    });

    return NextResponse.json({
      success: true,
      data: {
        ...property,
        floorMap,
      },
    });
  } catch (error: any) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property details", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { wid, name, category, pincode, address, floors, unitsPerFloor } = body;

    // Verify property existence
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (wid) {
      const workspaceId = parseInt(wid, 10);
      if (!isNaN(workspaceId) && existingProperty.workspaceId !== workspaceId) {
        return NextResponse.json(
          { error: "Forbidden: Property does not belong to specified workspace ID." },
          { status: 403 }
        );
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(pincode !== undefined && { pincode }),
        ...(address && { address }),
        ...(floors && { floors: parseInt(floors, 10) }),
        ...(unitsPerFloor && { unitsPerFloor: parseInt(unitsPerFloor, 10) }),
      },
      include: {
        units: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Property "${updatedProperty.name}" updated successfully!`,
      data: updatedProperty,
    });
  } catch (error: any) {
    console.error("PATCH /api/properties/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update property", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (widParam) {
      const wid = parseInt(widParam, 10);
      if (!isNaN(wid) && existingProperty.workspaceId !== wid) {
        return NextResponse.json(
          { error: "Forbidden: Property does not belong to specified workspace ID." },
          { status: 403 }
        );
      }
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Property "${existingProperty.name}" deleted successfully!`,
    });
  } catch (error: any) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete property", details: error?.message },
      { status: 500 }
    );
  }
}
