import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/receipt-signatures/[id]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.rentReceiptSignature.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Signature not found." }, { status: 404 });
    }

    await prisma.rentReceiptTemplate.updateMany({
      where: { signatureId: id },
      data: { signatureId: null },
    });

    await prisma.rentReceiptSignature.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Signature deleted." });
  } catch (error: any) {
    console.error("DELETE /api/receipt-signatures/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete signature.", details: error?.message },
      { status: 500 }
    );
  }
}
