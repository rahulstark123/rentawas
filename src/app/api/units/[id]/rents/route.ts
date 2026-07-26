import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id]/rents - Fetch real database bills and ledger entries for a unit
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

    // Fetch real bills for unit from PostgreSQL
    let bills = await prisma.bill.findMany({
      where: { unitId: unit.id },
      include: {
        tenant: true,
        property: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If unit has active occupants but no bills in DB yet, seed an initial database bill
    if (bills.length === 0 && unit.tenants && unit.tenants.length > 0) {
      const activeTenant = unit.tenants[0];
      const monthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const monthCode = new Date().toISOString().slice(0, 7);
      const totalRent = unit.tenants.reduce((acc, t) => acc + (t.monthlyRent || unit?.rent || 0), 0) || unit.rent || 1000;

      const newBill = await prisma.bill.create({
        data: {
          invoiceNumber: `INV-${monthCode}-${unit.unitNumber.replace(/[^a-zA-Z0-9]/g, "")}`,
          title: `${monthYear} Rent Invoice (${unit.unitNumber})`,
          amount: totalRent,
          status: "Paid",
          category: "Rent",
          paymentMethod: "Autopilot Consolidated",
          paidDate: new Date(),
          dueDate: new Date(),
          floorNumber: unit.floorNumber,
          unit: { connect: { id: unit.id } },
          ...(unit.propertyId ? { property: { connect: { id: unit.propertyId } } } : {}),
          ...(unit.workspaceId ? { workspace: { connect: { wid: unit.workspaceId } } } : {}),
          ...(activeTenant ? { tenant: { connect: { id: activeTenant.id } } } : {}),
        },
        include: {
          tenant: true,
          property: true,
        },
      });

      bills = [newBill];
    }

    // Format for frontend presentation
    const formattedBills = bills.map((b) => ({
      id: b.id,
      invoiceNumber: b.invoiceNumber,
      title: b.title,
      amount: b.amount,
      status: b.status,
      category: b.category,
      paymentMethod: b.paymentMethod || "ACH Direct",
      paidDate: b.paidDate ? new Date(b.paidDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Pending",
      dueDate: b.dueDate ? new Date(b.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
      notes: b.notes,
      tenantId: b.tenantId,
      tenantName: b.tenant?.name || "All Occupants Combined",
      floorNumber: b.floorNumber || unit?.floorNumber || 1,
      propertyId: b.propertyId || unit?.propertyId,
    }));

    return NextResponse.json({
      success: true,
      unitId: unit.id,
      count: formattedBills.length,
      data: formattedBills,
    });
  } catch (error: any) {
    console.error("GET /api/units/[id]/rents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills & ledger", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/units/[id]/rents - Issue new bill/invoice for unit in database
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: unitId } = await params;
    const body = await request.json();
    const { title, amount, category, status, tenantId, notes, paymentMethod, propertyId } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: "Title and amount are required." }, { status: 400 });
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

    const monthCode = new Date().toISOString().slice(0, 7);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${monthCode}-${randomSuffix}`;

    const billData: any = {
      invoiceNumber,
      title,
      amount: parseFloat(amount),
      status: status || "Paid",
      category: category || "Rent",
      paymentMethod: paymentMethod || "Manual / Admin Issued",
      notes: notes || null,
      paidDate: status === "Paid" ? new Date() : null,
      dueDate: new Date(),
      floorNumber: unit ? unit.floorNumber : 1,
    };

    if (unit?.id) billData.unit = { connect: { id: unit.id } };
    const resolvedPropId = unit ? unit.propertyId : propertyId;
    if (resolvedPropId) billData.property = { connect: { id: resolvedPropId } };
    if (unit?.workspaceId) billData.workspace = { connect: { wid: unit.workspaceId } };
    if (tenantId) billData.tenant = { connect: { id: tenantId } };

    const newBill = await prisma.bill.create({
      data: billData,
      include: { tenant: true, property: true },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${newBill.invoiceNumber} created successfully!`,
      data: newBill,
    });
  } catch (error: any) {
    console.error("POST /api/units/[id]/rents error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice", details: error?.message },
      { status: 500 }
    );
  }
}
