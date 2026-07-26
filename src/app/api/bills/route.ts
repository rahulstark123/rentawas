import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bills - Fetch bills filtered by workspaceId, propertyId, unitId, or tenantId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const propertyId = searchParams.get("propertyId");
    const unitId = searchParams.get("unitId");
    const tenantId = searchParams.get("tenantId");

    const whereClause: any = {};
    if (workspaceId) whereClause.workspaceId = Number(workspaceId);
    if (propertyId) whereClause.propertyId = propertyId;
    if (unitId) whereClause.unitId = unitId;
    if (tenantId) whereClause.tenantId = tenantId;

    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        tenant: true,
        unit: true,
        property: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error: any) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/bills - Issue new invoice / bill
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      amount,
      category,
      status,
      tenantId,
      unitId,
      propertyId,
      workspaceId,
      notes,
      paymentMethod,
      floorNumber,
    } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: "Invoice title and amount are required." }, { status: 400 });
    }

    const monthCode = new Date().toISOString().slice(0, 7);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${monthCode}-${randomNum}`;

    const billData: any = {
      invoiceNumber,
      title,
      amount: parseFloat(amount),
      status: status || "Paid",
      category: category || "Rent",
      paymentMethod: paymentMethod || "Manual Invoice",
      notes: notes || null,
      floorNumber: floorNumber ? Number(floorNumber) : 1,
      paidDate: status === "Paid" ? new Date() : null,
      dueDate: new Date(),
    };

    if (tenantId) billData.tenant = { connect: { id: tenantId } };
    if (unitId) billData.unit = { connect: { id: unitId } };
    if (propertyId) billData.property = { connect: { id: propertyId } };
    if (workspaceId) billData.workspace = { connect: { wid: Number(workspaceId) } };

    const bill = await prisma.bill.create({
      data: billData,
      include: {
        tenant: true,
        unit: true,
        property: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Invoice ${bill.invoiceNumber} issued successfully!`,
        data: bill,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/bills error:", error);
    return NextResponse.json(
      { error: "Failed to issue invoice", details: error?.message },
      { status: 500 }
    );
  }
}
