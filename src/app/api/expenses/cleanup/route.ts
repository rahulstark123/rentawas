import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expenses/cleanup - Delete all dummy expense records
export async function GET() {
  try {
    const deleted = await prisma.propertyExpense.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deleted.count} expense records from PostgreSQL database!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
