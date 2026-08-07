import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/properties/auto-receipt?workspaceId=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const wid = Number(workspaceId);

    if (!workspaceId || isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const properties = await prisma.property.findMany({
      where: { workspaceId: wid },
      select: {
        id: true,
        name: true,
        address: true,
        autoReceiptEnabled: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (error: any) {
    console.error("GET /api/properties/auto-receipt error:", error);
    return NextResponse.json(
      { error: "Failed to fetch auto-receipt settings.", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/auto-receipt — toggle auto receipt per property
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, propertyId, autoReceiptEnabled } = body;

    const wid = Number(workspaceId);
    if (!wid || isNaN(wid) || !propertyId) {
      return NextResponse.json(
        { error: "workspaceId and propertyId are required." },
        { status: 400 }
      );
    }

    const property = await prisma.property.findFirst({
      where: { id: String(propertyId), workspaceId: wid },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: { autoReceiptEnabled: Boolean(autoReceiptEnabled) },
      select: {
        id: true,
        name: true,
        autoReceiptEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Auto receipt ${updated.autoReceiptEnabled ? "enabled" : "disabled"} for ${updated.name}.`,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/properties/auto-receipt error:", error);
    return NextResponse.json(
      { error: "Failed to update auto-receipt setting.", details: error?.message },
      { status: 500 }
    );
  }
}
