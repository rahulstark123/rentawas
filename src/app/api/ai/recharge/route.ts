import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/ai/recharge
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, addCredits, pack } = body;

    const wid = Number(workspaceId);
    if (!workspaceId || isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Valid workspaceId is required." }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({ where: { wid } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const creditsToAdd = Number(addCredits) || 50;
    const currentUsed = workspace.aiCreditsUsed ?? 0;
    
    // Recharge reduces aiCreditsUsed (or expands total capacity)
    const newUsed = Math.max(0, currentUsed - creditsToAdd);

    const updated = await prisma.workspace.update({
      where: { wid },
      data: {
        aiCreditsUsed: newUsed,
      },
    });

    // Record successful AI bill in database table AiBill
    const packPrices: Record<string, { amount: number; packName: string }> = {
      starter: { amount: 199, packName: "🚀 Starter Pack — 100 AI Credits" },
      pro: { amount: 499, packName: "⭐ Pro Pack — 300 AI Credits" },
      pro_plus: { amount: 999, packName: "💎 Pro+ Pack — 700 AI Credits" },
    };

    const packInfo = packPrices[String(pack)] || {
      amount: creditsToAdd === 700 ? 999 : creditsToAdd === 300 ? 499 : 199,
      packName: `AI Credit Top-Up (+${creditsToAdd} Credits)`,
    };

    const aiBill = await prisma.aiBill.create({
      data: {
        workspaceId: wid,
        invoiceNumber: `INV-AI-${Date.now().toString().slice(-6)}`,
        amount: packInfo.amount,
        credits: creditsToAdd,
        packName: packInfo.packName,
        paymentId: body.paymentId || `pay_rzp_${Date.now()}`,
        paymentMethod: "Razorpay Live Gateway",
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully recharged +${creditsToAdd} AI credits!`,
      creditsUsed: updated.aiCreditsUsed,
      plan: updated.plan,
      bill: aiBill,
    });
  } catch (error: any) {
    console.error("POST /api/ai/recharge error:", error);
    return NextResponse.json(
      { error: "Failed to recharge AI credits.", details: error?.message },
      { status: 500 }
    );
  }
}
