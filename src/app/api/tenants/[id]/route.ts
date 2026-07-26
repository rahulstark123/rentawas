import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/tenants/[id] - Fetch single tenant by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { unit: { include: { property: true } } },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch tenant", details: error?.message }, { status: 500 });
  }
}

// PATCH /api/tenants/[id] - Update tenant details
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, monthlyRent, leaseStart, leaseEnd, unitId } = body;

    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        monthlyRent: monthlyRent !== undefined ? parseFloat(monthlyRent) : existing.monthlyRent,
        securityDeposit: body.securityDeposit !== undefined ? parseFloat(body.securityDeposit) : existing.securityDeposit,
        leaseStart: leaseStart ? new Date(leaseStart) : existing.leaseStart,
        leaseEnd: leaseEnd ? new Date(leaseEnd) : existing.leaseEnd,
        unitId: unitId !== undefined ? unitId : existing.unitId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tenant "${updated.name}" updated successfully!`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update tenant", details: error?.message }, { status: 500 });
  }
}

// DELETE /api/tenants/[id] - Offboard tenant: Mark currentStatus = "Exited" & unassign unit (Preserve record for workspace history)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const statusType = searchParams.get("status") || "Exited";

    const existing = await prisma.tenant.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const unitId = existing.unitId;

    // Mark currentStatus = "Exited" or "Evicted" and clear unitId to unassign from room while preserving tenant in workspace
    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        unitId: null,
        currentStatus: statusType.includes("Evict") || statusType.includes("Remove") ? "Evicted" : "Exited",
      },
    });

    // Check remaining active Current tenants in unit
    if (unitId) {
      const activeCount = await prisma.tenant.count({
        where: { unitId, currentStatus: "Current" },
      });
      if (activeCount === 0) {
        await prisma.unit.update({
          where: { id: unitId },
          data: { isOccupied: false },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tenant "${existing.name}" offboarded cleanly! Preserved in workspace history as Past Resident.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to offboard tenant", details: error?.message }, { status: 500 });
  }
}
