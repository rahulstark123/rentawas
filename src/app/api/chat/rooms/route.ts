import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceMessagesAccess } from "@/lib/planQuotaServer";

function parseWorkspaceId(searchParams: URLSearchParams, bodyWid?: unknown): number | null {
  const raw =
    searchParams.get("workspaceId") ||
    searchParams.get("wid") ||
    (bodyWid != null ? String(bodyWid) : null);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

function tenantBelongsToWorkspace(
  tenant: {
    workspaceId: number | null;
    property?: { workspaceId: number } | null;
    unit?: { property?: { workspaceId: number } | null } | null;
  } | null,
  workspaceId: number
): boolean {
  if (!tenant) return false;
  if (tenant.workspaceId === workspaceId) return true;
  if (tenant.property?.workspaceId === workspaceId) return true;
  if (tenant.unit?.property?.workspaceId === workspaceId) return true;
  return false;
}

const DEMO_SEED_GROUP_NAMES = new Set([
  "The Regent — All Residents",
  "Maintenance Team",
]);

/** Slim room payload — never include message history (load via /api/chat/messages). */
const roomListSelect = {
  id: true,
  type: true,
  name: true,
  initials: true,
  color: true,
  property: true,
  description: true,
  lastMessage: true,
  lastTime: true,
  unreadCount: true,
  membersJson: true,
  tenantId: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
  tenant: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      monthlyRent: true,
      currentStatus: true,
      leaseEnd: true,
      workspaceId: true,
      profileId: true,
      profile: { select: { id: true, email: true, fullName: true } },
      property: { select: { id: true, name: true, workspaceId: true } },
      unit: {
        select: {
          id: true,
          unitNumber: true,
          property: { select: { id: true, name: true, workspaceId: true } },
        },
      },
    },
  },
} as const;

