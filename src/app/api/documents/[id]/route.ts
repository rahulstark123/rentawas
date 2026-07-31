import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/documents/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
    }

    await prisma.tenantDocument.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully!",
    });
  } catch (error: any) {
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete document", details: error?.message },
      { status: 500 }
    );
  }
}
