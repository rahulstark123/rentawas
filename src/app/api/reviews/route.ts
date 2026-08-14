import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reviews?listingId=xxx - Fetch reviews for a specific property listing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const reviews = await prisma.propertyReview.findMany({
      where: { listingId },
      orderBy: { createdAt: "desc" },
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        stats: {
          avgRating: 0,
          totalReviews: 0,
          qualityAvg: 0,
          localityAvg: 0,
          landlordAvg: 0,
        },
      });
    }

    const totalReviews = reviews.length;
    const sumOverall = reviews.reduce((acc, r) => acc + (r.overallRating || 5), 0);
    const sumQuality = reviews.reduce((acc, r) => acc + (r.qualityRating || 5), 0);
    const sumLocality = reviews.reduce((acc, r) => acc + (r.localityRating || 5), 0);
    const sumLandlord = reviews.reduce((acc, r) => acc + (r.landlordRating || 5), 0);

    const avgRating = parseFloat((sumOverall / totalReviews).toFixed(1));
    const qualityAvg = parseFloat((sumQuality / totalReviews).toFixed(1));
    const localityAvg = parseFloat((sumLocality / totalReviews).toFixed(1));
    const landlordAvg = parseFloat((sumLandlord / totalReviews).toFixed(1));

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        avgRating,
        totalReviews,
        qualityAvg,
        localityAvg,
        landlordAvg,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a new review and recalculate PropertyListing rating
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      listingId,
      userName,
      userRole,
      overallRating,
      qualityRating,
      localityRating,
      landlordRating,
      headline,
      comment,
    } = body;

    if (!listingId || !comment) {
      return NextResponse.json(
        { error: "listingId and review comment are required" },
        { status: 400 }
      );
    }

    // 1. Create the new review in PostgreSQL DB
    const newReview = await prisma.propertyReview.create({
      data: {
        listingId,
        userName: userName?.trim() || "Verified Resident",
        userRole: userRole?.trim() || "Current Resident",
        overallRating: parseFloat(overallRating) || 5.0,
        qualityRating: qualityRating ? parseFloat(qualityRating) : 5.0,
        localityRating: localityRating ? parseFloat(localityRating) : 5.0,
        landlordRating: landlordRating ? parseFloat(landlordRating) : 5.0,
        headline: headline?.trim() || null,
        comment: comment.trim(),
      },
    });

    // 2. Query all reviews for this listing to recalculate exact average
    const allReviews = await prisma.propertyReview.findMany({
      where: { listingId },
      select: { overallRating: true },
    });

    const reviewCount = allReviews.length;
    const sumRating = allReviews.reduce((acc, r) => acc + (r.overallRating || 5), 0);
    const newAvgRating = parseFloat((sumRating / reviewCount).toFixed(1));

    // 3. Update the PropertyListing table with recalculation
    const updatedListing = await prisma.propertyListing.update({
      where: { id: listingId },
      data: {
        avgRating: newAvgRating,
        reviewCount: reviewCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted & property average rating updated live!",
      data: newReview,
      stats: {
        avgRating: newAvgRating,
        reviewCount: reviewCount,
      },
      updatedListing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit review", details: error?.message },
      { status: 500 }
    );
  }
}
