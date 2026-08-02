import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, replyMessage, status } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required." },
        { status: 400 }
      );
    }

    if (!replyMessage || !replyMessage.trim()) {
      return NextResponse.json(
        { error: "Reply message cannot be empty." },
        { status: 400 }
      );
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        adminReply: replyMessage.trim(),
        adminRepliedAt: new Date(),
        status: status || "Resolved",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reply sent and ticket updated successfully.",
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error("Error replying to support ticket:", error);
    return NextResponse.json(
      { error: "Failed to update support ticket." },
      { status: 500 }
    );
  }
}
