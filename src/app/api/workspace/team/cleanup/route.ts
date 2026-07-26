import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workspace/team/cleanup - Delete all dummy team member records
export async function GET() {
  try {
    const deleted = await prisma.teamMember.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deleted.count} dummy team member records from PostgreSQL database!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
