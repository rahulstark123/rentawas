"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Receipt,
  Download,
  X,
  Bot, 
  Zap, 
  CreditCard, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Sparkles,
  Layers,
  Building2,
  CheckCircle2,
  HelpCircle,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";
import AiCreditsExhaustedModal from "@/components/AiCreditsExhaustedModal";
import { invalidateAiUsage } from "@/lib/queryInvalidation";

interface AiLogItem {
  id: string;
  timestamp: string;
  feature: string;
  targetItem: string;
  question: string;
  creditsCost: number;
  status: string;
}

export default function RentAwasAiPage() {
  const { toast } = useToast();

  // Pagination & search (balance/logs come from useQuery data)
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [billingReceipts, setBillingReceipts] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const fetchReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) return;
      const res = await fetch(`/api/ai/billing-receipts?workspaceId=${activeWid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.receipts && Array.isArray(json.receipts)) {
          setBillingReceipts(json.receipts);
        }
      }
    } catch {
      toast("Could not load billing receipts.", "error");
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleOpenReceiptsModal = () => {
    fetchReceipts();
    setShowReceiptsModal(true);
  };

  const handlePrintReceipt = (receipt: any) => {
    try {
      const { generateTaxInvoiceHtml } = require("@/lib/pdfGenerator");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const html = generateTaxInvoiceHtml({
          invoiceNumber: receipt.invoiceNumber || receipt.id,
          receiptNumber: receipt.id,
          date: new Date(receipt.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          planName: receipt.item,
          amount: receipt.amount,
          billingTerm: receipt.type,
          paymentMethod: receipt.paymentMethod,
          paymentId: receipt.paymentId,
          status: receipt.status,
        });
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    } catch {
      toast("Printing receipt popup blocked or unavailable.", "error");
    }
  };

  // ─── Workspace ID ──────────────────────────────────────────────────────────
  const [aiWorkspaceId, setAiWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (wid) setAiWorkspaceId(wid);
    })();
  }, []);

  // ─── TanStack Query ─────────────────────────────────────────────────────────
  const { data: usageData, isPending, isFetching } = useQuery({
    queryKey: ["ai-usage", aiWorkspaceId, page],
    enabled: !!aiWorkspaceId,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await fetch(`/api/ai/usage-history?workspaceId=${aiWorkspaceId}&page=${page}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch AI usage");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch AI usage");
      return json as {
        currentBalance: number;
        creditLimit: number;
        creditsUsed: number;
        plan: string;
        pagination: { page: number; limit: number; totalPages: number; totalItems: number };
        logs: AiLogItem[];
      };
    },
  });

  const creditLimit = usageData?.creditLimit ?? 20;
  const creditsUsed = usageData?.creditsUsed ?? 0;
  // Same formula as dashboard header badge — never drift from limit − used
  const currentBalance = Math.max(0, creditLimit - creditsUsed);
  const plan = usageData?.plan ?? "free";
  const logs = usageData?.logs ?? [];
  const totalPages = usageData?.pagination?.totalPages ?? 1;
  const totalItems = usageData?.pagination?.totalItems ?? 0;
  const loading = !aiWorkspaceId || isPending;
  const refreshing = isFetching && !isPending;

  const fetchAiUsage = async (p = page) => {
    if (p !== page) setPage(p);
    invalidateAiUsage(queryClient);
    await queryClient.refetchQueries({ queryKey: ["ai-usage"] });
  };

  useEffect(() => {
    const handleCreditsUpdated = () => {
      invalidateAiUsage(queryClient);
      void queryClient.refetchQueries({ queryKey: ["ai-usage"] });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ai-credits-updated", handleCreditsUpdated);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ai-credits-updated", handleCreditsUpdated);
      }
    };
  }, [queryClient]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // Filter logs locally by searchQuery
  const filteredLogs = logs.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.feature.toLowerCase().includes(q) ||
      item.targetItem.toLowerCase().includes(q) ||
      item.question.toLowerCase().includes(q)
    );
  });

  const percentageUsed =
    creditLimit > 0 ? Math.min(100, Math.round((creditsUsed / creditLimit) * 100)) : 0;

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-md shadow-purple-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              RentAwas AI Control Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your RentAwas Buddy credits, view query logs, and track real-time AI telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/billing#plan-invoices"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer hover:border-orange-300"
          >
            <CreditCard className="w-4 h-4 text-[#FF6B00]" />
            <span>Plans &amp; Billing</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenReceiptsModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer hover:border-purple-300"
          >
            <Receipt className="w-4 h-4 text-purple-600" />
            <span>AI Billing Receipts</span>
          </button>

          <button
            type="button"
            onClick={() => fetchAiUsage(page)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Refresh AI Balance & Usage History"
          >
            <RefreshCw className={`w-4 h-4 ${loading || refreshing ? "animate-spin text-purple-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────── TOP SECTION: CURRENT AI BALANCE ─────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
          {/* Hero Card Skeleton */}
          <div className="md:col-span-2 bg-[#0B132B] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-40 bg-slate-800 rounded-lg" />
                <div className="h-5 w-24 bg-slate-800 rounded-full" />
              </div>
              <div className="h-12 w-64 bg-slate-800 rounded-2xl" />
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <div className="h-3 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-28 bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <div className="h-3.5 w-60 bg-slate-800 rounded" />
              <div className="h-9 w-32 bg-slate-800 rounded-xl" />
            </div>
          </div>

          {/* Stats Card Skeleton */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="h-4 w-36 bg-slate-200 rounded-lg" />
              <div className="space-y-3">
                <div className="h-10 w-full bg-slate-100 rounded-2xl" />
                <div className="h-10 w-full bg-slate-100 rounded-2xl" />
              </div>
            </div>
            <div className="h-8 w-full bg-purple-50 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Current AI Balance Hero Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0B132B] via-[#141A26] to-[#1C2536] border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Current AI Credits Balance</span>
                </span>
                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase text-purple-200 tracking-wider">
                  {plan.toUpperCase()} PLAN
                </span>
              </div>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {currentBalance.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {creditLimit.toLocaleString()} AI Credits Remaining
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Used: {creditsUsed} Credits ({percentageUsed}%)</span>
                  <span>Available: {currentBalance} Credits</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                💡 Need more AI credits? Instant top-ups available from ₹199.
              </span>
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-extrabold text-xs transition-all shadow-md shadow-purple-500/30 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>+ Recharge Now</span>
              </button>
            </div>
          </div>

          {/* AI Stats Overview Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider block border-b border-slate-100 pb-2.5">
                AI Operational Summary
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="font-semibold text-slate-600">Cost Per Query</span>
                  <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    2 Credits
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="font-semibold text-slate-600">Total Queries Run</span>
                  <span className="font-extrabold text-slate-900">{totalItems} Queries</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl text-[11px] text-purple-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>RentAwas Buddy active on Properties, Units & Marketplace</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── BOTTOM SECTION: AI USAGE HISTORY TABLE ─────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-none">
              AI Query & Telemetry Usage History
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Paginated logs of all RentAwas Buddy questions (Max 10 records per page).
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, targets, questions..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Usage History Table */}
        <div className="overflow-x-auto border border-slate-200/90 rounded-2xl shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-black uppercase text-slate-600 tracking-wider">
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">AI Feature Type</th>
                <th className="px-4 py-3">Target Subject</th>
                <th className="px-4 py-3">Question / Prompt Asked</th>
                <th className="px-4 py-3 text-center">Cost</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100">
                    <td className="px-4 py-4"><div className="h-3.5 w-24 bg-slate-200 rounded-md" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-36 bg-purple-100/70 rounded-lg" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 w-20 bg-slate-200 rounded-md" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 w-64 bg-slate-200 rounded-md" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-5 w-16 bg-amber-100/70 rounded-full mx-auto" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-5 w-20 bg-emerald-100/70 rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No AI usage records found. Ask RentAwas Buddy a question to start logging history!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 text-slate-600 font-semibold whitespace-nowrap text-[11px]">
                      {new Date(item.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Feature Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-extrabold text-[11px] border border-purple-200">
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        <span>{item.feature}</span>
                      </span>
                    </td>

                    {/* Target Item */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap max-w-[180px] truncate">
                      {item.targetItem}
                    </td>

                    {/* Question / Prompt */}
                    <td className="px-4 py-3.5 text-slate-700 font-medium max-w-xs truncate">
                      "{item.question}"
                    </td>

                    {/* Credits Cost */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-black text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                        -{item.creditsCost} Credits
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.status}</span>
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls (Max 10 per page) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900">{page}</span> of{" "}
            <span className="font-bold text-slate-900">{totalPages}</span> ({totalItems} total logs logged)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pNum === page
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* AI Credits Recharge Modal */}
      <AiCreditsExhaustedModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        creditsUsed={creditsUsed}
        creditLimit={creditLimit}
        plan={plan}
        onRecharged={() => {
          void fetchAiUsage(1);
          void fetchReceipts();
        }}
      />

      {/* ─────────────────────── BILLING RECEIPTS & INVOICES MODAL ─────────────────────── */}
      {showReceiptsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 text-white flex items-center justify-between relative overflow-hidden border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  <Receipt className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight leading-snug">
                    AI Billing Receipts &amp; Tax Invoices
                  </h3>
                  <p className="text-xs text-purple-200 font-medium mt-0.5">
                    Official receipts for AI credit recharges only. Plan invoices are on Plans &amp; Billing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReceiptsModal(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Receipts Table */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider pb-1">
                <span>Row-wise Invoice & Receipt History:</span>
                <span>{billingReceipts.length} Purchased Records</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-600 tracking-wider">
                      <th className="px-4 py-3">Invoice # & ID</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Purchased Item / Pack</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Payment Gateway</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                    {loadingReceipts ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                          <div className="inline-flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                            <span>Fetching billing receipts...</span>
                          </div>
                        </td>
                      </tr>
                    ) : billingReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold space-y-3">
                          <p>No AI recharge receipts yet for this workspace.</p>
                          <Link
                            href="/dashboard/billing#plan-invoices"
                            className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-bold underline underline-offset-2"
                            onClick={() => setShowReceiptsModal(false)}
                          >
                            View plan invoices on Plans &amp; Billing
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      billingReceipts.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                          
                          {/* Invoice # */}
                          <td className="px-4 py-3.5 font-bold font-mono text-purple-700 whitespace-nowrap text-[11px]">
                            {rec.invoiceNumber || rec.id}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap text-[11px]">
                            {new Date(rec.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          {/* Item */}
                          <td className="px-4 py-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                            {rec.item}
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3.5 font-black text-slate-900 whitespace-nowrap">
                            {rec.amount}
                          </td>

                          {/* Payment Method */}
                          <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap text-[11px]">
                            <div>{rec.paymentMethod}</div>
                            <div className="text-[10px] font-mono text-slate-400">{rec.paymentId}</div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{rec.status || "Paid"}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handlePrintReceipt(rec)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] rounded-xl shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>Print PDF</span>
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0 gap-3">
              <span className="text-slate-500 font-medium">
                AI credit invoices only. For workspace plan receipts, open Plans &amp; Billing.
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/billing#plan-invoices"
                  onClick={() => setShowReceiptsModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-[#FF6B00]/40 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Plans &amp; Billing
                </Link>
                <button
                  type="button"
                  onClick={() => setShowReceiptsModal(false)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
