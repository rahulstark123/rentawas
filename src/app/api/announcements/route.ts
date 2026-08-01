import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseWorkspaceId(searchParams: URLSearchParams, bodyWid?: unknown): number | null {
  const raw =
    searchParams.get("workspaceId") ||
    searchParams.get("wid") ||
    (bodyWid != null ? String(bodyWid) : null);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// GET /api/announcements?workspaceId=3 — workspace-scoped notices only
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = parseWorkspaceId(searchParams);
    const tenantEmail = searchParams.get("tenantEmail");
    const propertyId = searchParams.get("propertyId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const announcements = await prisma.announcement.findMany({
      where: { workspaceId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    // If tenantEmail or propertyId is passed, filter client/tenant-facing items
    let filtered = announcements;
    if (tenantEmail || propertyId) {
      filtered = announcements.filter((a) => {
        if (a.targetScope === "ALL_PROPERTIES") return true;

        if (a.targetScope === "SPECIFIC_PROPERTIES" && propertyId) {
          if (a.targetProperties.includes(propertyId)) return true;
        }

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

// POST /api/announcements - Create a new portfolio announcement (requires wid)
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
      workspaceId: bodyWorkspaceId,
      wid,
      creatorName,
    } = body;

    const workspaceId = parseWorkspaceId(new URLSearchParams(), bodyWorkspaceId ?? wid);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Announcement title is required." }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Announcement message content is required." }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || "General Notice",
        priority: priority || "Normal",
        targetScope: targetScope || "ALL_PROPERTIES",
        targetProperties: Array.isArray(targetProperties) ? targetProperties : [],
        targetTenants: Array.isArray(targetTenants) ? targetTenants : [],
        creatorName: creatorName || "Landlord / Portfolio Management",
        workspace: { connect: { wid: workspaceId } },
      },
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
