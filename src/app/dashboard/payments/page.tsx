"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
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
  Sparkles,
  ClipboardCheck,
  Receipt,
  Upload,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { generateRentPaymentReceiptHtml, triggerPrintOrDownload } from "@/lib/pdfGenerator";
import EmptyStateIllustration from "@/components/ui/EmptyStateIllustration";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";
import { uploadFile } from "@/lib/upload";
import AutoReceiptSettingsModal from "@/components/receipts/AutoReceiptSettingsModal";
import {
  getRentBillReceiptState,
  type RentBillReceiptState,
  type RentReceiptTemplateData,
  DEFAULT_RENT_RECEIPT_TEMPLATE,
  resolveSignatureForReceipt,
} from "@/lib/rentReceipts";

export interface TransactionRecord {
  billId: string;
  tenant: string;
  tenantEmail?: string;
  property: string;
  propertyId?: string;
  amount: string;
  rawAmount: number;
  date: string;
  status: string;
  method: string;
  paymentId?: string;
  receiptState: RentBillReceiptState;
  title: string;
  receiptUrl?: string;
  receiptName?: string;
  propertyAutoReceipt: boolean;
}

export default function RentPaymentsPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [transactionsList, setTransactionsList] = useState<TransactionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [actionBillId, setActionBillId] = useState<string | null>(null);
  const [showAutoReceiptModal, setShowAutoReceiptModal] = useState(false);
  const [showManualReceiptModal, setShowManualReceiptModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<TransactionRecord | null>(null);
  const [manualReceiptFile, setManualReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
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
  const [paymentMethodInput, setPaymentMethodInput] = useState("Cash / Offline");
  const [rentMonthInput, setRentMonthInput] = useState(() => new Date().toISOString().slice(0, 7));
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);

  const formatRentMonthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-").map(Number);
    if (!year || !month) return yearMonth;
    return new Date(year, month - 1, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const parseAmountInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // 1. Fetch tenant rent bills for this workspace
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!wid) {
        setTransactionsList([]);
        return;
      }
      setWorkspaceId(String(wid));

      const res = await fetch(`/api/bills?workspaceId=${encodeURIComponent(String(wid))}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: TransactionRecord[] = json.data.map((b: any) => {
            const receiptState = getRentBillReceiptState({
              status: b.status,
              paymentMethod: b.paymentMethod,
              notes: b.notes,
              receiptUrl: b.receiptUrl,
              property: b.property,
            });
            const tenantName = b.tenant?.name || "Resident";
            const propertyName = b.property?.name || "Property";
            const unitNo = b.unit?.unitNumber ? ` — ${b.unit.unitNumber}` : "";
            const rawAmount = Number(b.amount) || 0;
            const displayStatus =
              receiptState === "pending_verification"
                ? "Pending Verification"
                : receiptState === "verified_awaiting_receipt"
                ? "Verified"
                : "Completed";

            return {
              billId: b.id,
              tenant: tenantName,
              tenantEmail: b.tenant?.email || "",
              property: `${propertyName}${unitNo}`,
              propertyId: b.propertyId || b.property?.id,
              amount: formatCurrency(rawAmount),
              rawAmount,
              date: b.paidDate
                ? new Date(b.paidDate).toISOString().split("T")[0]
                : b.createdAt
                ? new Date(b.createdAt).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              status: displayStatus,
              method: b.paymentMethod || "Direct Payment",
              paymentId: b.notes?.match(/pay_[\w]+|cs_[\w]+/i)?.[0],
              receiptState,
              title: b.title || "Monthly Rent Payment",
              receiptUrl: b.receiptUrl || undefined,
              receiptName: b.receiptName || undefined,
              propertyAutoReceipt: b.property?.autoReceiptEnabled ?? true,
            };
          });
          setTransactionsList(mapped);
        }
      }
    } catch (err) {
      console.warn("Could not fetch rent bills:", err);
    } finally {
      setLoading(false);
    }
  }, [formatCurrency]);

  const loadLiveTenants = async () => {
    try {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!wid) return;
      const res = await fetch(`/api/tenants?wid=${encodeURIComponent(String(wid))}`);
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
  }, [loadTransactions]);

  const fetchReceiptTemplate = async (propertyId?: string): Promise<RentReceiptTemplateData> => {
    if (!workspaceId) return DEFAULT_RENT_RECEIPT_TEMPLATE;
    const params = new URLSearchParams({ workspaceId });
    if (propertyId) params.set("propertyId", propertyId);
    const res = await fetch(`/api/receipt-templates?${params.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.data) return DEFAULT_RENT_RECEIPT_TEMPLATE;
    return {
      brandName: json.data.brandName || DEFAULT_RENT_RECEIPT_TEMPLATE.brandName,
      tagline: json.data.tagline || DEFAULT_RENT_RECEIPT_TEMPLATE.tagline,
      address: json.data.address || "",
      taxId: json.data.taxId || "",
      contactEmail: json.data.contactEmail || "",
      contactPhone: json.data.contactPhone || "",
      footerNote: json.data.footerNote || DEFAULT_RENT_RECEIPT_TEMPLATE.footerNote,
      accentColor: json.data.accentColor || DEFAULT_RENT_RECEIPT_TEMPLATE.accentColor,
      signatureId: json.data.signatureId || null,
    };
  };

  const fetchReceiptSignature = async (signatureId?: string | null) => {
    if (!workspaceId || !signatureId) return undefined;
    const res = await fetch(`/api/receipt-signatures?workspaceId=${workspaceId}`);
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) return undefined;
    return resolveSignatureForReceipt(json.data, signatureId);
  };

  const handleVerifyPayment = async (record: TransactionRecord) => {
    setActionBillId(record.billId);
    try {
      const res = await fetch(`/api/bills/${record.billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");
      toast(
        json.autoReceiptIssued
          ? `Payment from ${record.tenant} verified. RentAwas receipt issued automatically.`
          : `Payment from ${record.tenant} verified. Upload a receipt when ready.`,
        "success"
      );
      await loadTransactions();
    } catch (err: any) {
      toast(err.message || "Could not verify payment.", "error");
    } finally {
      setActionBillId(null);
    }
  };

  const handleIssueReceipt = async (record: TransactionRecord) => {
    if (!record.propertyAutoReceipt) {
      setUploadTarget(record);
      setManualReceiptFile(null);
      setShowManualReceiptModal(true);
      return;
    }

    setActionBillId(record.billId);
    try {
      const res = await fetch(`/api/bills/${record.billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "issue_receipt" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not issue receipt");
      toast(`RentAwas receipt issued for ${record.tenant}.`, "success");
      await loadTransactions();
      await handlePrintReceipt({ ...record, receiptState: "receipt_ready" });
    } catch (err: any) {
      toast(err.message || "Could not issue receipt.", "error");
    } finally {
      setActionBillId(null);
    }
  };

  const handleUploadManualReceipt = async () => {
    if (!uploadTarget || !manualReceiptFile || !workspaceId) return;
    setUploadingReceipt(true);
    try {
      const upload = await uploadFile(manualReceiptFile, {
        workspaceId,
        context: "misc",
        filename: `rent-receipt-${uploadTarget.billId}-${Date.now()}`,
      });
      if (!upload.success || !upload.url) {
        throw new Error(upload.error || "File upload failed");
      }

      const res = await fetch(`/api/bills/${uploadTarget.billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload_manual_receipt",
          receiptUrl: upload.url,
          receiptName: upload.filename || manualReceiptFile.name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save receipt");

      toast(`Manual receipt uploaded for ${uploadTarget.tenant}.`, "success");
      setShowManualReceiptModal(false);
      setUploadTarget(null);
      setManualReceiptFile(null);
      await loadTransactions();
    } catch (err: any) {
      toast(err.message || "Could not upload receipt.", "error");
    } finally {
      setUploadingReceipt(false);
    }
  };

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
      setAmountInput(found.monthlyRent ? String(found.monthlyRent) : "");
    }
  };

  // 3. Handle Submit New Rent Payment Transaction
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTenant = customTenantName.trim() || "Tenant Resident";
    const finalUnit = customUnit.trim() || "Primary Rental Unit";
    const numericAmount = parseAmountInput(amountInput);

    if (!numericAmount) {
      toast("Please enter a valid monthly rent amount.", "error");
      return;
    }

    const selectedTenant = selectedTenantId
      ? liveTenants.find((t) => t.id === selectedTenantId)
      : null;
    const rentMonthLabel = formatRentMonthLabel(rentMonthInput);

    setIsSubmitting(true);
    try {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Rent Payment — ${rentMonthLabel} — ${finalUnit}`,
          amount: numericAmount,
          category: "Rent",
          status: "Pending",
          paymentMethod: paymentMethodInput,
          notes: "awaiting_landlord_verification",
          paidDate: dateInput,
          tenantId: selectedTenant?.id,
          unitId: selectedTenant?.unitId || selectedTenant?.unit?.id,
          propertyId:
            selectedTenant?.propertyId ||
            selectedTenant?.unit?.propertyId ||
            selectedTenant?.unit?.property?.id,
          workspaceId: wid ? Number(wid) : undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(
          `Rent for ${rentMonthLabel} recorded for ${finalTenant}. Verify to confirm payment.`,
          "success"
        );
        setShowAddModal(false);
        setSelectedTenantId("");
        setCustomTenantName("");
        setCustomUnit("");
        setAmountInput("");
        setRentMonthInput(new Date().toISOString().slice(0, 7));
        setDateInput(new Date().toISOString().split("T")[0]);
        loadTransactions();
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["rent-bills"] });
      } else {
        toast(json.error || "Failed to record rent payment", "error");
      }
    } catch (err) {
      console.error("Error submitting transaction:", err);
      toast("An error occurred while saving transaction", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Print / View Receipt with property template
  const handlePrintReceipt = async (record: TransactionRecord) => {
    if (record.receiptUrl) {
      window.open(record.receiptUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const branding = await fetchReceiptTemplate(record.propertyId);
    const signature = await fetchReceiptSignature(branding.signatureId);
    const html = generateRentPaymentReceiptHtml({
      receiptNumber: `RCPT-${record.date}-${record.billId.slice(-6).toUpperCase()}`,
      date: record.date,
      tenantName: record.tenant,
      tenantEmail: record.tenantEmail,
      propertyName: record.property.split(" — ")[0] || record.property,
      unitNumber: record.property.includes(" — ") ? record.property.split(" — ")[1] : undefined,
      title: record.title,
      amount: formatCurrency(record.rawAmount),
      rawAmount: record.rawAmount,
      paymentMethod: record.method,
      paymentId: record.paymentId,
      status: "PAID",
      branding,
      signature,
    });
    triggerPrintOrDownload(html, `Rent_Receipt_${record.billId.slice(-8)}`);
  };

  // Filtered Ledger List
  const filteredTransactions = transactionsList.filter((t) => {
    const matchesSearch =
      t.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.method.toLowerCase().includes(searchTerm.toLowerCase());
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
  const completedTxns = transactionsList.filter((t) => t.receiptState === "receipt_ready");
  const totalCollectedSum = completedTxns.reduce((acc, t) => acc + (t.rawAmount || 0), 0);
  const pendingTxns = transactionsList.filter((t) => t.receiptState === "pending_verification");
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAutoReceiptModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Auto Receipt Active</span>
          </button>

          <Link
            href="/dashboard/payments/receipts"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all uppercase tracking-wider whitespace-nowrap"
          >
            <Receipt className="w-4 h-4 text-[#FF6B00]" />
            <span>My Receipts</span>
          </Link>

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
              <option value="Completed">Completed / Receipt Issued</option>
              <option value="Verified">Verified — Awaiting Receipt</option>
              <option value="Pending Verification">Pending Verification</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
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
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                    Loading tenant rent payment records...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 border-0">
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
                  <tr key={t.billId} className="hover:bg-slate-50/80 transition-colors">
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
                      {t.status === "Verified" && (
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 uppercase">
                          Verified
                        </span>
                      )}
                      {t.status === "Pending Verification" && (
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 uppercase">
                          Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {t.receiptState === "pending_verification" && (
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(t)}
                          disabled={actionBillId === t.billId}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>{actionBillId === t.billId ? "..." : "Verify"}</span>
                        </button>
                      )}
                      {t.receiptState === "verified_awaiting_receipt" && (
                        <button
                          type="button"
                          onClick={() => handleIssueReceipt(t)}
                          disabled={actionBillId === t.billId}
                          className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {actionBillId === t.billId
                              ? "..."
                              : t.propertyAutoReceipt
                              ? "Issue Receipt"
                              : "Upload Receipt"}
                          </span>
                        </button>
                      )}
                      {t.receiptState === "receipt_ready" && (
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(t)}
                          className="p-1.5 rounded-lg text-purple-700 hover:text-purple-900 hover:bg-purple-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px] uppercase"
                          title={t.receiptUrl ? "View uploaded receipt" : "Download RentAwas receipt PDF"}
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">{t.receiptUrl ? "View" : "PDF"}</span>
                        </button>
                      )}
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

              {/* Rent Month & Payment Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rent For Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={rentMonthInput}
                    onChange={(e) => setRentMonthInput(e.target.value)}
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

              {/* Amount & Payment Method */}
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
                    placeholder="e.g. 3200 or 25000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethodInput}
                    onChange={(e) => setPaymentMethodInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Cash / Offline">Cash / Offline</option>
                    <option value="Bank Payout / NEFT">Bank Payout / NEFT</option>
                    <option value="Razorpay UPI / QR">Razorpay UPI / QR</option>
                    <option value="Razorpay Auto-Debit">Razorpay Auto-Debit</option>
                    <option value="Direct Card">Direct Card</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 leading-relaxed">
                Recorded payments are saved as <strong>Pending Verification</strong>. Use Verify on the ledger row to confirm and issue a receipt.
              </p>

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

      <AutoReceiptSettingsModal
        open={showAutoReceiptModal}
        onClose={() => setShowAutoReceiptModal(false)}
        workspaceId={workspaceId}
      />

      {showManualReceiptModal && uploadTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Upload Receipt</h3>
                <p className="text-xs text-slate-500">
                  {uploadTarget.tenant} · {uploadTarget.property}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowManualReceiptModal(false);
                  setUploadTarget(null);
                  setManualReceiptFile(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3">
                Auto Receipt is off for this property. Upload your own receipt file (PDF or image) for the tenant to download.
              </p>

              <label className="block">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Receipt File *
                </span>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#FF6B00]/40 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    id="manual-receipt-upload"
                    onChange={(e) => setManualReceiptFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="manual-receipt-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {manualReceiptFile ? manualReceiptFile.name : "Choose PDF or image"}
                    </span>
                    <span className="text-[11px] text-slate-500">Max recommended 10MB</span>
                  </label>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualReceiptModal(false);
                    setUploadTarget(null);
                    setManualReceiptFile(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!manualReceiptFile || uploadingReceipt}
                  onClick={() => void handleUploadManualReceipt()}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {uploadingReceipt ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload & Issue"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
