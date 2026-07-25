"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Users, 
  UserCheck, 
  Calendar, 
  Download, 
  Sparkles, 
  Layers, 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  ChevronDown, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Mock property data repository
const PROPERTIES_DB: Record<string, { id: string; name: string; address: string; tag: string; totalUnits: number; floors: number; monthlyYield: string }> = {
  "PROP-1": { id: "PROP-1", name: "The Regent - Wing A", address: "1420 5th Ave, Seattle, WA 98101", tag: "Residential Tower", totalUnits: 24, floors: 6, monthlyYield: "$72,500" },
  "PROP-2": { id: "PROP-2", name: "Downtown Horizon Suites", address: "800 Bellevue Way NE, Bellevue, WA 98004", tag: "Luxury Apartments", totalUnits: 16, floors: 4, monthlyYield: "$48,000" },
  "PROP-3": { id: "PROP-3", name: "Oakwood Executive Residency", address: "2100 Westlake Ave, Seattle, WA 98121", tag: "Executive Suites", totalUnits: 12, floors: 3, monthlyYield: "$38,400" },
  "PROP-4": { id: "PROP-4", name: "Skyline Manor", address: "1100 Mercer St, Seattle, WA 98109", tag: "Boutique Housing", totalUnits: 8, floors: 2, monthlyYield: "$26,000" },
};

