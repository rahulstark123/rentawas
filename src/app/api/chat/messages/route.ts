import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/chat/messages?roomId=xxx&workspaceId=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const widParam = searchParams.get("workspaceId") || searchParams.get("wid");
    const workspaceId = widParam ? parseInt(widParam, 10) : NaN;

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    if (!isNaN(workspaceId) && workspaceId > 0) {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { workspaceId: true },
      });
      if (!room) {
        return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
      }
      if (room.workspaceId != null && room.workspaceId !== workspaceId) {
        return NextResponse.json(
          { error: "Forbidden: Messages do not belong to this workspace." },
          { status: 403 }
        );
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
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
