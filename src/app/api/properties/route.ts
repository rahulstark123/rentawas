import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePagination, paginationMeta } from "@/lib/apiPagination";

// GET /api/properties?wid=1&page=1&limit=50
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : NaN;
    const pagination = parsePagination(searchParams);

    // Require wid so properties never leak across workspaces
    if (!widParam || isNaN(wid) || wid <= 0) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required to list properties." },
        { status: 400 }
      );
    }

    const where = { workspaceId: wid };

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          pincode: true,
          address: true,
          floors: true,
          unitsPerFloor: true,
          totalUnits: true,
          workspaceId: true,
          createdAt: true,
          units: {
            select: {
              id: true,
              isOccupied: true,
              rent: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        ...(pagination.take != null
          ? { take: pagination.take, skip: pagination.skip }
          : {}),
      }),
    ]);

    // Compute live metrics for each property (no tenant blobs)
    const formattedProperties = properties.map((prop) => {
      const occupiedUnits = prop.units.filter((u) => u.isOccupied).length;
      const totalUnits = prop.units.length || prop.totalUnits;
      const totalMonthlyYield = prop.units
        .filter((u) => u.isOccupied)
        .reduce((acc, u) => acc + (u.rent || 0), 0);
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      return {
        id: prop.id,
        name: prop.name,
        category: prop.category,
        pincode: prop.pincode,
        address: prop.address,
        floors: prop.floors,
        unitsPerFloor: prop.unitsPerFloor,
        totalUnits,
        occupiedUnits,
        occupancyRate: `${occupancyRate}%`,
        rawMonthlyYield: totalMonthlyYield,
        monthlyYield: `$${totalMonthlyYield.toLocaleString()}`,
        status: `${occupancyRate}% Occupied`,
        tag: prop.category,
        workspaceId: prop.workspaceId,
        createdAt: prop.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      workspaceId: wid,
      count: formattedProperties.length,
      pagination: paginationMeta(total, pagination, formattedProperties.length),
      data: formattedProperties,
    });
  } catch (error: any) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/properties
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wid, name, category, pincode, address, floors = 1, unitsPerFloor = 4 } = body;

    if (!wid || !name || !address) {
      return NextResponse.json(
        { error: "Missing required fields: wid, name, address are mandatory." },
        { status: 400 }
      );
    }

    const workspaceId = parseInt(wid, 10);
    if (isNaN(workspaceId)) {
      return NextResponse.json(
        { error: "Invalid Workspace ID (wid). Must be an integer." },
        { status: 400 }
      );
    }

    const totalFloorsInt = Math.max(1, parseInt(floors, 10) || 1);
    const unitsPerFloorInt = Math.max(1, parseInt(unitsPerFloor, 10) || 4);
    const totalUnitsCount = totalFloorsInt * unitsPerFloorInt;

    // Ensure target Workspace exists in database to satisfy foreign key constraint
    let workspace = await prisma.workspace.findUnique({
      where: { wid: workspaceId },
    });

    if (workspace) {
      const { assertWorkspaceQuota } = await import("@/lib/planQuotaServer");
      const quota = await assertWorkspaceQuota({
        workspaceId,
        action: "property",
        unitsToAdd: totalUnitsCount,
      });
      if (!quota.ok) {
        return NextResponse.json(
          { error: quota.message, code: quota.code },
          { status: 403 }
        );
      }
    }

    if (!workspace) {
      let ownerProfile = await prisma.profile.findFirst();
      if (!ownerProfile) {
        ownerProfile = await prisma.profile.create({
          data: {
            id: `owner_${Date.now()}`,
            email: "owner@rentawas.com",
            fullName: "Portfolio Owner",
            role: "OWNER",
          },
        });
      }

      workspace = await prisma.workspace.create({
        data: {
          wid: workspaceId,
          name: "Main Portfolio Workspace",
          currency: "USD ($)",
          ownerId: ownerProfile.id,
        },
      });
    }

    // Create Property under specific Workspace ID (wid)
    const property = await prisma.property.create({
      data: {
        workspaceId: workspace.wid,
        name,
        category: category || "Residential Apartment",
        pincode: pincode || "",
        address,
        floors: totalFloorsInt,
        unitsPerFloor: unitsPerFloorInt,
        totalUnits: totalUnitsCount,
      },
    });

    // Auto-generate unit inventory records floor-wise (scoped to same workspace)
    const unitCreatePromises = [];
    for (let fl = 1; fl <= totalFloorsInt; fl++) {
      for (let u = 1; u <= unitsPerFloorInt; u++) {
        const unitNoStr = `Unit ${fl}0${u}`;
        unitCreatePromises.push(
          prisma.unit.create({
            data: {
              propertyId: property.id,
              workspaceId: workspace.wid,
              floorNumber: fl,
              unitNumber: unitNoStr,
              rent: 0,
              isOccupied: false,
            },
          })
        );
      }
    }

    await Promise.all(unitCreatePromises);

    return NextResponse.json(
      {
        success: true,
        message: `Property "${property.name}" created successfully with ${totalUnitsCount} units!`,
        data: property,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to create property", details: error?.message },
      { status: 500 }
    );
  }
}
