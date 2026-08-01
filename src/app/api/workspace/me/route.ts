import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workspace/me?userId=xxx  OR  ?email=xxx
// Returns the owner's primary workspace so the client can scope data by wid.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId or email is required" },
        { status: 400 }
      );
    }

    let profile = null;
    if (userId) {
      profile = await prisma.profile.findUnique({
        where: { id: userId },
        include: {
          workspaces: { orderBy: { wid: "asc" } },
        },
      });
    }

    if (!profile && email) {
      profile = await prisma.profile.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        include: {
          workspaces: { orderBy: { wid: "asc" } },
        },
      });
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const workspace = profile.workspaces[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        profileId: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        wid: workspace?.wid ?? null,
        workspace: workspace
          ? {
              wid: workspace.wid,
              name: workspace.name,
              currency: workspace.currency,
              plan: workspace.plan,
              isOnboarded: workspace.isOnboarded,
            }
          : null,
        workspaces: profile.workspaces.map((w) => ({
          wid: w.wid,
          name: w.name,
          currency: w.currency,
          plan: w.plan,
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/workspace/me error:", error);
    return NextResponse.json(
      { error: "Failed to resolve workspace", details: error?.message },
      { status: 500 }
    );
  }
}
