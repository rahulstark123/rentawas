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

    return NextResponse.json({
      success: true,
      message: `Successfully recharged +${creditsToAdd} AI credits!`,
      creditsUsed: updated.aiCreditsUsed,
      plan: updated.plan,
    });
  } catch (error: any) {
    console.error("POST /api/ai/recharge error:", error);
    return NextResponse.json(
      { error: "Failed to recharge AI credits.", details: error?.message },
      { status: 500 }
    );
  }
}
