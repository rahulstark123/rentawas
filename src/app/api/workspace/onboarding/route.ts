import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_PORTFOLIO_FOCUS =
  "🏢 Residential Apartment (Flat / Condo / Penthouse)";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      wid, 
      companyName, 
      businessType, 
      operatingCity, 
      currency, 
      portfolioFocus, 
      dueDay 
    } = body;

    let targetWid = wid ? Number(wid) : 1;

    // Find workspace by wid or default to first workspace
    let workspace = await prisma.workspace.findUnique({
      where: { wid: targetWid }
    });

    if (!workspace) {
      workspace = await prisma.workspace.findFirst({
        orderBy: { wid: "asc" }
      });
      if (workspace) targetWid = workspace.wid;
    }

    if (!workspace) {
      return NextResponse.json({ success: false, error: "No workspace found to update." }, { status: 404 });
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { wid: targetWid },
      data: {
        name: companyName || workspace.name,
        businessType: businessType || "Individual Landlord / Homeowner (Individual)",
        operatingCity: operatingCity || "Not Specified",
        currency: currency || "USD ($)",
        portfolioFocus: portfolioFocus || DEFAULT_PORTFOLIO_FOCUS,
        dueDay: dueDay ? Number(dueDay) : 1,
        isOnboarded: true,
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
