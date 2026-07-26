import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/early-access - Store Early Access lead submissions in PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, portfolioType, notes } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full Name and Email Address are required." },
        { status: 400 }
      );
    }

    const lead = await prisma.earlyAccessLead.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        portfolioType: portfolioType || "Landlord (1-5 Units)",
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Congratulations! You have claimed your Early Access spot.",
      data: lead,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit Early Access request", details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/early-access - List all early access requests (Admin)
export async function GET() {
  try {
    const leads = await prisma.earlyAccessLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch early access leads", details: error?.message },
      { status: 500 }
    );
  }
}
