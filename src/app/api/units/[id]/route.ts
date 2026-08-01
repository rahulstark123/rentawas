import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id] - Fetch single unit with tenants
// Accepts optional ?propertyId=xxx and ?wid=xxx to scope lookup precisely
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : NaN;

    // 1. Try direct UUID lookup first
    let unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        tenants: true,
        property: true,
      },
    });

    // 2. Try by unitNumber scoped to property (and workspace via property)
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

      if (!isNaN(wid) && wid > 0) {
        whereClause.property = { workspaceId: wid };
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

    // Workspace gate when wid is provided
    if (!isNaN(wid) && wid > 0) {
      const unitWid = unit.workspaceId ?? unit.property?.workspaceId;
      if (unitWid != null && unitWid !== wid) {
        return NextResponse.json(
          { error: "Forbidden: Unit does not belong to specified workspace ID." },
          { status: 403 }
        );
      }
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
