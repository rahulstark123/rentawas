import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { Role } from "@/generated/prisma/client";

function parseWorkspaceId(searchParams: URLSearchParams, bodyWid?: unknown): number | null {
  const raw =
    searchParams.get("workspaceId") ||
    searchParams.get("wid") ||
    (bodyWid != null ? String(bodyWid) : null);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// GET /api/tenants?workspaceId=3  (or ?wid=3)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = parseWorkspaceId(searchParams);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status"); // "Current" | "Past" | "Exited" | "Evicted" | "all"

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const where: any = {
      AND: [
        {
          OR: [
            { workspaceId },
            { property: { workspaceId } },
            { unit: { property: { workspaceId } } },
          ],
        },
      ],
    };

    if (propertyId) where.AND.push({ propertyId });
    if (status && status !== "all") {
      where.AND.push({ currentStatus: status });
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        property: true,
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Hard filter: never leak tenants whose property belongs to another workspace
    const scoped = tenants.filter((t) => {
      if (t.workspaceId === workspaceId) return true;
      if (t.property?.workspaceId === workspaceId) return true;
      if (t.unit?.property?.workspaceId === workspaceId) return true;
      return false;
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      count: scoped.length,
      data: scoped,
    });
  } catch (error: any) {
    console.error("GET /api/tenants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/tenants - Create new tenant in database (requires workspace)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
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
      workspaceId: bodyWorkspaceId,
      wid,
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
    let targetWorkspaceId: number | null = parseWorkspaceId(new URLSearchParams(), bodyWorkspaceId ?? wid);
    if (targetUnitId) {
      targetUnit = await prisma.unit.findUnique({
        where: { id: targetUnitId },
        include: { property: true },
      });
      const unitWid = targetUnit?.workspaceId || targetUnit?.property?.workspaceId || null;
      if (targetWorkspaceId && unitWid && targetWorkspaceId !== unitWid) {
        return NextResponse.json(
          { error: "Unit does not belong to the specified workspace." },
          { status: 403 }
        );
      }
      targetWorkspaceId = targetWorkspaceId || unitWid;
    } else if (propertyId) {
      const prop = await prisma.property.findUnique({ where: { id: propertyId } });
      if (targetWorkspaceId && prop?.workspaceId && targetWorkspaceId !== prop.workspaceId) {
        return NextResponse.json(
          { error: "Property does not belong to the specified workspace." },
          { status: 403 }
        );
      }
      targetWorkspaceId = targetWorkspaceId || prop?.workspaceId || null;
    }

    if (!targetWorkspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required to create a tenant." },
        { status: 400 }
      );
    }

    const resolvedPropId = targetUnit ? targetUnit.propertyId : (propertyId || null);

    // Clean phone number: Do not save dummy phone number if user left it blank
    const cleanPhone = phone && typeof phone === "string" && phone.trim() && !phone.trim().endsWith("undefined") ? phone.trim() : "";

    const tenantEmail = (email && email.trim()) || `${name.toLowerCase().replace(/\s+/g, ".")}@rentawas.com`;
    const tenantPassword = (password && password.trim()) || "Tenant@123";

    // 1. Create or ensure Supabase Auth user & Prisma Profile exist for tenant portal login
    let linkedProfileId: string | null = null;
    try {
      let existingProfile = await prisma.profile.findUnique({
        where: { email: tenantEmail },
      });

      if (!existingProfile) {
        const { data: authData } = await supabase.auth.signUp({
          email: tenantEmail,
          password: tenantPassword,
          options: {
            data: {
              fullName: name,
              role: "tenant",
              phone: cleanPhone,
            },
          },
        });

        const userId = authData?.user?.id || `tenant_${Date.now()}`;

        existingProfile = await prisma.profile.upsert({
          where: { email: tenantEmail },
          update: {
            fullName: name,
            phone: cleanPhone || null,
            role: Role.TENANT,
          },
          create: {
            id: userId,
            email: tenantEmail,
            fullName: name,
            phone: cleanPhone || null,
            role: Role.TENANT,
          },
        });
      }

      if (existingProfile) {
        linkedProfileId = existingProfile.id;
      }
    } catch (authErr) {
      console.warn("Tenant auth profile creation notice:", authErr);
    }

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
      email: tenantEmail,
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
      workspace: { connect: { wid: targetWorkspaceId } },
    };

    if (linkedProfileId) {
      tenantData.profile = { connect: { id: linkedProfileId } };
    }
    if (targetUnitId) {
      tenantData.unit = { connect: { id: targetUnitId } };
    }
    if (resolvedPropId) {
      tenantData.property = { connect: { id: resolvedPropId } };
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
          workspace: { connect: { wid: targetWorkspaceId } },
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
        message: `Tenant "${tenant.name}" created successfully!`,
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
