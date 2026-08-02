import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function resolveRazorpayKeys(workspaceId: number | null) {
  let keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  let keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (workspaceId && workspaceId > 0) {
    const ws = await prisma.workspace.findUnique({ where: { wid: workspaceId } });
    if (ws?.razorpayKeyId) keyId = ws.razorpayKeyId;
    if (ws?.razorpayKeySecret) keySecret = ws.razorpayKeySecret;
  }

  return { keyId, keySecret };
}

// POST /api/razorpay/order — create a Razorpay order for tenant rent using landlord workspace keys
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = "INR",
      propertyName,
      unitNumber,
      tenantId,
      workspaceId,
      tenantName,
      tenantEmail,
    } = body;

    const rentAmount = Number(amount);
    if (!rentAmount || isNaN(rentAmount) || rentAmount <= 0) {
      return NextResponse.json({ error: "A valid rent amount is required." }, { status: 400 });
    }

    const wid = workspaceId ? parseInt(String(workspaceId), 10) : NaN;
    const { keyId, keySecret } = await resolveRazorpayKeys(
      !isNaN(wid) && wid > 0 ? wid : null
    );

    if (!keyId || keyId.length < 5 || !keySecret || keySecret.length < 5) {
      return NextResponse.json(
        {
          error:
            "Razorpay is not configured by your landlord yet. Ask them to save a valid Key ID and Secret.",
        },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(rentAmount * 100);
    const currencyCode = String(currency || "INR").toUpperCase();
    const receipt = `rent_${Date.now()}`.slice(0, 40);
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: currencyCode,
        receipt,
        notes: {
          tenantId: tenantId ? String(tenantId) : "",
          workspaceId: workspaceId ? String(workspaceId) : "",
          propertyName: propertyName ? String(propertyName) : "",
          unitNumber: unitNumber ? String(unitNumber) : "",
          tenantName: tenantName ? String(tenantName) : "",
          tenantEmail: tenantEmail ? String(tenantEmail) : "",
          amount: String(rentAmount),
        },
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok || !order?.id) {
      console.error("Razorpay order create failed:", order);
      return NextResponse.json(
        {
          error:
            order?.error?.description ||
            "Failed to create Razorpay order. Check landlord Razorpay keys.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error("Razorpay order API error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order.", details: error?.message },
      { status: 500 }
    );
  }
}
