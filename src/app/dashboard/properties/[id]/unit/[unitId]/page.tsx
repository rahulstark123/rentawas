"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Plus,
  MapPin,
  Receipt,
  Eye,
  History,
  Wrench,
  FileCheck,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
  DollarSign
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Mock data repository of properties
const PROPERTIES_DB: Record<string, { id: string; name: string; address: string; tag: string }> = {
  "PROP-1": { id: "PROP-1", name: "The Regent - Wing A", address: "1420 5th Ave, Seattle, WA 98101", tag: "Residential Tower" },
  "PROP-2": { id: "PROP-2", name: "Downtown Horizon Suites", address: "800 Bellevue Way NE, Bellevue, WA 98004", tag: "Luxury Apartments" },
  "PROP-3": { id: "PROP-3", name: "Oakwood Executive Residency", address: "2100 Westlake Ave, Seattle, WA 98121", tag: "Executive Suites" },
  "PROP-4": { id: "PROP-4", name: "Skyline Manor", address: "1100 Mercer St, Seattle, WA 98109", tag: "Boutique Housing" },
};

export default function RoomTelemetryFullPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const propId = (params?.id as string) || "PROP-1";
  const rawUnitId = (params?.unitId as string) || "Unit 301";
  const unitId = decodeURIComponent(rawUnitId);
  const property = PROPERTIES_DB[propId] || PROPERTIES_DB["PROP-1"];

  const [activeTab, setActiveTab] = useState<"resident" | "docs" | "history" | "maintenance" | "bills">("resident");

  // Simulated unit details
  const isOccupied = !unitId.includes("02");
  const tenant = isOccupied ? {
    name: "Eleanor Vance",
    contact: "Primary Resident",
    phone: "+1 (555) 234-5678",
    email: "eleanor.vance@company.com",
    moveIn: "2025-01-15",
    leaseEnd: "2026-01-14",
    health: "ACH — Auto Paid (98% Score)",
    rent: "$3,200/mo",
    type: "2 BHK Executive Suite",
    sqft: "980 sq ft",
    rooms: "2 Bedrooms • 2 Baths • Living • Modular Kitchen • Balcony",
  } : null;

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Top Breadcrumb Nav */}
      <div>
        <Link
          href={`/dashboard/properties/${propId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {property.name} Floor Plan</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {unitId} Details & History
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF6B00] text-white">
                    $3,200/mo
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isOccupied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {isOccupied ? "Occupied" : "Vacant"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{property.name} • {property.address}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast(`Generating full room report for ${unitId}...`, "info")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Export Room Report PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Overview Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Current Resident</span>
          <span className="text-base font-black text-slate-900">{tenant ? tenant.name : "Vacant"}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Lease Expiry</span>
          <span className="text-base font-black text-amber-600">{tenant ? tenant.leaseEnd : "N/A"}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Historical Gross Yield</span>
          <span className="text-base font-black text-emerald-600">$42,800 Total</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Maintenance</span>
          <span className="text-base font-black text-slate-900">1 Active Ticket</span>
        </div>
      </div>

      {/* Full Page Section Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
        {[
          { id: "resident", label: "Who is Living", icon: Users },
          { id: "docs", label: "Tenant Documents", icon: FileCheck },
          { id: "history", label: "Room History & Occupants", icon: History },
          { id: "maintenance", label: "Maintenance Log", icon: Wrench },
          { id: "bills", label: "Bills & Ledger", icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WHO IS LIVING (RESIDENT INFO) */}
      {activeTab === "resident" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          {tenant ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-xl font-black shadow-lg">
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{tenant.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{tenant.contact} • Primary Resident in {unitId}</p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-max">
                  {tenant.health}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/80 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Contact Phone</span>
                  <div className="text-xs font-bold text-white flex items-center gap-2 pt-0.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{tenant.phone}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
                  <div className="text-xs font-bold text-white flex items-center gap-2 pt-0.5">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>{tenant.email}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Lease Start Date</span>
                  <div className="text-xs font-bold text-slate-200 pt-0.5">{tenant.moveIn}</div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Lease Expiry Date</span>
                  <div className="text-xs font-bold text-amber-400 pt-0.5">{tenant.leaseEnd}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => toast(`Calling ${tenant.name} (${tenant.phone})...`, "info")}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Resident</span>
                </button>

                <button
                  onClick={() => toast(`Sending email notification to ${tenant.email}...`, "info")}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Send Email</span>
                </button>

                <button
                  onClick={() => toast(`Generating AI Lease renewal agreement for ${unitId}...`, "success")}
                  className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate AI Lease Renewal</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-amber-50/60 border border-amber-200 rounded-3xl text-center space-y-3">
              <UserCheck className="w-12 h-12 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Room Currently Vacant</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active resident is living in {unitId}. Assign a new tenant to generate lease documents.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TENANT DOCS & VERIFICATION */}
      {activeTab === "docs" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block text-sm">Government ID Verification Status</span>
                <span className="text-xs text-slate-500">Aadhaar / Passport / Driver's License — State Database Verified</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              VERIFIED ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Signed Rental Lease Agreement", size: "2.4 MB • PDF Document", status: "Signed & Active" },
              { title: "Police Background Verification Certificate", size: "1.1 MB • Official Seal", status: "Clear" },
              { title: "Government Identity Proof Document", size: "850 KB • Aadhaar / Passport", status: "Verified" },
              { title: "Security Deposit Bank Transfer Receipt", size: "420 KB • Digital Ledger", status: "Deposited" },
            ].map((doc, idx) => (
              <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{doc.title}</span>
                    <span className="text-xs text-slate-400">{doc.size} • {doc.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => toast(`Downloading ${doc.title}...`, "success")}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROOM HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
            <span className="font-bold text-slate-900 text-sm">Total Historical Yield from {unitId}</span>
            <span className="font-black text-emerald-600 text-lg">$42,800 Gross Generated</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-100 pb-3">
              Chronological Past Resident Timeline
            </h3>

            <div className="space-y-3">
              {[
                { name: tenant ? tenant.name : "Current Occupant", period: "Nov 2024 – Present", rent: "$3,200/mo", status: "Active Occupant", review: "5.0 ★ Excellent" },
                { name: "Elena Rostova", period: "Jan 2023 – Oct 2024 (21 mos)", rent: "$3,100/mo", status: "Lease Completed", review: "4.9 ★ Clean Move-out" },
                { name: "James Peterson", period: "Feb 2021 – Dec 2022 (22 mos)", rent: "$2,900/mo", status: "Lease Completed", review: "4.8 ★ Deposit Refunded" },
              ].map((h, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 font-extrabold text-slate-700 flex items-center justify-center text-sm">
                      {h.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{h.name}</span>
                      <span className="text-xs text-slate-500">{h.period} • {h.rent}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 inline-block mb-1">
                      {h.status}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold block">{h.review}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MAINTENANCE LOG */}
      {activeTab === "maintenance" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Maintenance & Repair Log for {unitId}</h3>
            <button
              onClick={() => toast(`Opening Maintenance ticket creation for ${unitId}...`, "info")}
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Log Maintenance Ticket</span>
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: "TKT-402", issue: "HVAC Air Conditioning Filter Cleaning", priority: "Medium", status: "In Progress", date: "24 Jul 2026", tech: "Apex Climate Co." },
              { id: "TKT-319", issue: "Master Bathroom Faucet Replacement", priority: "Low", status: "Completed ✓", date: "12 Jan 2026", tech: "QuickPlumb Services ($120)" },
              { id: "TKT-208", issue: "Balcony Sliding Door Latch Repair", priority: "Low", status: "Completed ✓", date: "04 Aug 2025", tech: "Handyman Pro ($65)" },
            ].map((t) => (
              <div key={t.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{t.id}: {t.issue}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.date} • Assigned Technician: {t.tech}</div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status.includes("Completed") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BILLS & INVOICES */}
      {activeTab === "bills" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-2.5 font-bold text-sm">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Monthly Billing Status: All Invoices Settled</span>
            </div>
            <span className="font-black text-sm">$0.00 Outstanding</span>
          </div>

          <div className="space-y-3">
            {[
              { inv: "INV-2026-07", title: "July Monthly Rent Invoice", amount: "$3,200.00", date: "24 Jul 2026", status: "Paid ✓" },
              { inv: "UTIL-2026-07", title: "Sub-meter Water & Power Utility Bill", amount: "$145.00", date: "20 Jul 2026", status: "Paid ✓" },
              { inv: "INV-2026-06", title: "June Monthly Rent Invoice", amount: "$3,200.00", date: "24 Jun 2026", status: "Paid ✓" },
            ].map((b) => (
              <div key={b.inv} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm">{b.inv} — {b.title}</span>
                    <span className="font-black text-[#FF6B00]">{b.amount}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Paid Date: {b.date}</div>
                </div>

                <button
                  onClick={() => toast(`Downloading PDF invoice receipt for ${b.inv}...`, "success")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF Invoice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
