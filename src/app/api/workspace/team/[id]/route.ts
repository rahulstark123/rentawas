import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/workspace/team/[id] - Revoke/Delete team member access
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    if (existing.role === "Owner") {
      return NextResponse.json(
        { error: "Cannot remove Workspace Owner access." },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Access for team member "${existing.name}" revoked successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete team member", details: error?.message },
      { status: 500 }
    );
  }
}
