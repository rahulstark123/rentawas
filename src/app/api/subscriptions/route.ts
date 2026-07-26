import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/subscriptions - Fetch subscription & invoice history from PostgreSQL database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;

    // Purge legacy seeded dummy records if any exist
    await prisma.subscription.deleteMany({
      where: {
        invoiceNumber: {
          in: ["INV-2026-007", "INV-2026-006", "INV-2026-005"],
        },
      },
    });

    const subscriptions = await prisma.subscription.findMany({
      where: {
        OR: [{ workspaceId: wid }, { workspaceId: null }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch subscription history", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Save new subscription and transaction after payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, amount, billingTerm, paymentType, paymentMethod, paymentId, wid } = body;

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `INV-2026-${randomSeq}`;
    const receiptNumber = `RCPT-2026-${randomSeq}`;
    const transactionNumber = `TXN-2026-${randomSeq}`;

    // 1. Record Subscription
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

    // 2. Record Transaction
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
      message: `Subscription and Transaction #${transactionNumber} recorded successfully!`,
      data: newSub,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save subscription record", details: error?.message },
      { status: 500 }
    );
  }
}
