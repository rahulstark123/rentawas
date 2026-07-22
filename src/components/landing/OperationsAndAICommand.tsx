"use client";

import { useState } from "react";
import { 
  Zap, 
  Droplet, 
  Wrench, 
  Terminal, 
  Mail, 
  BarChart3, 
  UserPlus, 
  Command
} from "lucide-react";

export default function OperationsAndAICommand() {
  const [selectedCommand, setSelectedCommand] = useState(0);

  const commands = [
    {
      icon: Mail,
      text: '"Email all tenants in The Regent about the elevator maintenance on Tuesday"',
    },
    {
      icon: BarChart3,
      text: '"Generate Q3 revenue report for London portfolio"',
    },
    {
      icon: UserPlus,
      text: '"Onboard new tenant for Unit 302"',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Part 1: Maintenance Hub & Capital Flow Dual Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-24 md:mb-32">
          {/* Left Column: Maintenance Hub */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B132B] tracking-tight mb-2">
              Maintenance Hub
            </h2>
            <p className="text-slate-500 font-medium text-base sm:text-lg mb-8">
              Track every drip and draft with millisecond accuracy.
            </p>

            {/* 3 Maintenance Tickets */}
            <div className="space-y-3.5">
              {/* Ticket 1 */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 flex items-center justify-between card-shadow card-shadow-hover transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Electrical Short-Circuit
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Unit 402 • High Priority
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100/80 text-red-700 uppercase tracking-wider shrink-0">
                  IN PROGRESS
                </span>
              </div>

              {/* Ticket 2 */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 flex items-center justify-between card-shadow card-shadow-hover transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Sink Leak
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Unit 115 • Normal
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 uppercase tracking-wider shrink-0">
                  PENDING
                </span>
              </div>

              {/* Ticket 3 */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 flex items-center justify-between card-shadow card-shadow-hover transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Annual Inspection
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Building-wide • Scheduled
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100/80 text-purple-700 uppercase tracking-wider shrink-0">
                  COMPLETED
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Capital Flow */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B132B] tracking-tight mb-2">
              Capital Flow
            </h2>
            <p className="text-slate-500 font-medium text-base sm:text-lg mb-8">
              Automated collection with instant digital receipts.
            </p>

            {/* Transaction Table Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 card-shadow overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Tenant</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5">
                      <p className="text-xs font-bold text-slate-900">Marcus Chen</p>
                      <p className="text-[11px] text-slate-500">Paid Dec 01, 2024</p>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wider">
                        PAID
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-xs font-bold text-slate-900">
                      $3,450
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5">
                      <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                      <p className="text-[11px] text-slate-500">Due Dec 05, 2024</p>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-100/70 text-orange-700 uppercase tracking-wider">
                        UPCOMING
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-xs font-bold text-slate-900">
                      $2,100
                    </td>
                  </tr>

                  <tr className="bg-red-50/30 hover:bg-red-50/50 transition-colors">
                    <td className="py-3.5 pl-2">
                      <p className="text-xs font-bold text-slate-900">Apex Holdings Ltd.</p>
                      <p className="text-[11px] text-red-500 font-medium">Overdue by 2 days</p>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wider">
                        OVERDUE
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right text-xs font-extrabold text-red-600">
                      $12,800
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Part 2: AI Command Center */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100 mb-6">
            AI COMMAND CENTER
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B132B] tracking-tight mb-10">
            Complex operations, simple commands.
          </h2>

          <div className="max-w-3xl mx-auto bg-[#141A26] text-white rounded-xl md:rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800 text-left">
            <div className="bg-[#0C1019] border border-slate-800 rounded-lg p-3 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 w-full">
                <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-400 font-medium truncate">
                  Type a command to automate property tasks...
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 shrink-0">
                <Command className="w-3 h-3" /> K
              </div>
            </div>

            <div className="space-y-2">
              {commands.map((cmd, idx) => {
                const IconComponent = cmd.icon;
                const isSelected = selectedCommand === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCommand(idx)}
                    className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 text-xs font-medium cursor-pointer ${
                      isSelected
                        ? "bg-[#202738] border-indigo-500/40 text-white shadow-xs"
                        : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="truncate">{cmd.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
