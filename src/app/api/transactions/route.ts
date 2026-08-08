import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePagination, paginationMeta } from "@/lib/apiPagination";

// GET /api/transactions - Fetch workspace transaction history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;
    const pagination = parsePagination(searchParams);

    const where = {
      OR: [{ workspaceId: wid }, { workspaceId: null }],
    };

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(pagination.take != null
          ? { take: pagination.take, skip: pagination.skip }
          : {}),
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: transactions.length,
      pagination: paginationMeta(total, pagination, transactions.length),
      data: transactions,
    });
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
    const { transactionNumber, paymentId, orderId, type, amount, status, paymentMethod, description, tenantName, propertyUnit, wid } = body;

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : NaN;
    if (!wid || isNaN(workspaceIdNum) || workspaceIdNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
    const txnDenied = await requireWorkspaceMutate(workspaceIdNum);
    if (txnDenied) return txnDenied;

    const randomSeq = Math.floor(800 + Math.random() * 199);
    const generatedTxnNumber = transactionNumber || `PAY-${randomSeq}`;
    const formattedDesc = description || (tenantName ? `${tenantName} — ${propertyUnit || "Rental Unit"}` : "Monthly Rent Payment");

    const newTxn = await prisma.transaction.create({
      data: {
        transactionNumber: generatedTxnNumber,
        paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
        orderId: orderId || null,
        type: type || "Rent Collection",
        amount: amount || "$0.00",
        status: status || "Completed",
        paymentMethod: paymentMethod || "Razorpay Auto-Debit",
        description: formattedDesc,
        workspaceId: workspaceIdNum,
      },
    });

    return NextResponse.json({ success: true, data: newTxn }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create transaction", details: error?.message },
      { status: 500 }
    );
  }
}
