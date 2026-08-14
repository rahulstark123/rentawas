import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId, device, city, area, channel } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const listing = await prisma.propertyListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    let detectedDevice = device;
    if (!detectedDevice) {
      if (/mobile/i.test(userAgent)) detectedDevice = "Mobile";
      else if (/ipad|tablet/i.test(userAgent)) detectedDevice = "Tablet";
      else detectedDevice = "Desktop";
    }

    const detectedCity = city || listing.city || listing.stateName || "Delhi NCR";
    const detectedArea = area || listing.locality || listing.pincode || "Central Area";
    const detectedChannel = channel || "Direct Marketplace";

    // 1. Create View Log Entry
    const log = await prisma.listingViewLog.create({
      data: {
        listingId,
        device: detectedDevice,
        city: detectedCity,
        area: detectedArea,
        channel: detectedChannel,
        userAgent,
      },
    });

    // 2. Increment listing viewsCount
    await prisma.propertyListing.update({
      where: { id: listingId },
      data: {
        viewsCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("POST /api/listings/views error:", error);
    return NextResponse.json({ error: "Failed to record view log" }, { status: 500 });
  }
}
