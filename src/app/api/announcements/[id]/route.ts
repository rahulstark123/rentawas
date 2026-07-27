import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/announcements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement", details: error?.message },
      { status: 500 }
    );
  }
}
