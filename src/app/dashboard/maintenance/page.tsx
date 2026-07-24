"use client";

import { useState } from "react";
import { Wrench, Plus, AlertCircle, CheckCircle2, Clock, User, Phone } from "lucide-react";

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([
    { id: "TCK-401", tenant: "Eleanor Vance", unit: "Regent #302", issue: "Kitchen sink faucet leak", priority: "High", status: "New", date: "Today 08:30 AM" },
    { id: "TCK-402", tenant: "David Chen", unit: "Oakwood #201", issue: "HVAC air filter replacement", priority: "Medium", status: "Dispatched", date: "Yesterday" },
    { id: "TCK-403", tenant: "Marcus Sterling", unit: "Regent #104", issue: "Smart door lock battery low", priority: "Low", status: "In Progress", date: "2 days ago" },
    { id: "TCK-404", tenant: "Sophia Martinez", unit: "Horizon #408", issue: "Water heater thermostat check", priority: "Medium", status: "Resolved", date: "3 days ago" },
  ]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const columns = ["New", "Dispatched", "In Progress", "Resolved"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Maintenance & Vendor Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time ticket tracking with automated local vendor dispatch & tenant alerts.
          </p>
        </div>

        <button
          onClick={() => alert("Creating new maintenance ticket...")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Maintenance Ticket</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTickets = tickets.filter(t => t.status === col);
          return (
            <div key={col} className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 space-y-4 min-h-[450px]">
              <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200">
                <span>{col}</span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-900 font-black text-[11px] flex items-center justify-center shadow-xs">
                  {colTickets.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTickets.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{t.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        t.priority === "High" ? "bg-red-100 text-red-700" : t.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.issue}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.tenant} • {t.unit}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{t.date}</span>
                      {col === "New" && (
                        <button
                          onClick={() => handleStatusChange(t.id, "Dispatched")}
                          className="px-2 py-1 bg-slate-900 hover:bg-black text-white font-bold rounded transition-colors uppercase"
                        >
                          Dispatch
                        </button>
                      )}
                      {col === "Dispatched" && (
                        <button
                          onClick={() => handleStatusChange(t.id, "In Progress")}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors uppercase"
                        >
                          Start Work
                        </button>
                      )}
                      {col === "In Progress" && (
                        <button
                          onClick={() => handleStatusChange(t.id, "Resolved")}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors uppercase"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
