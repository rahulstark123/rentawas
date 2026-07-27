import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/announcements - Fetch announcements (with targeting filter support)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const tenantEmail = searchParams.get("tenantEmail");
    const propertyId = searchParams.get("propertyId");

    const where: any = {};
    if (workspaceId) {
      where.workspaceId = Number(workspaceId);
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // If tenantEmail or propertyId is passed, filter client/tenant-facing items
    let filtered = announcements;
    if (tenantEmail || propertyId) {
      filtered = announcements.filter((a) => {
        // 1. All properties broadcast
        if (a.targetScope === "ALL_PROPERTIES") return true;

        // 2. Specific properties targeting
        if (a.targetScope === "SPECIFIC_PROPERTIES" && propertyId) {
          if (a.targetProperties.includes(propertyId)) return true;
        }

        // 3. Specific tenants targeting
        if (a.targetScope === "SPECIFIC_TENANTS" && tenantEmail) {
          const lowerEmail = tenantEmail.toLowerCase();
          if (a.targetTenants.some((t) => t.toLowerCase() === lowerEmail)) return true;
        }

        return false;
      });
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new portfolio announcement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category,
      priority,
      targetScope,
      targetProperties,
      targetTenants,
      workspaceId,
      creatorName,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Announcement title is required." }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Announcement message content is required." }, { status: 400 });
    }

    const announcementData: any = {
      title: title.trim(),
      content: content.trim(),
      category: category || "General Notice",
      priority: priority || "Normal",
      targetScope: targetScope || "ALL_PROPERTIES",
      targetProperties: Array.isArray(targetProperties) ? targetProperties : [],
      targetTenants: Array.isArray(targetTenants) ? targetTenants : [],
      creatorName: creatorName || "Landlord / Portfolio Management",
    };

    if (workspaceId) {
      announcementData.workspace = { connect: { wid: Number(workspaceId) } };
    }

    const announcement = await prisma.announcement.create({
      data: announcementData,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Announcement "${announcement.title}" published successfully!`,
        data: announcement,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json(
      { error: "Failed to create announcement", details: error?.message },
      { status: 500 }
    );
  }
}
