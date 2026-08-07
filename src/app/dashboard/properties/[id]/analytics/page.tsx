"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  TrendingUp,
  Coins,
  Users,
  UserCheck,
  Download,
  Sparkles,
  Wrench,
  ShieldCheck,
  MapPin,
  ChevronDown,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useCurrency } from "@/context/CurrencyContext";

type PropertyAnalytics = {
  property: {
    id: string;
    name: string;
    address: string;
    category: string;
    floors: number;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    monthlyGrossYield: number;
    avgRentPerUnit: number;
  };
  summary: {
    monthlyGrossYield: number;
    netOperatingMargin: number;
    occupancyRate: number;
    occupiedUnits: number;
    totalUnits: number;
    avgRentPerUnit: number;
    totalExpensesYtd: number;
    onTimePaymentRate: number;
    avgTenancyMonths: number;
  };
  monthlyTrend: { month: string; income: number; expense: number }[];
  paymentChannels: { channel: string; share: string; amount: number; color: string }[];
  floorMatrix: {
    floor: number;
    floorLabel: string;
    yield: number;
    occupancyPct: number;
    occupiedUnits: number;
    totalUnits: number;
    status: string;
    occupancyLabel: string;
  }[];
  expenseBreakdown: { category: string; cost: number; share: number }[];
  upcomingLeases: { unit: string; tenant: string; date: string; status: string }[];
};

