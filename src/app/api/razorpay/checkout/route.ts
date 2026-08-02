import { NextResponse } from "next/server";

// POST /api/razorpay/checkout - Generate order_id or subscription_id for Razorpay Checkout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, planName, amount, isRecurring } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    const hasRealKeys = keyId.length > 5 && !keyId.includes("placeholder") && keySecret.length > 5;

    if (hasRealKeys) {
      try {
        const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        
        if (isRecurring) {
          // Real Razorpay Subscription API Call
          const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({
              plan_id: planId,
              total_count: 12,
              quantity: 1,
              customer_notify: 1,
            }),
          });
          const subData = await subRes.json();
          if (subData.id) {
            return NextResponse.json({
              success: true,
              isRealRazorpay: true,
              type: "subscription",
              subscription_id: subData.id,
              key_id: keyId,
              amount: Math.round(amount * 100),
            });
          }
        } else {
          // Real Razorpay Order API Call
          const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              currency: "INR",
              receipt: `rcpt_${Date.now()}`,
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.id) {
            return NextResponse.json({
              success: true,
              isRealRazorpay: true,
              type: "order",
              order_id: orderData.id,
              key_id: keyId,
              amount: Math.round(amount * 100),
            });
          }
        }
      } catch (err) {
        console.warn("Razorpay API request notice:", err);
      }
    }

    // Demo / Sandbox mode fallback
    return NextResponse.json({
      success: true,
      isRealRazorpay: false,
      type: isRecurring ? "subscription" : "order",
      key_id: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SdilED7xPbKcdV",
      amount: Math.round(amount * 100),
      currency: "INR",
      notes: {
        planId,
        planName,
        paymentType: isRecurring ? "Recurring Subscription" : "One-Time Payment",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate Razorpay checkout payload", details: error?.message },
      { status: 500 }
    );
  }
}
