import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/listings?isLive=true&page=1&limit=12&search=Indiranagar&propertyType=Apartment&bhk=2+BHK&maxRent=30000
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const isLiveParam = searchParams.get("isLive");
    const search = searchParams.get("search") || searchParams.get("query");
    const propertyType = searchParams.get("propertyType");
    const bhk = searchParams.get("bhk");
    const maxRentParam = searchParams.get("maxRent");
    
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (widParam) {
      const wid = parseInt(widParam, 10);
      if (!isNaN(wid)) whereClause.workspaceId = wid;
    }

    if (isLiveParam === "true") {
      whereClause.isLive = true;
      whereClause.status = "Active";
    } else if (status) {
      whereClause.status = status;
    }

    if (city && city !== "All") {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    if (propertyType && propertyType !== "All") {
      whereClause.propertyType = { contains: propertyType, mode: "insensitive" };
    }

    if (bhk && bhk !== "All") {
      whereClause.propertyType = { contains: bhk, mode: "insensitive" };
    }

    if (maxRentParam && maxRentParam !== "All") {
      if (maxRentParam === "under15k") whereClause.rent = { lte: 15000 };
      else if (maxRentParam === "15k-30k") whereClause.rent = { gte: 15000, lte: 30000 };
      else if (maxRentParam === "30k-50k") whereClause.rent = { gte: 30000, lte: 50000 };
      else if (maxRentParam === "above50k") whereClause.rent = { gte: 50000 };
      else {
        const parsedMax = parseFloat(maxRentParam);
        if (!isNaN(parsedMax)) whereClause.rent = { lte: parsedMax };
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { locality: { contains: q, mode: "insensitive" } },
        { stateName: { contains: q, mode: "insensitive" } },
        { fullAddress: { contains: q, mode: "insensitive" } },
        { pincode: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, listings] = await Promise.all([
      prisma.propertyListing.count({ where: whereClause }),
      prisma.propertyListing.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
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

// PATCH /api/listings
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isLive, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required listing id." }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isLive === "boolean") {
      updateData.isLive = isLive;
      updateData.status = isLive ? "Active" : "Draft";
    }
    if (status) updateData.status = status;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.propertyType) updateData.propertyType = body.propertyType;
    if (body.rent !== undefined) updateData.rent = typeof body.rent === "number" ? body.rent : parseFloat(String(body.rent).replace(/[^0-9.]/g, "")) || 0;
    if (body.deposit !== undefined) updateData.deposit = body.deposit ? (typeof body.deposit === "number" ? body.deposit : parseFloat(String(body.deposit).replace(/[^0-9.]/g, ""))) : null;
    if (Array.isArray(body.tenantTypes)) updateData.tenantTypes = body.tenantTypes;
    if (body.availableFrom) updateData.availableFrom = body.availableFrom;
    if (body.maintenance) updateData.maintenance = body.maintenance;
    if (body.customMaintenance !== undefined) updateData.customMaintenance = body.customMaintenance;
    if (body.pincode) updateData.pincode = body.pincode;
    if (body.stateName) updateData.stateName = body.stateName;
    if (body.city) updateData.city = body.city;
    if (body.locality) updateData.locality = body.locality;
    if (body.fullAddress) updateData.fullAddress = body.fullAddress;
    if (body.pinnedLat !== undefined) updateData.pinnedLat = body.pinnedLat ? parseFloat(String(body.pinnedLat)) : null;
    if (body.pinnedLng !== undefined) updateData.pinnedLng = body.pinnedLng ? parseFloat(String(body.pinnedLng)) : null;
    if (Array.isArray(body.amenities)) updateData.amenities = body.amenities;
    if (body.mainImage) updateData.mainImage = body.mainImage;
    if (body.coverImage) updateData.coverImage = body.coverImage;
    if (Array.isArray(body.galleryImages)) updateData.galleryImages = body.galleryImages;
    if (body.contactPersonName) updateData.contactPersonName = body.contactPersonName;
    if (body.contactNumber) updateData.contactNumber = body.contactNumber;
    if (body.countryDialCode) updateData.countryDialCode = body.countryDialCode;
    if (body.countryCode) updateData.countryCode = body.countryCode;
    if (typeof body.whatsappEnabled === "boolean") updateData.whatsappEnabled = body.whatsappEnabled;

    const updated = await prisma.propertyListing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Property listing updated successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to update property listing", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/listings?id=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required listing id." }, { status: 400 });
    }

    await prisma.propertyListing.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Property listing deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to delete property listing", details: error?.message },
      { status: 500 }
    );
  }
}
