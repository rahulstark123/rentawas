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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    const body = await request.json();
    const updated = await prisma.announcement.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      message: "Announcement updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/announcements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update announcement", details: error?.message },
      { status: 500 }
    );
  }
}
