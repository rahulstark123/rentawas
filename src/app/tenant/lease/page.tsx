"use client";

import { FileText, Download, ShieldCheck, CheckCircle2, Copy } from "lucide-react";

export default function TenantLeasePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Lease Agreement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official signed tenancy contract for <span className="font-bold text-slate-800">The Regent — Unit 302</span>.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading signed PDF lease contract...")}
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
            RESIDENTIAL LEASE AGREEMENT — SEATTLE, WA
          </div>

          <p>
            <strong>THIS LEASE AGREEMENT</strong> is executed between <strong className="text-orange-400">Alexander Wright</strong> (Lessor) and <strong className="text-purple-400">Eleanor Vance</strong> (Lessee).
          </p>
          <p>
            <strong>1. PREMISES:</strong> Unit #302, The Regent Wing A, 1420 5th Ave, Seattle WA 98101.
          </p>
          <p>
            <strong>2. TERM:</strong> 12 Months starting August 01, 2025 and ending July 31, 2026.
          </p>
          <p>
            <strong>3. RENT:</strong> Monthly rent is <strong className="text-emerald-400">$3,200.00 USD</strong> collected via RentAwas Autopilot ACH Gateway.
          </p>
          <p>
            <strong>4. PET ADDENDUM:</strong> Approved for 1 domestic pet (Cat). Security deposit of $3,200 held in statutory escrow.
          </p>
        </div>
      </div>
    </div>
  );
}
