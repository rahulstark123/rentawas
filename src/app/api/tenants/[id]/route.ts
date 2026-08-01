import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

function tenantInWorkspace(
  tenant: {
    workspaceId: number | null;
    property?: { workspaceId: number } | null;
    unit?: { property?: { workspaceId: number } | null } | null;
  },
  workspaceId: number
) {
  if (tenant.workspaceId === workspaceId) return true;
  if (tenant.property?.workspaceId === workspaceId) return true;
  if (tenant.unit?.property?.workspaceId === workspaceId) return true;
  return false;
}

// GET /api/tenants/[id]?workspaceId=3
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const workspaceId = widParam ? parseInt(widParam, 10) : NaN;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        unit: { include: { property: true } },
        property: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    if (!isNaN(workspaceId) && workspaceId > 0 && !tenantInWorkspace(tenant, workspaceId)) {
      return NextResponse.json(
        { error: "Forbidden: Tenant does not belong to this workspace." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch tenant", details: error?.message }, { status: 500 });
  }
}

// PATCH /api/tenants/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, monthlyRent, leaseStart, leaseEnd, unitId, workspaceId, wid, rentDueDay } = body;
    const widNum = workspaceId != null || wid != null ? Number(workspaceId ?? wid) : NaN;

    const existing = await prisma.tenant.findUnique({
      where: { id },
      include: {
        property: true,
        unit: { include: { property: true } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    if (!isNaN(widNum) && widNum > 0 && !tenantInWorkspace(existing, widNum)) {
      return NextResponse.json(
        { error: "Forbidden: Tenant does not belong to this workspace." },
        { status: 403 }
      );
    }

    const parsedDueDay =
      rentDueDay !== undefined
        ? Math.min(28, Math.max(1, parseInt(String(rentDueDay), 10) || 1))
        : existing.rentDueDay;

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
        rentBillingType: "monthly",
        rentDueDay: parsedDueDay,
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

// DELETE /api/tenants/[id]?workspaceId=3&status=Exited
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const statusType = searchParams.get("status") || "Exited";
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const workspaceId = widParam ? parseInt(widParam, 10) : NaN;

    const existing = await prisma.tenant.findUnique({
      where: { id },
      include: {
        property: true,
        unit: { include: { property: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    if (!isNaN(workspaceId) && workspaceId > 0 && !tenantInWorkspace(existing, workspaceId)) {
      return NextResponse.json(
        { error: "Forbidden: Tenant does not belong to this workspace." },
        { status: 403 }
      );
    }

    const unitId = existing.unitId;

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        unitId: null,
        currentStatus: statusType.includes("Evict") || statusType.includes("Remove") ? "Evicted" : "Exited",
      },
    });

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
