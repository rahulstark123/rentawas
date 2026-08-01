import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const TRIAL_DURATION_DAYS = 14;

function computeTrialDaysLeft(trialStartedAt: Date | null | undefined, createdAt?: Date | null): number {
  const start = trialStartedAt || createdAt;
  if (!start) return TRIAL_DURATION_DAYS;
  const elapsedMs = Date.now() - new Date(start).getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DURATION_DAYS - elapsedDays);
}

// GET /api/workspace?wid=3 — workspace-scoped plan + 14-day trial status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid") || searchParams.get("workspaceId");
    const wid = widParam ? parseInt(widParam, 10) : NaN;

    if (!widParam || isNaN(wid) || wid <= 0) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    // Normalize legacy enterprise → pro_plus (this workspace only)
    await prisma.workspace.updateMany({
      where: { wid, plan: "enterprise" },
      data: { plan: "pro_plus" },
    });

    let workspace = await prisma.workspace.findUnique({
      where: { wid },
      include: {
        owner: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: `Workspace #${wid} not found.` },
        { status: 404 }
      );
    }

    // Auto-lapse expired trial → free (per this workspace)
    let plan = workspace.plan || "trial";
    const trialStartedAt = workspace.trialStartedAt || workspace.createdAt;
    let trialDaysLeft = computeTrialDaysLeft(workspace.trialStartedAt, workspace.createdAt);

    if (plan === "trial" && trialDaysLeft <= 0) {
      workspace = await prisma.workspace.update({
        where: { wid },
        data: { plan: "free" },
        include: { owner: true },
      });
      plan = "free";
      trialDaysLeft = 0;
    }

    const isTrialActive = plan === "trial" && trialDaysLeft > 0;

    // Count live units for THIS workspace only
    const unitsCount = await prisma.unit.count({
      where: {
        OR: [
          { workspaceId: wid },
          { property: { workspaceId: wid } },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        wid: workspace.wid,
        name: workspace.name || "",
        plan,
        trialStartedAt: trialStartedAt?.toISOString?.() || trialStartedAt,
        trialDaysLeft: plan === "trial" ? trialDaysLeft : 0,
        trialDurationDays: TRIAL_DURATION_DAYS,
        isTrialActive,
        currency: workspace.currency || "",
        portfolioScale: workspace.portfolioScale || "",
        ownerName: workspace.owner?.fullName || "",
        ownerEmail: workspace.owner?.email || "",
        companyType: workspace.companyType || "",
        taxId: workspace.taxId || "",
        registeredAddress: workspace.registeredAddress || "",
        landlordName: workspace.landlordName || "",
        landlordRole: workspace.landlordRole || "",
        companyEmail: workspace.companyEmail || "",
        companyPhone: workspace.companyPhone || "",
        jurisdiction: workspace.jurisdiction || "",
        pincode: workspace.pincode || "",
        timezone: workspace.timezone || "",
        fiscalYearStart: workspace.fiscalYearStart || "",
        customSubdomain: workspace.customSubdomain || "",
        tagline: workspace.tagline || "",
        unitsCount,
        razorpayKeyId: workspace.razorpayKeyId || "",
        razorpayKeySecret: workspace.razorpayKeySecret || "",
        razorpayMerchantVpa: workspace.razorpayMerchantVpa || "",
        razorpayWebhookSecret: workspace.razorpayWebhookSecret || "",
        razorpayEnvMode: workspace.razorpayEnvMode || "test",
        razorpayConnected: workspace.razorpayConnected ?? false,
        stripePublishableKey: workspace.stripePublishableKey || "",
        stripeSecretKey: workspace.stripeSecretKey || "",
        stripeWebhookSecret: workspace.stripeWebhookSecret || "",
        stripeConnectAccountId: workspace.stripeConnectAccountId || "",
        stripeEnvMode: workspace.stripeEnvMode || "test",
        stripeConnected: workspace.stripeConnected ?? false,
        paypalClientId: workspace.paypalClientId || "",
        paypalClientSecret: workspace.paypalClientSecret || "",
        paypalMerchantEmail: workspace.paypalMerchantEmail || "",
        paypalWebhookId: workspace.paypalWebhookId || "",
        paypalEnvMode: workspace.paypalEnvMode || "test",
        paypalConnected: workspace.paypalConnected ?? false,
        upiId: workspace.upiId || "",
        upiPhoneNumber: workspace.upiPhoneNumber || "",
        upiQrCodeUrl: workspace.upiQrCodeUrl || "",
        upiAccountName: workspace.upiAccountName || "",
        upiAppsSupported: workspace.upiAppsSupported || "",
        upiConnected: workspace.upiConnected ?? false,
        gpayUpiId: workspace.gpayUpiId || "",
        gpayPhoneNumber: workspace.gpayPhoneNumber || "",
        gpayQrCodeUrl: workspace.gpayQrCodeUrl || "",
        gpayConnected: workspace.gpayConnected ?? false,
        phonepeUpiId: workspace.phonepeUpiId || "",
        phonepePhoneNumber: workspace.phonepePhoneNumber || "",
        phonepeQrCodeUrl: workspace.phonepeQrCodeUrl || "",
        phonepeConnected: workspace.phonepeConnected ?? false,
        paytmUpiId: workspace.paytmUpiId || "",
        paytmPhoneNumber: workspace.paytmPhoneNumber || "",
        paytmQrCodeUrl: workspace.paytmQrCodeUrl || "",
        paytmConnected: workspace.paytmConnected ?? false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch workspace details", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace - Update workspace details (e.g. active subscription plan, Razorpay, Stripe & PayPal keys)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { 
      wid, 
      plan, 
      name, 
      currency, 
      portfolioScale,
      companyType,
      taxId,
      registeredAddress,
      landlordName,
      landlordRole,
      companyEmail,
      companyPhone,
      jurisdiction,
      pincode,
      timezone,
      fiscalYearStart,
      customSubdomain,
      tagline,
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
      stripeConnected,
      paypalClientId,
      paypalClientSecret,
      paypalMerchantEmail,
      paypalWebhookId,
      paypalEnvMode,
      paypalConnected,
      upiId,
      upiPhoneNumber,
      upiQrCodeUrl,
      upiAccountName,
      upiAppsSupported,
      upiConnected,
      gpayUpiId,
      gpayPhoneNumber,
      gpayQrCodeUrl,
      gpayConnected,
      phonepeUpiId,
      phonepePhoneNumber,
      phonepeQrCodeUrl,
      phonepeConnected,
      paytmUpiId,
      paytmPhoneNumber,
      paytmQrCodeUrl,
      paytmConnected,
    } = body;

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : NaN;
    if (!wid || isNaN(workspaceIdNum) || workspaceIdNum <= 0) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const emptyToNull = (v: unknown) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const s = String(v).trim();
      return s === "" ? null : s;
    };

    const updatedWs = await prisma.workspace.update({
      where: { wid: workspaceIdNum },
      data: {
        ...(plan ? { plan } : {}),
        ...(name ? { name } : {}),
        ...(currency ? { currency } : {}),
        ...(portfolioScale ? { portfolioScale } : {}),
        ...(companyType !== undefined ? { companyType: emptyToNull(companyType) } : {}),
        ...(taxId !== undefined ? { taxId: emptyToNull(taxId) } : {}),
        ...(registeredAddress !== undefined ? { registeredAddress: emptyToNull(registeredAddress) } : {}),
        ...(landlordName !== undefined ? { landlordName: emptyToNull(landlordName) } : {}),
        ...(landlordRole !== undefined ? { landlordRole: emptyToNull(landlordRole) } : {}),
        ...(companyEmail !== undefined ? { companyEmail: emptyToNull(companyEmail) } : {}),
        ...(companyPhone !== undefined ? { companyPhone: emptyToNull(companyPhone) } : {}),
        ...(jurisdiction !== undefined ? { jurisdiction: emptyToNull(jurisdiction) } : {}),
        ...(pincode !== undefined ? { pincode: emptyToNull(pincode) } : {}),
        ...(timezone !== undefined ? { timezone: emptyToNull(timezone) } : {}),
        ...(fiscalYearStart !== undefined ? { fiscalYearStart: emptyToNull(fiscalYearStart) } : {}),
        ...(customSubdomain !== undefined ? { customSubdomain: emptyToNull(customSubdomain) } : {}),
        ...(tagline !== undefined ? { tagline: emptyToNull(tagline) } : {}),
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
        ...(paypalClientId !== undefined ? { paypalClientId } : {}),
        ...(paypalClientSecret !== undefined ? { paypalClientSecret } : {}),
        ...(paypalMerchantEmail !== undefined ? { paypalMerchantEmail } : {}),
        ...(paypalWebhookId !== undefined ? { paypalWebhookId } : {}),
        ...(paypalEnvMode !== undefined ? { paypalEnvMode } : {}),
        ...(paypalConnected !== undefined ? { paypalConnected } : {}),
        ...(upiId !== undefined ? { upiId } : {}),
        ...(upiPhoneNumber !== undefined ? { upiPhoneNumber } : {}),
        ...(upiQrCodeUrl !== undefined ? { upiQrCodeUrl } : {}),
        ...(upiAccountName !== undefined ? { upiAccountName } : {}),
        ...(upiAppsSupported !== undefined ? { upiAppsSupported } : {}),
        ...(upiConnected !== undefined ? { upiConnected } : {}),
        ...(gpayUpiId !== undefined ? { gpayUpiId } : {}),
        ...(gpayPhoneNumber !== undefined ? { gpayPhoneNumber } : {}),
        ...(gpayQrCodeUrl !== undefined ? { gpayQrCodeUrl } : {}),
        ...(gpayConnected !== undefined ? { gpayConnected } : {}),
        ...(phonepeUpiId !== undefined ? { phonepeUpiId } : {}),
        ...(phonepePhoneNumber !== undefined ? { phonepePhoneNumber } : {}),
        ...(phonepeQrCodeUrl !== undefined ? { phonepeQrCodeUrl } : {}),
        ...(phonepeConnected !== undefined ? { phonepeConnected } : {}),
        ...(paytmUpiId !== undefined ? { paytmUpiId } : {}),
        ...(paytmPhoneNumber !== undefined ? { paytmPhoneNumber } : {}),
        ...(paytmQrCodeUrl !== undefined ? { paytmQrCodeUrl } : {}),
        ...(paytmConnected !== undefined ? { paytmConnected } : {}),
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
