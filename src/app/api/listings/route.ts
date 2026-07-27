import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/listings?wid=1&city=Bengaluru&status=Active
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const city = searchParams.get("city");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (widParam) {
      const wid = parseInt(widParam, 10);
      if (!isNaN(wid)) whereClause.workspaceId = wid;
    }
    if (city) whereClause.city = { contains: city, mode: "insensitive" };
    if (status) whereClause.status = status;

    const listings = await prisma.propertyListing.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error: any) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property listings", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/listings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      wid,
      title,
      description,
      propertyType,
      rent,
      deposit,
      tenantTypes = [],
      availableFrom,
      maintenance,
      customMaintenance,
      pincode,
      stateName,
      city,
      locality,
      fullAddress,
      pinnedLat,
      pinnedLng,
      amenities = [],
      mainImage,
      coverImage,
      galleryImages = [],
      contactPersonName,
      contactNumber,
      countryDialCode = "+91",
      countryCode = "IN",
      whatsappEnabled = true,
      isLive = true,
    } = body;

    if (!title || !propertyType || !rent) {
      return NextResponse.json(
        { error: "Missing mandatory fields: title, propertyType, rent are required." },
        { status: 400 }
      );
    }

    const parsedRent = typeof rent === "number" ? rent : parseFloat(String(rent).replace(/[^0-9.]/g, "")) || 0;
    const parsedDeposit = deposit ? (typeof deposit === "number" ? deposit : parseFloat(String(deposit).replace(/[^0-9.]/g, ""))) : null;

    let workspaceId: number | null = null;
    if (wid) {
      const parsedWid = parseInt(String(wid), 10);
      if (!isNaN(parsedWid)) workspaceId = parsedWid;
    }

    const newListing = await prisma.propertyListing.create({
      data: {
        title,
        description,
        propertyType,
        rent: parsedRent,
        deposit: parsedDeposit,
        tenantTypes,
        availableFrom,
        maintenance,
        customMaintenance,
        pincode,
        stateName,
        city,
        locality,
        fullAddress,
        pinnedLat: pinnedLat ? parseFloat(String(pinnedLat)) : null,
        pinnedLng: pinnedLng ? parseFloat(String(pinnedLng)) : null,
        amenities,
        mainImage,
        coverImage,
        galleryImages,
        contactPersonName,
        contactNumber,
        countryDialCode,
        countryCode,
        whatsappEnabled: Boolean(whatsappEnabled),
        isLive: Boolean(isLive),
        status: isLive ? "Active" : "Draft",
        workspaceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: isLive ? "Property published live to marketplace!" : "Property listing saved as draft.",
      data: newListing,
    });
  } catch (error: any) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to create property listing", details: error?.message },
      { status: 500 }
    );
  }
}
