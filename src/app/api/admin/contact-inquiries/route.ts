import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { inquiryId, status } = body;

    if (!inquiryId || !status) {
      return NextResponse.json(
        { error: "Inquiry ID and status are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.contactInquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      inquiry: updated,
    });
  } catch (error: any) {
    console.error("Error updating contact inquiry status:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry status." },
      { status: 500 }
    );
  }
}