export default function PropertyDedicatedAnalyticsPage() {
  const params = useParams();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const workspaceId = useWorkspaceId();

  const propId = (params?.id as string) || "";
  const [dateRange, setDateRange] = useState("FY 2026 – 2027 (Current FY)");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["property-analytics", propId, workspaceId],
    enabled: !!propId && !!workspaceId,
    queryFn: async (): Promise<PropertyAnalytics | null> => {
      const res = await fetch(
        `/api/properties/${encodeURIComponent(propId)}/analytics?wid=${workspaceId}`
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
  });

  const property = analytics?.property;
  const summary = analytics?.summary;
  const monthlyTrend = analytics?.monthlyTrend ?? [];
  const paymentChannels = analytics?.paymentChannels ?? [];
  const floorMatrix = analytics?.floorMatrix ?? [];
  const expenseBreakdown = analytics?.expenseBreakdown ?? [];
  const upcomingLeases = analytics?.upcomingLeases ?? [];

  const maxMonthlyValue = Math.max(
    ...monthlyTrend.map((m) => Math.max(m.income, m.expense)),
    1
  );

  if (!workspaceId || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 font-bold text-sm">
        Loading property analytics…
      </div>
    );
  }

  if (!analytics || !property) {
    return (
      <div className="space-y-4">
        <Link
          href={`/dashboard/properties/${propId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Property</span>
        </Link>
        <p className="text-slate-600 font-medium">Could not load analytics for this property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      <div>
        <Link
          href={`/dashboard/properties/${propId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {property.name} Floor Plan</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {property.name} Analytics
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF6B00] text-white">
                    {formatCurrency(property.monthlyGrossYield)}/mo Gross
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {property.address} • {property.floors} Floors • {property.totalUnits} Units
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  toast(`Filter updated to ${e.target.value}`, "info");
                }}
                className="appearance-none pl-3.5 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
              >
                <optgroup label="Fiscal Years (April – March)">
                  <option value="FY 2026 – 2027 (Current FY)">FY 2026 – 2027 (Current FY)</option>
                  <option value="FY 2025 – 2026 (Previous FY)">FY 2025 – 2026 (Previous FY)</option>
                </optgroup>
                <optgroup label="Calendar Years">
                  <option value="Calendar Year 2026">Calendar Year 2026 (Jan – Dec)</option>
                  <option value="Trailing 6 Months">Trailing 6 Months</option>
                </optgroup>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={() =>
                toast(`Downloading analytics report for ${property.name}…`, "success")
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Monthly Gross Yield</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(summary?.monthlyGrossYield ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            From {summary?.occupiedUnits ?? 0} occupied units
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Net Operating Margin</span>
            <Coins className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">
            {summary?.netOperatingMargin ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Maintenance overhead {formatCurrency(summary?.totalExpensesYtd ?? 0)} YTD
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Occupancy Rate</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {summary?.occupancyRate ?? 0}% Occupied
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {summary?.occupiedUnits ?? 0} of {summary?.totalUnits ?? 0} Units Rented
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Avg Rent Per Unit</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(summary?.avgRentPerUnit ?? 0)}
            <span className="text-xs font-bold text-slate-400">/unit</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Average across occupied units</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Monthly Income vs Maintenance Expenses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Financial performance history for {property.name}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#FF6B00]" />
                <span className="text-slate-700">Gross Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-slate-700">Maintenance Outlay</span>
              </div>
            </div>
          </div>

          {monthlyTrend.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium">No payment or expense data yet.</p>
          ) : (
            <div className="space-y-4 text-xs">
              {monthlyTrend.map((m) => (
                <div key={m.month} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span>{m.month}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#FF6B00] font-extrabold">
                        {formatCurrency(m.income)}
                      </span>
                      <span className="text-rose-600 font-semibold text-[11px]">
                        {formatCurrency(m.expense)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-4 bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-lg flex items-center justify-end px-2 text-[10px] font-black text-white min-w-[8%]"
                      style={{
                        width: `${Math.max(8, Math.round((m.income / maxMonthlyValue) * 88))}%`,
                      }}
                    >
                      {m.income > 0 ? formatCurrency(m.income) : ""}
                    </div>
                    {m.expense > 0 && (
                      <div
                        className="h-4 bg-rose-500 rounded-lg flex items-center justify-center px-1 text-[9px] font-bold text-white"
                        style={{
                          width: `${Math.max(5, Math.round((m.expense / maxMonthlyValue) * 100 * 5))}%`,
                        }}
                      >
                        {formatCurrency(m.expense)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Payment Collection Channels</h3>
            <p className="text-xs text-slate-500 mt-0.5">How residents pay rent at {property.name}</p>
          </div>

          {paymentChannels.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium">No paid rent records yet.</p>
          ) : (
            <div className="space-y-5 text-xs">
              {paymentChannels.map((c) => (
                <div key={c.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{c.channel}</span>
                    <span className="font-black text-slate-900">{c.share}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.color} rounded-full`}
                      style={{ width: c.share }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {formatCurrency(c.amount)} collected
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-emerald-900">
            <div className="flex items-center gap-2 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {summary?.onTimePaymentRate
                  ? `${summary.onTimePaymentRate}% On-Time Payments`
                  : "Payment tracking active"}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Rent collections are tracked per bill for this property.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Floor-by-Floor Yield & Occupancy Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular performance breakdown across each level
            </p>
          </div>
          <span className="px-3.5 py-1 bg-slate-900 text-white rounded-full font-bold text-xs">
            {floorMatrix.length} Floor Levels
          </span>
        </div>

        {floorMatrix.length === 0 ? (
          <p className="text-sm text-slate-500 font-medium">No units configured for this property.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {floorMatrix.map((f) => (
              <div
                key={f.floor}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">{f.floorLabel}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === "Optimal Yield"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Monthly Yield
                    </span>
                    <span className="font-extrabold text-[#FF6B00] text-sm">
                      {formatCurrency(f.yield)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Occupancy
                    </span>
                    <span className="font-bold text-slate-900">{f.occupancyLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Maintenance Expenses by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                YTD repair outlay breakdown for {property.name}
              </p>
            </div>
            <span className="font-black text-rose-600 text-sm">
              {formatCurrency(summary?.totalExpensesYtd ?? 0)} YTD
            </span>
          </div>

          {expenseBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium">No expenses recorded this year.</p>
          ) : (
            <div className="space-y-4 text-xs">
              {expenseBreakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{item.category}</span>
                    <span className="text-slate-900 font-extrabold">
                      {formatCurrency(item.cost)} ({item.share}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Tenancy Health & Upcoming Lease Expirations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Retain tenants and manage renewal timelines</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                Avg Tenancy Duration
              </span>
              <span className="text-lg font-black text-emerald-900">
                {summary?.avgTenancyMonths ?? 0} Months
              </span>
            </div>
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
              <span className="text-[10px] text-purple-700 uppercase font-bold block">
                On-Time Payment Score
              </span>
              <span className="text-lg font-black text-purple-900">
                {summary?.onTimePaymentRate ?? 0}% Rate
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-slate-700 uppercase text-[11px] block">
              Upcoming Lease Expirations (Next 90 Days)
            </span>
            {upcomingLeases.length === 0 ? (
              <p className="text-slate-500 font-medium">No leases expiring in the next 90 days.</p>
            ) : (
              upcomingLeases.map((lease, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {lease.unit} — {lease.tenant}
                    </span>
                    <span className="text-slate-500 text-[11px]">Lease Ends: {lease.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    {lease.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl space-y-3 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
          <Sparkles className="w-5 h-5" />
          <span>{property.name} Executive Analytics Summary</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {property.name} has a monthly gross yield of{" "}
          <strong>{formatCurrency(property.monthlyGrossYield)}/mo</strong> with an occupancy rate of{" "}
          <strong>{property.occupancyRate}%</strong> ({property.occupiedUnits} of{" "}
          {property.totalUnits} units). YTD maintenance costs total{" "}
          <strong>{formatCurrency(summary?.totalExpensesYtd ?? 0)}</strong>
          {summary && summary.onTimePaymentRate > 0 && (
            <>
              , with an on-time payment rate of <strong>{summary.onTimePaymentRate}%</strong>
            </>
          )}
          .
          {property.occupiedUnits < property.totalUnits && (
            <>
              {" "}
              Recommended next action: market the{" "}
              {property.totalUnits - property.occupiedUnits} vacant unit
              {property.totalUnits - property.occupiedUnits > 1 ? "s" : ""} to improve yield.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
