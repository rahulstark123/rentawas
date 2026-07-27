import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/listings/inquiries?wid=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const listingId = searchParams.get("listingId");

    const whereClause: any = {};
    if (widParam) {
      const wid = parseInt(widParam, 10);
      if (!isNaN(wid)) whereClause.workspaceId = wid;
    }
    if (listingId) {
      whereClause.listingId = listingId;
    }

    const inquiries = await prisma.tenantInquiry.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            locality: true,
            rent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedInquiries = inquiries.map((item) => ({
      id: item.id,
      tenantName: item.tenantName,
      phone: item.phone,
      email: item.email || "N/A",
      propertyTitle: item.listing?.title || "Rental Property",
      moveInDate: item.moveInDate || "As soon as possible",
      status: item.status,
      date: item.createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      listingId: item.listingId,
      notes: item.notes,
    }));

    return NextResponse.json({
      success: true,
      count: formattedInquiries.length,
      data: formattedInquiries,
    });
  } catch (error: any) {
    console.error("GET /api/listings/inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant inquiries", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/listings/inquiries
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantName, phone, email, moveInDate, listingId, wid, notes } = body;

    if (!tenantName || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: tenantName and phone are mandatory." },
        { status: 400 }
      );
    }

    let workspaceId: number | null = null;
    if (wid) {
      const parsedWid = parseInt(String(wid), 10);
      if (!isNaN(parsedWid)) workspaceId = parsedWid;
    }

    const inquiry = await prisma.tenantInquiry.create({
      data: {
        tenantName,
        phone,
        email,
        moveInDate,
        listingId: listingId || null,
        workspaceId,
        notes,
        status: "Inquiry Pending",
      },
    });

    // Increment inquiriesCount on target listing
    if (listingId) {
      try {
        await prisma.propertyListing.update({
          where: { id: listingId },
          data: { inquiriesCount: { increment: 1 } },
        });
      } catch (err) {
        console.warn("Could not increment listing inquiriesCount:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tenant inquiry registered successfully!",
      data: inquiry,
    });
  } catch (error: any) {
    console.error("POST /api/listings/inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant inquiry", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/inquiries
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required inquiry id." }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.tenantInquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Inquiry status updated to ${updated.status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/listings/inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to update tenant inquiry", details: error?.message },
      { status: 500 }
    );
  }
}
