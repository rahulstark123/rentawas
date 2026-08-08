import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendListingInquiryPush } from "@/lib/push-notifications";

function parseWid(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = parseInt(String(raw), 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// GET /api/listings/inquiries?wid=3 — landlord workspace leads only
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = parseWid(searchParams.get("wid") || searchParams.get("workspaceId"));
    const listingId = searchParams.get("listingId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const whereClause: any = {
      OR: [
        { workspaceId },
        { listing: { workspaceId } },
      ],
    };
    if (listingId) {
      whereClause.AND = [{ listingId }];
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
            workspaceId: true,
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

// POST /api/listings/inquiries — public lead form; wid derived from listing when possible
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

    let workspaceId = parseWid(wid);

    if (listingId) {
      const listing = await prisma.propertyListing.findUnique({
        where: { id: listingId },
        select: { workspaceId: true },
      });
      if (listing?.workspaceId) {
        workspaceId = listing.workspaceId;
      }
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

    if (workspaceId) {
      try {
        let listingTitle: string | null = null;
        if (listingId) {
          const listing = await prisma.propertyListing.findUnique({
            where: { id: listingId },
            select: { title: true },
          });
          listingTitle = listing?.title ?? null;
        }
        const pushResult = await sendListingInquiryPush(
          {
            id: inquiry.id,
            tenantName,
            phone,
            email,
            moveInDate,
            listingTitle,
          },
          workspaceId
        );
        if (pushResult.sent > 0) {
          console.log(
            `[push] Listing inquiry notified ${pushResult.sent} landlord device(s).`
          );
        }
      } catch (pushErr) {
        console.error("[push] Listing inquiry push failed:", pushErr);
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

// PATCH /api/listings/inquiries — landlord status update (scoped by wid)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes, wid } = body;
    const workspaceId = parseWid(wid);

    if (!id) {
      return NextResponse.json({ error: "Missing required inquiry id." }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.tenantInquiry.findFirst({
      where: {
        id,
        OR: [
          { workspaceId },
          { listing: { workspaceId } },
        ],
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found in this workspace." }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (existing.workspaceId == null) {
      updateData.workspaceId = workspaceId;
    }

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
