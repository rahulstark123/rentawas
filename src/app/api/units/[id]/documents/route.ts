import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id]/documents - Fetch real database documents for unit and occupants
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    let unit = await prisma.unit.findUnique({
      where: { id },
      include: { tenants: true },
    });

    if (!unit) {
      unit = await prisma.unit.findFirst({
        where: {
          AND: [
            {
              OR: [
                { unitNumber: id },
                { unitNumber: `Unit ${id}` },
                { unitNumber: id.replace("Unit ", "") },
              ],
            },
            ...(propertyId ? [{ propertyId }] : []),
          ],
        },
        include: { tenants: true },
      });
    }

    if (!unit) {
      return NextResponse.json({
        success: true,
        unitId: id,
        count: 0,
        data: [],
      });
    }

    // Query TenantDocument records for unit
    const dbDocs = await prisma.tenantDocument.findMany({
      where: { unitId: unit.id },
      include: { tenant: true, profile: true },
      orderBy: { createdAt: "desc" },
    });

    const docsList: any[] = [];

    // Add dbDocs
    dbDocs.forEach((d) => {
      docsList.push({
        id: d.id,
        title: d.title,
        docType: d.docType,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileSize: d.fileSize || "PDF Document",
        occupantName: d.tenant?.name || d.profile?.fullName || "Occupant",
        tenantId: d.tenantId,
        profileId: d.profileId,
        uploadedAt: new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      });
    });

    // Also include occupant government ID and lease docs from Tenant table
    (unit.tenants || []).forEach((t) => {
      if (t.govIdUrl && !docsList.some((d) => d.fileUrl === t.govIdUrl)) {
        docsList.push({
          id: `GOV-${t.id}`,
          title: `Government ID (${t.govIdType || "National ID"}) — ${t.name}`,
          docType: "Government ID",
          fileUrl: t.govIdUrl,
          fileName: `${t.name.toLowerCase().replace(/\s+/g, "_")}_govid.pdf`,
          fileSize: "Scan Document",
          occupantName: t.name,
          tenantId: t.id,
          profileId: t.profileId,
          uploadedAt: t.leaseStart ? new Date(t.leaseStart).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
        });
      }
      if (t.leaseDocUrl && !docsList.some((d) => d.fileUrl === t.leaseDocUrl)) {
        docsList.push({
          id: `LEASE-${t.id}`,
          title: `Signed Residential Lease Agreement — ${t.name}`,
          docType: "Lease Agreement",
          fileUrl: t.leaseDocUrl,
          fileName: `${t.name.toLowerCase().replace(/\s+/g, "_")}_lease.pdf`,
          fileSize: "Signed Agreement",
          occupantName: t.name,
          tenantId: t.id,
          profileId: t.profileId,
          uploadedAt: t.leaseStart ? new Date(t.leaseStart).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
        });
      }
    });

    return NextResponse.json({
      success: true,
      unitId: unit.id,
      count: docsList.length,
      data: docsList,
    });
  } catch (error: any) {
    console.error("GET /api/units/[id]/documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit documents", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/units/[id]/documents - Add document record for unit
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: unitId } = await params;
    const body = await request.json();
    const {
      title,
      docType,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      tenantId,
      profileId,
      propertyId,
    } = body;

    if (!fileUrl || !title) {
      return NextResponse.json({ error: "Title and R2 fileUrl are required." }, { status: 400 });
    }

    let unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      unit = await prisma.unit.findFirst({
        where: {
          AND: [
            {
              OR: [
                { unitNumber: unitId },
                { unitNumber: `Unit ${unitId}` },
                { unitNumber: unitId.replace("Unit ", "") },
              ],
            },
            ...(propertyId ? [{ propertyId }] : []),
          ],
        },
      });
    }

    const docData: any = {
      title: title.trim(),
      docType: docType || "Lease Agreement",
      fileUrl,
      fileName: fileName || title,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      floorNumber: unit ? unit.floorNumber : 1,
    };

    if (unit?.id) docData.unit = { connect: { id: unit.id } };
    const resolvedPropId = unit ? unit.propertyId : propertyId;
    if (resolvedPropId) docData.property = { connect: { id: resolvedPropId } };
    if (unit?.workspaceId) docData.workspace = { connect: { wid: unit.workspaceId } };
    if (tenantId) docData.tenant = { connect: { id: tenantId } };
    if (profileId) docData.profile = { connect: { id: profileId } };

    const docRecord = await prisma.tenantDocument.create({
      data: docData,
      include: {
        tenant: true,
        unit: true,
        property: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Document "${docRecord.title}" attached to unit in database!`,
        data: docRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/units/[id]/documents error:", error);
    return NextResponse.json(
      { error: "Failed to create document record", details: error?.message },
      { status: 500 }
    );
  }
}
