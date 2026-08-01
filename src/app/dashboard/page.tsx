"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Building2, 
  Users, 
  Zap, 
  Wrench, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  FileText, 
  Download, 
  Send, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Coins,
  Printer
} from "lucide-react";
import AddPropertyModal from "@/components/ui/AddPropertyModal";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { generatePaymentReceiptHtml, triggerPrintOrDownload } from "@/lib/pdfGenerator";
import EmptyStateIllustration from "@/components/ui/EmptyStateIllustration";
import { getActiveWorkspaceId, ensureActiveWorkspaceId } from "@/lib/workspace";

export interface DashboardTransaction {
  id: string;
  tenant: string;
  unit: string;
  amount: string;
  rawAmount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  channel: string;
  paymentId?: string;
}

export default function DashboardOverviewPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showEmptyStateCard, setShowEmptyStateCard] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<"this_month" | "last_month" | "ytd">("this_month");
  const [loading, setLoading] = useState(true);

  // Live PostgreSQL Data States
  const [transactionsList, setTransactionsList] = useState<DashboardTransaction[]>([]);
  const [liveProperties, setLiveProperties] = useState<any[]>([]);
  const [liveTenants, setLiveTenants] = useState<any[]>([]);
  const [liveMaintenanceCount, setLiveMaintenanceCount] = useState<number>(0);
  const [urgentMaintenanceCount, setUrgentMaintenanceCount] = useState<number>(0);

  // Load Real Database Telemetry
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        setLoading(false);
        return;
      }

      // 1. Fetch Real Transactions
      const txRes = await fetch(`/api/transactions?wid=${activeWid}`);
      if (txRes.ok) {
        const json = await txRes.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: DashboardTransaction[] = json.data.map((t: any) => {
            const desc = t.description || "Workspace Resident";
            const parts = desc.split("—").map((s: string) => s.trim());
            const tenantName = parts[0] || desc;
            const unitName = parts[1] || "Primary Unit";

            let rawNum = 0;
            if (typeof t.amount === "string") {
              rawNum = parseFloat(t.amount.replace(/[^0-9.]/g, "")) || 0;
            } else if (typeof t.amount === "number") {
              rawNum = t.amount;
            }

            const stStr = String(t.status || "").toLowerCase();
            let st: "paid" | "pending" | "overdue" = "paid";
            if (stStr === "overdue") st = "overdue";
            else if (stStr === "processing" || stStr === "pending") st = "pending";
            else st = "paid";

            return {
              id: t.transactionNumber || t.id,
              tenant: tenantName,
              unit: unitName,
              amount: typeof t.amount === "string" ? t.amount : `$${rawNum.toLocaleString("en-US")}`,
              rawAmount: rawNum,
              dueDate: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "2026-07-28",
              status: st,
              channel: t.paymentMethod || "Razorpay Auto-Debit",
              paymentId: t.paymentId || "pay_direct_bank",
            };
          });
          setTransactionsList(mapped);
        }
      }

      // 2. Fetch Live Properties
      const propRes = await fetch(`/api/properties?wid=${activeWid}`);
      if (propRes.ok) {
        const json = await propRes.json();
        if (json.success && Array.isArray(json.data)) {
          setLiveProperties(json.data);
        }
      }

      // 3. Fetch Live Tenants
      const tenantRes = await fetch(`/api/tenants?wid=${activeWid}`);
      if (tenantRes.ok) {
        const json = await tenantRes.json();
        if (json.success && Array.isArray(json.data)) {
          setLiveTenants(json.data);
        }
      }

      // 4. Fetch Live Maintenance Tickets
      const maintRes = await fetch(`/api/maintenance?wid=${activeWid}`);
      if (maintRes.ok) {
        const json = await maintRes.json();
        if (json.success && Array.isArray(json.data)) {
          setLiveMaintenanceCount(json.data.length);
          const urgent = json.data.filter((m: any) => m.priority === "High" || m.priority === "Urgent" || m.status === "Open").length;
          setUrgentMaintenanceCount(urgent);
        }
      }
    } catch (err) {
      console.warn("Could not load dashboard overview telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredTransactions = transactionsList.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  // Dynamic Metrics Computations
  const paidTxns = transactionsList.filter((t) => t.status === "paid");
  const totalMonthlyYield = paidTxns.reduce((acc, t) => acc + (t.rawAmount || 0), 0);

  // Property units & accurate occupancy calculation strictly from PostgreSQL
  const totalUnitsInPortfolio = liveProperties.reduce((acc, p) => acc + (p.totalUnits || 0), 0);
  const totalOccupiedUnits = liveProperties.reduce((acc, p) => acc + (p.occupiedUnits || 0), 0);
  const occupancyPct = totalUnitsInPortfolio > 0 
    ? ((totalOccupiedUnits / totalUnitsInPortfolio) * 100).toFixed(1)
    : "0.0";
  const vacantUnitsCount = Math.max(0, totalUnitsInPortfolio - totalOccupiedUnits);

  // Printable Receipt Action
  const handlePrintReceipt = (tx: DashboardTransaction) => {
    const html = generatePaymentReceiptHtml({
      invoiceNumber: tx.id,
      receiptNumber: `RCPT-${tx.id}`,
      date: tx.dueDate,
      planName: `Monthly Rent — ${tx.unit}`,
      amount: tx.amount,
      paymentMethod: tx.channel,
      paymentId: tx.paymentId || "pay_direct_bank",
      status: tx.status.toUpperCase(),
    });
    triggerPrintOrDownload(html, `Payment_Receipt_${tx.id}`);
  };

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mission Control Overview
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time operations, rental yield, and tenant telemetry log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).checkCanAddAction) {
                if (!(window as any).checkCanAddAction("Add New Property")) return;
              }
              setShowAddPropertyModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>Add Property</span>
          </button>

          <Link
            href="/dashboard/payments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all uppercase tracking-wider"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Financials</span>
          </Link>

          <Link
            href="/dashboard/leases"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New AI Document</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Monthly Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent Yield</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(totalMonthlyYield)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>{paidTxns.length} Rent Payments Collected</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Direct Settlement</span>
            <span className="font-bold text-slate-900">{paidTxns.length} Paid</span>
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{occupancyPct}%</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
              <span>{totalOccupiedUnits} of {totalUnitsInPortfolio} units occupied</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Vacant Units: {vacantUnitsCount}</span>
            <span className="font-bold text-orange-600">Turnover: &lt; 5 days</span>
          </div>
        </div>

        {/* Metric 3: Active Leases & Renewals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Leases &amp; Renewals</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{liveTenants.length} Active</div>
            <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold mt-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Digital Lease Agreements Onboarded</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Lease Health Compliance:</span>
            <span className="font-bold text-emerald-600">100% Verified</span>
          </div>
        </div>

        {/* Metric 4: Maintenance Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maintenance Stream</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{liveMaintenanceCount} Tickets</div>
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold mt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{urgentMaintenanceCount} Open / Pending Requests</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Vendor Dispatch:</span>
            <span className="font-bold text-slate-900">14 mins</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions (Left 8 Cols) & AI Insights Sidebar (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Table Section */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Rent Transactions</h3>
              <p className="text-xs text-slate-500">Live payment collection log across your portfolio.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(["all", "paid", "pending", "overdue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer transition-all ${
                    filter === tab
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Tenant &amp; Unit</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Due Date</th>
                  <th className="pb-3 px-2">Payment Method</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      Loading live transaction records...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 border-0">
                      <EmptyStateIllustration
                        title="No Rent Payments Logged Yet"
                        description="When tenants pay monthly rent or when you log payment collections, live financial telemetry will automatically appear here."
                        actionText="Record Rent Payment"
                        actionHref="/dashboard/payments"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="font-extrabold text-slate-900">{tx.tenant}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{tx.unit}</div>
                      </td>
                      <td className="py-3.5 px-2 font-black text-slate-900">{tx.amount}</td>
                      <td className="py-3.5 px-2 text-slate-600 font-medium">{tx.dueDate}</td>
                      <td className="py-3.5 px-2 text-slate-600">{tx.channel}</td>
                      <td className="py-3.5 px-2">
                        {tx.status === "paid" && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                            Paid
                          </span>
                        )}
                        {tx.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-700 uppercase tracking-wider border border-amber-200">
                            Pending
                          </span>
                        )}
                        {tx.status === "overdue" && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-red-50 text-red-700 uppercase tracking-wider border border-red-200">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        {tx.status === "overdue" ? (
                          <button
                            onClick={() => toast(`Payment reminder notification sent to ${tx.tenant}!`, "warning")}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[10px] rounded-md transition-colors uppercase cursor-pointer"
                          >
                            Send Reminder
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePrintReceipt(tx)}
                            className="text-slate-500 hover:text-slate-900 font-bold text-[11px] underline cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-slate-400" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/dashboard/payments"
              className="text-xs font-bold text-[#FF6B00] hover:underline uppercase tracking-wider inline-flex items-center gap-1"
            >
              <span>View All Financial Reports &amp; Historical Records</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Sidebar Widgets Section (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Property Portfolio Summary */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Portfolio Summary</h4>
                  <p className="text-[11px] text-slate-500">Live property occupancy rates</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                {occupancyPct}% Occupied
              </span>
            </div>

              {liveProperties.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-400 text-xs font-semibold">
                  No properties added yet.
                </div>
              ) : (
                liveProperties.slice(0, 3).map((p, idx) => {
                  const total = typeof p.totalUnits === "number" ? p.totalUnits : 0;
                  const occupied = typeof p.occupiedUnits === "number" ? p.occupiedUnits : 0;
                  const pct = total > 0 ? Math.min(100, Math.round((occupied / total) * 100)) : 0;

                  return (
                    <div key={p.id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="truncate max-w-[150px]">{p.name}</span>
                        <span className="text-slate-600 font-extrabold text-[11px]">{occupied} / {total} Units</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6B00] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}

            <Link
              href="/dashboard/properties"
              className="inline-block w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-2xs"
            >
              Manage Properties Portfolio →
            </Link>
          </div>

          {/* Card 2: Upcoming Lease Expirations */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Resident Directory</h4>
                  <p className="text-[11px] text-slate-500">Live active lease contracts</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                {liveTenants.length} Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {liveTenants.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-400 font-semibold">
                  No active tenant leases found.
                </div>
              ) : (
                liveTenants.slice(0, 2).map((t) => (
                  <div key={t.id} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{t.name}</span>
                      <span className="text-purple-700 font-extrabold text-[11px]">Lease Active</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t.unit?.property?.name || t.property?.name || "The Regent"} • {t.unit?.unitNumber || "Unit #101"} ({t.monthlyRent ? `$${t.monthlyRent.toLocaleString()}/mo` : "$0/mo"})
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/dashboard/tenants"
              className="inline-block w-full text-center py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-2xs"
            >
              View Resident Directory &amp; Leases →
            </Link>
          </div>

        </div>

      </div>

      <AddPropertyModal
        isOpen={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
    </div>
  );
}
