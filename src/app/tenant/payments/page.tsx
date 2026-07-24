"use client";

import { useState } from "react";
import { CreditCard, Download, CheckCircle2, ShieldCheck, DollarSign, Clock, ArrowUpRight } from "lucide-react";

export default function TenantPaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState("ach");
  const [paid, setPaid] = useState(false);

  const history = [
    { id: "REC-901", period: "June 2026", amount: "$3,200.00", paidOn: "2026-06-25", status: "Paid", method: "Auto-Debit (ACH)" },
    { id: "REC-902", period: "May 2026", amount: "$3,200.00", paidOn: "2026-05-24", status: "Paid", method: "UPI Gateway" },
    { id: "REC-903", period: "April 2026", amount: "$3,200.00", paidOn: "2026-04-26", status: "Paid", method: "Credit Card" },
    { id: "REC-904", period: "March 2026", amount: "$3,200.00", paidOn: "2026-03-25", status: "Paid", method: "Auto-Debit (ACH)" },
  ];

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => setPaid(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pay Rent & Payment Receipts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pay monthly rent securely via Auto-Debit, UPI, ACH, or Credit Card and download instant tax receipts.
        </p>
      </div>

      {/* Payment Portal Box */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Outstanding Balance</span>
            <div className="text-3xl font-black text-slate-900 mt-1">$3,200.00</div>
            <div className="text-xs text-slate-500 mt-0.5">July 2026 Rent • Due on July 31, 2026</div>
          </div>

          <button
            onClick={handlePay}
            className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            Submit Payment ($3,200.00)
          </button>
        </div>

        {paid && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Payment of $3,200.00 submitted successfully! Receipt REC-900 has been sent to your email.</span>
          </div>
        )}

        {/* Method Switcher */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Payment Channel</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { id: "ach", title: "Bank ACH Auto-Debit", desc: "0% fee • Automated monthly run" },
              { id: "upi", title: "Razorpay / UPI", desc: "Instant UPI QR code scan" },
              { id: "card", title: "Credit / Debit Card", desc: "Standard 1.5% processing fee" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedMethod === m.id
                    ? "bg-purple-50/60 border-purple-500 ring-2 ring-purple-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-slate-900">{m.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Historical Receipts & Payment Logs</h3>

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
              {history.map((h) => (
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
      </div>
    </div>
  );
}
