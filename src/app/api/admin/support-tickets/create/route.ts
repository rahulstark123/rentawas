import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, message, contactEmail, contactPhone, category, priority, isTenant } = body;

    const ticketNumber = "TKT-2026-" + Math.floor(1000 + Math.random() * 9000);

    const newTicket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: subject || "Sample Rent Payment Inquiry",
        message: message || "Need assistance regarding rent invoice settlement and payment receipt status.",
        contactEmail: contactEmail || "landlord.demo@example.com",
        contactPhone: contactPhone || "+91 98765 43210",
        category: category || "Billing & Invoices",
        priority: priority || "High",
        status: "Open",
        isTenant: isTenant ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: newTicket,
    });
  } catch (error: any) {
    console.error("Error creating admin support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
