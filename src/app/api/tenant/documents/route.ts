import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tenant/documents?workspaceId=1 or ?tenantId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    const workspaceIdParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam, 10) : null;

    const whereClause: any = {};
    if (tenantId) whereClause.tenantId = tenantId;
    if (workspaceId && !isNaN(workspaceId)) whereClause.workspaceId = workspaceId;

    const docs = await prisma.tenantDocument.findMany({
      where: whereClause,
      include: {
        tenant: true,
        property: true,
        unit: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error: any) {
    console.error("GET /api/tenant/documents error:", error);
    return NextResponse.json({ error: "Failed to fetch tenant documents", details: error?.message }, { status: 500 });
  }
}

// POST /api/tenant/documents - Resident submits new document
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      fileName,
      fileSize,
      fileUrl,
      tenantId,
      workspaceId: bodyWid,
    } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: "Document title and fileUrl are required" }, { status: 400 });
    }

    let tenant = null;
    if (tenantId && tenantId !== "demo-tenant-id") {
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { property: true, unit: true },
      });
    }

    const wid = tenant?.workspaceId || (bodyWid ? parseInt(String(bodyWid), 10) : null);

    const docData: any = {
      title: title.trim(),
      docType: category || "Resident Upload",
      fileName: fileName || title,
      fileSize: fileSize || "850 KB",
      fileUrl,
      isDocs: true,
      uploadedBy: "tenant",
      floorNumber: tenant?.unit?.floorNumber || 1,
    };

    if (wid && !isNaN(wid)) {
      docData.workspace = { connect: { wid } };
    }
    if (tenant?.id) {
      docData.tenant = { connect: { id: tenant.id } };
    }
    if (tenant?.unitId) {
      docData.unit = { connect: { id: tenant.unitId } };
    }
    if (tenant?.propertyId) {
      docData.property = { connect: { id: tenant.propertyId } };
    }

    const createdDoc = await prisma.tenantDocument.create({
      data: docData,
      include: {
        tenant: true,
        property: true,
        unit: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: createdDoc,
    });
  } catch (error: any) {
    console.error("POST /api/tenant/documents error:", error);
    return NextResponse.json({ error: "Failed to upload resident document", details: error?.message }, { status: 500 });
  }
}

// PATCH /api/tenant/documents - Landlord verifies or updates status of document
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Document ID and status are required" }, { status: 400 });
    }

    const updatedDoc = await prisma.tenantDocument.update({
      where: { id },
      data: {
        docType: status === "Verified" ? "Verified Resident Record" : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDoc,
    });
  } catch (error: any) {
    console.error("PATCH /api/tenant/documents error:", error);
    return NextResponse.json({ error: "Failed to update document status", details: error?.message }, { status: 500 });
  }
}
