import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// POST /api/workspace/team - Add a new team member to workspace
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

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;

    const newMember = await prisma.teamMember.create({
      data: {
        name,
        email,
        countryCode: countryCode || "+1",
        phone: phone || null,
        role: role || "Manager", // "Owner", "Admin", "Manager", "Employee"
        password: password || null,
        status: "Active",
        workspaceId: workspaceIdNum,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Team member "${newMember.name}" added to workspace #${workspaceIdNum} successfully!`,
      data: newMember,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to add team member", details: error?.message },
      { status: 500 }
    );
  }
}
