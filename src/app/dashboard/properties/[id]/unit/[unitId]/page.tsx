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
  X,
  ChevronDown,
  IdCard,
  Upload,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

export interface OccupantItem {
  id: string;
  name: string;
  bedSlot: string;
  individualRent: number;
  phone: string;
  email: string;
  moveIn: string;
  leaseEnd: string;
  paymentStatus: string;
  govIdType?: string;
  govIdNumber?: string;
  govIdFile?: string;
  leaseDocFile?: string;
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

  // Multi-tenant occupancy state
  const [occupants, setOccupants] = useState<OccupantItem[]>([
    {
      id: "OCC-1",
      name: "Eleanor Vance",
      bedSlot: "Bed Slot A (Master Suite)",
      individualRent: 1000,
      phone: "+1 (555) 234-5678",
      email: "eleanor.vance@company.com",
      moveIn: "2025-01-15",
      leaseEnd: "2026-01-14",
      paymentStatus: "Auto Paid (ACH)",
      govIdType: "Passport",
      govIdNumber: "PASS-981029",
      govIdFile: "passport_eleanor.pdf",
      leaseDocFile: "lease_eleanor.pdf",
    },
    {
      id: "OCC-2",
      name: "Sarah Connor",
      bedSlot: "Bed Slot B (Balcony Room)",
      individualRent: 1200,
      phone: "+1 (555) 891-2345",
      email: "sarah.connor@cyber.org",
      moveIn: "2025-02-01",
      leaseEnd: "2026-01-31",
      paymentStatus: "Auto Paid (UPI)",
      govIdType: "Aadhaar Card",
      govIdNumber: "AAD-4910283",
      govIdFile: "aadhaar_sarah.pdf",
      leaseDocFile: "lease_sarah.pdf",
    },
  ]);

