import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/experts/launch-notify — save RentAwas Experts launch waitlist signup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, source, interest, city, workspaceId } = body;

    const trimmedEmail = String(email || "").trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const notifySource = String(source || "dashboard_experts").trim();
    const wid =
      workspaceId != null && !Number.isNaN(Number(workspaceId)) && Number(workspaceId) > 0
        ? Number(workspaceId)
        : null;

    const existing = await prisma.expertsLaunchNotify.findFirst({
      where: {
        email: trimmedEmail,
        source: notifySource,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        message: "You already filled this.",
        data: existing,
      });
    }

    const record = await prisma.expertsLaunchNotify.create({
      data: {
        email: trimmedEmail,
        name: name ? String(name).trim() : null,
        phone: phone ? String(phone).trim() : null,
        source: notifySource,
        interest: interest ? String(interest).trim() : null,
        city: city ? String(city).trim() : null,
        ...(wid ? { workspace: { connect: { wid } } } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "You are on the list! We will notify you when RentAwas Experts launches.",
      data: record,
    });
  } catch (error: any) {
    console.error("POST /api/experts/launch-notify error:", error);
    return NextResponse.json(
      { error: "Failed to save launch notification request.", details: error?.message },
      { status: 500 }
    );
  }
}
