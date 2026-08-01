import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseWorkspaceId(searchParams: URLSearchParams, bodyWid?: unknown): number | null {
  const raw =
    searchParams.get("workspaceId") ||
    searchParams.get("wid") ||
    (bodyWid != null ? String(bodyWid) : null);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// GET /api/documents?workspaceId=3&landlordOnly=true
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = parseWorkspaceId(searchParams);
    const propertyId = searchParams.get("propertyId");
    const unitId = searchParams.get("unitId");
    const tenantId = searchParams.get("tenantId");
    const profileId = searchParams.get("profileId");
    const landlordOnly = searchParams.get("landlordOnly");
    const isDocsParam = searchParams.get("isDocs");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    // Scope by workspace: document.workspaceId OR linked property/tenant in this workspace
    const whereClause: any = {
      AND: [
        {
          OR: [
            { workspaceId },
            { property: { workspaceId } },
            { tenant: { workspaceId } },
            { unit: { property: { workspaceId } } },
          ],
        },
      ],
    };

    if (propertyId) whereClause.AND.push({ propertyId });
    if (unitId) whereClause.AND.push({ unitId });
    if (tenantId) whereClause.AND.push({ tenantId });
    if (profileId) whereClause.AND.push({ profileId });

    if (isDocsParam === "true" || landlordOnly === "true") {
      whereClause.AND.push({
        OR: [
          { isDocs: true },
          {
            docType: {
              notIn: [
                "Govt ID",
                "Tenant ID Proof",
                "Aadhaar Card",
                "Passport",
                "PAN Card",
                "ID Proof",
                "Profile Photo",
              ],
            },
          },
        ],
      });
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

    // Extra safety: drop docs whose property/tenant clearly belongs to another workspace
    const scoped = docs.filter((d) => {
      if (d.workspaceId === workspaceId) return true;
      if (d.property?.workspaceId === workspaceId) return true;
      if (d.tenant?.workspaceId === workspaceId) return true;
      // Allow workspace-scoped docs with no property/tenant yet (landlord vault uploads)
      if (d.workspaceId == null && !d.propertyId && !d.tenantId) return false;
      return false;
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      count: scoped.length,
      data: scoped,
    });
  } catch (error: any) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant documents", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create document (requires workspaceId / wid)
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
      workspaceId: bodyWorkspaceId,
      wid,
      profileId,
      floorNumber,
      isDocs,
    } = body;

    const workspaceId = parseWorkspaceId(new URLSearchParams(), bodyWorkspaceId ?? wid);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    if (!fileUrl || !title) {
      return NextResponse.json(
        { error: "Document title and R2 fileUrl are required." },
        { status: 400 }
      );
    }

    // If property is provided, verify it belongs to this workspace
    if (propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: propertyId, workspaceId },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Property not found in this workspace." },
          { status: 403 }
        );
      }
    }

    if (tenantId) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          id: tenantId,
          OR: [
            { workspaceId },
            { property: { workspaceId } },
            { unit: { property: { workspaceId } } },
          ],
        },
      });
      if (!tenant) {
        return NextResponse.json(
          { error: "Tenant not found in this workspace." },
          { status: 403 }
        );
      }
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
      workspace: { connect: { wid: workspaceId } },
    };

    if (tenantId) docData.tenant = { connect: { id: tenantId } };
    if (unitId) docData.unit = { connect: { id: unitId } };
    if (propertyId) docData.property = { connect: { id: propertyId } };
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
        message: `Document "${doc.title}" saved successfully!`,
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
