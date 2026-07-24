"use client";

import { TrendingUp, DollarSign, ArrowUpRight, BarChart3, PieChart, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Yield & Portfolio Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Financial performance, net operating income (NOI), and predictive yield metrics.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annualized Net Operating Income</span>
          <div className="text-2xl font-black text-slate-900 mt-2">$1,782,000</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>+11.2% year-over-year</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Rent Per Unit</span>
          <div className="text-2xl font-black text-slate-900 mt-2">$3,093 / mo</div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Top Performer: Regent Wing A ($3,200)
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection Efficiency Score</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">98.6 / 100</div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Powered by Autopilot Engine
          </div>
        </div>
      </div>

      {/* Chart Visual Simulation */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Monthly Revenue vs Operating Expenses</h3>
          <span className="text-xs font-bold text-slate-500">2026 YTD</span>
        </div>

        <div className="h-64 bg-slate-50 border border-slate-100 rounded-xl p-6 flex items-end justify-between gap-4">
          {[
            { month: "Jan", rev: 85, exp: 20 },
            { month: "Feb", rev: 88, exp: 22 },
            { month: "Mar", rev: 92, exp: 19 },
            { month: "Apr", rev: 90, exp: 25 },
            { month: "May", rev: 95, exp: 21 },
            { month: "Jun", rev: 97, exp: 20 },
            { month: "Jul", rev: 100, exp: 18 },
          ].map((bar) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                <div 
                  className="w-full max-w-[28px] bg-[#FF6B00] rounded-t-md transition-all hover:opacity-90"
                  style={{ height: `${bar.rev}%` }}
                  title={`Revenue: ${bar.rev}%`}
                />
                <div 
                  className="w-full max-w-[28px] bg-slate-300 rounded-t-md transition-all hover:opacity-90"
                  style={{ height: `${bar.exp}%` }}
                  title={`Expenses: ${bar.exp}%`}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-600 uppercase">{bar.month}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#FF6B00]" />
            <span className="text-slate-700">Gross Rent Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-slate-300" />
            <span className="text-slate-700">Operational Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
