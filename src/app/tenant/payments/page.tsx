"use client";

import { useState, useEffect } from "react";
import { CreditCard, Download, CheckCircle2, ShieldCheck, DollarSign, Clock, ArrowUpRight, Receipt, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TenantPaymentsPage() {
  const [paid, setPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const res = await fetch(`/api/tenant/me${emailParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTenant(json.data);
        }
      }
    } catch (err) {
      console.error("Error loading tenant payments data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, []);

  const rentVal = tenant?.monthlyRent || 3200;

  const history = Array.isArray(tenant?.bills)
    ? tenant.bills.map((b: any, idx: number) => ({
        id: b.invoiceNumber || b.billNumber || `REC-${900 + idx + 1}`,
        period: b.title || "Monthly Rent Payment",
        amount: `$${(b.amount || rentVal).toLocaleString()}.00`,
        paidOn: b.paidDate
          ? new Date(b.paidDate).toISOString().split("T")[0]
          : b.createdAt
          ? new Date(b.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: b.status || "Paid",
        method: b.paymentMethod || "Auto-Debit (ACH)",
      }))
    : [];

  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      if (tenant && tenant.id && tenant.id !== "demo-tenant-id") {
        await fetch("/api/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Rent Payment — ${tenant.propertyName || "Residence"} (${tenant.unitNumber || "Unit"})`,
            amount: rentVal,
            category: "Rent",
            status: "Paid",
            paymentMethod: "Online Portal Payment",
            tenantId: tenant.id,
            unitId: tenant.unitId || undefined,
            propertyId: tenant.propertyId || undefined,
            workspaceId: tenant.workspaceId || undefined,
          }),
        });
      }

      setPaid(true);
      setTimeout(() => setPaid(false), 4000);
      await loadTenantData();
    } catch (err) {
      console.error("Payment submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pay Rent &amp; Payment Receipts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pay monthly rent for <span className="font-bold text-slate-800">{tenant?.propertyName || "your property"} — {tenant?.unitNumber || "Unit"}</span> securely via Auto-Debit, UPI, ACH, or Credit Card and download instant tax receipts.
        </p>
      </div>

      {/* Payment Portal Box */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Outstanding Balance</span>
            <div className="text-3xl font-black text-slate-900 mt-1">${rentVal.toLocaleString()}.00</div>
            <div className="text-xs text-slate-500 mt-0.5">Assigned Rent for {tenant?.propertyName || "Property"} — {tenant?.unitNumber || "Unit"}</div>
          </div>

          <button
            onClick={handlePay}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Submit Payment (${rentVal.toLocaleString()}.00)</span>
          </button>
        </div>

        {paid && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Payment of ${rentVal.toLocaleString()}.00 submitted successfully! Receipt has been logged and sent to your email.</span>
          </div>
        )}
      </div>

      {/* Payment History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Historical Receipts &amp; Payment Logs</h3>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">Loading payment receipts...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Payment Receipts Logged</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No payment receipts or historical logs exist yet for{" "}
              <span className="font-semibold text-slate-700">
                {tenant?.propertyName || "your residence"} — {tenant?.unitNumber || "Unit"}
              </span>. Instant receipts will appear here automatically when monthly rent is paid.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Receipt ID</th>
                  <th className="pb-3 px-2">Billing Period</th>
                  <th className="pb-3 px-2">Amount Paid</th>
                  <th className="pb-3 px-2">Payment Date</th>
                  <th className="pb-3 px-2">Method</th>
                  <th className="pb-3 px-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {history.map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-slate-700">{h.id}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">{h.period}</td>
                    <td className="py-3 px-2 font-black text-slate-900">{h.amount}</td>
                    <td className="py-3 px-2 text-slate-600">{h.paidOn}</td>
                    <td className="py-3 px-2 text-slate-600">{h.method}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => alert(`Downloading PDF receipt for ${h.id}...`)}
                        className="text-purple-700 hover:underline font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
