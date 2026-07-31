import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

// GET /api/workspace/team - Fetch workspace team members from database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;

    // Purge legacy seeded dummy records if any exist in database
    await prisma.teamMember.deleteMany({
      where: {
        email: {
          in: [
            "alexander@regencymanagement.com",
            "sarah.j@regencymanagement.com",
            "david.r@accounting.com",
            "dispatch@quickplumb.com",
          ],
        },
      },
    });

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        OR: [{ workspaceId: wid }, { workspaceId: null }],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: teamMembers });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch workspace team members", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/workspace/team - Add a new team member to workspace & create login credentials automatically
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, countryCode, phone, role, password, wid } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Full Name and Email Address are required fields." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? `${countryCode || "+1"} ${phone.trim()}` : null;
    const memberPassword = (password && password.trim()) || "Rentawas@123";
    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;

    // Check if target workspace exists in database
    const existingWs = await prisma.workspace.findUnique({
      where: { wid: workspaceIdNum },
    });

    const targetWsId = existingWs ? existingWs.wid : null;

    // 1. Create or ensure Supabase Auth user & Prisma Profile exist for Team Member login
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

    // 2. Create or update TeamMember record in database
    const newMember = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        countryCode: countryCode || "+1",
        phone: phone ? phone.trim() : null,
        role: role || "Manager", // "Owner", "Admin", "Manager", "Employee"
        password: memberPassword,
        status: "Active",
        workspaceId: targetWsId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Team member "${newMember.name}" added to workspace! Login account created for (${cleanEmail}).`,
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
