import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isGatewayPayment,
  isManualVerificationPayment,
  billNotesInclude,
} from "@/lib/rentReceipts";
import { parsePagination, paginationMeta } from "@/lib/apiPagination";
import { resolveRequestProfile } from "@/lib/api-auth";
import {
  sendRentPaymentSubmittedForVerificationPush,
  sendRentPaymentReceivedPush,
} from "@/lib/push-notifications";

const billListSelect = {
  id: true,
  invoiceNumber: true,
  title: true,
  amount: true,
  status: true,
  category: true,
  paymentMethod: true,
  notes: true,
  receiptUrl: true,
  receiptName: true,
  floorNumber: true,
  paidDate: true,
  dueDate: true,
  workspaceId: true,
  tenantId: true,
  unitId: true,
  propertyId: true,
  createdAt: true,
  tenant: { select: { id: true, name: true, email: true } },
  unit: { select: { id: true, unitNumber: true, floorNumber: true } },
  property: { select: { id: true, name: true, autoReceiptEnabled: true } },
} as const;

// GET /api/bills - Fetch bills filtered by workspaceId, propertyId, unitId, or tenantId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const propertyId = searchParams.get("propertyId");
    const unitId = searchParams.get("unitId");
    const tenantId = searchParams.get("tenantId");
    const pagination = parsePagination(searchParams);

    const whereClause: any = {};
    if (workspaceId) whereClause.workspaceId = Number(workspaceId);
    if (propertyId) whereClause.propertyId = propertyId;
    if (unitId) whereClause.unitId = unitId;
    if (tenantId) whereClause.tenantId = tenantId;

    const [total, bills] = await Promise.all([
      prisma.bill.count({ where: whereClause }),
      prisma.bill.findMany({
        where: whereClause,
        select: billListSelect,
        orderBy: { createdAt: "desc" },
        ...(pagination.take != null
          ? { take: pagination.take, skip: pagination.skip }
          : {}),
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: bills.length,
      pagination: paginationMeta(total, pagination, bills.length),
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
      paidDate,
    } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: "Invoice title and amount are required." }, { status: 400 });
    }

    const monthCode = new Date().toISOString().slice(0, 7);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${monthCode}-${randomNum}`;

    let finalNotes = notes || null;
    if (propertyId && paymentMethod && isGatewayPayment(String(paymentMethod))) {
      const prop = await prisma.property.findUnique({
        where: { id: String(propertyId) },
        select: { autoReceiptEnabled: true },
      });
      const autoReceipt = prop?.autoReceiptEnabled ?? true;
      if (!autoReceipt && finalNotes) {
        finalNotes = finalNotes.replace(/;?receipt_issued/gi, "").replace(/^;+|;+$/g, "") || null;
      }
    }

    const billStatus = status || "Paid";
    const billData: any = {
      invoiceNumber,
      title,
      amount: parseFloat(amount),
      status: billStatus,
      category: category || "Rent",
      paymentMethod: paymentMethod || "Manual Invoice",
      notes: finalNotes,
      floorNumber: floorNumber ? Number(floorNumber) : 1,
      paidDate: paidDate
        ? new Date(paidDate)
        : billStatus === "Paid"
        ? new Date()
        : null,
      dueDate: new Date(),
    };

    if (tenantId) billData.tenant = { connect: { id: tenantId } };
    if (unitId) billData.unit = { connect: { id: unitId } };
    if (propertyId) billData.property = { connect: { id: propertyId } };
    if (workspaceId) billData.workspace = { connect: { wid: Number(workspaceId) } };

    const bill = await prisma.bill.create({
      data: billData,
      select: billListSelect,
    });

    const creatorProfile = await resolveRequestProfile(request, body);
    const isOwnerRecorded = creatorProfile?.role === "OWNER";
    const workspaceIdNum = bill.workspaceId ?? (workspaceId ? Number(workspaceId) : null);

    if (!isOwnerRecorded && workspaceIdNum) {
      try {
        const isManualPending =
          bill.status === "Pending" &&
          (billNotesInclude(bill.notes, "awaiting_landlord_verification") ||
            isManualVerificationPayment(bill.paymentMethod));

        if (isManualPending) {
          const pushResult = await sendRentPaymentSubmittedForVerificationPush(
            bill,
            workspaceIdNum
          );
          if (pushResult.sent > 0) {
            console.log(
              `[push] Rent verification ${bill.invoiceNumber} notified ${pushResult.sent} landlord device(s).`
            );
          }
        } else if (
          bill.status === "Paid" &&
          bill.tenantId &&
          isGatewayPayment(bill.paymentMethod)
        ) {
          const pushResult = await sendRentPaymentReceivedPush(bill, workspaceIdNum);
          if (pushResult.sent > 0) {
            console.log(
              `[push] Rent payment ${bill.invoiceNumber} notified ${pushResult.sent} landlord device(s).`
            );
          }
        }
      } catch (pushErr) {
        console.error("[push] Rent payment push failed (bill still saved):", pushErr);
      }
    }

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
