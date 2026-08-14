import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expert-bookings?bookedById=...&email=...&expertId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookedById = searchParams.get("bookedById");
    const bookedByEmail = searchParams.get("email") || searchParams.get("bookedByEmail");
    const expertId = searchParams.get("expertId");
    const expertEmail = searchParams.get("expertEmail");
    const status = searchParams.get("status");

    const where: any = { AND: [] };

    const all = searchParams.get("all");

    if (expertId) {
      where.AND.push({
        OR: [
          { expertId: expertId },
          { expertName: { contains: expertId, mode: "insensitive" } },
        ],
      });
    } else if (bookedById) {
      where.AND.push({ bookedById });
    } else if (bookedByEmail) {
      where.AND.push({ bookedByEmail: bookedByEmail.trim().toLowerCase() });
    } else if (all === "true") {
      // Fetch all
    }

    if (status && status !== "ALL") {
      where.AND.push({ status });
    }

    const queryWhere = where.AND.length > 0 ? where : {};

    const bookings = await (prisma as any).rentawasExpertBooking.findMany({
      where: queryWhere,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error("GET /api/expert-bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings list." },
      { status: 500 }
    );
  }
}

// POST /api/expert-bookings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      expertId,
      expertName,
      expertTitle,
      expertAvatar,
      expertPhone,
      serviceBooked,
      bookingDate,
      timeSlot,
      feePaid,
      property,
      notes,
      bookedById,
      bookedByEmail,
      bookedByName,
      bookedByRole,
      workspaceId,
    } = body;

    if (!expertId || !expertName || !serviceBooked || !bookingDate) {
      return NextResponse.json(
        { error: "Expert ID, name, service, and booking date are required." },
        { status: 400 }
      );
    }

    if (!bookedById && !bookedByEmail) {
      return NextResponse.json(
        { error: "User authentication ID or email is required to book an expert." },
        { status: 400 }
      );
    }

    const bookingNum = `EXP-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));

    const booking = await (prisma as any).rentawasExpertBooking.create({
      data: {
        bookingNumber: bookingNum,
        expertId: expertId,
        expertName: expertName,
        expertTitle: expertTitle || "",
        expertAvatar: expertAvatar || "",
        expertPhone: expertPhone || "",
        serviceBooked: serviceBooked,
        bookingDate: bookingDate,
        timeSlot: timeSlot || "Morning Slot",
        feePaid: Number(feePaid) || 599,
        status: "Waiting Confirmation",
        property: property || "Main Property",
        notes: notes || "",
        otpCode: otpCode,
        bookedById: bookedById || `user_${Date.now()}`,
        bookedByEmail: (bookedByEmail || "").trim().toLowerCase(),
        bookedByName: bookedByName || "RentAwas User",
        bookedByRole: bookedByRole || "owner",
        workspaceId: workspaceId ? Number(workspaceId) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Expert booking request created successfully!",
      booking,
    });
  } catch (error: any) {
    console.error("POST /api/expert-bookings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create expert booking request." },
      { status: 500 }
    );
  }
}

// PATCH /api/expert-bookings
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, bookingNumber, status, userRating, userFeedbackTags, userComment, isRated, startedAt, completedAt } = body;

    if (!id && !bookingNumber) {
      return NextResponse.json(
        { error: "Booking ID or bookingNumber is required to update." },
        { status: 400 }
      );
    }

    const where: any = id ? { id } : { bookingNumber };
    const updateData: any = {};
    if (status) updateData.status = status;
    if (userRating !== undefined) updateData.userRating = Number(userRating);
    if (userFeedbackTags !== undefined) updateData.userFeedbackTags = typeof userFeedbackTags === "string" ? userFeedbackTags : JSON.stringify(userFeedbackTags);
    if (userComment !== undefined) updateData.userComment = userComment;
    if (isRated !== undefined) updateData.isRated = Boolean(isRated);
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (completedAt) updateData.completedAt = new Date(completedAt);

    if (status === "Completed") {
      updateData.completedAt = updateData.completedAt || new Date();
      // Increment completedJobs count for expert in DB
      try {
        const bk = await (prisma as any).rentawasExpertBooking.findFirst({ where });
        if (bk?.expertId) {
          await (prisma as any).rentawasExpert.update({
            where: { id: bk.expertId },
            data: { completedJobs: { increment: 1 } },
          }).catch(() => {});
        }
      } catch (e) {
        console.warn("Could not increment completedJobs on expert:", e);
      }
    }

    const updatedBooking = await (prisma as any).rentawasExpertBooking.updateMany({
      where,
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully!",
      updatedBooking,
    });
  } catch (error: any) {
    console.error("PATCH /api/expert-bookings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update booking." },
      { status: 500 }
    );
  }
}
