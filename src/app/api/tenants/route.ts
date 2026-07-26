import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tenants - Fetch all tenants across units
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");
    const propertyId = searchParams.get("propertyId");

    const whereClause: any = {};
    if (unitId) whereClause.unitId = unitId;
    if (propertyId) whereClause.unit = { propertyId };

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: tenants.length,
      data: tenants,
    });
  } catch (error: any) {
    console.error("GET /api/tenants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/tenants - Create new tenant in database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      unitId,
      propertyId,
      monthlyRent,
      leaseStart,
      leaseEnd,
      bedSlot,
      govIdType,
      govIdNumber,
      govIdUrl,
      leaseDocUrl,
      documents,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tenant name is required." }, { status: 400 });
    }

    let targetUnitId = unitId;

    // If unitId is a unit number string (e.g. "Unit 101" or "101"), locate real unit ID
    if (unitId && typeof unitId === "string") {
      let unit = await prisma.unit.findUnique({ where: { id: unitId } });
      if (!unit) {
        unit = await prisma.unit.findFirst({
          where: {
            OR: [
              { unitNumber: unitId },
              { unitNumber: `Unit ${unitId}` },
              { unitNumber: unitId.replace("Unit ", "") },
            ],
            ...(propertyId ? { propertyId } : {}),
          },
        });
      }
      if (unit) {
        targetUnitId = unit.id;
      }
    }

    // Fetch target unit and property to obtain workspaceId
    let targetUnit: any = null;
    let targetWorkspaceId: number | null = null;
    if (targetUnitId) {
      targetUnit = await prisma.unit.findUnique({
        where: { id: targetUnitId },
        include: { property: true },
      });
      targetWorkspaceId = targetUnit?.workspaceId || targetUnit?.property?.workspaceId || null;
    } else if (propertyId) {
      const prop = await prisma.property.findUnique({ where: { id: propertyId } });
      targetWorkspaceId = prop?.workspaceId || null;
    }

    const resolvedPropId = targetUnit ? targetUnit.propertyId : (propertyId || null);

    // Clean phone number: Do not save dummy phone number if user left it blank
    const cleanPhone = phone && typeof phone === "string" && phone.trim() && !phone.trim().endsWith("undefined") ? phone.trim() : "";

    // Compute dynamic health score based on compliance & documentation completeness
    const docList = Array.isArray(documents) ? documents : [];
    const hasGovId = govIdUrl || docList.some((d: any) => d.docType === "Government ID" || d.type === "Passport" || d.type === "Driver's License");
    const hasLeaseDoc = leaseDocUrl || docList.some((d: any) => d.docType === "Lease Agreement");

    let computedHealthScore = 75; // Base score for new tenant
    if (hasGovId) computedHealthScore += 10;
    if (hasLeaseDoc) computedHealthScore += 10;
    if (cleanPhone) computedHealthScore += 5;

    const tenantData: any = {
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@rentawas.com`,
      phone: cleanPhone,
      healthScore: computedHealthScore,
      monthlyRent: monthlyRent ? parseFloat(monthlyRent) : 0,
      securityDeposit: body.securityDeposit ? parseFloat(body.securityDeposit) : 0,
      leaseStart: leaseStart ? new Date(leaseStart) : new Date(),
      leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
      floorNumber: targetUnit ? targetUnit.floorNumber : (body.floorNumber ? Number(body.floorNumber) : 1),
      bedSlot: bedSlot || null,
      govIdType: govIdType || null,
      govIdNumber: govIdNumber || null,
      govIdUrl: govIdUrl || (docList.find((d: any) => d.fileUrl)?.fileUrl || null),
      leaseDocUrl: leaseDocUrl || null,
    };

    if (targetUnitId) {
      tenantData.unit = { connect: { id: targetUnitId } };
    }
    if (resolvedPropId) {
      tenantData.property = { connect: { id: resolvedPropId } };
    }
    const widNum = targetWorkspaceId || (body.workspaceId ? Number(body.workspaceId) : null);
    if (widNum) {
      tenantData.workspace = { connect: { wid: widNum } };
    }

    const tenant = await prisma.tenant.create({
      data: tenantData,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    // Auto-create TenantDocument records in DB for all uploaded documents
    const allDocsToCreate = [...docList];
    if (govIdUrl && !allDocsToCreate.some((d: any) => d.fileUrl === govIdUrl)) {
      allDocsToCreate.push({
        title: `Government ID (${govIdType || "ID Scan"}) — ${tenant.name}`,
        docType: "Government ID",
        fileUrl: govIdUrl,
        fileName: `${tenant.name.toLowerCase().replace(/\s+/g, "_")}_govid.pdf`,
      });
    }
    if (leaseDocUrl && !allDocsToCreate.some((d: any) => d.fileUrl === leaseDocUrl)) {
      allDocsToCreate.push({
        title: `Signed Residential Lease Agreement — ${tenant.name}`,
        docType: "Lease Agreement",
        fileUrl: leaseDocUrl,
        fileName: `${tenant.name.toLowerCase().replace(/\s+/g, "_")}_lease.pdf`,
      });
    }

    for (const doc of allDocsToCreate) {
      if (!doc.fileUrl) continue;
      await prisma.tenantDocument.create({
        data: {
          title: doc.title || `${doc.type || "Government ID"} (${doc.name || "Scan"}) — ${tenant.name}`,
          docType: doc.docType || "Government ID",
          fileUrl: doc.fileUrl,
          fileName: doc.fileName || doc.name || `${tenant.name.toLowerCase().replace(/\s+/g, "_")}_doc.pdf`,
          fileSize: "Uploaded Document Scan",
          floorNumber: tenant.floorNumber,
          tenant: { connect: { id: tenant.id } },
          ...(tenant.unitId ? { unit: { connect: { id: tenant.unitId } } } : {}),
          ...(tenant.propertyId ? { property: { connect: { id: tenant.propertyId } } } : {}),
          ...(tenant.workspaceId ? { workspace: { connect: { wid: tenant.workspaceId } } } : {}),
        },
      });
    }

    // If assigned to a unit, update unit occupancy
    if (targetUnitId) {
      await prisma.unit.update({
        where: { id: targetUnitId },
        data: { isOccupied: true },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Tenant "${tenant.name}" created successfully with ${allDocsToCreate.length} document(s) uploaded!`,
        data: tenant,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/tenants error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant", details: error?.message },
      { status: 500 }
    );
  }
}
