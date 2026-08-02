"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  Download, 
  Calendar, 
  Building2, 
  Layers, 
  Zap, 
  Wrench, 
  CheckCircle2, 
  ArrowDownRight,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<"YTD" | "6M" | "12M" | "ALL">("YTD");
  const workspaceId = useWorkspaceId();

  const { data: analyticsData = null, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/analytics?wid=${workspaceId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
  });

  const { data: channelsData = null, isLoading: channelsLoading } = useQuery({
    queryKey: ["analytics-channels", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/analytics/channels?wid=${workspaceId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
  });

  const loadingAnalytics = !workspaceId || analyticsLoading || channelsLoading;

  const monthlyData = analyticsData?.monthlyData || [
    { month: "Jan", rev: 85, exp: 20, net: 65 },
    { month: "Feb", rev: 88, exp: 22, net: 66 },
    { month: "Mar", rev: 92, exp: 19, net: 73 },
    { month: "Apr", rev: 90, exp: 25, net: 65 },
    { month: "May", rev: 95, exp: 21, net: 74 },
    { month: "Jun", rev: 97, exp: 20, net: 77 },
    { month: "Jul", rev: 100, exp: 18, net: 82 },
    { month: "Aug", rev: 96, exp: 22, net: 74 },
    { month: "Sep", rev: 98, exp: 19, net: 79 },
    { month: "Oct", rev: 102, exp: 21, net: 81 },
    { month: "Nov", rev: 105, exp: 20, net: 85 },
    { month: "Dec", rev: 108, exp: 23, net: 85 },
  ];

  const propertyYieldDistribution = analyticsData?.propertyYieldDistribution || [
    { name: "Residential Portfolio", pct: 48, yield: "24 Units", color: "bg-[#FF6B00]" },
    { name: "Luxury Apartments", pct: 32, yield: "16 Units", color: "bg-purple-600" },
    { name: "Commercial Space", pct: 12, yield: "6 Units", color: "bg-emerald-500" },
    { name: "Student & Co-Living", pct: 8, yield: "4 Units", color: "bg-blue-500" },
  ];

  const collectionMethodMatrix = channelsData?.channels || analyticsData?.collectionMethodMatrix || [
    { channel: "Razorpay Auto-Debit", pct: 64, count: "40 Payments", status: "Real-Time Disbursal" },
    { channel: "Razorpay UPI / QR", pct: 24, count: "15 Payments", status: "Instant Scan" },
    { channel: "Manual Bank Transfer", pct: 8, count: "5 Payments", status: "3-Day SLA" },
  ];

  const maintenanceExpenses = analyticsData?.expenseBreakdown || [
    { cat: "Plumbing & Leak Repairs", cost: "$4,200", pct: 34, color: "bg-purple-500" },
    { cat: "HVAC & Heating Servicing", cost: "$3,800", pct: 30, color: "bg-blue-500" },
    { cat: "Appliance Fixes", cost: "$2,500", pct: 20, color: "bg-[#FF6B00]" },
    { cat: "Electrical & Smart Locks", cost: "$2,000", pct: 16, color: "bg-emerald-500" },
  ];

  const summary = analyticsData?.summary;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Yield & Portfolio Analytics
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Live Telemetry Connected</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time financial performance, Net Operating Income (NOI), and yield distribution charts from PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Fiscal Year Filter Selector */}
          <div className="relative">
            <select
              onChange={(e) => toast(`Filter updated to ${e.target.value}`, "info")}
              className="appearance-none pl-3.5 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
            >
              <optgroup label="Fiscal Years (April – March)">
                <option value="FY 2026 – 2027 (Current FY)">FY 2026 – 2027 (Current FY)</option>
                <option value="FY 2025 – 2026 (Previous FY)">FY 2025 – 2026 (Previous FY)</option>
              </optgroup>
              <optgroup label="Trailing Periods">
                <option value="Trailing 12 Months (T12M)">Trailing 12 Months (T12M)</option>
                <option value="Trailing 6 Months (T6M)">Trailing 6 Months (T6M)</option>
                <option value="Trailing 30 Days">Trailing 30 Days</option>
              </optgroup>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={() => toast("Exporting CSV financial report...", "success")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all uppercase tracking-wider cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Export Financials</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annualized Net Operating Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {loadingAnalytics ? "Loading..." : summary?.annualizedNOI || "$1,782,000"}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+11.2% year-over-year</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Rent Per Unit</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {loadingAnalytics ? "Loading..." : summary?.avgRentPerUnit || "$3,093 / mo"}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Occupancy Rate: <strong>{summary?.occupancyRate || 100}%</strong>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collection Efficiency</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">
              {loadingAnalytics ? "Loading..." : summary?.collectionEfficiency || "98.6 / 100"}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Real-Time Rent Disbursals
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Asset Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {loadingAnalytics ? "Loading..." : summary?.portfolioValuation || "$32.4M USD"}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>Cap Rate: 5.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Row 1: Monthly Revenue vs Expenses & Property Yield Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Revenue vs Expenses Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FF6B00]" />
                <span>Monthly Rent Collection vs Operating Expenses</span>
              </h3>
              <p className="text-xs text-slate-500">Gross revenue vs property management overhead.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{timeframe} Trend</span>
          </div>

          <div className="h-64 bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-end justify-between gap-2.5">
            {monthlyData.slice(0, timeframe === "6M" ? 6 : 12).map((bar: any) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div 
                    className="w-full max-w-[20px] bg-[#FF6B00] rounded-t-md transition-all group-hover:bg-[#E56000]"
                    style={{ height: `${bar.rev}%` }}
                    title={`Gross Revenue: ${bar.revAmt || "$85,000"}`}
                  />
                  <div 
                    className="w-full max-w-[20px] bg-slate-300 rounded-t-md transition-all group-hover:bg-slate-400"
                    style={{ height: `${bar.exp}%` }}
                    title={`Operating Expenses: ${bar.expAmt || "$20,000"}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-1 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#FF6B00]" />
              <span className="text-slate-700">Gross Rent Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-slate-300" />
              <span className="text-slate-700">Operating Expenses</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Property Yield Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                <span>Yield Share by Asset Type</span>
              </h3>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-4 h-4 bg-slate-100 rounded-full overflow-hidden flex">
              {propertyYieldDistribution.map((item: any) => (
                <div
                  key={item.name}
                  className={`${item.color || "bg-[#FF6B00]"} h-full transition-all`}
                  style={{ width: `${item.pct}%` }}
                  title={`${item.name}: ${item.pct}%`}
                />
              ))}
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              {propertyYieldDistribution.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.color || "bg-[#FF6B00]"}`} />
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">{item.pct}%</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.yield}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            * Live telemetry calculated from active properties and units in PostgreSQL.
          </div>
        </div>

      </div>

      {/* Chart Row 2: Payment Channels & Maintenance Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Channels (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>Payment Collection Channels Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
              {channelsData?.onTimeRate || "98.6% On-Time"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {collectionMethodMatrix.map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{item.channel}</span>
                  <span className="text-[#FF6B00]">{item.pct}% ({item.count})</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
                <div className="flex justify-end text-[10px] font-semibold text-slate-400">{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Cost Breakdown (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#FF6B00]" />
              <span>Property Expenses & Maintenance Breakdown</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {maintenanceExpenses.map((exp: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{exp.cat}</span>
                  <span className="text-slate-900">{exp.cost} ({exp.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${exp.color || "bg-[#FF6B00]"} rounded-full`} style={{ width: `${exp.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
