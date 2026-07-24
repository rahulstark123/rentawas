"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Building2, 
  Users, 
  Zap, 
  Wrench, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  FileText, 
  Download, 
  Send, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";

export default function DashboardOverviewPage() {
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [remindersSent, setRemindersSent] = useState(false);

  const transactions = [
    { id: "TX-901", tenant: "Eleanor Vance", unit: "Regent Wing A - #302", amount: "$3,200", dueDate: "2026-07-25", status: "paid", channel: "Auto-Debit (ACH)" },
    { id: "TX-902", tenant: "Marcus Sterling", unit: "Regent Wing A - #104", amount: "$2,850", dueDate: "2026-07-25", status: "paid", channel: "UPI Gateway" },
    { id: "TX-903", tenant: "Sophia Martinez", unit: "Horizon Suites - #408", amount: "$4,100", dueDate: "2026-07-28", status: "pending", channel: "Scheduled" },
    { id: "TX-904", tenant: "David Chen", unit: "Oakwood - #201", amount: "$2,600", dueDate: "2026-07-20", status: "overdue", channel: "Pending" },
    { id: "TX-905", tenant: "Samantha Reed", unit: "Regent Wing A - #501", amount: "$3,500", dueDate: "2026-07-25", status: "paid", channel: "Credit Card" },
  ];

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleRunReminders = () => {
    setRemindersSent(true);
    setTimeout(() => setRemindersSent(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mission Control Overview
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Yield Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics for <span className="font-semibold text-slate-800">The Regent Portfolio</span> (July 2026).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/payments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all uppercase tracking-wider"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Financials</span>
          </Link>

          <Link
            href="/dashboard/leases"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New AI Lease</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Monthly Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent Yield</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">$148,500</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8.4% from last month</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Collection Target: $154,000</span>
            <span className="font-bold text-slate-900">96.4%</span>
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">94.2%</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
              <span>48 of 51 units occupied</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Vacant Units: 3</span>
            <span className="font-bold text-orange-600">Turnover: &lt; 5 days</span>
          </div>
        </div>

        {/* Metric 3: Autopilot Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Autopilot Rent Engine</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IconAutopilotRent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Active</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
              <span>Auto-reminders & instant payout</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Next Collection Run:</span>
            <span className="font-bold text-slate-900">Tomorrow 09:00 AM</span>
          </div>
        </div>

        {/* Metric 4: Maintenance Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maintenance Stream</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">3 Tickets</div>
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold mt-1">
              <AlertCircle className="w-4 h-4" />
              <span>1 Urgent request pending</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Vendor Dispatch:</span>
            <span className="font-bold text-slate-900">14 mins</span>
          </div>
        </div>
      </div>

      {/* Autopilot Banner Control Hub */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#141A26] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-emerald-400 mb-3">
            <IconAutopilotRent className="w-4 h-4 text-emerald-400" />
            <span>Autopilot Rent Ecosystem v2.4</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Automated Collection & Reminders Active
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Multi-channel SMS, WhatsApp, and email reminders are scheduled for July due dates. Late fee auto-application is enabled.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleRunReminders}
            className="px-4.5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Send className="w-4 h-4" />
            <span>Run Instant Reminders</span>
          </button>

          <Link
            href="/dashboard/payments"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
          >
            Configure Rules
          </Link>
        </div>

        {remindersSent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-8 right-8 bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 justify-center z-20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Automated payment reminders dispatched to 2 pending tenants!</span>
          </motion.div>
        )}
      </div>

      {/* Main Grid: Recent Transactions (Left 8 Cols) & AI Insights Sidebar (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Table Section */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Rent Transactions</h3>
              <p className="text-xs text-slate-500">Live payment collection log across your portfolio.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(["all", "paid", "pending", "overdue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer transition-all ${
                    filter === tab
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Tenant & Unit</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Due Date</th>
                  <th className="pb-3 px-2">Payment Method</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900">{tx.tenant}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{tx.unit}</div>
                    </td>
                    <td className="py-3.5 px-2 font-black text-slate-900">{tx.amount}</td>
                    <td className="py-3.5 px-2 text-slate-600 font-medium">{tx.dueDate}</td>
                    <td className="py-3.5 px-2 text-slate-600">{tx.channel}</td>
                    <td className="py-3.5 px-2">
                      {tx.status === "paid" && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                          Paid
                        </span>
                      )}
                      {tx.status === "pending" && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-700 uppercase tracking-wider border border-amber-200">
                          Pending
                        </span>
                      )}
                      {tx.status === "overdue" && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-red-50 text-red-700 uppercase tracking-wider border border-red-200">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {tx.status === "overdue" ? (
                        <button
                          onClick={() => alert(`SMS reminder sent to ${tx.tenant}`)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[10px] rounded-md transition-colors uppercase cursor-pointer"
                        >
                          Send Reminder
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Downloading receipt for ${tx.id}...`)}
                          className="text-slate-500 hover:text-slate-900 font-bold text-[11px] underline cursor-pointer"
                        >
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/dashboard/payments"
              className="text-xs font-bold text-[#FF6B00] hover:underline uppercase tracking-wider inline-flex items-center gap-1"
            >
              <span>View All Financial Reports & Historical Records</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Sidebar Widgets Section (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Insights & Lease Renewal Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">AI Lease Recommendations</h4>
                <p className="text-[11px] text-slate-500">Automated Legal Yield Intelligence</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Unit 201 Renewal</span>
                <span className="text-purple-600 font-extrabold">+4.2% Yield</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Lease expires in 25 days. Seattle rental market trend suggests adjusting rate to $2,720/mo.
              </p>
              <Link
                href="/dashboard/leases"
                className="inline-block mt-1 w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors uppercase tracking-wider cursor-pointer"
              >
                Auto-Generate Renewal
              </Link>
            </div>
          </div>

          {/* Urgent Maintenance Dispatch Widget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Urgent Maintenance</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                High Priority
              </span>
            </div>

            <div className="p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900">Ticket #402 — Plumbing Leak</div>
              <div className="text-slate-600 text-[11px]">Regent Wing A, Unit 304 • Reported 1h ago</div>
              <Link
                href="/dashboard/maintenance"
                className="inline-block mt-1 w-full text-center py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs transition-colors uppercase tracking-wider cursor-pointer"
              >
                Dispatch Local Vendor
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
