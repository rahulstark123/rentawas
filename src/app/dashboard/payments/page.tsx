"use client";

import { useState } from "react";
import { Zap, DollarSign, Download, ArrowUpRight, CheckCircle2, ShieldCheck, CreditCard, RefreshCw } from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";

export default function RentPaymentsPage() {
  const transactions = [
    { id: "PAY-801", tenant: "Eleanor Vance", property: "The Regent - #302", amount: "$3,200", date: "2026-07-24", status: "Completed", method: "ACH Auto-Debit" },
    { id: "PAY-802", tenant: "Marcus Sterling", property: "The Regent - #104", amount: "$2,850", date: "2026-07-23", status: "Completed", method: "Razorpay UPI" },
    { id: "PAY-803", tenant: "Samantha Reed", property: "The Regent - #501", amount: "$3,500", date: "2026-07-22", status: "Completed", method: "Stripe Card" },
    { id: "PAY-804", tenant: "Sophia Martinez", property: "Horizon Suites - #408", amount: "$4,100", date: "2026-07-20", status: "Processing", method: "Bank Payout" },
    { id: "PAY-805", tenant: "David Chen", property: "Oakwood - #201", amount: "$2,600", date: "2026-07-15", status: "Overdue", method: "SMS Dispatched" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rent Payments & Transactions
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Direct Bank Settlement</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Collection history, bank disbursal routing, and payment processing.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading full financial ledger in CSV format...")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all uppercase tracking-wider cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Payout Ledger</span>
        </button>
      </div>

      {/* Financial Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Disbursed This Month</div>
          <div className="text-2xl font-black text-slate-900 mt-2">$148,500.00</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Routed to Chase Operating Account</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Auto-Disbursal Run</div>
          <div className="text-2xl font-black text-slate-900 mt-2">Tomorrow, 09:00 AM</div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Estimated Batch: $6,700.00
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Payment Gateways</div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <span>4 Channels</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Healthy</span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            UPI, ACH, Stripe, Razorpay
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Full Payout & Collection Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 px-2">Transaction ID</th>
                <th className="pb-3 px-2">Tenant & Property</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Payment Method</th>
                <th className="pb-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-slate-700">{t.id}</td>
                  <td className="py-3 px-2">
                    <div className="font-bold text-slate-900">{t.tenant}</div>
                    <div className="text-[11px] text-slate-500">{t.property}</div>
                  </td>
                  <td className="py-3 px-2 font-black text-slate-900">{t.amount}</td>
                  <td className="py-3 px-2 text-slate-600">{t.date}</td>
                  <td className="py-3 px-2 text-slate-600">{t.method}</td>
                  <td className="py-3 px-2">
                    {t.status === "Completed" && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 uppercase">
                        Completed
                      </span>
                    )}
                    {t.status === "Processing" && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 uppercase">
                        Processing
                      </span>
                    )}
                    {t.status === "Overdue" && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-red-50 text-red-700 uppercase">
                        Overdue
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
