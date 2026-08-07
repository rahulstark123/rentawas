import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

function parseAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

function isPaidStatus(status: string | null | undefined): boolean {
  const s = String(status || "").toLowerCase();
  return s === "paid" || s === "success" || s === "completed";
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// GET /api/properties/[id]/analytics?wid=1
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");

    if (!widParam) {
      return NextResponse.json({ error: "Workspace ID (wid) is required." }, { status: 400 });
    }
    const wid = parseInt(widParam, 10);
    if (isNaN(wid)) {
      return NextResponse.json({ error: "Invalid workspace ID." }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            tenants: {
              where: { currentStatus: { in: ["Current", "Active"] } },
              select: {
                id: true,
                name: true,
                leaseStart: true,
                leaseEnd: true,
                monthlyRent: true,
              },
            },
          },
          orderBy: [{ floorNumber: "asc" }, { unitNumber: "asc" }],
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    if (property.workspaceId !== wid) {
      return NextResponse.json(
        { error: "Forbidden: Property does not belong to specified workspace ID." },
        { status: 403 }
      );
    }

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [bills, expenses] = await Promise.all([
      prisma.bill.findMany({
        where: {
          propertyId: id,
          OR: [{ workspaceId: wid }, { workspaceId: null }],
        },
        select: {
          amount: true,
          status: true,
          paymentMethod: true,
          dueDate: true,
          paidDate: true,
          createdAt: true,
        },
      }),
      prisma.propertyExpense.findMany({
        where: {
          propertyId: id,
          OR: [{ workspaceId: wid }, { workspaceId: null }],
          createdAt: { gte: yearStart },
        },
        select: {
          amount: true,
          category: true,
          createdAt: true,
        },
      }),
    ]);

    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter((u) => u.isOccupied).length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const monthlyGrossYield = property.units
      .filter((u) => u.isOccupied)
      .reduce((sum, u) => sum + (u.rent || 0), 0);

    const avgRentPerUnit =
      occupiedUnits > 0 ? Math.round(monthlyGrossYield / occupiedUnits) : 0;

    const paidBills = bills.filter((b) => isPaidStatus(b.status));
    const totalRevenueYtd = paidBills
      .filter((b) => new Date(b.paidDate || b.createdAt) >= yearStart)
      .reduce((sum, b) => sum + parseAmount(b.amount), 0);

    const totalExpensesYtd = expenses.reduce((sum, e) => sum + parseAmount(e.amount), 0);
    const netOperatingMargin =
      totalRevenueYtd > 0
        ? Math.round(((totalRevenueYtd - totalExpensesYtd) / totalRevenueYtd) * 1000) / 10
        : totalExpensesYtd > 0
        ? 0
        : 100;

    const onTimePaid = paidBills.filter((b) => {
      const paidAt = b.paidDate ? new Date(b.paidDate) : new Date(b.createdAt);
      return paidAt <= new Date(b.dueDate);
    }).length;
    const onTimePaymentRate =
      paidBills.length > 0 ? Math.round((onTimePaid / paidBills.length) * 1000) / 10 : 0;

    const activeTenants = property.units.flatMap((u) => u.tenants);
    const now = new Date();
    const avgTenancyMonths =
      activeTenants.length > 0
        ? Math.round(
            (activeTenants.reduce((sum, t) => {
              const start = new Date(t.leaseStart);
              const months =
                (now.getFullYear() - start.getFullYear()) * 12 +
                (now.getMonth() - start.getMonth());
              return sum + Math.max(0, months);
            }, 0) /
              activeTenants.length) *
              10
          ) / 10
        : 0;

    const incomeByMonth: Record<string, number> = {};
    const expenseByMonth: Record<string, number> = {};

    paidBills.forEach((b) => {
      const d = new Date(b.paidDate || b.createdAt);
      if (d < sixMonthsAgo) return;
      const key = monthKey(d);
      incomeByMonth[key] = (incomeByMonth[key] || 0) + parseAmount(b.amount);
    });

    expenses.forEach((e) => {
      const d = new Date(e.createdAt);
      if (d < sixMonthsAgo) return;
      const key = monthKey(d);
      expenseByMonth[key] = (expenseByMonth[key] || 0) + parseAmount(e.amount);
    });

    const monthKeys: string[] = [];
    const cursor = new Date(sixMonthsAgo);
    while (cursor <= now) {
      monthKeys.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const monthlyTrend = monthKeys.map((key) => {
      const [y, m] = key.split("-").map(Number);
      const labelDate = new Date(y, m - 1, 1);
      return {
        month: monthLabel(labelDate),
        income: incomeByMonth[key] || 0,
        expense: expenseByMonth[key] || 0,
      };
    });

    const channelTotals: Record<string, number> = {};
    paidBills.forEach((b) => {
      const method = b.paymentMethod || "Direct Payment";
      channelTotals[method] = (channelTotals[method] || 0) + parseAmount(b.amount);
    });
    const channelSum = Object.values(channelTotals).reduce((a, b) => a + b, 0);
    const channelColors = ["bg-[#FF6B00]", "bg-purple-600", "bg-blue-600", "bg-emerald-500", "bg-amber-500"];
    const paymentChannels =
      channelSum > 0
        ? Object.entries(channelTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([channel, amount], idx) => ({
              channel,
              share: `${Math.round((amount / channelSum) * 100)}%`,
              amount,
              color: channelColors[idx % channelColors.length],
            }))
        : [];

    const floorMap: Record<
      number,
      { units: number; occupied: number; yield: number }
    > = {};
    property.units.forEach((u) => {
      const fl = u.floorNumber || 1;
      if (!floorMap[fl]) floorMap[fl] = { units: 0, occupied: 0, yield: 0 };
      floorMap[fl].units += 1;
      if (u.isOccupied) {
        floorMap[fl].occupied += 1;
        floorMap[fl].yield += u.rent || 0;
      }
    });

    const floorMatrix = Object.entries(floorMap)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([floor, data]) => {
        const occPct =
          data.units > 0 ? Math.round((data.occupied / data.units) * 100) : 0;
        const vacant = data.units - data.occupied;
        return {
          floor: Number(floor),
          floorLabel: `Floor ${floor}`,
          yield: data.yield,
          occupancyPct: occPct,
          occupiedUnits: data.occupied,
          totalUnits: data.units,
          status:
            occPct === 100 ? "Optimal Yield" : vacant > 0 ? "Action Needed" : "Optimal Yield",
          occupancyLabel:
            occPct === 100
              ? "100% Occupied"
              : `${occPct}% Occupied${vacant > 0 ? ` (${vacant} Vacant)` : ""}`,
        };
      });

    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || "General Maintenance";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseAmount(e.amount);
    });
    const expenseBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, cost]) => ({
        category,
        cost,
        share: totalExpensesYtd > 0 ? Math.round((cost / totalExpensesYtd) * 100) : 0,
      }));

    const leaseCutoff = new Date();
    leaseCutoff.setDate(leaseCutoff.getDate() + 90);
    const upcomingLeases = property.units
      .flatMap((u) =>
        u.tenants
          .filter((t) => t.leaseEnd && new Date(t.leaseEnd) <= leaseCutoff)
          .map((t) => ({
            unit: u.unitNumber,
            tenant: t.name,
            date: new Date(t.leaseEnd!).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status:
              t.leaseEnd && new Date(t.leaseEnd) < now ? "Lease Expired" : "Active Tenancy",
          }))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        property: {
          id: property.id,
          name: property.name,
          address: property.address,
          category: property.category,
          floors: property.floors || 1,
          totalUnits,
          occupiedUnits,
          occupancyRate,
          monthlyGrossYield,
          avgRentPerUnit,
        },
        summary: {
          monthlyGrossYield,
          netOperatingMargin,
          occupancyRate,
          occupiedUnits,
          totalUnits,
          avgRentPerUnit,
          totalExpensesYtd,
          onTimePaymentRate,
          avgTenancyMonths,
        },
        monthlyTrend,
        paymentChannels,
        floorMatrix,
        expenseBreakdown,
        upcomingLeases,
      },
    });
  } catch (error: any) {
    console.error("GET /api/properties/[id]/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property analytics", details: error?.message },
      { status: 500 }
    );
  }
}
