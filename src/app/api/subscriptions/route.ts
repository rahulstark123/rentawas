import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseWid(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = parseInt(String(raw), 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// GET /api/subscriptions?wid=3
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wid = parseWid(searchParams.get("wid") || searchParams.get("workspaceId"));

    if (!wid) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, workspaceId: wid, data: subscriptions });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch subscription history", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Save new subscription after payment (requires wid)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, amount, billingTerm, paymentType, paymentMethod, paymentId, wid, workspaceId } = body;

    const workspaceIdNum = parseWid(wid ?? workspaceId);
    if (!workspaceIdNum) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const randomSeq = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `INV-2026-${randomSeq}`;
    const receiptNumber = `RCPT-2026-${randomSeq}`;
    const transactionNumber = `TXN-2026-${randomSeq}`;

    const newSub = await prisma.subscription.create({
      data: {
        invoiceNumber,
        receiptNumber,
        planName: planName || "Pro Portfolio Plan",
        amount: amount || "$15.00 USD",
        billingTerm: billingTerm || "Monthly",
        paymentType: paymentType || "Recurring Subscription",
        paymentMethod: paymentMethod || "Razorpay Auto-Debit",
        paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
        status: "Paid",
        workspaceId: workspaceIdNum,
      },
    });

    await prisma.transaction.create({
      data: {
        transactionNumber,
        paymentId: newSub.paymentId,
        orderId: `sub_${Math.random().toString(36).substring(2, 10)}`,
        type: "Subscription Payment",
        amount: newSub.amount,
        status: "Success",
        paymentMethod: newSub.paymentMethod,
        description: `Rent Awas ${newSub.planName} (${newSub.billingTerm})`,
        workspaceId: workspaceIdNum,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subscription and Transaction #${transactionNumber} recorded for Workspace #${workspaceIdNum}!`,
      data: newSub,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save subscription record", details: error?.message },
      { status: 500 }
    );
  }
}
