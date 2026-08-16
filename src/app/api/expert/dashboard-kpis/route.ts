import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expert/dashboard-kpis: Compute real database KPIs for Expert Portal header cards
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");
    const expertEmail = searchParams.get("expertEmail");

    if (!expertId && !expertEmail) {
      return NextResponse.json({
        success: true,
        pendingJobsCount: 0,
        completedJobsCount: 0,
        reputationScore: 5.0,
        reviewsCount: 0,
        consultationFee: 599,
      });
    }

    const orConditions: any[] = [];
    if (expertId) {
      orConditions.push({ expertId });
      orConditions.push({ expertName: { contains: expertId, mode: "insensitive" } });
    }
    if (expertEmail) {
      orConditions.push({ expertEmail: expertEmail.trim().toLowerCase() });
    }

    let dbBookings: any[] = [];
    try {
      dbBookings = await (prisma as any).rentawasExpertBooking.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: "desc" },
      });
    } catch (e: any) {
      console.warn("DB query warning in /api/expert/dashboard-kpis GET:", e?.message);
    }

    const pendingJobsCount = dbBookings.filter((b: any) => b.status !== "Completed" && b.status !== "Cancelled").length;
    const completedJobsCount = dbBookings.filter((b: any) => b.status === "Completed").length;
    const ratedBookings = dbBookings.filter((b: any) => b.isRated || b.userRating != null);

    const totalRatingSum = ratedBookings.reduce((sum: number, b: any) => sum + (Number(b.userRating) || 5), 0);
    const avgRating = ratedBookings.length > 0 ? (totalRatingSum / ratedBookings.length).toFixed(1) : "5.0";
    const reviewsCount = ratedBookings.length;

    // Fetch expert consultation fee from DB
    let consultationFee = 1000;
    try {
      const expertRecord = await (prisma as any).rentawasExpert.findFirst({
        where: { OR: orConditions },
      });
      if (expertRecord?.fee) {
        consultationFee = Number(expertRecord.fee);
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      pendingJobsCount,
      completedJobsCount,
      reputationScore: ratedBookings.length > 0 ? Number(avgRating) : 5.0,
      reviewsCount,
      consultationFee,
    });
  } catch (error: any) {
    console.error("GET /api/expert/dashboard-kpis error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard KPIs." },
      { status: 500 }
    );
  }
}
