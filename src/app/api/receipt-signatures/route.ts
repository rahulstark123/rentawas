import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_CHARS = 500_000;

// GET /api/receipt-signatures?workspaceId=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const wid = Number(workspaceId);
    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Invalid workspaceId." }, { status: 400 });
    }

    const signatures = await prisma.rentReceiptSignature.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        signerName: true,
        imageData: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: signatures });
  } catch (error: any) {
    console.error("GET /api/receipt-signatures error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatures.", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/receipt-signatures — upload new signature
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, label, signerName, imageData } = body;

    const wid = Number(workspaceId);
    if (!wid || isNaN(wid)) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    if (!label?.trim()) {
      return NextResponse.json({ error: "Signature label is required." }, { status: 400 });
    }

    if (!imageData || typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
      return NextResponse.json({ error: "A valid signature image is required." }, { status: 400 });
    }

    if (imageData.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: "Signature image is too large. Use a smaller PNG/JPG." }, { status: 400 });
    }

    const signature = await prisma.rentReceiptSignature.create({
      data: {
        workspaceId: wid,
        label: String(label).trim(),
        signerName: signerName?.trim() || null,
        imageData,
      },
      select: {
        id: true,
        label: true,
        signerName: true,
        imageData: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Signature saved.",
      data: signature,
    });
  } catch (error: any) {
    console.error("POST /api/receipt-signatures error:", error);
    return NextResponse.json(
      { error: "Failed to save signature.", details: error?.message },
      { status: 500 }
    );
  }
}
