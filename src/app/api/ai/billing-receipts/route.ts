import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ai/billing-receipts?workspaceId=123
// Returns AI credit recharge receipts only (not workspace plan subscriptions).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : NaN;

    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Valid workspaceId is required." }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { wid },
      select: { wid: true, name: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const dbAiBills = await prisma.aiBill.findMany({
      where: { workspaceId: wid, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    const receipts = dbAiBills.map((b) => ({
      id: b.id,
      invoiceNumber: b.invoiceNumber,
      date: b.createdAt.toISOString(),
      item: b.packName,
      type: "AI Credit Recharge",
      amount: `₹${b.amount.toFixed(2)}`,
      paymentMethod: b.paymentMethod,
      paymentId: b.paymentId || "pay_rzp_live",
      status: "Paid & Activated",
    }));

    return NextResponse.json({
      success: true,
      workspaceName: workspace.name,
      receipts,
    });
  } catch (error: any) {
    console.error("GET /api/ai/billing-receipts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI billing receipts", details: error?.message },
      { status: 500 }
    );
  }
}
