import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

function toStripeUnitAmount(amount: number, currency: string): number {
  const c = currency.toLowerCase();
  if (ZERO_DECIMAL.has(c)) return Math.round(amount);
  return Math.round(amount * 100);
}

async function resolveStripeKeys(workspaceId: number | null) {
  let stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
  let stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  let stripeConnectAccountId: string | null = null;

  if (workspaceId && workspaceId > 0) {
    const ws = await prisma.workspace.findUnique({ where: { wid: workspaceId } });
    if (ws?.stripeSecretKey) stripeSecretKey = ws.stripeSecretKey;
    if (ws?.stripePublishableKey) stripePublishableKey = ws.stripePublishableKey;
    if (ws?.stripeConnectAccountId) stripeConnectAccountId = ws.stripeConnectAccountId;
  }

  return { stripeSecretKey, stripePublishableKey, stripeConnectAccountId };
}

// POST /api/stripe/checkout — create a Stripe Checkout Session and return its URL
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = "USD",
      propertyName,
      unitNumber,
      tenantEmail,
      tenantName,
      tenantId,
      workspaceId,
      successUrl,
      cancelUrl,
    } = body;

    const rentAmount = Number(amount);
    if (!rentAmount || isNaN(rentAmount) || rentAmount <= 0) {
      return NextResponse.json({ error: "A valid rent amount is required." }, { status: 400 });
    }

    const wid = workspaceId ? parseInt(String(workspaceId), 10) : NaN;
    const { stripeSecretKey, stripePublishableKey, stripeConnectAccountId } =
      await resolveStripeKeys(!isNaN(wid) && wid > 0 ? wid : null);

    if (!stripeSecretKey || stripeSecretKey.length < 10 || stripeSecretKey.includes("sample")) {
      return NextResponse.json(
        { error: "Stripe is not configured by your landlord yet. Ask them to save a valid Secret Key." },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const currencyCode = String(currency || "USD").toLowerCase();
    const unitAmount = toStripeUnitAmount(rentAmount, currencyCode);
    const productLabel = `Monthly Rent — ${propertyName || "Residence"} (${unitNumber || "Unit"})`;

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set(
      "success_url",
      successUrl ||
        `${origin}/tenant/payments?stripe=success&session_id={CHECKOUT_SESSION_ID}`
    );
    params.set(
      "cancel_url",
      cancelUrl || `${origin}/tenant/payments?stripe=cancel`
    );
    params.set("line_items[0][price_data][currency]", currencyCode);
    params.set("line_items[0][price_data][product_data][name]", productLabel);
    params.set("line_items[0][price_data][unit_amount]", String(unitAmount));
    params.set("line_items[0][quantity]", "1");
    params.set("payment_method_types[0]", "card");

    if (tenantEmail) params.set("customer_email", String(tenantEmail));
    if (tenantId) params.set("metadata[tenantId]", String(tenantId));
    if (workspaceId) params.set("metadata[workspaceId]", String(workspaceId));
    if (propertyName) params.set("metadata[propertyName]", String(propertyName));
    if (unitNumber) params.set("metadata[unitNumber]", String(unitNumber));
    if (tenantName) params.set("metadata[tenantName]", String(tenantName));
    params.set("metadata[amount]", String(rentAmount));
    params.set("metadata[currency]", currencyCode);

    // Optional Connect destination if landlord linked a Connect account
    if (stripeConnectAccountId && stripeConnectAccountId.startsWith("acct_")) {
      params.set("payment_intent_data[transfer_data][destination]", stripeConnectAccountId);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok || !session?.id || !session?.url) {
      console.error("Stripe session create failed:", session);
      return NextResponse.json(
        {
          error:
            session?.error?.message ||
            "Failed to create Stripe Checkout session. Check landlord Stripe keys.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      publishableKey: stripePublishableKey || "",
    });
  } catch (error: any) {
    console.error("Stripe checkout API error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Stripe session.", details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/stripe/checkout?session_id=cs_xxx&workspaceId=1 — verify paid session
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : NaN;

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required." }, { status: 400 });
    }

    const { stripeSecretKey } = await resolveStripeKeys(
      !isNaN(wid) && wid > 0 ? wid : null
    );

    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      }
    );
    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      return NextResponse.json(
        { error: session?.error?.message || "Failed to retrieve Stripe session." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paid: session.payment_status === "paid",
      status: session.status,
      paymentStatus: session.payment_status,
      sessionId: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata || {},
    });
  } catch (error: any) {
    console.error("Stripe session verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify Stripe session.", details: error?.message },
      { status: 500 }
    );
  }
}
