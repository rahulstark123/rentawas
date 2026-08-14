import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expert/documents: Fetch official documents attached for specific expert by foreign key ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");
    const expertEmail = searchParams.get("expertEmail");

    let dbDocs: any[] = [];
    try {
      const where: any = {};
      if (expertId) {
        where.OR = [
          { expertId: expertId },
          { expertEmail: expertEmail || undefined },
        ];
      } else if (expertEmail) {
        where.expertEmail = expertEmail;
      }

      dbDocs = await (prisma as any).rentawasExpertDocument.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (e: any) {
      console.warn("DB query warning in /api/expert/documents GET:", e?.message);
    }

    if (expertId || expertEmail) {
      dbDocs = dbDocs.filter(
        (doc: any) =>
          (expertId && doc.expertId === expertId) ||
          (expertEmail && doc.expertEmail?.toLowerCase() === expertEmail.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      count: dbDocs.length,
      documents: dbDocs,
    });
  } catch (error: any) {
    console.error("GET /api/expert/documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expert documents." },
      { status: 500 }
    );
  }
}

// POST /api/expert/documents: Attach or upload new official document for expert (Admin Panel & Expert Portal)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      expertId,
      expertEmail,
      title,
      category,
      description,
      fileUrl,
      fileSize,
      issuer,
      isRentAwasIssued,
      statusBadge,
      issuedDate,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Document title is required." },
        { status: 400 }
      );
    }

    const docCode = `DOC-RA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const formattedDate = issuedDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const newDoc = await (prisma as any).rentawasExpertDocument.create({
      data: {
        docCode,
        expertId: expertId || null,
        expertEmail: expertEmail || null,
        title: title.trim(),
        category: category || "RentAwas Issued Agreement",
        description: description || "Official document uploaded via Admin Panel",
        fileUrl: fileUrl || "/sample-documents/Empanelment_Agreement.pdf",
        fileSize: fileSize || "1.4 MB",
        issuer: issuer || "RentAwas Operations (ANSH Apps)",
        isRentAwasIssued: isRentAwasIssued ?? true,
        statusBadge: statusBadge || "Digitally Signed & Verified",
        issuedDate: formattedDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Document "${title}" uploaded & attached to expert profile!`,
      document: newDoc,
    });
  } catch (error: any) {
    console.error("POST /api/expert/documents error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload document." },
      { status: 500 }
    );
  }
}
