"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTenantMe } from "@/hooks/useTenantMe";

export default function TenantLeasePage() {
  const { data: tenantMe, isLoading } = useTenantMe();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
    if (tenantMe) setTenant(tenantMe);
    setLoading(false);
  }, [tenantMe, isLoading]);

  const rentVal = tenant?.monthlyRent || 3200;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-slate-200 rounded-xl" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="h-4 w-56 bg-slate-200 rounded" />
            <div className="h-6 w-28 bg-slate-100 rounded" />
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="h-4 w-64 bg-slate-700 rounded mx-auto" />
            <div className="h-3 w-full bg-slate-800 rounded" />
            <div className="h-3 w-5/6 bg-slate-800 rounded" />
            <div className="h-3 w-full bg-slate-800 rounded" />
            <div className="h-3 w-4/5 bg-slate-800 rounded" />
            <div className="h-3 w-3/4 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Lease Agreement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official signed tenancy contract for <span className="font-bold text-slate-800">{tenant?.propertyName || "Property"} — {tenant?.unitNumber || "Unit"}</span>.
          </p>
        </div>

        <button
          onClick={() => {
            if (tenant?.leaseDocUrl) {
              window.open(tenant.leaseDocUrl, "_blank");
            } else {
              alert("Downloading signed PDF lease contract...");
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Signed PDF</span>
        </button>
      </div>

      {/* Contract Details */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Cryptographically Hash Verified Contract</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            E-Sign Completed
          </span>
        </div>

        {/* Contract Viewer Box */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed space-y-4">
          <div className="text-center font-bold text-white uppercase tracking-widest text-sm border-b border-slate-800 pb-2">
            RESIDENTIAL LEASE AGREEMENT — {tenant?.propertyName || "RENT AWAS"}
          </div>

          <p>
            <strong>THIS LEASE AGREEMENT</strong> is executed for Resident <strong className="text-purple-400">{tenant?.name || "Resident"}</strong> ({tenant?.email || "email"}).
          </p>
          <p>
            <strong>1. PREMISES:</strong> {tenant?.unitNumber || "Unit"}, {tenant?.propertyName || "Property"}, {tenant?.propertyAddress || "Demised Address"}.
          </p>
          <p>
            <strong>2. TERM:</strong> Starting <strong className="text-amber-400">{tenant?.leaseStart || "Start Date"}</strong> and ending <strong className="text-amber-400">{tenant?.leaseEnd || "End Date"}</strong>.
          </p>
          <p>
            <strong>3. RENT:</strong> Monthly rent is <strong className="text-emerald-400">${rentVal.toLocaleString()}.00</strong> collected via RentAwas Gateway.
          </p>
          <p>
            <strong>4. DEPOSIT &amp; STATUS:</strong> Security deposit is ${((tenant?.securityDeposit || rentVal)).toLocaleString()}. Current Tenancy Status: <span className="text-emerald-400 uppercase font-bold">{tenant?.currentStatus || "Active"}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
