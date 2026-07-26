import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expenses - Fetch property expenses from database (supports optional ?wid= workspace filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : undefined;

    const whereClause: any = {};
    if (wid) {
      whereClause.OR = [
        { workspaceId: wid },
        { property: { workspaceId: wid } },
        { workspaceId: null },
      ];
    }

    const expenses = await prisma.propertyExpense.findMany({
      where: whereClause,
      include: {
        property: true,
        unit: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch property expenses", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Record a new property expense in database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      amount,
      date,
      vendor,
      paymentMethod,
      receiptName,
      receiptUrl,
      propertyId,
      unitId,
      workspaceId,
    } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { error: "Title and amount are required fields." },
        { status: 400 }
      );
    }

    let targetWorkspaceId: number | null = workspaceId ? Number(workspaceId) : null;
    let resolvedPropId = propertyId || null;

    if (unitId) {
      const u = await prisma.unit.findUnique({
        where: { id: unitId },
        include: { property: true },
      });
      if (u) {
        resolvedPropId = resolvedPropId || u.propertyId;
        targetWorkspaceId = targetWorkspaceId || u.workspaceId || u.property?.workspaceId || null;
      }
    } else if (resolvedPropId) {
      const p = await prisma.property.findUnique({ where: { id: resolvedPropId } });
      if (p) {
        targetWorkspaceId = targetWorkspaceId || p.workspaceId || null;
      }
    }

    const nextNumber = `EXP-${Math.floor(100 + Math.random() * 899)}`;

    const newExpense = await prisma.propertyExpense.create({
      data: {
        expenseNumber: nextNumber,
        title,
        category: category || "Maintenance & Repairs",
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        vendor: vendor || "Local Contractor",
        paymentMethod: paymentMethod || "Bank Wire / ACH Transfer",
        receiptName: receiptName || "property_receipt_attached.pdf",
        receiptUrl: receiptUrl || null,
        status: "Verified & Paid",
        propertyId: resolvedPropId,
        unitId: unitId || null,
        workspaceId: targetWorkspaceId || 1,
      },
      include: {
        property: true,
        unit: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Property expense "${newExpense.title}" recorded successfully!`,
      data: newExpense,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to record expense", details: error?.message },
      { status: 500 }
    );
  }
}
