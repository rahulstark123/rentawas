"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Wrench, 
  FileText, 
  Building, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Send, 
  Download, 
  Wifi, 
  Megaphone, 
  Phone, 
  Mail, 
  ArrowUpRight,
  Sparkles,
  Plus
} from "lucide-react";

export default function TenantDashboardPage() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayRent = () => {
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, Eleanor!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Resident Dashboard for <span className="font-bold text-slate-800">The Regent — Unit 302</span>.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lease Active & Account Verified</span>
        </span>
      </div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Rent Due Primary Action Card (7 Cols) */}
        <div className="md:col-span-7 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Rent Due in 4 Days</span>
              </span>

              <span className="text-xs font-bold text-slate-300">July 2026 Billing</span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount Due</div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">$3,200.00</div>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Includes Base Rent & Covered Parking</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">Auto-Debit Enabled</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handlePayRent}
              className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Rent Now ($3,200)</span>
            </button>

            <Link
              href="/tenant/payments"
              className="text-xs font-bold text-slate-300 hover:text-white underline"
            >
              View Payment Receipts
            </Link>
          </div>

          {paymentSuccess && (
            <div className="absolute bottom-4 left-6 right-6 bg-emerald-500 text-white text-xs font-bold p-3 rounded-xl shadow-lg flex items-center gap-2 justify-center z-20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Rent payment of $3,200.00 processed successfully! Instant receipt issued.</span>
            </div>
          )}
        </div>

        {/* Active Lease Overview Card (5 Cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                Active Lease Contract
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Demised Premises</span>
                <span className="font-bold text-slate-900">The Regent — Unit #302</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Start Date</span>
                  <span className="font-bold text-slate-800">Aug 01, 2025</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">End Date</span>
                  <span className="font-bold text-slate-800">Jul 31, 2026</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Landlord / Property Manager</span>
                <span className="font-bold text-slate-900">Alexander Wright (Grand Regency LLC)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/tenant/documents"
              className="text-xs font-bold text-purple-700 hover:underline uppercase tracking-wider"
            >
              View All My Documents (8 Files)
            </Link>
          </div>
        </div>

      </div>

      {/* Main Grid: My Active Maintenance (Left 7) & Building Announcements (Right 5) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Active Maintenance Requests (7 Cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">My Repair & Maintenance Requests</h3>
                <p className="text-xs text-slate-500">Track real-time status of reported unit issues.</p>
              </div>
            </div>

            <Link
              href="/tenant/maintenance"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl transition-all shadow-xs uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Issue</span>
            </Link>
          </div>

          {/* Ticket Item */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-700">Ticket #402 — Kitchen Sink Leak</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 uppercase">
                Vendor Dispatched
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Reported on July 24. Vendor <strong className="text-slate-900">QuickPlumb Co.</strong> scheduled to arrive today between <strong>02:00 PM – 04:00 PM</strong>.
            </p>
            <div className="text-[11px] text-slate-400 font-medium pt-1">
              Need to reschedule? Contact building maintenance hotline at +1 (555) 019-2834.
            </div>
          </div>
        </div>

        {/* Building Announcements & Amenities (5 Cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Building Notices & Perks</h3>
              <p className="text-xs text-slate-500">Community updates & unit access details.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Notice 1 */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <div className="font-bold text-slate-900">Scheduled Elevator Maintenance</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Elevator 2 will undergo routine servicing on Saturday, July 27, between 10:00 AM – 01:00 PM.
              </div>
            </div>

            {/* Resident Wi-Fi Perk */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Building Fiber Wi-Fi</div>
                  <div className="text-[10px] text-slate-500 font-mono">SSID: Regent_Guest_5G</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
