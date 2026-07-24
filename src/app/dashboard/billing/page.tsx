"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Building2, 
  Zap, 
  Crown, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  X
} from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";

export default function LandlordBillingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("pro");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Billing History
  const invoices = [
    { id: "INV-2026-007", date: "Jul 24, 2026", plan: "Pro Autopilot (Monthly)", amount: "$18.00 USD", status: "Paid", card: "Visa •••• 4242" },
    { id: "INV-2026-006", date: "Jun 24, 2026", plan: "Pro Autopilot (Monthly)", amount: "$18.00 USD", status: "Paid", card: "Visa •••• 4242" },
    { id: "INV-2026-005", date: "May 24, 2026", plan: "Pro Autopilot (Monthly)", amount: "$18.00 USD", status: "Paid", card: "Visa •••• 4242" },
    { id: "INV-2026-004", date: "Apr 24, 2026", plan: "Pro Autopilot (Monthly)", amount: "$18.00 USD", status: "Paid", card: "Visa •••• 4242" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Landlord Plans & Billing
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pro Plan Active</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your RentAwas subscription plan, active billing cycle, invoice tax receipts, and payment methods.
          </p>
        </div>
      </div>

      {/* Current Subscription Active Banner Card */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#FF6B00] text-white font-extrabold text-[10px] uppercase tracking-wider">
                CURRENT ACTIVE PLAN
              </span>
              <span className="text-xs font-bold text-slate-300">Auto-Renews Aug 24, 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Pro Landlord Autopilot Plan</span>
              <Zap className="w-6 h-6 text-[#FF6B00] fill-[#FF6B00]" />
            </h2>
            <p className="text-xs text-slate-300">
              $18.00 / Month • Full Autopilot Rent Disbursals + 10 AI Legal Document Architect + WhatsApp Reminders
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Update Payment Card
            </button>
          </div>
        </div>

        {/* Meter Progress bar for units */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-300">Units Managed Limit</span>
              <span className="text-white">24 / 50 Units</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-400 rounded-full w-[48%]" />
            </div>
            <div className="text-[10px] text-slate-400">26 units remaining in Pro quota</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method on File</span>
            <div className="font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Visa ending in 4242</span>
            </div>
            <div className="text-[10px] text-slate-400">Expires 09/2028 • Auto-Debit Active</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Contact</span>
            <div className="font-bold text-white">Alexander Wright</div>
            <div className="text-[10px] text-slate-400">alexander@regencymanagement.com</div>
          </div>
        </div>
      </div>

      {/* Monthly vs Annual Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">RentAwas Landlord Subscription Plans</h3>
          <p className="text-xs text-slate-500">Choose the ideal plan to scale your rental property portfolio.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isAnnual ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isAnnual ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white/20 text-white uppercase">Save 20%</span>
          </button>
        </div>
      </div>

      {/* 3 Tier Landlord Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tier 1: Starter Landlord ($0) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                STARTER PORTFOLIO
              </span>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Starter Landlord</h3>
              <p className="text-xs text-slate-500 mt-1">For DIY property owners managing up to 3 units.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">$0</span>
              <span className="text-xs text-slate-500 font-bold">/ month forever</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {[
                "Up to 3 Property Units",
                "Manual Rent Invoice Issuance",
                "Standard 1-Page Lease Template",
                "Email Support SLA (48 hours)",
                "Basic Maintenance Logs",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert("Starter plan selected.")}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            Downgrade to Starter
          </button>
        </div>

        {/* Tier 2: Pro Autopilot ($18/mo) — CURRENT PLAN */}
        <div className="bg-slate-900 text-white border-2 border-[#FF6B00] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FF6B00] text-white font-extrabold text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-widest">
            MOST POPULAR • CURRENT PLAN
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">PRO AUTOPILOT</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Pro Autopilot</h3>
              <p className="text-xs text-slate-300 mt-1">Full automated rent collection & legal architect suite.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{isAnnual ? "$14" : "$18"}</span>
              <span className="text-xs text-slate-300 font-bold">/ month {isAnnual ? "(billed annually)" : ""}</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs">
              {[
                "Up to 50 Property Units",
                "Autopilot Instant Rent Disbursal & Auto-Debit",
                "10 AI Legal & Lease Templates (Global & India)",
                "Automated WhatsApp & SMS Rent Reminders",
                "Automated 5% Late Fee Enforcement",
                "2 Property Manager & Accountant Roles",
                "Priority Support SLA (< 2 hours)",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled
            className="w-full py-3 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider opacity-90 cursor-default flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Current Active Plan</span>
          </button>
        </div>

        {/* Tier 3: Institutional / Enterprise ($39/mo) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase">
                ENTERPRISE PORTFOLIO
              </span>
              <Crown className="w-5 h-5 text-purple-600" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Institutional Enterprise</h3>
              <p className="text-xs text-slate-500 mt-1">For multi-property developers & commercial estate firms.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{isAnnual ? "$31" : "$39"}</span>
              <span className="text-xs text-slate-500 font-bold">/ month {isAnnual ? "(billed annually)" : ""}</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {[
                "Unlimited Property Units & Portfolios",
                "Custom ERP & Accounting API Integrations",
                "Unlimited Team Roles & Audit Logs",
                "Custom Branded Tenant Portals",
                "Dedicated Portfolio Account Manager",
                "24/7 Emergency Phone Support",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert("Upgrading to Enterprise Portfolio plan...")}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            Upgrade to Enterprise
          </button>
        </div>

      </div>

      {/* Invoice Receipts History */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Subscription Invoice & Tax Receipts</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 px-2">Invoice ID</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Plan</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Payment Method</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-slate-700">{inv.id}</td>
                  <td className="py-3 px-2 text-slate-600">{inv.date}</td>
                  <td className="py-3 px-2 font-bold text-slate-900">{inv.plan}</td>
                  <td className="py-3 px-2 font-black text-slate-900">{inv.amount}</td>
                  <td className="py-3 px-2 text-slate-600">{inv.card}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => alert(`Downloading invoice ${inv.id}...`)}
                      className="text-[#FF6B00] hover:underline font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
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
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Update Auto-Debit Payment Card</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Cardholder Name</label>
                <input
                  type="text"
                  defaultValue="Alexander Wright"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Card Number</label>
                <input
                  type="text"
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="text"
                    defaultValue="09 / 28"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">CVC Code</label>
                  <input
                    type="password"
                    defaultValue="•••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Payment card updated successfully!");
                  setShowPaymentModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
              >
                Save Payment Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
