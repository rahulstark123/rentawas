import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceMessagesAccess } from "@/lib/planQuotaServer";
import { sendNewChatMessagePush } from "@/lib/push-notifications";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// GET /api/chat/messages?roomId=xxx&workspaceId=1&limit=50&before=<ISO date>
// Returns the latest N messages (ascending). Pass `before` to page older history.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const workspaceId = widParam ? parseInt(widParam, 10) : NaN;
    const before = searchParams.get("before");
    const limitRaw = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
    const limit = !isNaN(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, MAX_LIMIT)
      : DEFAULT_LIMIT;

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { workspaceId: true },
    });
    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    if (!isNaN(workspaceId) && workspaceId > 0 && room.workspaceId != null && room.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Forbidden: Messages do not belong to this workspace." },
        { status: 403 }
      );
    }

    const gateWid = (!isNaN(workspaceId) && workspaceId > 0 ? workspaceId : room.workspaceId) ?? null;
    if (gateWid) {
      const access = await assertWorkspaceMessagesAccess(gateWid);
      if (!access.ok) {
        return NextResponse.json(
          { error: access.message, code: access.code },
          { status: 403 }
        );
      }
    }

    const where: any = { roomId };
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        where.createdAt = { lt: beforeDate };
      }
    }

    const [total, newestFirst] = await Promise.all([
      prisma.chatMessage.count({ where: { roomId } }),
      prisma.chatMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          senderId: true,
          senderName: true,
          senderInitials: true,
          text: true,
          isMe: true,
          createdAt: true,
          roomId: true,
        },
      }),
    ]);

    // Chronological order for the UI
    const messages = newestFirst.reverse();
    const hasMore = before
      ? newestFirst.length === limit
      : total > messages.length;

    return NextResponse.json({
      success: true,
      count: messages.length,
      total,
      hasMore,
      data: messages,
    });
  } catch (error: any) {
    console.error("GET /api/chat/messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages - Send a message in a room (profile + workspace scoped)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomId,
      senderId = "owner",
      senderName = "You",
      senderInitials = "ME",
      text,
      isMe = true,
      workspaceId: bodyWorkspaceId,
      wid,
      profileId,
    } = body;

    if (!roomId || !text) {
      return NextResponse.json(
        { error: "roomId and text are required" },
        { status: 400 }
      );
    }

    const workspaceIdRaw = bodyWorkspaceId ?? wid;
    const workspaceId =
      workspaceIdRaw != null ? parseInt(String(workspaceIdRaw), 10) : NaN;

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { id: true, workspaceId: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    if (!isNaN(workspaceId) && workspaceId > 0 && room.workspaceId != null && room.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Forbidden: Chat room does not belong to this workspace." },
        { status: 403 }
      );
    }

    const gateWid = (!isNaN(workspaceId) && workspaceId > 0 ? workspaceId : room.workspaceId) ?? null;
    if (gateWid) {
      const access = await assertWorkspaceMessagesAccess(gateWid);
      if (!access.ok) {
        return NextResponse.json(
          { error: access.message, code: access.code },
          { status: 403 }
        );
      }
    }

    const resolvedSenderId = profileId || senderId;

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: String(resolvedSenderId),
        senderName,
        senderInitials,
        text,
        isMe,
      },
    });

    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessage: text,
        lastTime: formattedTime,
        updatedAt: now,
      },
    });

    try {
      const pushResult = await sendNewChatMessagePush({
        roomId,
        senderProfileId: resolvedSenderId,
        senderName,
        text,
        workspaceId: gateWid,
      });
      if (pushResult.sent > 0) {
        console.log(`[push] Chat message notified ${pushResult.sent} device(s).`);
      }
    } catch (pushErr) {
      console.error("[push] Chat message push failed:", pushErr);
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("POST /api/chat/messages error:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error?.message },
      { status: 500 }
    );
  }
}
