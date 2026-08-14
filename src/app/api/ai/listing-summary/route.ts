import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanCreditLimit } from "@/lib/aiCredits";
import { recordAiUsageLog } from "@/lib/aiUsageLog";

// POST /api/ai/listing-summary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId, workspaceId, question } = body;

    if (!listingId || !workspaceId) {
      return NextResponse.json(
        { error: "listingId and workspaceId are required." },
        { status: 400 }
      );
    }

    const wid = Number(workspaceId);
    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Invalid workspaceId." }, { status: 400 });
    }

    // 1. Fetch workspace + check credits (2 credits per query)
    const workspace = await prisma.workspace.findUnique({ where: { wid } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const plan = workspace.plan || "free";
    const creditLimit = getPlanCreditLimit(plan);
    const creditsUsed = workspace.aiCreditsUsed ?? 0;

    if (creditsUsed + 2 > creditLimit) {
      return NextResponse.json(
        {
          error: "AI_CREDITS_EXHAUSTED",
          message: `This action requires 2 AI credits. You have ${Math.max(0, creditLimit - creditsUsed)} credits left out of ${creditLimit} on your ${plan} plan. Upgrade to unlock more.`,
          creditsUsed,
          creditLimit,
          plan,
        },
        { status: 403 }
      );
    }

    // 2. Fetch live listing details from DB
    const listing = await prisma.propertyListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const totalInquiries = await prisma.tenantInquiry.count({
      where: { listingId: listing.id },
    });
    const locationText = `${listing.locality || ""}${listing.locality && listing.city ? ", " : ""}${listing.city || ""}`;
    const totalReviews = listing.reviewCount || 0;

    // 3. Build AI prompt
    const defaultFormatInstructions = `Provide your marketplace listing analysis in this EXACT format with 4 sections. Keep each section to 2-3 sentences max. Be specific with numbers.

### 🏷️ Listing Performance Overview
[Summary of marketplace visibility, listing status, and overall lead attraction]

### 💰 Pricing & Local Market Check
[Analysis of monthly rent rate, security deposit, maintenance terms versus marketplace benchmarks]

### 📩 Tenant Inquiries & Lead Interest
[Evaluation of tenant inquiry volume, conversion potential, and resident demand]

### ✨ Optimization & SEO Recommendations
[Specific tips to improve photos, description, amenities, or pricing to get 2x more inquiries]`;

    const userQuestionInstructions = `The landlord has a specific question regarding this marketplace listing:
Question: "${question}"

Provide a clear, detailed, and professional answer based strictly on the listing data above. Use emoji headers (### 💡 ...), bullet points, and specific figures where applicable.`;

    const prompt = `You are RentAwas Buddy, an expert marketplace listing optimization AI for RentAwas.
Analyze this property listing performance and provide actionable marketing & pricing advice.

## Listing Data
- **Title:** ${listing.title}
- **Property Type:** ${listing.propertyType || "Flat / Apartment"}
- **Location:** ${locationText}
- **Status:** ${listing.isLive !== false && listing.status !== "Draft" ? "Live on Marketplace" : "Draft (Private)"}
- **Monthly Rent:** ₹${(listing.rent || 0).toLocaleString("en-IN")}/month
- **Security Deposit:** ${listing.deposit ? `₹${listing.deposit.toLocaleString("en-IN")}` : "Not specified"}
- **Maintenance Fee:** ${listing.maintenance || "Included in rent"}
- **Available From:** ${listing.availableFrom || "Immediately"}
- **Preferred Tenants:** ${listing.tenantTypes ? listing.tenantTypes.join(", ") : "Any"}
- **WhatsApp Contact Enabled:** ${listing.whatsappEnabled ? "Yes" : "No"}

## Tenant Engagement Record
- Total Inquiries Received: ${totalInquiries}
- Total Ratings/Reviews: ${totalReviews} (Avg Rating: ${totalReviews > 0 && listing.avgRating ? listing.avgRating : "No reviews yet"})

---

${question && question.trim() && question !== "Listing Performance & Summary" ? userQuestionInstructions : defaultFormatInstructions}`;

    // 4. Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_FALLBACK;
    const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!groqApiKey) {
      return NextResponse.json({ error: "AI service not configured." }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const fallbackKey = process.env.GROQ_API_KEY_FALLBACK;
      if (fallbackKey && groqApiKey !== fallbackKey) {
        const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${fallbackKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });
        if (!fallbackRes.ok) {
          return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 502 });
        }
        const fallbackJson = await fallbackRes.json();
        const summaryText = fallbackJson.choices?.[0]?.message?.content || "";
        const generatedAt = new Date();
        await prisma.workspace.update({ where: { wid }, data: { aiCreditsUsed: creditsUsed + 2 } });
        await recordAiUsageLog({
          workspaceId: wid,
          feature: "Marketplace Listing Advice",
          targetItem: listing.title || "Listing",
          question: question,
        });
        return NextResponse.json({
          success: true,
          summary: summaryText,
          generatedAt: generatedAt.toISOString(),
          creditsUsed: creditsUsed + 2,
          creditLimit,
          plan,
        });
      }
      return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 502 });
    }

    const groqJson = await groqRes.json();
    const summaryText = groqJson.choices?.[0]?.message?.content || "";
    const generatedAt = new Date();

    // Increment credits used
    await prisma.workspace.update({
      where: { wid },
      data: { aiCreditsUsed: creditsUsed + 2 },
    });
    await recordAiUsageLog({
      workspaceId: wid,
      feature: "Marketplace Listing Advice",
      targetItem: listing.title || "Listing",
      question: question,
    });

    return NextResponse.json({
      success: true,
      summary: summaryText,
      generatedAt: generatedAt.toISOString(),
      creditsUsed: creditsUsed + 2,
      creditLimit,
      plan,
    });
  } catch (error: any) {
    console.error("POST /api/ai/listing-summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI listing analysis", details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/ai/listing-summary?workspaceId=3
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : NaN;

    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { wid },
      select: { plan: true, aiCreditsUsed: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const plan = workspace.plan || "free";
    const creditLimit = getPlanCreditLimit(plan);
    const creditsUsed = workspace.aiCreditsUsed ?? 0;

    return NextResponse.json({
      success: true,
      plan,
      creditLimit,
      creditsUsed,
      creditsLeft: Math.max(0, creditLimit - creditsUsed),
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch AI credits", details: error?.message }, { status: 500 });
  }
}
