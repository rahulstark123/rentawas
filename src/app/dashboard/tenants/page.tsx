"use client";

import { useState } from "react";
import { Users, Search, Phone, Mail, ShieldCheck, FileText, CheckCircle2, MessageSquare } from "lucide-react";

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const tenants = [
    {
      id: "TEN-101",
      name: "Eleanor Vance",
      unit: "The Regent - Unit 302",
      phone: "+1 (555) 234-5678",
      email: "eleanor.vance@example.com",
      leaseEnd: "2027-06-30",
      healthScore: 98,
      status: "Excellent",
      onTimeRate: "100%",
    },
    {
      id: "TEN-102",
      name: "Marcus Sterling",
      unit: "The Regent - Unit 104",
      phone: "+1 (555) 876-5432",
      email: "marcus.s@example.com",
      leaseEnd: "2026-11-15",
      healthScore: 94,
      status: "Good",
      onTimeRate: "98%",
    },
    {
      id: "TEN-103",
      name: "Sophia Martinez",
      unit: "Horizon Suites - Unit 408",
      phone: "+1 (555) 345-6789",
      email: "sophia.m@example.com",
      leaseEnd: "2027-01-31",
      healthScore: 96,
      status: "Excellent",
      onTimeRate: "100%",
    },
    {
      id: "TEN-104",
      name: "David Chen",
      unit: "Oakwood - Unit 201",
      phone: "+1 (555) 901-2345",
      email: "david.c@example.com",
      leaseEnd: "2026-08-15",
      healthScore: 82,
      status: "Fair",
      onTimeRate: "85%",
    },
  ];

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tenants & Health Scores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Credit scoring, payment behavioral history, and lease contract tracking.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tenant name or unit..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
          />
        </div>
      </div>

      {/* Tenant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTenants.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B132B] text-white font-bold text-sm flex items-center justify-center">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.unit}</p>
                </div>
              </div>

              {/* Health Score Badge */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.healthScore} / 100</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{t.status} Rating</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">On-Time Payment Rate</span>
                <span className="font-extrabold text-slate-900">{t.onTimeRate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lease Expiry</span>
                <span className="font-extrabold text-slate-900">{t.leaseEnd}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500 font-medium">
                {t.phone}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Opening message drawer for ${t.name}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
