import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanCreditLimit } from "@/lib/aiCredits";

// GET /api/ai/usage-history?workspaceId=123&page=1&limit=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    const wid = widParam ? parseInt(widParam, 10) : NaN;
    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Valid workspaceId is required." }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { wid },
      select: { wid: true, name: true, plan: true, aiCreditsUsed: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const plan = workspace.plan || "free";
    const creditLimit = getPlanCreditLimit(plan);
    const creditsUsed = workspace.aiCreditsUsed ?? 0;
    const creditsLeft = Math.max(0, creditLimit - creditsUsed);

    const skip = (page - 1) * limit;
    const [totalItems, rows] = await Promise.all([
      prisma.aiUsageLog.count({ where: { workspaceId: wid } }),
      prisma.aiUsageLog.findMany({
        where: { workspaceId: wid },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          feature: true,
          targetItem: true,
          question: true,
          creditsCost: true,
          status: true,
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit) || 1);
    const logs = rows.map((row) => ({
      id: row.id,
      timestamp: row.createdAt.toISOString(),
      feature: row.feature,
      targetItem: row.targetItem,
      question: row.question,
      creditsCost: row.creditsCost,
      status: row.status,
    }));

    return NextResponse.json({
      success: true,
      currentBalance: creditsLeft,
      creditLimit,
      creditsUsed,
      plan,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      logs,
    });
  } catch (error: any) {
    console.error("GET /api/ai/usage-history error:", error);
    return NextResponse.json({ error: "Failed to fetch AI usage history", details: error?.message }, { status: 500 });
  }
}
