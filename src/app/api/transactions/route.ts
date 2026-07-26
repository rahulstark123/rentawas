import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions - Fetch workspace transaction history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ workspaceId: wid }, { workspaceId: null }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch transaction history", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create transaction record
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionNumber, paymentId, orderId, type, amount, status, paymentMethod, description, wid } = body;

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;
    const randomSeq = Math.floor(100 + Math.random() * 900);

    const newTxn = await prisma.transaction.create({
      data: {
        transactionNumber: transactionNumber || `TXN-2026-${randomSeq}`,
        paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
        orderId: orderId || null,
        type: type || "Subscription Payment",
        amount: amount || "$0.00",
        status: status || "Success",
        paymentMethod: paymentMethod || "Razorpay",
        description: description || null,
        workspaceId: workspaceIdNum,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${newTxn.transactionNumber} created successfully!`,
      data: newTxn,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create transaction", details: error?.message },
      { status: 500 }
    );
  }
}
