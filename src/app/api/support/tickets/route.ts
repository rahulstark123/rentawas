import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseWid(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = parseInt(String(raw), 10);
  return !isNaN(n) && n > 0 ? n : null;
}

function parseIsTenant(raw: unknown): boolean | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "boolean") return raw;
  const s = String(raw).toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  return null;
}

// GET /api/support/tickets?wid=3&isTenant=false
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wid = parseWid(searchParams.get("wid") || searchParams.get("workspaceId"));
    const isTenant = parseIsTenant(searchParams.get("isTenant"));

    if (!wid) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    // Default to landlord tickets when isTenant is omitted (backward compatible)
    const tenantFlag = isTenant === null ? false : isTenant;

    const tickets = await prisma.supportTicket.findMany({
      where: {
        workspaceId: wid,
        isTenant: tenantFlag,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      workspaceId: wid,
      isTenant: tenantFlag,
      data: tickets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch support tickets", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/support/tickets — pass isTenant: true for tenant portal tickets
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      subject,
      category,
      priority,
      message,
      contactEmail,
      contactPhone,
      attachments,
      wid,
      workspaceId,
      isTenant,
    } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and Message are required" },
        { status: 400 }
      );
    }

    const workspaceIdNum = parseWid(wid ?? workspaceId);
    if (!workspaceIdNum) {
      return NextResponse.json(
        { error: "Workspace ID (wid) is required." },
        { status: 400 }
      );
    }

    const tenantFlag = Boolean(isTenant);
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
          isTenant: tenantFlag,
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
          message:
            Array.isArray(attachments) && attachments.length > 0
              ? `${message}\n\nAttachments:\n${attachments.join("\n")}`
              : message,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          workspaceId: workspaceIdNum,
          isTenant: tenantFlag,
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

// PATCH /api/support/tickets — gated by wid + isTenant when provided
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, priority, message, wid, workspaceId, isTenant } = body;

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const widNum = parseWid(wid ?? workspaceId);
    const tenantFlag = parseIsTenant(isTenant);
    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (widNum && existing.workspaceId != null && existing.workspaceId !== widNum) {
      return NextResponse.json(
        { error: "Forbidden: Ticket does not belong to this workspace." },
        { status: 403 }
      );
    }
    if (tenantFlag !== null && existing.isTenant !== tenantFlag) {
      return NextResponse.json(
        { error: "Forbidden: Ticket does not belong to this portal." },
        { status: 403 }
      );
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

// DELETE /api/support/tickets?id=xxx&wid=3&isTenant=false
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const wid = parseWid(searchParams.get("wid") || searchParams.get("workspaceId"));
    const tenantFlag = parseIsTenant(searchParams.get("isTenant"));

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: true, message: "Ticket already removed" });
    }
    if (wid && existing.workspaceId != null && existing.workspaceId !== wid) {
      return NextResponse.json(
        { error: "Forbidden: Ticket does not belong to this workspace." },
        { status: 403 }
      );
    }
    if (tenantFlag !== null && existing.isTenant !== tenantFlag) {
      return NextResponse.json(
        { error: "Forbidden: Ticket does not belong to this portal." },
        { status: 403 }
      );
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
