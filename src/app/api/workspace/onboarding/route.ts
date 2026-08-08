import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";

const DEFAULT_PORTFOLIO_FOCUS =
  "🏢 Residential Apartment (Flat / Condo / Penthouse)";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      wid,
      userId,
      email,
      companyName,
      businessType,
      operatingCity,
      currency,
      portfolioFocus,
      dueDay,
    } = body;

    let workspace = null;

    if (wid) {
      workspace = await prisma.workspace.findUnique({
        where: { wid: Number(wid) },
      });
    }

    if (!workspace && userId) {
      const profile = await prisma.profile.findUnique({
        where: { id: String(userId) },
        include: { workspaces: { orderBy: { wid: "asc" } } },
      });
      workspace = profile?.workspaces[0] ?? null;
    }

    if (!workspace && email) {
      const profile = await prisma.profile.findFirst({
        where: { email: { equals: String(email).trim(), mode: "insensitive" } },
        include: { workspaces: { orderBy: { wid: "asc" } } },
      });
      workspace = profile?.workspaces[0] ?? null;
    }

    // Create profile + trial workspace if missing (mobile signup fallback)
    if (!workspace && userId && email) {
      const created = await createUserProfileAndWorkspace({
        userId: String(userId),
        email: String(email).trim(),
        fullName: companyName?.trim() || "Workspace Owner",
        role: "owner",
        workspaceName: companyName?.trim() || undefined,
        currency: currency || "USD ($)",
      });
      workspace = created.workspace ?? null;
    }

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "No workspace found to update." },
        { status: 404 }
      );
    }

    const isFirstOnboarding = !workspace.isOnboarded;
    const paidPlans = new Set(["starter", "pro", "pro_plus", "enterprise"]);
    const shouldStartTrial =
      isFirstOnboarding && !paidPlans.has(String(workspace.plan || "").toLowerCase());

    const updatedWorkspace = await prisma.workspace.update({
      where: { wid: workspace.wid },
      data: {
        name: companyName || workspace.name,
        businessType: businessType || "Individual Landlord / Homeowner (Individual)",
        operatingCity: operatingCity || "Not Specified",
        currency: currency || "USD ($)",
        portfolioFocus: portfolioFocus || DEFAULT_PORTFOLIO_FOCUS,
        dueDay: dueDay ? Number(dueDay) : 1,
        isOnboarded: true,
        ...(shouldStartTrial
          ? {
              plan: "trial",
              trialStartedAt: workspace.trialStartedAt ?? new Date(),
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWorkspace,
      message: "Workspace onboarding successfully completed!",
    });
  } catch (error: any) {
    console.error("Error saving onboarding info:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save onboarding information." },
      { status: 500 }
    );
  }
}
