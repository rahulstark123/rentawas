import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appendBillNote } from "@/lib/rentReceipts";
import {
  sendRentPaymentVerifiedPush,
  sendRentReceiptReadyPush,
} from "@/lib/push-notifications";

const billDetailSelect = {
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
  paidDate: true,
  dueDate: true,
  workspaceId: true,
  tenantId: true,
  unitId: true,
  propertyId: true,
  createdAt: true,
  tenant: { select: { id: true, name: true, email: true } },
  unit: { select: { id: true, unitNumber: true } },
  property: { select: { id: true, name: true, address: true, autoReceiptEnabled: true } },
} as const;

interface Params {
  params: Promise<{ id: string }>;
}

async function propertyAutoReceiptEnabled(propertyId: string | null | undefined) {
  if (!propertyId) return true;
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { autoReceiptEnabled: true },
  });
  return property?.autoReceiptEnabled ?? true;
}

// PATCH /api/bills/[id] — verify, issue auto receipt, or upload manual receipt
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action as "verify" | "issue_receipt" | "upload_manual_receipt";

    const existing = await prisma.bill.findUnique({
      where: { id },
      select: billDetailSelect,
    });

    if (!existing) {
      return NextResponse.json({ error: "Bill not found." }, { status: 404 });
    }

    if (action === "verify") {
      const autoReceipt = await propertyAutoReceiptEnabled(existing.propertyId);
      let notes = appendBillNote(existing.notes, "landlord_verified");
      if (autoReceipt) {
        notes = appendBillNote(notes, "receipt_issued");
      }

      const bill = await prisma.bill.update({
        where: { id },
        data: {
          status: "Paid",
          paidDate: new Date(),
          notes,
        },
        select: billDetailSelect,
      });

      try {
        const pushResult = await sendRentPaymentVerifiedPush(bill, {
          receiptReady: autoReceipt,
        });
        if (pushResult.sent > 0) {
          console.log(
            `[push] Rent verified ${bill.invoiceNumber} notified tenant (${pushResult.sent} device(s)).`
          );
        }
      } catch (pushErr) {
        console.error("[push] Rent verified push failed:", pushErr);
      }

      return NextResponse.json({
        success: true,
        message: autoReceipt
          ? "Payment verified and RentAwas receipt issued automatically."
          : "Payment verified. Upload a receipt manually when ready.",
        autoReceiptIssued: autoReceipt,
        data: bill,
      });
    }

    if (action === "issue_receipt") {
      if (existing.status !== "Paid") {
        return NextResponse.json(
          { error: "Payment must be verified before issuing a receipt." },
          { status: 400 }
        );
      }

      const bill = await prisma.bill.update({
        where: { id },
        data: {
          notes: appendBillNote(existing.notes, "receipt_issued"),
        },
        select: billDetailSelect,
      });

      try {
        const pushResult = await sendRentReceiptReadyPush(bill, existing.tenantId);
        if (pushResult.sent > 0) {
          console.log(
            `[push] Receipt issued ${bill.invoiceNumber} notified tenant (${pushResult.sent} device(s)).`
          );
        }
      } catch (pushErr) {
        console.error("[push] Receipt issued push failed:", pushErr);
      }

      return NextResponse.json({
        success: true,
        message: "Receipt issued successfully.",
        data: bill,
      });
    }

    if (action === "upload_manual_receipt") {
      const { receiptUrl, receiptName } = body;
      if (!receiptUrl || typeof receiptUrl !== "string") {
        return NextResponse.json({ error: "receiptUrl is required." }, { status: 400 });
      }
      if (receiptUrl.startsWith("data:")) {
        return NextResponse.json(
          { error: "Upload the file to storage first; data URLs are not supported." },
          { status: 400 }
        );
      }

      const bill = await prisma.bill.update({
        where: { id },
        data: {
          receiptUrl,
          receiptName: receiptName?.trim() || "rent_receipt.pdf",
          notes: appendBillNote(
            appendBillNote(existing.notes, "manual_receipt"),
            "receipt_issued"
          ),
        },
        select: billDetailSelect,
      });

      try {
        const pushResult = await sendRentReceiptReadyPush(bill, existing.tenantId);
        if (pushResult.sent > 0) {
          console.log(
            `[push] Manual receipt ${bill.invoiceNumber} notified tenant (${pushResult.sent} device(s)).`
          );
        }
      } catch (pushErr) {
        console.error("[push] Manual receipt push failed:", pushErr);
      }

      return NextResponse.json({
        success: true,
        message: "Manual receipt uploaded successfully.",
        data: bill,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/bills/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update bill.", details: error?.message },
      { status: 500 }
    );
  }
}
