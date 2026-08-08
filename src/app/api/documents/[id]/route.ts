import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/documents/[id]?workspaceId=3
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const workspaceId = widParam ? parseInt(widParam, 10) : NaN;

    if (!id) {
      return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
    }

    const existing = await prisma.tenantDocument.findUnique({
      where: { id },
      include: {
        property: { select: { workspaceId: true } },
        tenant: { select: { workspaceId: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (!isNaN(workspaceId) && workspaceId > 0) {
      const docWid =
        existing.workspaceId ??
        existing.property?.workspaceId ??
        existing.tenant?.workspaceId ??
        null;
      if (docWid != null && docWid !== workspaceId) {
        return NextResponse.json(
          { error: "Forbidden: Document does not belong to this workspace." },
          { status: 403 }
        );
      }
      if (docWid) {
        const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
        const documentDeleteDenied = await requireWorkspaceMutate(docWid);
        if (documentDeleteDenied) return documentDeleteDenied;
      }
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