export default function PropertyDedicatedAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const propId = (params?.id as string) || "PROP-1";
  const property = PROPERTIES_DB[propId] || PROPERTIES_DB["PROP-1"];

  const [dateRange, setDateRange] = useState("Fiscal Year 2026");

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Top Breadcrumb Nav & Actions */}
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
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {property.name} Analytics
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF6B00] text-white">
                    {property.monthlyYield}/mo Gross
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{property.address} • {property.floors} Floors • {property.totalUnits} Units</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
              >
                <option value="Fiscal Year 2026">Fiscal Year 2026</option>
                <option value="Last 12 Months">Last 12 Months</option>
                <option value="Q3 2026">Q3 2026 (Current Quarter)</option>
                <option value="All Time">All Time Historical</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={() => toast(`Downloading dedicated analytics report PDF for ${property.name}...`, "success")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Monthly Gross Yield</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{property.monthlyYield}</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% Year-over-Year</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Net Operating Margin</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">94.8%</div>
          <div className="text-[11px] text-slate-500 font-medium">Low maintenance overhead ($1,870 YTD)</div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Occupancy Rate</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">96% Occupied</div>
          <div className="text-[11px] text-emerald-700 font-bold">23 of 24 Units Rented</div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase text-[10px] tracking-wider">Avg Rent Per Unit</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">$3,020<span className="text-xs font-bold text-slate-400">/unit</span></div>
          <div className="text-[11px] text-slate-500 font-medium">Average across all floors</div>
        </div>
      </div>

      {/* SECTION 1: REVENUE VS EXPENSE TREND & PAYMENT CHANNEL SHARE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue vs Expense 6-Month Chart (2 cols) */}
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

          <div className="space-y-4 text-xs">
            {[
              { month: "Feb 2026", income: 72500, expense: 1200 },
              { month: "Mar 2026", income: 72500, expense: 450 },
              { month: "Apr 2026", income: 72500, expense: 2100 },
              { month: "May 2026", income: 72500, expense: 320 },
              { month: "Jun 2026", income: 72500, expense: 980 },
              { month: "Jul 2026", income: 72500, expense: 1870 },
            ].map((m) => (
              <div key={m.month} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>{m.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#FF6B00] font-extrabold">${m.income.toLocaleString()}</span>
                    <span className="text-rose-600 font-semibold text-[11px]">${m.expense.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="h-4 bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-lg flex items-center justify-end px-2 text-[10px] font-black text-white" style={{ width: "88%" }}>
                    ${m.income.toLocaleString()}
                  </div>
                  <div className="h-4 bg-rose-500 rounded-lg flex items-center justify-center px-1 text-[9px] font-bold text-white" style={{ width: `${Math.max(5, (m.expense / m.income) * 100 * 5)}%` }}>
                    ${m.expense}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Collection Channels Share (1 col) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Payment Collection Channels</h3>
            <p className="text-xs text-slate-500 mt-0.5">How residents pay rent at {property.name}</p>
          </div>

          <div className="space-y-5 text-xs">
            {[
              { channel: "Autopilot ACH Direct (Auto-Debit)", share: "68%", amount: "$49,300/mo", color: "bg-[#FF6B00]" },
              { channel: "Razorpay UPI Gateway", share: "24%", amount: "$17,400/mo", color: "bg-purple-600" },
              { channel: "Credit / Debit Card", share: "8%", amount: "$5,800/mo", color: "bg-blue-600" },
            ].map((c) => (
              <div key={c.channel} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{c.channel}</span>
                  <span className="font-black text-slate-900">{c.share}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: c.share }} />
                </div>
                <span className="text-[10px] text-slate-400 font-bold block">{c.amount} collected monthly</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-emerald-900">
            <div className="flex items-center gap-2 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Digital Reconciliation</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Zero manual cash collections. All payments are verified automatically.
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 2: FLOOR-BY-FLOOR YIELD & OCCUPANCY MATRIX */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Floor-by-Floor Yield & Occupancy Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Granular performance breakdown across each level</p>
          </div>

          <span className="px-3.5 py-1 bg-slate-900 text-white rounded-full font-bold text-xs">
            {property.floors} Total Floor Levels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            { floor: "Floor 6 (Penthouse Suite)", yield: "$15,200/mo", occ: "100% Occupied", units: "4 Units", status: "Optimal Yield" },
            { floor: "Floor 5 (Sky Suites)", yield: "$12,800/mo", occ: "100% Occupied", units: "4 Units", status: "Optimal Yield" },
            { floor: "Floor 4 (Deluxe Units)", yield: "$11,900/mo", occ: "100% Occupied", units: "4 Units", status: "Optimal Yield" },
            { floor: "Floor 3 (Corner Suites)", yield: "$11,400/mo", occ: "75% Occupied (1 Vacant)", units: "4 Units", status: "Action Needed" },
            { floor: "Floor 2 (Executive)", yield: "$10,800/mo", occ: "100% Occupied", units: "4 Units", status: "Optimal Yield" },
            { floor: "Floor 1 (Ground Retail/Apts)", yield: "$10,400/mo", occ: "100% Occupied", units: "4 Units", status: "Optimal Yield" },
          ].map((f, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs">{f.floor}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  f.status === "Optimal Yield" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {f.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Yield</span>
                  <span className="font-extrabold text-[#FF6B00] text-sm">{f.yield}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Occupancy</span>
                  <span className="font-bold text-slate-900">{f.occ}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MAINTENANCE OVERHEAD & TENANT HEALTH SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Maintenance Expenses by Category */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Maintenance Expenses by Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">YTD repair outlay breakdown for {property.name}</p>
            </div>
            <span className="font-black text-rose-600 text-sm">$1,870 YTD</span>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { category: "HVAC & Air Conditioning Servicing", cost: "$840.00", share: 45, icon: Wrench },
              { category: "Plumbing & Water Sub-meter Repair", cost: "$560.00", share: 30, icon: Wrench },
              { category: "Electrical & Corridor Lighting", cost: "$280.00", share: 15, icon: Wrench },
              { category: "Locks & Smart Card Access Repair", cost: "$190.00", share: 10, icon: Wrench },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{item.category}</span>
                  <span className="text-slate-900 font-extrabold">{item.cost} ({item.share}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant Retention & Lease Renewal Forecast */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Tenancy Health & Upcoming Lease Expirations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Retain tenants and manage renewal timelines</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Avg Tenancy Duration</span>
              <span className="text-lg font-black text-emerald-900">19.6 Months</span>
            </div>

            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
              <span className="text-[10px] text-purple-700 uppercase font-bold block">On-Time Payment Score</span>
              <span className="text-lg font-black text-purple-900">98.5% Rate</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-slate-700 uppercase text-[11px] block">Upcoming Lease Expirations (Next 90 Days)</span>
            {[
              { unit: "Unit 301", tenant: "Eleanor Vance", date: "Jan 14, 2026", status: "Renewal Notice Sent" },
              { unit: "Unit 502", tenant: "Marcus Sterling", date: "Nov 14, 2026", status: "Active Tenancy" },
            ].map((lease, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium">
                <div>
                  <span className="font-bold text-slate-900 block">{lease.unit} — {lease.tenant}</span>
                  <span className="text-slate-500 text-[11px]">Lease Ends: {lease.date}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {lease.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 4: AI SUMMARY & RECOMMENDATION */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl space-y-3 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
          <Sparkles className="w-5 h-5" />
          <span>{property.name} Executive Analytics Summary</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {property.name} continues to deliver exceptional returns with a monthly yield of <strong>{property.monthlyYield}/mo</strong> and an occupancy rate of <strong>96%</strong>. Maintenance costs are well contained at under 3% of total revenue. Recommended next action: List Unit 302 to achieve 100% portfolio capacity.
        </p>
      </div>

    </div>
  );
}
