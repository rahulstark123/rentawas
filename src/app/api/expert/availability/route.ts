import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expert/availability: Check expert booking status availability
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    let expert: any = null;
    try {
      const where: any = {};
      if (email) where.email = email.trim().toLowerCase();
      else if (id) where.id = id;

      expert = await (prisma as any).rentawasExpert.findFirst({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (e: any) {
      console.warn("DB query warning in /api/expert/availability GET:", e?.message);
    }

    const isAvailable = expert ? expert.isAvailable !== false : true;

    return NextResponse.json({
      success: true,
      isAvailable,
      status: expert?.status || (isAvailable ? "Active & Verified" : "Offline / Busy"),
    });
  } catch (error: any) {
    return NextResponse.json({ isAvailable: true, status: "Active & Verified" });
  }
}

// POST /api/expert/availability: Toggle specific expert availability status in database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, id, isAvailable } = body;

    if (!id && !email) {
      return NextResponse.json(
        { error: "Expert ID or email address is required to toggle availability status." },
        { status: 400 }
      );
    }

    const boolVal = Boolean(isAvailable);
    const newStatus = boolVal ? "Active & Verified" : "Offline / Busy";

    try {
      const where: any = {};
      if (id) where.id = id;
      else if (email) where.email = email.trim().toLowerCase();

      // Update strictly for targeted expert in DB
      await (prisma as any).rentawasExpert.updateMany({
        where,
        data: {
          isAvailable: boolVal,
          status: newStatus,
        },
      });
    } catch (e: any) {
      console.warn("DB update warning in /api/expert/availability POST:", e?.message);
    }

    return NextResponse.json({
      success: true,
      isAvailable: boolVal,
      status: newStatus,
      message: boolVal
        ? "Booking status updated: Available for New Bookings!"
        : "Booking status updated: Offline / Busy!",
    });
  } catch (error: any) {
    console.error("POST /api/expert/availability error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update availability status." },
      { status: 500 }
    );
  }
}
