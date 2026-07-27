import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workspace - Fetch workspace profile, active plan & live unit counts from PostgreSQL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;

    let workspace = await prisma.workspace.findUnique({
      where: { wid },
      include: {
        owner: true,
      },
    });

    // Fallback if workspace #wid does not exist yet
    if (!workspace) {
      const firstWs = await prisma.workspace.findFirst({
        include: { owner: true },
      });
      workspace = firstWs;
    }

    // Count live units in database for this workspace
    const unitsCount = await prisma.unit.count({
      where: {
        OR: [{ workspaceId: wid }, { workspaceId: null }],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        wid: workspace?.wid || wid,
        name: workspace?.name || "My Property Portfolio Workspace",
        plan: workspace?.plan || "starter",
        currency: workspace?.currency || "USD ($)",
        portfolioScale: workspace?.portfolioScale || "1-5",
        ownerName: workspace?.owner?.fullName || "Alexander Wright",
        ownerEmail: workspace?.owner?.email || "alexander@regencymanagement.com",
        unitsCount: unitsCount,
        razorpayKeyId: workspace?.razorpayKeyId || "",
        razorpayKeySecret: workspace?.razorpayKeySecret || "",
        razorpayMerchantVpa: workspace?.razorpayMerchantVpa || "",
        razorpayWebhookSecret: workspace?.razorpayWebhookSecret || "",
        razorpayEnvMode: workspace?.razorpayEnvMode || "test",
        razorpayConnected: workspace?.razorpayConnected ?? false,
        stripePublishableKey: workspace?.stripePublishableKey || "",
        stripeSecretKey: workspace?.stripeSecretKey || "",
        stripeWebhookSecret: workspace?.stripeWebhookSecret || "",
        stripeConnectAccountId: workspace?.stripeConnectAccountId || "",
        stripeEnvMode: workspace?.stripeEnvMode || "test",
        stripeConnected: workspace?.stripeConnected ?? false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch workspace details", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace - Update workspace details (e.g. active subscription plan, Razorpay & Stripe keys)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { 
      wid, 
      plan, 
      name, 
      currency, 
      portfolioScale,
      razorpayKeyId,
      razorpayKeySecret,
      razorpayMerchantVpa,
      razorpayWebhookSecret,
      razorpayEnvMode,
      razorpayConnected,
      stripePublishableKey,
      stripeSecretKey,
      stripeWebhookSecret,
      stripeConnectAccountId,
      stripeEnvMode,
      stripeConnected
    } = body;

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;

    const updatedWs = await prisma.workspace.update({
      where: { wid: workspaceIdNum },
      data: {
        ...(plan ? { plan } : {}),
        ...(name ? { name } : {}),
        ...(currency ? { currency } : {}),
        ...(portfolioScale ? { portfolioScale } : {}),
        ...(razorpayKeyId !== undefined ? { razorpayKeyId } : {}),
        ...(razorpayKeySecret !== undefined ? { razorpayKeySecret } : {}),
        ...(razorpayMerchantVpa !== undefined ? { razorpayMerchantVpa } : {}),
        ...(razorpayWebhookSecret !== undefined ? { razorpayWebhookSecret } : {}),
        ...(razorpayEnvMode !== undefined ? { razorpayEnvMode } : {}),
        ...(razorpayConnected !== undefined ? { razorpayConnected } : {}),
        ...(stripePublishableKey !== undefined ? { stripePublishableKey } : {}),
        ...(stripeSecretKey !== undefined ? { stripeSecretKey } : {}),
        ...(stripeWebhookSecret !== undefined ? { stripeWebhookSecret } : {}),
        ...(stripeConnectAccountId !== undefined ? { stripeConnectAccountId } : {}),
        ...(stripeEnvMode !== undefined ? { stripeEnvMode } : {}),
        ...(stripeConnected !== undefined ? { stripeConnected } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Workspace #${workspaceIdNum} updated successfully! Active plan set to ${updatedWs.plan}.`,
      data: updatedWs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update workspace", details: error?.message },
      { status: 500 }
    );
  }
}
