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
  DollarSign,
  UserPlus,
  Edit3,
  Trash2,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface OccupantItem {
  id: string;
  name: string;
  bedSlot: string; // e.g. Bed A, Master Bedroom, Person 1 Slot
  individualRent: number; // e.g. 1000 for Person A, 1200 for Person B
  phone: string;
  email: string;
  moveIn: string;
  leaseEnd: string;
  paymentStatus: string;
}

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

  // Multi-tenant occupancy with custom per-user individual rents!
  const [occupants, setOccupants] = useState<OccupantItem[]>([
    {
      id: "OCC-1",
      name: "Person A — Eleanor Vance",
      bedSlot: "Bed Slot A (Master Suite)",
      individualRent: 1000,
      phone: "+1 (555) 234-5678",
      email: "eleanor.vance@company.com",
      moveIn: "2025-01-15",
      leaseEnd: "2026-01-14",
      paymentStatus: "Auto Paid (ACH)",
    },
    {
      id: "OCC-2",
      name: "Person B — Sarah Connor",
      bedSlot: "Bed Slot B (Balcony Room)",
      individualRent: 1200,
      phone: "+1 (555) 891-2345",
      email: "sarah.connor@cyber.org",
      moveIn: "2025-02-01",
      leaseEnd: "2026-01-31",
      paymentStatus: "Auto Paid (UPI)",
    },
  ]);

  // Modal State for adding/editing per-user rent
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [editingOccupantId, setEditingOccupantId] = useState<string | null>(null);

  // Form State for Resident & Per-User Rent
  const [formName, setFormName] = useState("");
  const [formBedSlot, setFormBedSlot] = useState("Bed Slot A");
  const [formRent, setFormRent] = useState("1000");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMoveIn, setFormMoveIn] = useState("2026-08-01");
  const [formLeaseEnd, setFormLeaseEnd] = useState("2027-07-31");

  // Calculated total combined room revenue from all residents
  const totalRoomRent = occupants.reduce((acc, curr) => acc + curr.individualRent, 0);

  const openAddModal = () => {
    setEditingOccupantId(null);
    setFormName("");
    setFormBedSlot(`Bed Slot ${String.fromCharCode(65 + occupants.length)}`);
    setFormRent("1000");
    setFormPhone("");
    setFormEmail("");
    setShowAddResidentModal(true);
  };

  const openEditModal = (occ: OccupantItem) => {
    setEditingOccupantId(occ.id);
    setFormName(occ.name);
    setFormBedSlot(occ.bedSlot);
    setFormRent(occ.individualRent.toString());
    setFormPhone(occ.phone);
    setFormEmail(occ.email);
    setFormMoveIn(occ.moveIn);
    setFormLeaseEnd(occ.leaseEnd);
    setShowAddResidentModal(true);
  };

  const handleSaveOccupant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const rentVal = Number(formRent) || 0;

    if (editingOccupantId) {
      setOccupants((prev) =>
        prev.map((o) =>
          o.id === editingOccupantId
            ? {
                ...o,
                name: formName,
                bedSlot: formBedSlot,
                individualRent: rentVal,
                phone: formPhone || o.phone,
                email: formEmail || o.email,
                moveIn: formMoveIn,
                leaseEnd: formLeaseEnd,
              }
            : o
        )
      );
      toast(`Updated rent for ${formName} to $${rentVal.toLocaleString()}/mo!`, "success");
    } else {
      const newOcc: OccupantItem = {
        id: `OCC-${Date.now()}`,
        name: formName,
        bedSlot: formBedSlot,
        individualRent: rentVal,
        phone: formPhone || "+1 (555) 019-2831",
        email: formEmail || "tenant@rentawas.com",
        moveIn: formMoveIn,
        leaseEnd: formLeaseEnd,
        paymentStatus: "Active",
      };
      setOccupants((prev) => [...prev, newOcc]);
      toast(`Added ${formName} to ${unitId} with rent $${rentVal.toLocaleString()}/mo!`, "success");
    }

    setShowAddResidentModal(false);
  };

  const handleDeleteOccupant = (id: string, name: string) => {
    setOccupants((prev) => prev.filter((o) => o.id !== id));
    toast(`Removed ${name} from ${unitId}.`, "info");
  };

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
                    {unitId} Details & Occupant Rents
                  </h1>
                  <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#FF6B00] text-white">
                    Total: ${totalRoomRent.toLocaleString()}/mo
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    {occupants.length} Active Occupants
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
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Resident & Custom Rent</span>
            </button>

            <button
              onClick={() => toast(`Generating full room report for ${unitId}...`, "info")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Export Report PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Overview Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Occupants</span>
          <span className="text-base font-black text-slate-900">{occupants.length} Residents</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Combined Room Rent</span>
          <span className="text-base font-black text-[#FF6B00]">${totalRoomRent.toLocaleString()}/mo</span>
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
          { id: "resident", label: "Occupants & User Rents", icon: Users },
          { id: "docs", label: "Tenant Documents", icon: FileCheck },
          { id: "history", label: "Room History & Past Residents", icon: History },
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

      {/* TAB 1: OCCUPANTS & PER-USER CUSTOM RENTS */}
      {activeTab === "resident" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Individual Per-Occupant Rent Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each resident in {unitId} has their own individual rent amount configured.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resident & Custom Rent</span>
            </button>
          </div>

          {/* Occupants Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {occupants.map((occ) => (
              <div
                key={occ.id}
                className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 shadow-xl relative border border-slate-800"
              >
                {/* Individual Occupant Header & Custom Rent */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-lg font-black shadow-md">
                      {occ.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">{occ.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">{occ.bedSlot}</p>
                    </div>
                  </div>

                  {/* Custom Per-User Rent Display Badge */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider text-[10px]">User Rent</span>
                    <span className="text-lg font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30 inline-block mt-0.5">
                      ${occ.individualRent.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{occ.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                    <div className="font-bold text-white flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{occ.email}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Move-in Date</span>
                    <div className="font-bold text-slate-200">{occ.moveIn}</div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lease Expiry</span>
                    <div className="font-bold text-amber-400">{occ.leaseEnd}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => openEditModal(occ)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Edit User Rent</span>
                  </button>

                  <button
                    onClick={() => toast(`Calling ${occ.name} (${occ.phone})...`, "info")}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    title="Call Resident"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteOccupant(occ.id, occ.name)}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-colors cursor-pointer"
                    title="Remove Occupant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Combined Rent Yield Summary Box */}
          <div className="p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FF6B00] text-white rounded-2xl shadow-md">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Total Combined Room Revenue Calculation</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {occupants.map((o) => `${o.name.split(" ")[0]} ($${o.individualRent.toLocaleString()})`).join(" + ")} = <strong>${totalRoomRent.toLocaleString()}/mo Total</strong>
                </p>
              </div>
            </div>

            <span className="text-xl font-black text-slate-900 bg-white px-5 py-2 rounded-2xl border border-orange-200 shadow-2xs">
              ${totalRoomRent.toLocaleString()} / mo
            </span>
          </div>

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
                { name: "Person A & Person B (Active)", period: "Nov 2024 – Present", rent: `$${totalRoomRent.toLocaleString()}/mo`, status: "Active Occupants", review: "5.0 ★ Excellent" },
                { name: "Elena Rostova", period: "Jan 2023 – Oct 2024 (21 mos)", rent: "$1,800/mo", status: "Lease Completed", review: "4.9 ★ Clean Move-out" },
                { name: "James Peterson", period: "Feb 2021 – Dec 2022 (22 mos)", rent: "$1,600/mo", status: "Lease Completed", review: "4.8 ★ Deposit Refunded" },
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
              { inv: "INV-2026-07", title: "July Combined Room Rent Invoice", amount: `$${totalRoomRent.toLocaleString()}`, date: "24 Jul 2026", status: "Paid ✓" },
              { inv: "UTIL-2026-07", title: "Sub-meter Water & Power Utility Bill", amount: "$145.00", date: "20 Jul 2026", status: "Paid ✓" },
              { inv: "INV-2026-06", title: "June Combined Room Rent Invoice", amount: `$${totalRoomRent.toLocaleString()}`, date: "24 Jun 2026", status: "Paid ✓" },
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

      {/* ------------------- MODAL: ADD / EDIT RESIDENT & INDIVIDUAL RENT ------------------- */}
      {showAddResidentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleSaveOccupant}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-none">
                    {editingOccupantId ? "Edit Resident Rent" : "Add Resident & Set Rent"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure individual rent for {unitId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddResidentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Resident Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Person A — John Doe"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bed / Room Slot</label>
                  <input
                    type="text"
                    value={formBedSlot}
                    onChange={(e) => setFormBedSlot(e.target.value)}
                    placeholder="Bed Slot A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#FF6B00] uppercase mb-1">Individual Rent ($ / ₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formRent}
                    onChange={(e) => setFormRent(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-white border border-[#FF6B00] rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="resident@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Move-in Date</label>
                  <input
                    type="date"
                    value={formMoveIn}
                    onChange={(e) => setFormMoveIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Lease Expiry</label>
                  <input
                    type="date"
                    value={formLeaseEnd}
                    onChange={(e) => setFormLeaseEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddResidentModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Individual Rent</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
