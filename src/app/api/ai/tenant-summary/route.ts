import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanCreditLimit } from "@/lib/aiCredits";
import { recordAiUsageLog } from "@/lib/aiUsageLog";

// POST /api/ai/tenant-summary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, workspaceId, question } = body;

    if (!tenantId || !workspaceId) {
      return NextResponse.json(
        { error: "tenantId and workspaceId are required." },
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

    // 2. Fetch live tenant details from DB
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        property: true,
        maintenances: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: { id: true, priority: true, status: true, category: true, issue: true, createdAt: true },
        },
        roomHistories: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        bills: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const propName = tenant.property?.name || tenant.unit?.property?.name || "Property";
    const unitNo = tenant.unit?.unitNumber || "Unit";
    const leaseStartStr = tenant.leaseStart ? new Date(tenant.leaseStart).toISOString().split("T")[0] : "N/A";
    const leaseEndStr = tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split("T")[0] : "N/A";

    const openTickets = tenant.maintenances.filter((m: any) => m.status !== "Resolved");
    const totalBills = tenant.bills.length;
    const paidBills = tenant.bills.filter((b: any) => b.status === "Paid").length;
    const pendingBills = tenant.bills.filter((b: any) => b.status === "Pending" || b.status === "Overdue").length;

    // 3. Build AI prompt
    const defaultFormatInstructions = `Provide your behavioral & operational analysis in this EXACT format with 4 sections. Keep each section to 2-3 sentences max. Be specific with numbers.

### 👤 Tenant Overview
[Summary of resident profile, lease standing, and general reliability]

### 💰 Rent & Payment Health
[Analysis of rent rate, payment compliance, due days, and billing status]

### 📄 Compliance & Documentation
[Verification status of ID scan, lease agreement, and any missing credentials]

### 🔧 Maintenance & Issue History
[Summary of reported maintenance tickets, resolution status, and behavioral impact]`;

    const userQuestionInstructions = `The landlord has a specific question regarding this tenant:
Question: "${question}"

Provide a clear, detailed, and professional answer based strictly on the tenant data above. Use emoji headers (### 💡 ...), bullet points, and specific figures where applicable.`;

    const prompt = `You are RentAwas Buddy, an expert resident behavioral AI analyst for the real estate platform RentAwas.
Analyze this resident's telemetry and provide actionable insights for the landlord.

## Resident Data
- **Name:** ${tenant.name}
- **Email:** ${tenant.email || "N/A"}
- **Phone:** ${tenant.phone || "N/A"}
- **Property & Unit:** ${propName} — ${unitNo}
- **Current Status:** ${tenant.currentStatus}
- **Behavioral Health Score:** ${tenant.healthScore}/100

## Lease Details
- **Monthly Rent:** ₹${(tenant.monthlyRent || 0).toLocaleString()}/month
- **Rent Due Day:** Day ${tenant.rentDueDay || 1} of each month
- **Lease Duration:** ${leaseStartStr} to ${leaseEndStr}

## Compliance & Documents
- **Govt ID Attached:** ${tenant.govIdUrl ? "Yes (Verified)" : "No (Missing)"}
- **Lease Contract Attached:** ${tenant.leaseDocUrl ? "Yes (Signed)" : "No (Missing)"}

## Payment & Billing Record
- Total Bills Logged: ${totalBills} | Paid: ${paidBills} | Pending/Overdue: ${pendingBills}

## Maintenance History
- Total Tickets Logged: ${tenant.maintenances.length}
- Open/Unresolved Tickets: ${openTickets.length}
- High Priority Issues: ${openTickets.filter((t: any) => t.priority === "Emergency" || t.priority === "High").length}

---

${question && question.trim() && question !== "Tenant Behavioral Summary" ? userQuestionInstructions : defaultFormatInstructions}`;

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
          feature: "Resident Behavioral Health Check",
          targetItem: `${propName} — ${unitNo} (${tenant.name || "Tenant"})`,
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
      feature: "Resident Behavioral Health Check",
      targetItem: `${propName} — ${unitNo} (${tenant.name || "Tenant"})`,
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
    console.error("POST /api/ai/tenant-summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI tenant analysis", details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/ai/tenant-summary?workspaceId=3
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
