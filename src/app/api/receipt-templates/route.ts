import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RENT_RECEIPT_TEMPLATE } from "@/lib/rentReceipts";

// GET /api/receipt-templates?workspaceId=1&propertyId=optional
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const propertyId = searchParams.get("propertyId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const wid = Number(workspaceId);
    if (isNaN(wid) || wid <= 0) {
      return NextResponse.json({ error: "Invalid workspaceId." }, { status: 400 });
    }

    let template = null;

    if (propertyId) {
      template = await prisma.rentReceiptTemplate.findFirst({
        where: { workspaceId: wid, propertyId },
      });
    }

    if (!template) {
      template = await prisma.rentReceiptTemplate.findFirst({
        where: { workspaceId: wid, propertyId: null },
      });
    }

    const properties = await prisma.property.findMany({
      where: { workspaceId: wid },
      select: { id: true, name: true, address: true },
      orderBy: { name: "asc" },
    });

    const allTemplates = await prisma.rentReceiptTemplate.findMany({
      where: { workspaceId: wid },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: template,
      properties,
      templates: allTemplates,
      defaults: DEFAULT_RENT_RECEIPT_TEMPLATE,
    });
  } catch (error: any) {
    console.error("GET /api/receipt-templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt template.", details: error?.message },
      { status: 500 }
    );
  }
}

// PUT /api/receipt-templates — create or update template for workspace/property
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      propertyId,
      brandName,
      tagline,
      address,
      taxId,
      contactEmail,
      contactPhone,
      footerNote,
      accentColor,
      signatureId,
    } = body;

    const wid = Number(workspaceId);
    if (!wid || isNaN(wid)) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    if (!brandName || !String(brandName).trim()) {
      return NextResponse.json({ error: "brandName is required." }, { status: 400 });
    }

    const propertyKey = propertyId ? String(propertyId) : null;

    const existing = await prisma.rentReceiptTemplate.findFirst({
      where: {
        workspaceId: wid,
        propertyId: propertyKey,
      },
    });

    const payload = {
      brandName: String(brandName).trim(),
      tagline: tagline?.trim() || null,
      address: address?.trim() || null,
      taxId: taxId?.trim() || null,
      contactEmail: contactEmail?.trim() || null,
      contactPhone: contactPhone?.trim() || null,
      footerNote: footerNote?.trim() || null,
      accentColor: accentColor?.trim() || "#FF6B00",
      signatureId: signatureId || null,
    };

    const template = existing
      ? await prisma.rentReceiptTemplate.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.rentReceiptTemplate.create({
          data: {
            ...payload,
            workspaceId: wid,
            propertyId: propertyKey,
          },
        });

    return NextResponse.json({
      success: true,
      message: "Receipt template saved.",
      data: template,
    });
  } catch (error: any) {
    console.error("PUT /api/receipt-templates error:", error);
    return NextResponse.json(
      { error: "Failed to save receipt template.", details: error?.message },
      { status: 500 }
    );
  }
}
