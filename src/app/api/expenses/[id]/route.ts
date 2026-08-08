import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/expenses/[id] - Delete a property expense by ID
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.propertyExpense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense record not found." }, { status: 404 });
    }

    const expenseWid = existing.workspaceId;
    if (expenseWid) {
      const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
      const expenseDeleteDenied = await requireWorkspaceMutate(expenseWid);
      if (expenseDeleteDenied) return expenseDeleteDenied;
    }

    await prisma.propertyExpense.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Property expense "${existing.title}" deleted successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete expense", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses/[id] - Update a property expense
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.propertyExpense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense record not found." }, { status: 404 });
    }

    const expenseWid = existing.workspaceId;
    if (expenseWid) {
      const { requireWorkspaceMutate } = await import("@/lib/planQuotaServer");
      const expensePatchDenied = await requireWorkspaceMutate(expenseWid);
      if (expensePatchDenied) return expensePatchDenied;
    }

    const updated = await prisma.propertyExpense.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        category: body.category !== undefined ? body.category : existing.category,
        amount: body.amount !== undefined ? parseFloat(body.amount) : existing.amount,
        vendor: body.vendor !== undefined ? body.vendor : existing.vendor,
        paymentMethod: body.paymentMethod !== undefined ? body.paymentMethod : existing.paymentMethod,
        status: body.status !== undefined ? body.status : existing.status,
      },
      include: {
        property: true,
        unit: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Property expense "${updated.title}" updated successfully!`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update expense", details: error?.message },
      { status: 500 }
    );
  }
}
