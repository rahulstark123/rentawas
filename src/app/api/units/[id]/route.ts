import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id] - Fetch single unit with tenants
// Accepts optional ?propertyId=xxx to scope lookup precisely
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    // 1. Try direct UUID lookup first
    let unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        tenants: true,
        property: true,
      },
    });

    // 2. Try by unitNumber scoped to property
    if (!unit) {
      const whereClause: any = {
        OR: [
          { unitNumber: id },
          { unitNumber: `Unit ${id}` },
          { unitNumber: id.replace("Unit ", "") },
        ],
      };

      if (propertyId) {
        whereClause.propertyId = propertyId;
      }

      unit = await prisma.unit.findFirst({
        where: whereClause,
        include: {
          tenants: true,
          property: true,
        },
        orderBy: [
          { isOccupied: "desc" },
          { createdAt: "desc" },
        ],
      });
    }

    // 3. Return empty vacant fallback if still not found
    if (!unit) {
      const cleanNum = id.replace(/\D/g, "");
      const formattedNum = cleanNum ? `Unit ${cleanNum}` : id;
      return NextResponse.json({
        success: true,
        data: {
          id: id,
          unitNumber: formattedNum,
          floorNumber: parseInt(cleanNum.charAt(0) || "1", 10) || 1,
          rent: 0,
          isOccupied: false,
          tenants: [],
          property: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error: any) {
    console.error("GET /api/units/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit", details: error?.message },
      { status: 500 }
    );
  }
}
