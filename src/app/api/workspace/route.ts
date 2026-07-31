import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workspace - Fetch workspace profile, active plan & live unit counts from PostgreSQL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;

    // Update any legacy "starter" plan records to "trial"
    await prisma.workspace.updateMany({
      where: { plan: "starter" },
      data: { plan: "trial" },
    });

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
        name: workspace?.name || "Grand Regency Management LLC",
        plan: workspace?.plan || "trial",
        currency: workspace?.currency || "USD ($)",
        portfolioScale: workspace?.portfolioScale || "1-5",
        ownerName: workspace?.owner?.fullName || "Alexander Wright",
        ownerEmail: workspace?.owner?.email || "alexander@regencymanagement.com",
        companyType: workspace?.companyType || "LLC (Limited Liability Company)",
        taxId: workspace?.taxId || "EIN 92-8491029 / GSTIN 27AAACR1234F1Z9",
        registeredAddress: workspace?.registeredAddress || "1420 5th Ave, Suite 3000, Seattle, WA 98101",
        landlordName: workspace?.landlordName || workspace?.owner?.fullName || "Alexander Wright",
        landlordRole: workspace?.landlordRole || "Managing Director & Asset Owner",
        companyEmail: workspace?.companyEmail || workspace?.owner?.email || "support@regencymanagement.com",
        companyPhone: workspace?.companyPhone || workspace?.owner?.phone || "+1 (555) 019-2834",
        jurisdiction: workspace?.jurisdiction || "Seattle, WA (USA)",
        pincode: workspace?.pincode || "98101",
        timezone: workspace?.timezone || "(UTC-08:00) Pacific Time (US & Canada)",
        fiscalYearStart: workspace?.fiscalYearStart || "January (Standard Calendar Year)",
        customSubdomain: workspace?.customSubdomain || "regency.rentawas.com",
        tagline: workspace?.tagline || "Premier Residential & Executive Asset Management",
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
        paypalClientId: workspace?.paypalClientId || "",
        paypalClientSecret: workspace?.paypalClientSecret || "",
        paypalMerchantEmail: workspace?.paypalMerchantEmail || "",
        paypalWebhookId: workspace?.paypalWebhookId || "",
        paypalEnvMode: workspace?.paypalEnvMode || "test",
        paypalConnected: workspace?.paypalConnected ?? false,
        upiId: workspace?.upiId || "",
        upiPhoneNumber: workspace?.upiPhoneNumber || "",
        upiQrCodeUrl: workspace?.upiQrCodeUrl || "",
        upiAccountName: workspace?.upiAccountName || "",
        upiAppsSupported: workspace?.upiAppsSupported || "Google Pay, PhonePe, Paytm, BHIM UPI",
        upiConnected: workspace?.upiConnected ?? false,
        gpayUpiId: workspace?.gpayUpiId || "",
        gpayPhoneNumber: workspace?.gpayPhoneNumber || "",
        gpayQrCodeUrl: workspace?.gpayQrCodeUrl || "",
        gpayConnected: workspace?.gpayConnected ?? false,
        phonepeUpiId: workspace?.phonepeUpiId || "",
        phonepePhoneNumber: workspace?.phonepePhoneNumber || "",
        phonepeQrCodeUrl: workspace?.phonepeQrCodeUrl || "",
        phonepeConnected: workspace?.phonepeConnected ?? false,
        paytmUpiId: workspace?.paytmUpiId || "",
        paytmPhoneNumber: workspace?.paytmPhoneNumber || "",
        paytmQrCodeUrl: workspace?.paytmQrCodeUrl || "",
        paytmConnected: workspace?.paytmConnected ?? false,
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

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;

    const updatedWs = await prisma.workspace.update({
      where: { wid: workspaceIdNum },
      data: {
        ...(plan ? { plan } : {}),
        ...(name ? { name } : {}),
        ...(currency ? { currency } : {}),
        ...(portfolioScale ? { portfolioScale } : {}),
        ...(companyType !== undefined ? { companyType } : {}),
        ...(taxId !== undefined ? { taxId } : {}),
        ...(registeredAddress !== undefined ? { registeredAddress } : {}),
        ...(landlordName !== undefined ? { landlordName } : {}),
        ...(landlordRole !== undefined ? { landlordRole } : {}),
        ...(companyEmail !== undefined ? { companyEmail } : {}),
        ...(companyPhone !== undefined ? { companyPhone } : {}),
        ...(jurisdiction !== undefined ? { jurisdiction } : {}),
        ...(pincode !== undefined ? { pincode } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
        ...(fiscalYearStart !== undefined ? { fiscalYearStart } : {}),
        ...(customSubdomain !== undefined ? { customSubdomain } : {}),
        ...(tagline !== undefined ? { tagline } : {}),
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
