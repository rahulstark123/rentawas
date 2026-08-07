import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/dates";
import { supabase } from "@/lib/supabase";
import { Role } from "@/generated/prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id]/occupants - Fetch active tenants for unit
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const floorNumber = searchParams.get("floorNumber");

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
            ...(floorNumber ? [{ floorNumber: Number(floorNumber) }] : []),
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

    const occupants = (unit.tenants || []).map((t, idx) => ({
      id: t.id,
      name: t.name,
      bedSlot: t.bedSlot || `Bed Slot ${String.fromCharCode(65 + idx)}`,
      individualRent: t.monthlyRent || unit.rent || 0,
      phone: t.phone || "+1 (555) 000-0000",
      email: t.email || "resident@rentawas.com",
      moveIn: formatDisplayDate(t.leaseStart),
      paymentStatus: "Auto Paid (ACH)",
      rentDueDay: t.rentDueDay ?? 1,
      govIdType: t.govIdType || undefined,
      govIdNumber: t.govIdNumber || undefined,
      govIdUrl: t.govIdUrl || undefined,
      leaseDocUrl: t.leaseDocUrl || undefined,
    }));

    return NextResponse.json({
      success: true,
      unitId: id,
      count: occupants.length,
      data: occupants,
    });
  } catch (error: any) {
    console.error("GET /api/units/[id]/occupants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch occupants", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/units/[id]/occupants - Create new occupant/tenant for unit
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: unitId } = await params;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      monthlyRent,
      leaseStart,
      leaseEnd,
      propertyId,
      floorNumber,
      bedSlot,
      govIdType,
      govIdNumber,
      govIdUrl,
      leaseDocUrl,
      rentDueDay,
      collectFirstRent,
      firstRentAmount,
      firstRentMethod,
      firstRentPaid,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tenant name is required." }, { status: 400 });
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
            ...(floorNumber ? [{ floorNumber: Number(floorNumber) }] : []),
          ],
        },
      });
    }

    // If unit still does not exist in DB, create unit scoped uniquely to property & floor
    if (!unit) {
      let targetPropId = propertyId;
      if (!targetPropId) {
        const firstProp = await prisma.property.findFirst();
        targetPropId = firstProp?.id;
      }

      if (targetPropId) {
        const targetProp = await prisma.property.findUnique({ where: { id: targetPropId } });
        unit = await prisma.unit.create({
          data: {
            unitNumber: unitId.startsWith("Unit ") ? unitId : `Unit ${unitId}`,
            floorNumber: floorNumber ? Number(floorNumber) : 1,
            propertyId: targetPropId,
            workspaceId: targetProp?.workspaceId || null,
            rent: parseFloat(monthlyRent) || 0,
            isOccupied: true,
          },
        });
      }
    }

    // Fetch property if workspaceId not set
    let targetWorkspaceId = unit?.workspaceId || null;
    if (!targetWorkspaceId && (unit?.propertyId || propertyId)) {
      const prop = await prisma.property.findUnique({
        where: { id: unit?.propertyId || propertyId! },
      });
      targetWorkspaceId = prop?.workspaceId || null;
    }

    const resolvedPropId = unit ? unit.propertyId : (propertyId || null);

    const tenantEmail = (email && email.trim()) || `${name.toLowerCase().replace(/\s+/g, ".")}@rentawas.com`;
    const tenantPassword = (body.password && body.password.trim()) || "Tenant@123";

    // Create or ensure Supabase Auth user & Prisma Profile exist for tenant portal login
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
              phone: phone || "",
            },
          },
        });

        const userId = authData?.user?.id || `tenant_${Date.now()}`;

        existingProfile = await prisma.profile.upsert({
          where: { email: tenantEmail },
          update: {
            fullName: name,
            phone: phone || null,
            role: Role.TENANT,
          },
          create: {
            id: userId,
            email: tenantEmail,
            fullName: name,
            phone: phone || null,
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

    const parsedDueDay = Math.min(28, Math.max(1, parseInt(String(rentDueDay ?? 1), 10) || 1));

    const tenantData: any = {
      name,
      email: tenantEmail,
      phone: phone || "",
      monthlyRent: parseFloat(monthlyRent) || (unit ? unit.rent : 0),
      rentBillingType: "monthly",
      rentDueDay: parsedDueDay,
      leaseStart: leaseStart ? new Date(leaseStart) : new Date(),
      leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
      floorNumber: unit ? unit.floorNumber : (floorNumber ? Number(floorNumber) : 1),
      bedSlot: bedSlot || null,
      govIdType: govIdType || null,
      govIdNumber: govIdNumber || null,
      govIdUrl: govIdUrl || null,
      leaseDocUrl: leaseDocUrl || null,
    };

    if (linkedProfileId) {
      tenantData.profile = { connect: { id: linkedProfileId } };
    }

    if (unit?.id) {
      tenantData.unit = { connect: { id: unit.id } };
    }
    if (resolvedPropId) {
      tenantData.property = { connect: { id: resolvedPropId } };
    }
    if (targetWorkspaceId) {
      tenantData.workspace = { connect: { wid: targetWorkspaceId } };
    }

    const tenant = await prisma.tenant.create({
      data: tenantData,
    });

    if (unit) {
      await prisma.unit.update({
        where: { id: unit.id },
        data: { isOccupied: true },
      });
    }

    // Optional: record move-in / current-period rent collection
    let firstBill = null;
    if (collectFirstRent) {
      const amount = parseFloat(String(firstRentAmount ?? monthlyRent)) || tenant.monthlyRent || 0;
      const paid = firstRentPaid !== false;
      const periodLabel = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      firstBill = await prisma.bill.create({
        data: {
          invoiceNumber: `INV-MOVEIN-${Date.now().toString().slice(-6)}`,
          title: `Move-in rent — ${periodLabel}`,
          amount,
          status: paid ? "Paid" : "Pending",
          category: "Rent",
          paymentMethod: firstRentMethod || "Recorded at move-in",
          dueDate: new Date(),
          paidDate: paid ? new Date() : null,
          notes: `First period rent collected during resident assignment. Recurring due day: ${parsedDueDay}.`,
          tenantId: tenant.id,
          unitId: unit?.id || null,
          propertyId: resolvedPropId,
          workspaceId: targetWorkspaceId,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Tenant "${tenant.name}" created and assigned to unit!`,
        data: tenant,
        firstBill,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/units/[id]/occupants error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant", details: error?.message },
      { status: 500 }
    );
  }
}
