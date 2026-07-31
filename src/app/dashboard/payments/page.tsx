"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Coins, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  RefreshCw, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  X,
  FileText,
  Printer,
  Calendar,
  Building2,
  User,
  Sparkles
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { generatePaymentReceiptHtml, triggerPrintOrDownload } from "@/lib/pdfGenerator";
import EmptyStateIllustration from "@/components/ui/EmptyStateIllustration";

export interface TransactionRecord {
  id: string;
  tenant: string;
  property: string;
  amount: string;
  rawAmount: number;
  date: string;
  status: string;
  method: string;
  paymentId?: string;
}

export default function RentPaymentsPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [transactionsList, setTransactionsList] = useState<TransactionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Modal State for Recording New Rent Payment
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTenants, setLiveTenants] = useState<any[]>([]);

  // Form State
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [customTenantName, setCustomTenantName] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [paymentMethodInput, setPaymentMethodInput] = useState("Razorpay Auto-Debit");
  const [statusInput, setStatusInput] = useState("Completed");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);

  // 1. Fetch Live Transactions & Tenants from PostgreSQL
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transactions?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: TransactionRecord[] = json.data.map((t: any) => {
            const desc = t.description || "Workspace Resident";
            const parts = desc.split("—").map((s: string) => s.trim());
            const tenantName = parts[0] || desc;
            const propertyName = parts[1] || "Primary Unit";

            // Parse numerical amount for summaries
            let rawNum = 0;
            if (typeof t.amount === "string") {
              const cleaned = t.amount.replace(/[^0-9.]/g, "");
              rawNum = parseFloat(cleaned) || 0;
            } else if (typeof t.amount === "number") {
              rawNum = t.amount;
            }

            return {
              id: t.transactionNumber || t.id,
              tenant: tenantName,
              property: propertyName,
              amount: typeof t.amount === "string" ? t.amount : `$${rawNum.toLocaleString("en-US")}`,
              rawAmount: rawNum,
              date: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "2026-07-28",
              status: t.status === "Success" ? "Completed" : t.status || "Completed",
              method: t.paymentMethod || "Razorpay Auto-Debit",
              paymentId: t.paymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
            };
          });
          setTransactionsList(mapped);
        }
      }
    } catch (err) {
      console.warn("Could not fetch PostgreSQL transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveTenants = async () => {
    try {
      const res = await fetch("/api/tenants?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLiveTenants(json.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch live tenants:", err);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadLiveTenants();
  }, []);

  // 2. Handle Tenant Selection Change
  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (!tenantId) {
      setCustomTenantName("");
      setCustomUnit("");
      setAmountInput("");
      return;
    }
    const found = liveTenants.find((t) => t.id === tenantId);
    if (found) {
      setCustomTenantName(found.name);
      const propName = found.unit?.property?.name || found.property?.name || "The Regent";
      const uNo = found.unit?.unitNumber || "Unit #101";
      setCustomUnit(`${propName} - ${uNo}`);
      setAmountInput(found.monthlyRent ? `$${found.monthlyRent.toLocaleString()}` : "$3,200");
    }
  };

  // 3. Handle Submit New Rent Payment Transaction
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTenant = customTenantName.trim() || "Tenant Resident";
    const finalUnit = customUnit.trim() || "Primary Rental Unit";
    const finalAmount = amountInput.trim() || "$3,200";

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: finalTenant,
          propertyUnit: finalUnit,
          amount: finalAmount,
          status: statusInput,
          paymentMethod: paymentMethodInput,
          type: "Rent Collection",
          wid: 1,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(`Monthly rent payment of ${finalAmount} recorded for ${finalTenant}!`, "success");
        setShowAddModal(false);
        // Reset Form
        setSelectedTenantId("");
        setCustomTenantName("");
        setCustomUnit("");
        setAmountInput("");
        loadTransactions();
      } else {
        toast("Failed to record rent payment", "error");
      }
    } catch (err) {
      console.error("Error submitting transaction:", err);
      toast("An error occurred while saving transaction", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Print / View Receipt
  const handlePrintReceipt = (record: TransactionRecord) => {
    const html = generatePaymentReceiptHtml({
      invoiceNumber: record.id,
      receiptNumber: `RCPT-${record.id}`,
      date: record.date,
      planName: `Monthly Rent — ${record.property}`,
      amount: record.amount,
      paymentMethod: record.method,
      paymentId: record.paymentId || "pay_direct_bank",
      status: record.status,
    });
    triggerPrintOrDownload(html, `Payment_Receipt_${record.id}`);
  };

  // 5. CSV Export Ledger
  const handleExportCSV = () => {
    if (transactionsList.length === 0) {
      toast("No transactions to export.", "info");
      return;
    }
    const headers = ["Transaction ID", "Tenant Name", "Property & Unit", "Amount", "Date", "Payment Method", "Status"];
    const rows = transactionsList.map((t) => [
      t.id,
      `"${t.tenant}"`,
      `"${t.property}"`,
      `"${t.amount}"`,
      t.date,
      `"${t.method}"`,
      t.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rent_Payments_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Rent Payments Ledger exported as CSV!", "success");
  };

  // Filtered Ledger List
  const filteredTransactions = transactionsList.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination Calculations (Max 10 per page)
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Dynamic Summaries
  const completedTxns = transactionsList.filter((t) => t.status === "Completed");
  const totalCollectedSum = completedTxns.reduce((acc, t) => acc + (t.rawAmount || 0), 0);
  const pendingTxns = transactionsList.filter((t) => t.status === "Processing" || t.status === "Overdue");
  const totalPendingSum = pendingTxns.reduce((acc, t) => acc + (t.rawAmount || 0), 0);
  const onTimeRate = transactionsList.length > 0 
    ? ((completedTxns.length / transactionsList.length) * 100).toFixed(1)
    : "100.0";

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Rent Payments &amp; Transactions</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct Settlement</span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Collection history, bank payout records, and payment gateway transaction ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).checkCanAddAction) {
                if (!(window as any).checkCanAddAction("Record Rent Payment")) return;
              }
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Rent Payment</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rent Collected This Month</div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(totalCollectedSum)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Deposited to Bank Account ({completedTxns.length} Payments)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending &amp; Overdue Collections</div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {formatCurrency(totalPendingSum)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>{pendingTxns.length} Pending / Overdue (Reminders Active)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Time Collection Rate</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{onTimeRate}%</div>
          <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedTxns.length} of {transactionsList.length} Payments Collected On-Time</span>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
        
        {/* Table Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Full Payout &amp; Collection Ledger</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time monthly rent transactions and direct settlement history</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tenant name or unit..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses ({transactionsList.length})</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 px-2">Transaction ID</th>
                <th className="pb-3 px-2">Tenant &amp; Property</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Payment Method</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                    Loading PostgreSQL rent payment records...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 border-0">
                    <EmptyStateIllustration
                      title="No Rent Payments Logged Yet"
                      description="When tenants pay monthly rent or when you log payment collections, live financial telemetry will automatically appear here."
                      actionText="Record Rent Payment"
                      onActionClick={() => {
                        if (typeof window !== "undefined" && (window as any).checkCanAddAction) {
                          if (!(window as any).checkCanAddAction("Record Rent Payment")) return;
                        }
                        setShowAddModal(true);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-700">{t.id}</td>
                    <td className="py-3.5 px-2">
                      <div className="font-extrabold text-slate-900">{t.tenant}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{t.property}</div>
                    </td>
                    <td className="py-3.5 px-2 font-black text-slate-900">
                      {formatCurrency(t.rawAmount || 0)}
                    </td>
                    <td className="py-3.5 px-2 text-slate-600">{t.date}</td>
                    <td className="py-3.5 px-2 text-slate-600 font-semibold">{t.method}</td>
                    <td className="py-3.5 px-2">
                      {t.status === "Completed" && (
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase">
                          Completed
                        </span>
                      )}
                      {t.status === "Processing" && (
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 uppercase">
                          Processing
                        </span>
                      )}
                      {t.status === "Overdue" && (
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200/80 uppercase">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => handlePrintReceipt(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Print / View Receipt PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Bar */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 font-sans">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
              <span className="font-bold text-slate-900">{endIndex}</span> of{" "}
              <span className="font-bold text-slate-900">{totalItems}</span> transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>

              <span className="text-xs font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECORD RENT PAYMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-2xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Record Monthly Rent Payment</h3>
                  <p className="text-xs text-slate-500 font-medium">Log collection transaction into PostgreSQL database</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              
              {/* Select Tenant from Directory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Tenant Resident (Optional)
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  <option value="">-- Choose Tenant from Directory --</option>
                  {liveTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.unit?.property?.name || t.property?.name || "The Regent"} ({t.unit?.unitNumber || "Unit"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Tenant Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tenant Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customTenantName}
                  onChange={(e) => setCustomTenantName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Property & Unit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Property &amp; Unit *
                </label>
                <input
                  type="text"
                  required
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="e.g. The Regent - #302"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Rent Amount *
                  </label>
                  <input
                    type="text"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="e.g. $3,200 or ₹25,000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Payment Method & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethodInput}
                    onChange={(e) => setPaymentMethodInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Razorpay Auto-Debit">Razorpay Auto-Debit</option>
                    <option value="Razorpay UPI / QR">Razorpay UPI / QR</option>
                    <option value="Direct Card">Direct Card</option>
                    <option value="Bank Payout / NEFT">Bank Payout / NEFT</option>
                    <option value="Cash / Offline">Cash / Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Collection Status *
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Processing">Processing</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? "Recording..." : "Save Payment Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
