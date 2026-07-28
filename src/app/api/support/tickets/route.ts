import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/support/tickets - Fetch workspace support tickets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : 1;

    const tickets = await prisma.supportTicket.findMany({
      where: {
        OR: [{ workspaceId: wid }, { workspaceId: null }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch support tickets", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/support/tickets - Create a new support ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, category, priority, message, contactEmail, contactPhone, attachments, wid } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and Message are required" },
        { status: 400 }
      );
    }

    const workspaceIdNum = wid ? parseInt(String(wid), 10) : 1;
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const ticketNumber = `TKT-2026-${randomSeq}`;

    let newTicket;
    try {
      newTicket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          subject,
          category: category || "General Inquiry",
          priority: priority || "Medium",
          status: "Open",
          message,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          attachments: Array.isArray(attachments) ? attachments : [],
          workspaceId: workspaceIdNum,
        },
      });
    } catch (createErr: any) {
      console.warn("Notice: Retrying support ticket creation fallback:", createErr?.message);
      newTicket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          subject,
          category: category || "General Inquiry",
          priority: priority || "Medium",
          status: "Open",
          message: Array.isArray(attachments) && attachments.length > 0 
            ? `${message}\n\nAttachments:\n${attachments.join("\n")}` 
            : message,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          workspaceId: workspaceIdNum,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Support Ticket #${ticketNumber} created successfully!`,
      data: newTicket,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create support ticket", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/support/tickets - Update ticket status or priority
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, priority, message } = body;

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(message ? { message } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Ticket #${updatedTicket.ticketNumber} updated to status "${updatedTicket.status}"!`,
      data: updatedTicket,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update support ticket", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/support/tickets - Delete support ticket
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket deleted successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete support ticket", details: error?.message },
      { status: 500 }
    );
  }
}
