import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_LISTINGS: Record<string, any> = {
  "prop-101": {
    id: "PROP-101",
    title: "The Regent Luxury 2BHK Residence",
    location: "100 Feet Road, Indiranagar",
    locality: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    stateName: "Karnataka",
    pincode: "560038",
    fullAddress: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    pinnedLat: 12.9784,
    pinnedLng: 77.6408,
    rent: 28500,
    deposit: 50000,
    propertyType: "2 BHK Apartment",
    mainImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Fully Furnished", "Zero Brokerage", "Gated Security", "24/7 Power Backup", "High-Speed WiFi", "Covered Parking"],
    contactPersonName: "Alexander Wright",
    contactNumber: "+91 98765 43210",
    description: "Spacious 2BHK in prime Indiranagar with high-end modular kitchen, balcony, and 24/7 security.",
    status: "Active",
    isLive: true,
  },
  "prop-102": {
    id: "PROP-102",
    title: "Horizon Heights Executive Studio",
    location: "Sector 3, HSR Layout",
    locality: "Sector 3, HSR Layout",
    city: "Bengaluru",
    stateName: "Karnataka",
    pincode: "560102",
    fullAddress: "Sector 3, HSR Layout, Bengaluru, Karnataka 560102",
    pinnedLat: 12.9116,
    pinnedLng: 77.6389,
    rent: 18000,
    deposit: 30000,
    propertyType: "1 BHK Studio",
    mainImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Fully Furnished", "WiFi Included", "Power Backup", "Lift Access", "AC Room"],
    contactPersonName: "Priya Nair",
    contactNumber: "+91 98123 45678",
    description: "Cozy executive 1BHK studio in HSR Layout near IT parks, gym, and restaurants.",
    status: "Active",
    isLive: true,
  },
  "prop-103": {
    id: "PROP-103",
    title: "Royal Stays Premium PG & Co-Living",
    location: "Cyber City, Phase 2",
    locality: "Cyber City, Phase 2",
    city: "Gurgaon",
    stateName: "Haryana",
    pincode: "122002",
    fullAddress: "Cyber City, Phase 2, Gurgaon, Haryana 122002",
    pinnedLat: 28.4950,
    pinnedLng: 77.0895,
    rent: 12500,
    deposit: 5000,
    propertyType: "PG Bed",
    mainImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["3 Meals Included", "Daily Housekeeping", "High-Speed WiFi", "Washing Machine", "CCTV Security"],
    contactPersonName: "Rajesh Kumar",
    contactNumber: "+91 99887 76655",
    description: "Premium co-living PG with daily delicious meals, daily cleaning, and ultra-fast WiFi.",
    status: "Active",
    isLive: true,
  },
  "prop-104": {
    id: "PROP-104",
    title: "Emerald Vista 3BHK Penthouse",
    location: "Banjara Hills, Road No. 12",
    locality: "Banjara Hills, Road No. 12",
    city: "Hyderabad",
    stateName: "Telangana",
    pincode: "500034",
    fullAddress: "Banjara Hills, Road No. 12, Hyderabad, Telangana 500034",
    pinnedLat: 17.4156,
    pinnedLng: 78.4347,
    rent: 45000,
    deposit: 90000,
    propertyType: "3 BHK Penthouse",
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Luxury Interiors", "Covered Parking", "Clubhouse Access", "Private Terrace", "Modular Kitchen"],
    contactPersonName: "Dr. Vikram Reddy",
    contactNumber: "+91 97000 11223",
    description: "Ultra-luxurious 3BHK penthouse with private terrace views in Banjara Hills.",
    status: "Active",
    isLive: true,
  },
};

// GET /api/listings/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Property ID parameter is required" }, { status: 400 });
    }

    // 1. Check Prisma Database
    let listing = await prisma.propertyListing.findUnique({
      where: { id },
    });

    // If not found by exact ID, try case-insensitive ID or search
    if (!listing) {
      listing = await prisma.propertyListing.findFirst({
        where: {
          OR: [
            { id: { equals: id, mode: "insensitive" } },
            { title: { contains: id, mode: "insensitive" } },
          ],
        },
      });
    }

    // 2. Check Fallback Static Properties if not in DB
    if (!listing) {
      const fallbackKey = id.toLowerCase();
      if (FALLBACK_LISTINGS[fallbackKey]) {
        listing = FALLBACK_LISTINGS[fallbackKey];
      }
    }

    if (!listing) {
      return NextResponse.json(
        { error: "Property listing not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error: any) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property detail", details: error?.message },
      { status: 500 }
    );
  }
}
