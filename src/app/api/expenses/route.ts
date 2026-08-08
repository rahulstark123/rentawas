import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePagination, paginationMeta, isDataUrl } from "@/lib/apiPagination";

const expenseListSelect = {
  id: true,
  expenseNumber: true,
  title: true,
  category: true,
  amount: true,
  date: true,
  vendor: true,
  paymentMethod: true,
  receiptName: true,
  receiptUrl: true,
  status: true,
  propertyId: true,
  unitId: true,
  workspaceId: true,
  createdAt: true,
  property: { select: { id: true, name: true } },
  unit: { select: { id: true, unitNumber: true, floorNumber: true } },
} as const;

// GET /api/expenses - Fetch property expenses from database (supports optional ?wid= workspace filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");
    const wid = widParam ? parseInt(widParam, 10) : undefined;
    const pagination = parsePagination(searchParams);

    const whereClause: any = {};
    if (wid) {
      whereClause.OR = [
        { workspaceId: wid },
        { property: { workspaceId: wid } },
        { workspaceId: null },
      ];
    }

    const [total, expenses] = await Promise.all([
      prisma.propertyExpense.count({ where: whereClause }),
      prisma.propertyExpense.findMany({
        where: whereClause,
        select: expenseListSelect,
        orderBy: { date: "desc" },
        ...(pagination.take != null
          ? { take: pagination.take, skip: pagination.skip }
          : {}),
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: expenses.length,
      pagination: paginationMeta(total, pagination, expenses.length),
      data: expenses,
    });
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

    if (isDataUrl(receiptUrl)) {
      return NextResponse.json(
        { error: "receiptUrl must be a storage URL, not a base64 data URL." },
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

    if (!targetWorkspaceId) {
      return NextResponse.json(
        { success: false, error: "Workspace ID (workspaceId / wid) is required." },
        { status: 400 }
      );
    }

    const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
    const expenseDenied = await requireWorkspaceMutate(targetWorkspaceId);
    if (expenseDenied) return expenseDenied;

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
        workspaceId: targetWorkspaceId,
      },
      select: expenseListSelect,
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
