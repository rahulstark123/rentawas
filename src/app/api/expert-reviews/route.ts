import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// SEED REVIEWS FALLBACK (If database is empty or initial state)
const SEED_REVIEWS = [
  {
    id: "REV-301",
    clientName: "Rajesh Goyal",
    clientRole: "Property Owner",
    property: "The Regent - Wing A, Unit 102",
    rating: 5.0,
    date: "2 weeks ago",
    comment: "Punctual and highly skilled expert. Solved our water pipe leakage within 45 minutes! Tested water pressure and left premises completely clean.",
    service: "Plumbing Service",
    verifiedBooking: true,
    likes: 12,
  },
  {
    id: "REV-302",
    clientName: "Neha Malhotra",
    clientRole: "Tenant",
    property: "Downtown Horizon Suites, Unit 301",
    rating: 5.0,
    date: "1 month ago",
    comment: "Excellent AC repair service. Fixed cooling coil issue quickly and performed full electrical load test. Very polite & professional.",
    service: "AC & Electrical Servicing",
    verifiedBooking: true,
    likes: 8,
  },
  {
    id: "REV-303",
    clientName: "Amitabh Sen",
    clientRole: "Property Owner",
    property: "Greenwood Park Villas, Villa 12",
    rating: 4.9,
    date: "1 month ago",
    comment: "Thorough structural and moisture leakage inspection. The PDF report delivered via RentAwas was extremely detailed and accepted by society management.",
    service: "Property Inspection Audit",
    verifiedBooking: true,
    likes: 15,
  },
  {
    id: "REV-304",
    clientName: "Sanjay Singhania",
    clientRole: "Property Manager",
    property: "Orchid Heights, Tower B",
    rating: 5.0,
    date: "2 months ago",
    comment: "Trusted master partner for our multi-flat maintenance. Always reliable, prompt response times, and honest pricing.",
    service: "General Maintenance",
    verifiedBooking: true,
    likes: 21,
  },
];

// GET /api/expert-reviews: Fetch client ratings and reviews for expert
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");
    const expertEmail = searchParams.get("expertEmail");

    let dbBookings: any[] = [];
    try {
      const AND: any[] = [
        {
          OR: [
            { isRated: true },
            { userRating: { not: null } },
          ],
        },
      ];

      if (expertId || expertEmail) {
        const expertOR: any[] = [];
        if (expertId) {
          expertOR.push({ expertId: expertId });
          expertOR.push({ expertName: { contains: expertId, mode: "insensitive" } });
        }
        if (expertEmail) {
          expertOR.push({ expertEmail: expertEmail.trim().toLowerCase() });
        }
        AND.push({ OR: expertOR });
      }

      const rawBookings = await (prisma as any).rentawasExpertBooking.findMany({
        where: { AND },
        orderBy: { updatedAt: "desc" },
      });

      // Deduplicate by bookingNumber / id
      const seenKeys = new Set();
      dbBookings = rawBookings.filter((b: any) => {
        const key = b.bookingNumber || b.id;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });
    } catch (e: any) {
      console.warn("DB query warning in /api/expert-reviews:", e?.message);
    }

    const mappedDbReviews = dbBookings.map((b: any) => {
      let tags: string[] = [];
      if (b.userFeedbackTags) {
        try {
          tags = typeof b.userFeedbackTags === "string" ? JSON.parse(b.userFeedbackTags) : b.userFeedbackTags;
        } catch (e) {
          tags = [];
        }
      }

      return {
        id: `REV-${b.bookingNumber || b.id}`,
        bookingNumber: b.bookingNumber || b.id,
        clientName: b.bookedByName || "Verified User",
        clientRole: b.bookedByRole === "tenant" ? "Tenant Resident" : "Property Owner",
        property: b.property || "Main Property",
        rating: Number(b.userRating) || 5.0,
        feedbackTags: tags,
        comment: b.userComment || (tags.length > 0 ? `Highlights: ${tags.join(", ")}` : "Verified session completed cleanly."),
        service: b.serviceBooked || "Property Maintenance Service",
        verifiedBooking: true,
        date: new Date(b.updatedAt || b.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        createdAt: b.createdAt,
      };
    });

    const isSpecificExpert = Boolean(expertId || expertEmail);
    const reviewsToReturn = isSpecificExpert ? mappedDbReviews : (mappedDbReviews.length > 0 ? mappedDbReviews : SEED_REVIEWS);
    const totalRatingSum = reviewsToReturn.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0);
    const averageRating = reviewsToReturn.length > 0 ? (totalRatingSum / reviewsToReturn.length).toFixed(1) : "5.0";

    return NextResponse.json({
      success: true,
      count: reviewsToReturn.length,
      averageRating: Number(averageRating),
      reviews: reviewsToReturn,
    });
  } catch (error: any) {
    console.error("GET /api/expert-reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client reviews and ratings." },
      { status: 500 }
    );
  }
}
