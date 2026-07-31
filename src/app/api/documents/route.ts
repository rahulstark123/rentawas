import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/documents - Fetch tenant documents filtered by workspaceId, propertyId, unitId, tenantId, or profileId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const propertyId = searchParams.get("propertyId");
    const unitId = searchParams.get("unitId");
    const tenantId = searchParams.get("tenantId");
    const profileId = searchParams.get("profileId");
    const landlordOnly = searchParams.get("landlordOnly");
    const isDocsParam = searchParams.get("isDocs");

    const whereClause: any = {};
    if (workspaceId) whereClause.workspaceId = Number(workspaceId);
    if (propertyId) whereClause.propertyId = propertyId;
    if (unitId) whereClause.unitId = unitId;
    if (tenantId) whereClause.tenantId = tenantId;
    if (profileId) whereClause.profileId = profileId;

    if (isDocsParam === "true" || landlordOnly === "true") {
      whereClause.OR = [
        { isDocs: true },
        { docType: { notIn: ["Govt ID", "Tenant ID Proof", "Aadhaar Card", "Passport", "PAN Card", "ID Proof", "Profile Photo"] } },
      ];
    }

    const docs = await prisma.tenantDocument.findMany({
      where: whereClause,
      include: {
        tenant: true,
        unit: true,
        property: true,
        profile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error: any) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant documents", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create tenant document record with Cloudflare R2 fileUrl
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      docType,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      tenantId,
      unitId,
      propertyId,
      workspaceId,
      profileId,
      floorNumber,
      isDocs,
    } = body;

    if (!fileUrl || !title) {
      return NextResponse.json({ error: "Document title and R2 fileUrl are required." }, { status: 400 });
    }

    const docData: any = {
      title: title.trim(),
      docType: docType || "Lease Agreement",
      fileUrl,
      fileName: fileName || title,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      floorNumber: floorNumber ? Number(floorNumber) : 1,
      isDocs: typeof isDocs === "boolean" ? isDocs : true,
    };

    if (tenantId) docData.tenant = { connect: { id: tenantId } };
    if (unitId) docData.unit = { connect: { id: unitId } };
    if (propertyId) docData.property = { connect: { id: propertyId } };
    if (workspaceId) docData.workspace = { connect: { wid: Number(workspaceId) } };
    if (profileId) docData.profile = { connect: { id: profileId } };

    let doc;
    try {
      doc = await prisma.tenantDocument.create({
        data: docData,
        include: {
          tenant: true,
          unit: true,
          property: true,
          profile: true,
        },
      });
    } catch (createErr: any) {
      console.warn("Retrying document creation without isDocs field fallback...", createErr?.message);
      delete docData.isDocs;
      doc = await prisma.tenantDocument.create({
        data: docData,
        include: {
          tenant: true,
          unit: true,
          property: true,
          profile: true,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Tenant document "${doc.title}" saved to database!`,
        data: doc,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant document", details: error?.message },
      { status: 500 }
    );
  }
}
