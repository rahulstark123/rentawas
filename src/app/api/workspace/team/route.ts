import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

function parseWid(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = parseInt(String(raw), 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// GET /api/workspace/team?wid=3
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wid = parseWid(searchParams.get("wid") || searchParams.get("workspaceId"));

    if (!wid) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, workspaceId: wid, data: teamMembers });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch workspace team members", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/workspace/team - Add team member (requires wid)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, countryCode, phone, role, password, wid, workspaceId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Full Name and Email Address are required fields." },
        { status: 400 }
      );
    }

    const workspaceIdNum = parseWid(wid ?? workspaceId);
    if (!workspaceIdNum) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? `${countryCode || "+1"} ${phone.trim()}` : null;
    const memberPassword = (password && password.trim()) || "Rentawas@123";

    const existingWs = await prisma.workspace.findUnique({
      where: { wid: workspaceIdNum },
    });
    if (!existingWs) {
      return NextResponse.json(
        { error: `Workspace #${workspaceIdNum} not found.` },
        { status: 404 }
      );
    }

    let linkedProfileId: string | null = null;
    try {
      let existingProfile = await prisma.profile.findUnique({
        where: { email: cleanEmail },
      });

      if (!existingProfile) {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: memberPassword,
          options: {
            data: {
              fullName: name,
              role: "landlord",
              phone: cleanPhone,
            },
          },
        });

        const userId = authData?.user?.id || `team_${Date.now()}`;

        existingProfile = await prisma.profile.upsert({
          where: { email: cleanEmail },
          update: {
            fullName: name,
            phone: cleanPhone || null,
            role: "OWNER" as any,
          },
          create: {
            id: userId,
            email: cleanEmail,
            fullName: name,
            phone: cleanPhone || null,
            role: "OWNER" as any,
          },
        });
      }

      if (existingProfile) {
        linkedProfileId = existingProfile.id;
      }
    } catch (authErr) {
      console.warn("Could not create Supabase Auth User for Team Member, fallback to TeamMember record:", authErr);
    }

    const newMember = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        countryCode: countryCode || "+1",
        phone: phone ? phone.trim() : null,
        role: role || "Manager",
        password: memberPassword,
        status: "Active",
        workspaceId: workspaceIdNum,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Team member "${newMember.name}" added to workspace #${workspaceIdNum}!`,
      data: {
        ...newMember,
        profileId: linkedProfileId,
        loginPassword: memberPassword,
      },
    });
  } catch (error: any) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add team member. Please try again." },
      { status: 400 }
    );
  }
}
