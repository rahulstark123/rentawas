import { NextResponse } from "next/server";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";

// POST /api/auth/signup-profile — create Prisma profile + workspace after Supabase signup (mobile + web clients)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, fullName, phone, role, portfolioScale } = body;

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json(
        { success: false, error: "userId, email, fullName, and role are required." },
        { status: 400 }
      );
    }

    const normalizedRole =
      role === "tenant" || role === "TENANT" ? "tenant" : "owner";

    const result = await createUserProfileAndWorkspace({
      userId,
      email: String(email).trim(),
      fullName: String(fullName).trim(),
      phone: phone ? String(phone).trim() : undefined,
      role: normalizedRole,
      portfolioScale: portfolioScale ? String(portfolioScale) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profileId: result.profile?.id,
        wid: result.wid,
        role: normalizedRole,
        workspace: result.workspace
          ? {
              wid: result.workspace.wid,
              name: result.workspace.name,
              isOnboarded: result.workspace.isOnboarded,
              plan: result.workspace.plan,
              trialStartedAt: result.workspace.trialStartedAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("POST /api/auth/signup-profile error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Signup profile creation failed." },
      { status: 500 }
    );
  }
}