// GET /api/chat/rooms?workspaceId=1 — room metadata + lastMessage only (no message history)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = parseWorkspaceId(searchParams);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const access = await assertWorkspaceMessagesAccess(workspaceId);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.message, code: access.code },
        { status: 403 }
      );
    }

    // One-time cleanup: remove rooms wrongly seeded from other workspaces / demo templates
    const candidateRooms = await prisma.chatRoom.findMany({
      where: { workspaceId },
      select: {
        id: true,
        type: true,
        name: true,
        tenantId: true,
        tenant: {
          select: {
            workspaceId: true,
            property: { select: { workspaceId: true } },
            unit: { select: { property: { select: { workspaceId: true } } } },
          },
        },
      },
    });

    const pollutedIds = candidateRooms
      .filter((r) => {
        if (r.type === "group" && DEMO_SEED_GROUP_NAMES.has(r.name)) return true;
        if (r.type === "dm") {
          if (!r.tenantId) return true;
          return !tenantBelongsToWorkspace(r.tenant, workspaceId);
        }
        return false;
      })
      .map((r) => r.id);

    if (pollutedIds.length > 0) {
      await prisma.chatMessage.deleteMany({ where: { roomId: { in: pollutedIds } } });
      await prisma.chatRoom.deleteMany({ where: { id: { in: pollutedIds } } });
    }

    let rooms = await prisma.chatRoom.findMany({
      where: { workspaceId },
      select: roomListSelect,
      orderBy: { updatedAt: "desc" },
    });

    // Hard filter: never return DMs whose tenant is outside this workspace
    rooms = rooms.filter((r) => {
      if (r.type === "dm") return tenantBelongsToWorkspace(r.tenant, workspaceId);
      if (DEMO_SEED_GROUP_NAMES.has(r.name)) return false;
      return true;
    });

    const userRole = searchParams.get("userRole"); // "tenant" or "landlord"
    const tenantId = searchParams.get("tenantId");
    const profileId = searchParams.get("profileId");

    // Tenant-specific privacy: only their DMs + groups they belong to
    if (userRole === "tenant") {
      let filtered = rooms;
      if (tenantId || profileId) {
        filtered = rooms.filter((r) => {
          if (r.type === "group") {
            if (r.membersJson) {
              try {
                const members = JSON.parse(r.membersJson);
                return members.some(
                  (m: any) =>
                    (tenantId && (m.id === tenantId || m.tenantId === tenantId)) ||
                    (profileId && (m.id === profileId || m.profileId === profileId))
                );
              } catch {
                return false;
              }
            }
            return false;
          }
          if (r.type === "dm") {
            if (tenantId && r.tenantId === tenantId) return true;
            if (profileId && r.tenant?.profileId === profileId) return true;
            return false;
          }
          return false;
        });
      } else {
        filtered = [];
      }

      // Resolve real workspace owner for tenant-facing DM labels
      const workspace = await prisma.workspace.findUnique({
        where: { wid: workspaceId },
        include: { owner: true },
      });
      const ownerDisplayName =
        workspace?.landlordName?.trim() ||
        workspace?.owner?.fullName?.trim() ||
        "Property Owner";
      const ownerInitials = (() => {
        const parts = ownerDisplayName.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return (ownerDisplayName.trim().substring(0, 2) || "PM").toUpperCase();
      })();
      const ownerRole =
        workspace?.landlordRole?.trim() || "Property Owner & Landlord";

      rooms = filtered.map((r) => {
        if (r.type === "dm") {
          return {
            ...r,
            displayName: `${ownerDisplayName} (${ownerRole})`,
            displayInitials: ownerInitials,
            displayColor: "bg-[#FF6B00]",
            ownerProfileId: workspace?.ownerId || null,
            ownerName: ownerDisplayName,
          };
        }
        return r;
      });
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    console.error("GET /api/chat/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat rooms", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/chat/rooms - Create new ChatRoom (requires workspaceId / wid)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      workspaceId: bodyWorkspaceId,
      wid,
      type = "dm",
      name,
      initials,
      color = "bg-purple-500",
      description,
      property,
      tenantId,
      members,
      ownerProfileId,
    } = body;

    const workspaceId = parseWorkspaceId(new URLSearchParams(), bodyWorkspaceId ?? wid);
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const access = await assertWorkspaceMessagesAccess(workspaceId);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.message, code: access.code },
        { status: 403 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Chat room name is required" },
        { status: 400 }
      );
    }

    // If creating a DM, ensure tenant belongs to this workspace
    if (tenantId) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          id: String(tenantId),
          OR: [
            { workspaceId },
            { property: { workspaceId } },
            { unit: { property: { workspaceId } } },
          ],
        },
      });
      if (!tenant) {
        return NextResponse.json(
          { error: "Tenant not found in this workspace." },
          { status: 403 }
        );
      }

      const existingDm = await prisma.chatRoom.findFirst({
        where: {
          workspaceId,
          type: "dm",
          tenantId: String(tenantId),
        },
        select: roomListSelect,
      });
      if (existingDm) {
        return NextResponse.json({ success: true, data: existingDm });
      }
    }

    const room = await prisma.chatRoom.create({
      data: {
        workspaceId,
        type,
        name,
        initials,
        color,
        description,
        property,
        tenantId: tenantId ? String(tenantId) : null,
        membersJson: members
          ? JSON.stringify(
              ownerProfileId
                ? members.map((m: any) =>
                    m.id === "owner" || m.role === "Property Manager"
                      ? { ...m, id: ownerProfileId, profileId: ownerProfileId }
                      : m
                  )
                : members
            )
          : null,
        lastMessage: type === "group" ? "Group created" : "Start a conversation...",
        lastTime: "Just now",
      },
      select: roomListSelect,
    });

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    console.error("POST /api/chat/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to create chat room", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/rooms?roomId=xxx&workspaceId=1
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const workspaceId = parseWorkspaceId(searchParams);

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({ where: { id: String(roomId) } });
    if (!room) {
      return NextResponse.json({ success: true, message: "Chat room already removed" });
    }

    if (workspaceId && room.workspaceId != null && room.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Forbidden: Chat room does not belong to this workspace." },
        { status: 403 }
      );
    }

    const gateWid = workspaceId || room.workspaceId;
    if (gateWid) {
      const access = await assertWorkspaceMessagesAccess(gateWid);
      if (!access.ok) {
        return NextResponse.json(
          { error: access.message, code: access.code },
          { status: 403 }
        );
      }
    }

    await prisma.chatMessage.deleteMany({
      where: { roomId: String(roomId) },
    });

    await prisma.chatRoom.delete({
      where: { id: String(roomId) },
    });

    return NextResponse.json({
      success: true,
      message: "Chat room deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/chat/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat room", details: error?.message },
      { status: 500 }
    );
  }
}
