import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// AI credit limits per plan
const CREDIT_LIMITS: Record<string, number> = {
  trial: 20,
  free: 20,
  starter: 50,
  pro: 200,
  pro_plus: 500,
};

function getPlanCreditLimit(plan: string): number {
  return CREDIT_LIMITS[plan] ?? 20;
}

// POST /api/ai/property-summary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, workspaceId, question } = body;

    if (!propertyId || !workspaceId) {
      return NextResponse.json(
        { error: "propertyId and workspaceId are required." },
        { status: 400 }
      );
    }

    const wid = Number(workspaceId);
    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Invalid workspaceId." }, { status: 400 });
    }

    // 1. Fetch workspace + check credits
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

    // 2. Fetch live property data from DB
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: {
          include: {
            tenants: {
              where: { currentStatus: "Current" },
              select: { id: true, name: true, monthlyRent: true, healthScore: true, leaseEnd: true },
            },
          },
        },
        tenants: {
          where: { currentStatus: "Current" },
          select: { id: true, name: true, monthlyRent: true, healthScore: true },
        },
        maintenances: {
          where: { status: { not: "Resolved" } },
          select: { id: true, priority: true, status: true, category: true, issue: true },
        },
        bills: {
          take: 20,
          orderBy: { createdAt: "desc" },
          select: { amount: true, status: true, category: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    // 3. Compute summary stats for the prompt
    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter((u) => u.isOccupied).length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const allActiveTenants = property.tenants;
    const monthlyRevenue = allActiveTenants.reduce((sum, t) => sum + (t.monthlyRent || 0), 0);
    const avgHealthScore =
      allActiveTenants.length > 0
        ? Math.round(allActiveTenants.reduce((s, t) => s + (t.healthScore || 75), 0) / allActiveTenants.length)
        : 0;

    const openTickets = property.maintenances;
    const emergencyTickets = openTickets.filter((t) => t.priority === "Emergency" || t.priority === "High");

    // Lease expiry alerts (within 60 days)
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringLeases = property.units
      .flatMap((u) => u.tenants)
      .filter((t) => t.leaseEnd && new Date(t.leaseEnd) <= sixtyDaysFromNow);

    // Revenue from bills
    const totalBilled = property.bills.reduce((s, b) => s + (b.amount || 0), 0);
    const paidBills = property.bills.filter((b) => b.status === "Paid");
    const pendingBills = property.bills.filter((b) => b.status === "Pending" || b.status === "Overdue");

    // 4. Build the AI prompt
    const defaultFormatInstructions = `Provide your analysis in this EXACT format with these 5 sections. Keep each section to 2-3 sentences max. Be specific with numbers. Use an assertive, professional tone.

### 🏠 Property Overview
[Brief summary of the property's current state and portfolio standing]

### 📊 Occupancy Intelligence  
[Analysis of occupancy performance and what it means for revenue]

### 💰 Financial Health
[Revenue performance, billing health, and financial outlook]

### ⚠️ Risk Alerts
[Any critical issues: maintenance backlog, expiring leases, overdue bills, low health scores. If none, say "No critical risks detected."]

### ✅ Recommended Actions
[3 specific, actionable recommendations the landlord should take this week]`;

    const userQuestionInstructions = `The landlord has a specific question regarding this property:
Question: "${question}"

Provide a clear, detailed, and professional answer based strictly on the property data above. Use emoji headers (### 💡 ...), bullet points, and specific figures where applicable.`;

    const prompt = `You are RentAwas Buddy, a professional property management AI assistant for the real estate platform RentAwas.
Analyze this property and provide actionable insights for the landlord.

## Property Data
- **Name:** ${property.name}
- **Category:** ${property.category}
- **Address:** ${property.address}
- **Total Floors:** ${property.floors}
- **Total Units:** ${totalUnits}

## Occupancy
- Occupied Units: ${occupiedUnits} / ${totalUnits} (${occupancyRate}%)
- Vacant Units: ${vacantUnits}

## Financials
- Monthly Gross Revenue: ₹${monthlyRevenue.toLocaleString()}/month
- Total Billed (recent): ₹${totalBilled.toLocaleString()}
- Paid Bills: ${paidBills.length} | Pending/Overdue Bills: ${pendingBills.length}

## Residents
- Active Tenants: ${allActiveTenants.length}
- Average Tenant Health Score: ${avgHealthScore}/100
- Leases Expiring Within 60 Days: ${expiringLeases.length}

## Maintenance
- Open/Active Tickets: ${openTickets.length}
- High Priority / Emergency: ${emergencyTickets.length}
- Categories: ${[...new Set(openTickets.map((t) => t.category))].join(", ") || "None"}

---

${question && question.trim() && question !== "Summarise Property" ? userQuestionInstructions : defaultFormatInstructions}`;

    // 5. Call Groq API
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
      const errText = await groqRes.text();
      console.error("Groq API error:", errText);
      // Try fallback key
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
        // Save to workspace credits + property summary cache
        await Promise.all([
          prisma.workspace.update({ where: { wid }, data: { aiCreditsUsed: creditsUsed + 2 } }),
          prisma.property.update({
            where: { id: propertyId },
            data: { aiSummary: summaryText, aiSummaryGeneratedAt: generatedAt },
          }),
        ]);
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

    // 6. Increment credits used + save summary to Property (upsert-style — always replaces)
    await Promise.all([
      prisma.workspace.update({
        where: { wid },
        data: { aiCreditsUsed: creditsUsed + 2 },
      }),
      prisma.property.update({
        where: { id: propertyId },
        data: { aiSummary: summaryText, aiSummaryGeneratedAt: generatedAt },
      }),
    ]);

    return NextResponse.json({
      success: true,
      summary: summaryText,
      generatedAt: generatedAt.toISOString(),
      creditsUsed: creditsUsed + 2,
      creditLimit,
      plan,
    });
  } catch (error: any) {
    console.error("POST /api/ai/property-summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary", details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/ai/property-summary?workspaceId=3&propertyId=xyz — check credits + load saved summary
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : NaN;
    const propertyId = searchParams.get("propertyId");

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

    // Also fetch cached summary for this property if propertyId provided
    let savedSummary: string | null = null;
    let savedAt: string | null = null;
    if (propertyId) {
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { aiSummary: true, aiSummaryGeneratedAt: true },
      });
      if (prop) {
        savedSummary = prop.aiSummary ?? null;
        savedAt = prop.aiSummaryGeneratedAt ? prop.aiSummaryGeneratedAt.toISOString() : null;
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      creditLimit,
      creditsUsed,
      creditsLeft: Math.max(0, creditLimit - creditsUsed),
      savedSummary,
      savedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch AI credits", details: error?.message }, { status: 500 });
  }
}