  // Modal State for 3-Step Add Tenant Modal
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [editingOccupantId, setEditingOccupantId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form Fields
  const [name, setName] = useState("");
  const [bedSlot, setBedSlot] = useState("Bed Slot A");
  const [monthlyRent, setMonthlyRent] = useState("1000");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(ALL_COUNTRIES[0]);
  const [email, setEmail] = useState("");
  const [leaseStart, setLeaseStart] = useState("2026-08-01");
  const [paymentChannel, setPaymentChannel] = useState("Autopilot ACH Direct");

  // Step 2 Form Fields (Government ID)
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("");
  const [idCountry, setIdCountry] = useState("United States");
  const [govIdFile, setGovIdFile] = useState<string | null>(null);

  // Step 3 Form Fields (Lease Docs)
  const [docType, setDocType] = useState("Signed Residential Lease Agreement");
  const [leaseFile, setLeaseFile] = useState<string | null>(null);

  // Calculated total combined room revenue from all residents
  const totalRoomRent = occupants.reduce((acc, curr) => acc + curr.individualRent, 0);

  const openAddTenantModal = () => {
    setEditingOccupantId(null);
    setName("");
    setBedSlot(`Bed Slot ${String.fromCharCode(65 + occupants.length)}`);
    setMonthlyRent("1000");
    setPhone("");
    setEmail("");
    setIdNumber("");
    setGovIdFile(null);
    setLeaseFile(null);
    setCurrentStep(1);
    setShowAddTenantModal(true);
  };

  const openEditTenantModal = (occ: OccupantItem) => {
    setEditingOccupantId(occ.id);
    setName(occ.name);
    setBedSlot(occ.bedSlot);
    setMonthlyRent(occ.individualRent.toString());
    setPhone(occ.phone.replace(/^\+\d+\s*/, ""));
    setEmail(occ.email);
    setLeaseStart(occ.moveIn);
    setIdType(occ.govIdType || "Passport");
    setIdNumber(occ.govIdNumber || "");
    setGovIdFile(occ.govIdFile || null);
    setLeaseFile(occ.leaseDocFile || null);
    setCurrentStep(1);
    setShowAddTenantModal(true);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim() || !email.trim()) {
        toast("Please fill in Resident Name and Email before proceeding.", "info");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const fullPhoneNumber = phone.trim()
      ? `${selectedCountry.dialCode} ${phone.trim()}`
      : `${selectedCountry.dialCode} (555) 019-2834`;

    const rentVal = Number(monthlyRent) || 0;

    if (editingOccupantId) {
      setOccupants((prev) =>
        prev.map((o) =>
          o.id === editingOccupantId
            ? {
                ...o,
                name,
                bedSlot,
                individualRent: rentVal,
                phone: fullPhoneNumber,
                email,
                moveIn: leaseStart,
                govIdType: idType,
                govIdNumber: idNumber,
                govIdFile: govIdFile || o.govIdFile,
                leaseDocFile: leaseFile || o.leaseDocFile,
              }
            : o
        )
      );
      toast(`Updated resident ${name} in ${unitId}!`, "success");
    } else {
      const newTenant: OccupantItem = {
        id: `OCC-${Date.now()}`,
        name,
        bedSlot,
        individualRent: rentVal,
        phone: fullPhoneNumber,
        email,
        moveIn: leaseStart,
        leaseEnd: "2027-07-31",
        paymentStatus: "Active",
        govIdType: idType,
        govIdNumber: idNumber,
        govIdFile: govIdFile || "gov_id_scan.pdf",
        leaseDocFile: leaseFile || "lease_contract_signed.pdf",
      };
      setOccupants((prev) => [...prev, newTenant]);
      toast(`Added new resident ${name} to ${unitId} with rent $${rentVal.toLocaleString()}/mo!`, "success");
    }

    setShowAddTenantModal(false);
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
              onClick={openAddTenantModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Tenant</span>
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
              onClick={openAddTenantModal}
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Tenant</span>
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
                    onClick={() => openEditTenantModal(occ)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Edit Resident Details</span>
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
                { name: "Eleanor Vance & Sarah Connor (Active)", period: "Nov 2024 – Present", rent: `$${totalRoomRent.toLocaleString()}/mo`, status: "Active Occupants", review: "5.0 ★ Excellent" },
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

      {/* ------------------- 3-STEP ADD / EDIT TENANT MODAL (SAME AS TENANTS PAGE) ------------------- */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddTenantSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    {editingOccupantId ? "Edit Resident Profile & Rent" : `Add Resident to ${unitId}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {property.name} • {unitId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTenantModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-Step Wizard Navigation Pills */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
              <div
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 1 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span className="truncate">1. Resident & Rent</span>
              </div>

              <div
                onClick={() => setCurrentStep(2)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 2 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span className="truncate">2. Gov ID Scan</span>
              </div>

              <div
                onClick={() => setCurrentStep(3)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 3 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span className="truncate">3. Lease Docs</span>
              </div>
            </div>

            {/* STEP 1: BASIC INFO, BED SLOT & USER RENT */}
            {currentStep === 1 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Resident Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Bed Slot / Room Designation</label>
                    <input
                      type="text"
                      value={bedSlot}
                      onChange={(e) => setBedSlot(e.target.value)}
                      placeholder="Bed Slot A (Master)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#FF6B00] uppercase mb-1">Individual Monthly Rent ($ / ₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-2 bg-white border border-[#FF6B00] rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Phone Field with Country Flag & Code */}
                <div className="relative z-30">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number (with Country Code)</label>
                  <CountryPhoneInput
                    value={phone}
                    onChange={setPhone}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenant@domain.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Lease Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaseStart}
                      onChange={(e) => setLeaseStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Autopilot Payment Channel</label>
                  <div className="relative">
                    <select
                      value={paymentChannel}
                      onChange={(e) => setPaymentChannel(e.target.value)}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Autopilot ACH Direct">Autopilot ACH Direct (Auto-Debit)</option>
                      <option value="Razorpay UPI Gateway">Razorpay UPI Gateway</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Manual Bank Wire Transfer">Manual Bank Wire Transfer</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GOVERNMENT ID & VERIFICATION */}
            {currentStep === 2 && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-blue-900">
                  <IdCard className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Government Identity Verification</span>
                    <span className="text-[11px] text-blue-700">Upload official government-issued ID scan or photo for background audit.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Government ID Type</label>
                    <div className="relative">
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver&apos;s License</option>
                        <option value="Aadhaar Card / National ID">Aadhaar Card / National ID</option>
                        <option value="Social Security Card (SSN)">Social Security Card (SSN)</option>
                        <option value="Permanent Resident Card">Permanent Resident / Green Card</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">ID Code / Document Number</label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. A-98102948"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload Government ID Scan (Front & Back)</label>
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    <Upload className="w-6 h-6 text-blue-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {govIdFile ? `Attached: ${govIdFile}` : "Drag & Drop Passport, Driver's License or ID Card Scan"}
                    </div>
                    <p className="text-[10px] text-slate-400">Accepted formats: PDF, JPG, PNG (Max 15MB)</p>
                    <button
                      type="button"
                      onClick={() => {
                        setGovIdFile("passport_scanned_verified.pdf");
                        toast("Government ID scan attached to resident profile!", "success");
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer"
                    >
                      Select ID File
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LEASE AGREEMENT & DOCUMENTS */}
            {currentStep === 3 && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center gap-2.5 text-purple-900">
                  <FileCheck className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Lease Agreement & Rental Contract Upload</span>
                    <span className="text-[11px] text-purple-700">Attach signed tenancy agreements, paystubs, or security deposit receipts.</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload Signed Lease Contract</label>
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    <FileText className="w-6 h-6 text-[#FF6B00] mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {leaseFile ? `Attached: ${leaseFile}` : "Drag & Drop Signed Tenancy Contract PDF"}
                    </div>
                    <p className="text-[10px] text-slate-400">Accepted format: PDF (Max 25MB)</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLeaseFile("signed_lease_agreement.pdf");
                        toast("Signed lease document attached!", "success");
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer"
                    >
                      Select Lease PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Resident & Rent</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
