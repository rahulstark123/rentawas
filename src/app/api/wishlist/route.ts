import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";
import { mapListingToPropertyItem } from "@/lib/marketplace";

export async function GET(request: Request) {
  try {
    const profile = await resolveRequestProfile(request);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: { profileId: profile.id },
      include: { listing: true },
      orderBy: { createdAt: "desc" },
    });

    const properties = items
      .filter((item) => item.listing)
      .map((item) => mapListingToPropertyItem(item.listing));

    const likedIds = properties.reduce<Record<string, boolean>>((acc, p) => {
      acc[p.id] = true;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: { items: properties, likedIds },
    });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = await resolveRequestProfile(request, body);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const listingId = String(body.listingId || "").trim();
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "listingId is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.propertyListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Property listing not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        profileId_listingId: {
          profileId: profile.id,
          listingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          action: "already_saved",
          item: mapListingToPropertyItem(listing),
        },
      });
    }

    await prisma.wishlistItem.create({
      data: {
        profileId: profile.id,
        listingId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        action: "added",
        item: mapListingToPropertyItem(listing),
      },
    });
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const profile = await resolveRequestProfile(request);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = String(searchParams.get("listingId") || "").trim();
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "listingId is required" },
        { status: 400 }
      );
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        profileId: profile.id,
        listingId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { action: "removed", listingId },
    });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
