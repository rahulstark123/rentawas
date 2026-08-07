import { createHmac } from "crypto";
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

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

// POST /api/razorpay/verify — confirm payment success, then create Historical Receipt (Bill)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      propertyName,
      unitNumber,
      billingMonth,
      tenantId,
      unitId,
      propertyId,
      workspaceId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment details (order_id, payment_id, signature)." },
        { status: 400 }
      );
    }

    const wid = workspaceId ? parseInt(String(workspaceId), 10) : NaN;
    const { keyId, keySecret } = await resolveRazorpayKeys(
      !isNaN(wid) && wid > 0 ? wid : null
    );

    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 400 });
    }

    const signatureOk = verifySignature(
      String(razorpay_order_id),
      String(razorpay_payment_id),
      String(razorpay_signature),
      keySecret
    );

    if (!signatureOk) {
      return NextResponse.json(
        { error: "Payment signature verification failed. Receipt was not created." },
        { status: 400 }
      );
    }

    // Confirm payment status with Razorpay (captured / authorized only)
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const payRes = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(String(razorpay_payment_id))}`,
      { headers: { Authorization: authHeader } }
    );
    const payment = await payRes.json();

    if (!payRes.ok) {
      return NextResponse.json(
        { error: payment?.error?.description || "Failed to fetch Razorpay payment status." },
        { status: 400 }
      );
    }

    const status = String(payment?.status || "").toLowerCase();
    const paid = status === "captured" || status === "authorized";

    if (!paid) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          status,
          error: `Payment is not successful (status: ${status || "unknown"}). Receipt was not created.`,
        },
        { status: 400 }
      );
    }

    const paymentMethod = `Razorpay (ID: ${razorpay_payment_id})`;

    // Idempotent: skip if this payment already has a receipt
    const existing = await prisma.bill.findFirst({
      where: {
        paymentMethod,
        ...(tenantId ? { tenantId: String(tenantId) } : {}),
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        paid: true,
        alreadyRecorded: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status,
        data: existing,
      });
    }

    const rentAmount =
      amount != null && !isNaN(Number(amount))
        ? Number(amount)
        : typeof payment.amount === "number"
          ? payment.amount / 100
          : 0;

    if (!rentAmount || rentAmount <= 0) {
      return NextResponse.json({ error: "Could not determine paid amount." }, { status: 400 });
    }

    const monthCode = new Date().toISOString().slice(0, 7);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${monthCode}-${randomNum}`;

    const monthLabel =
      billingMonth ||
      new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    let autoReceipt = true;
    if (propertyId) {
      const prop = await prisma.property.findUnique({
        where: { id: String(propertyId) },
        select: { autoReceiptEnabled: true },
      });
      autoReceipt = prop?.autoReceiptEnabled ?? true;
    }

    const gatewayNotes = autoReceipt
      ? `gateway_verified;receipt_issued;Razorpay order ${razorpay_order_id}`
      : `gateway_verified;Razorpay order ${razorpay_order_id}`;

    const billData: any = {
      invoiceNumber,
      title: `Rent Payment — ${monthLabel} — ${propertyName || "Residence"} (${unitNumber || "Unit"})`,
      amount: rentAmount,
      status: "Paid",
      category: "Rent",
      paymentMethod,
      notes: gatewayNotes,
      floorNumber: 1,
      paidDate: new Date(),
      dueDate: new Date(),
    };

    if (tenantId) billData.tenant = { connect: { id: String(tenantId) } };
    if (unitId) billData.unit = { connect: { id: String(unitId) } };
    if (propertyId) billData.property = { connect: { id: String(propertyId) } };
    if (!isNaN(wid) && wid > 0) billData.workspace = { connect: { wid } };

    const bill = await prisma.bill.create({
      data: billData,
      include: {
        tenant: true,
        unit: true,
        property: true,
      },
    });

    return NextResponse.json({
      success: true,
      paid: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status,
      data: bill,
    });
  } catch (error: any) {
    console.error("Razorpay verify API error:", error);
    return NextResponse.json(
      { error: "Failed to verify Razorpay payment.", details: error?.message },
      { status: 500 }
    );
  }
}
