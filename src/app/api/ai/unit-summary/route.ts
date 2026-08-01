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

// POST /api/ai/unit-summary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { unitNo, propertyId, workspaceId, question } = body;

    if (!unitNo || !workspaceId) {
      return NextResponse.json(
        { error: "unitNo and workspaceId are required." },
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

    // 2. Fetch live unit details from DB
    const cleanUnitNo = String(unitNo).trim();
    const unit = await prisma.unit.findFirst({
      where: {
        ...(propertyId ? { propertyId } : {}),
        OR: [
          { unitNumber: cleanUnitNo },
          { unitNumber: `Unit ${cleanUnitNo}` },
          { unitNumber: cleanUnitNo.replace(/^Unit\s*/i, "") },
        ],
      },
      include: {
        property: true,
        tenants: true,
        maintenances: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        bills: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const propName = unit?.property?.name || "Property";
    const actualUnitNo = unit?.unitNumber || cleanUnitNo;
    const isOccupied = unit?.isOccupied || false;
    const monthlyRent = unit?.rent || 0;
    const floorNo = unit?.floorNumber || 1;

    const primaryTenant = unit?.tenants?.[0] || null;
    const tenantName = primaryTenant?.name || (isOccupied ? "Resident Assigned" : "Vacant (No Resident)");
    const tenantHealth = primaryTenant?.healthScore || 75;
    const leaseStartStr = primaryTenant?.leaseStart ? new Date(primaryTenant.leaseStart).toISOString().split("T")[0] : "N/A";
    const leaseEndStr = primaryTenant?.leaseEnd ? new Date(primaryTenant.leaseEnd).toISOString().split("T")[0] : "N/A";

    const openTickets = unit?.maintenances ? unit.maintenances.filter((m: any) => m.status !== "Resolved") : [];
    const totalBills = unit?.bills?.length || 0;
    const paidBills = unit?.bills ? unit.bills.filter((b: any) => b.status === "Paid").length : 0;
    const pendingBills = unit?.bills ? unit.bills.filter((b: any) => b.status === "Pending" || b.status === "Overdue").length : 0;

    // 3. Build AI prompt
    const defaultFormatInstructions = `Provide your unit telemetry & operational analysis in this EXACT format with 4 sections. Keep each section to 2-3 sentences max. Be specific with numbers.

### 🚪 Unit Status & Overview
[Summary of unit occupancy status, floor location, and lease standing]

### 👤 Resident & Behavioral Health
[Analysis of primary resident profile, payment history, health score & contract status]

### 💰 Financial Yield & Rent Health
[Evaluation of monthly rent rate, billing history, paid vs pending invoices]

### 🔧 Maintenance & Repairs History
[Summary of reported maintenance tickets, open issues, and repair status]`;

    const userQuestionInstructions = `The landlord has a specific question regarding ${actualUnitNo} in ${propName}:
Question: "${question}"

Provide a clear, detailed, and professional answer based strictly on the unit data above. Use emoji headers (### 💡 ...), bullet points, and specific figures where applicable.`;

    const prompt = `You are RentAwas Buddy, an expert unit-level real estate telemetry AI for RentAwas.
Analyze this specific rental unit's telemetry and provide actionable insights for the landlord.

## Unit Telemetry Data
- **Building Property:** ${propName}
- **Unit Number:** ${actualUnitNo}
- **Floor Number:** Floor ${floorNo}
- **Occupancy Status:** ${isOccupied ? "Occupied" : "Vacant"}
- **Monthly Rent:** ₹${monthlyRent.toLocaleString("en-IN")}/month

## Resident Info (If Occupied)
- **Resident Name:** ${tenantName}
- **Behavioral Health Score:** ${tenantHealth}/100
- **Lease Start:** ${leaseStartStr}
- **Lease Expiry:** ${leaseEndStr}
- **Govt ID Scan:** ${primaryTenant?.govIdUrl ? "Yes (Verified)" : "No (Missing)"}
- **Lease Contract:** ${primaryTenant?.leaseDocUrl ? "Yes (Signed)" : "No (Missing)"}

## Payment & Invoicing Record
- Total Invoices Logged: ${totalBills} | Paid: ${paidBills} | Pending/Overdue: ${pendingBills}

## Maintenance & Issue Record
- Total Tickets Logged: ${unit?.maintenances?.length || 0}
- Open/Unresolved Tickets: ${openTickets.length}
- High Priority Issues: ${openTickets.filter((t: any) => t.priority === "Emergency" || t.priority === "High").length}

---

${question && question.trim() && question !== "Unit Status & Summary" ? userQuestionInstructions : defaultFormatInstructions}`;

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

    return NextResponse.json({
      success: true,
      summary: summaryText,
      generatedAt: generatedAt.toISOString(),
      creditsUsed: creditsUsed + 2,
      creditLimit,
      plan,
    });
  } catch (error: any) {
    console.error("POST /api/ai/unit-summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI unit analysis", details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/ai/unit-summary?workspaceId=3
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
