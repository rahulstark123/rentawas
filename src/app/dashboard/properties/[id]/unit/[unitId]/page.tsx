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
  ChevronRight,
  LogOut,
  Star,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  AlertCircle
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

export interface PastHistoryRecord {
  name: string;
  period: string;
  rent: string;
  status: "Active Occupant" | "Lease Completed" | "Removed / Evicted";
  review?: string;
  rating?: number;
  removalReason?: string;
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
  const [workspaceCurrency, setWorkspaceCurrency] = useState("$");
  const [selectedDocOccupantId, setSelectedDocOccupantId] = useState<string>("");

  // Active occupants list
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

  // Historical Timeline Log
  const [roomHistory, setRoomHistory] = useState<PastHistoryRecord[]>([
    { name: "Elena Rostova", period: "Jan 2023 – Oct 2024 (21 mos)", rent: "$1,800/mo", status: "Lease Completed", review: "Clean Move-out. Paid rent on time via UPI.", rating: 5 },
    { name: "James Peterson", period: "Feb 2021 – Dec 2022 (22 mos)", rent: "$1,600/mo", status: "Lease Completed", review: "Deposit refunded in full. Excellent tenant.", rating: 5 },
  ]);

  // Modal State 1: 3-Step Add / Edit Tenant Modal
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

  // ---------------- MODAL 2: NORMAL LEASE EXIT & RATING REVIEW MODAL STATE ----------------
  const [showNormalExitModal, setShowNormalExitModal] = useState(false);
  const [exitOccupant, setExitOccupant] = useState<OccupantItem | null>(null);
  const [exitMoveOutDate, setExitMoveOutDate] = useState("2026-07-25");
  const [depositSettlement, setDepositSettlement] = useState("Full Deposit Refunded");
  const [keysReturned, setKeysReturned] = useState(true);
  const [starRating, setStarRating] = useState(5);
  const [reviewNotes, setReviewNotes] = useState("");

  // ---------------- MODAL 3: REMOVE / EVICT OCCUPANT MODAL STATE ----------------
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeOccupantTarget, setRemoveOccupantTarget] = useState<OccupantItem | null>(null);
  const [removalReason, setRemovalReason] = useState("Non-Payment of Rent / Financial Default");
  const [removalDate, setRemovalDate] = useState("2026-07-25");
  const [dueAmount, setDueAmount] = useState("0");
  const [incidentNotes, setIncidentNotes] = useState("");
  const [flagTenant, setFlagTenant] = useState(true);

  // Calculated total combined room revenue from all active residents
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

  // ---------------- HANDLER 1: NORMAL LEASE EXIT & RATING ----------------
  const openNormalExitModal = (occ: OccupantItem) => {
    setExitOccupant(occ);
    setExitMoveOutDate("2026-07-25");
    setDepositSettlement("Full Deposit Refunded");
    setKeysReturned(true);
    setStarRating(5);
    setReviewNotes(`Tenant ${occ.name} completed lease tenure cleanly and maintained room in great condition.`);
    setShowNormalExitModal(true);
  };

  const handleNormalExitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitOccupant) return;

    // Add to Room History Timeline
    const historyEntry: PastHistoryRecord = {
      name: exitOccupant.name,
      period: `${exitOccupant.moveIn} – ${exitMoveOutDate}`,
      rent: `$${exitOccupant.individualRent.toLocaleString()}/mo`,
      status: "Lease Completed",
      review: reviewNotes || "Normal lease exit completed.",
      rating: starRating,
    };

    setRoomHistory((prev) => [historyEntry, ...prev]);
    setOccupants((prev) => prev.filter((o) => o.id !== exitOccupant.id));

    toast(`Resident ${exitOccupant.name} offboarded cleanly. Review saved with ${starRating}★ rating!`, "success");
    setShowNormalExitModal(false);
    setExitOccupant(null);
  };

  // ---------------- HANDLER 2: REMOVE / EVICT OCCUPANT ----------------
  const openRemoveModal = (occ: OccupantItem) => {
    setRemoveOccupantTarget(occ);
    setRemovalReason("Non-Payment of Rent / Financial Default");
    setRemovalDate("2026-07-25");
    setDueAmount("1200");
    setIncidentNotes(`Occupant removed due to non-payment of rent and lease policy breach.`);
    setFlagTenant(true);
    setShowRemoveModal(true);
  };

  const handleRemoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeOccupantTarget) return;

    // Add to Room History Timeline marked as Removed
    const historyEntry: PastHistoryRecord = {
      name: removeOccupantTarget.name,
      period: `${removeOccupantTarget.moveIn} – ${removalDate}`,
      rent: `$${removeOccupantTarget.individualRent.toLocaleString()}/mo`,
      status: "Removed / Evicted",
      removalReason: removalReason,
      review: `REMOVAL NOTICE: ${removalReason}. Notes: ${incidentNotes}`,
      rating: 1,
    };

    setRoomHistory((prev) => [historyEntry, ...prev]);
    setOccupants((prev) => prev.filter((o) => o.id !== removeOccupantTarget.id));

    toast(`Occupant ${removeOccupantTarget.name} removed from ${unitId}. Eviction record logged.`, "info");
    setShowRemoveModal(false);
    setRemoveOccupantTarget(null);
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
                Individual Per-Occupant Rent & Offboarding Options
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage occupants, custom user rents, normal lease exits, or forced removals for {unitId}.
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

                {/* Action Buttons Row 1: Edit & Call */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => openEditTenantModal(occ)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Edit Profile & Rent</span>
                  </button>

                  <button
                    onClick={() => toast(`Calling ${occ.name} (${occ.phone})...`, "info")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Call</span>
                  </button>
                </div>

                {/* Action Buttons Row 2: 2 Explicit Exit Options (Normal Exit vs Remove Occupant) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openNormalExitModal(occ)}
                    className="py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Normal Exit & Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openRemoveModal(occ)}
                    className="py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove Occupant</span>
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

      {/* TAB 2: TENANT DOCS & VERIFICATION (INDIVIDUAL RESIDENT SWITCHER) */}
      {activeTab === "docs" && (() => {
        const currentDocOccupant = occupants.find((o) => o.id === selectedDocOccupantId) || occupants[0];
        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            
            {/* Resident Switcher Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6B00]" />
                  <span>Select Resident to View Documents</span>
                </span>
                <span className="text-xs font-bold text-[#FF6B00]">
                  {occupants.length} Occupants Registered
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-1">
                {occupants.map((occ) => {
                  const isSelected = (selectedDocOccupantId || occupants[0]?.id) === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => setSelectedDocOccupantId(occ.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap border ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isSelected ? "bg-[#FF6B00] text-white" : "bg-slate-200 text-slate-800"
                      }`}>
                        {occ.name.charAt(0)}
                      </div>
                      <span>{occ.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"
                      }`}>
                        {occ.bedSlot}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentDocOccupant ? (
              <div className="space-y-5">
                {/* Government ID Banner for Selected Resident */}
                <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {currentDocOccupant.name}&apos;s Government ID Status
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                          VERIFIED ✓
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Document: {currentDocOccupant.govIdType || "Passport"} ({currentDocOccupant.govIdNumber || "PASS-981029"}) • State Database Verified
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toast(`Uploading additional document for ${currentDocOccupant.name}...`, "info")}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Doc for {currentDocOccupant.name.split(" ")[0]}</span>
                  </button>
                </div>

                {/* Per-Resident Document Vault Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { 
                      title: `Signed Tenancy Agreement — ${currentDocOccupant.name}`, 
                      file: currentDocOccupant.leaseDocFile || `${currentDocOccupant.name.toLowerCase().replace(/\s+/g, "_")}_lease.pdf`, 
                      size: "2.4 MB • PDF Document", 
                      status: "Signed & Active" 
                    },
                    { 
                      title: `Government ID Scan — ${currentDocOccupant.govIdType || "Passport"}`, 
                      file: currentDocOccupant.govIdFile || `${currentDocOccupant.name.toLowerCase().replace(/\s+/g, "_")}_id_scan.pdf`, 
                      size: "1.1 MB • Official ID", 
                      status: "Verified ✓" 
                    },
                    { 
                      title: `Police Verification Certificate`, 
                      file: `police_clearance_${currentDocOccupant.name.toLowerCase().replace(/\s+/g, "_")}.pdf`, 
                      size: "850 KB • Background Seal", 
                      status: "Clear" 
                    },
                    { 
                      title: `Security Deposit Receipt`, 
                      file: `deposit_receipt_${currentDocOccupant.name.toLowerCase().replace(/\s+/g, "_")}.pdf`, 
                      size: "420 KB • Digital Ledger", 
                      status: "Deposited" 
                    },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{doc.title}</span>
                          <span className="text-xs text-slate-400 font-mono">{doc.file} • {doc.size}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toast(`Downloading ${doc.file}...`, "success")}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-xs font-bold text-slate-500">No active occupants found for this room.</span>
              </div>
            )}

          </div>
        );
      })()}

      {/* TAB 3: ROOM HISTORY WITH RATINGS & REVIEWS */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
            <span className="font-bold text-slate-900 text-sm">Total Historical Yield from {unitId}</span>
            <span className="font-black text-emerald-600 text-lg">$42,800 Gross Generated</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-100 pb-3">
              Chronological Past Resident Timeline & Landlord Ratings
            </h3>

            <div className="space-y-3">
              {roomHistory.map((h, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 font-extrabold text-slate-800 flex items-center justify-center text-sm">
                        {h.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">{h.name}</span>
                        <span className="text-xs text-slate-500">{h.period} • {h.rent}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold block mb-1 ${
                        h.status === "Lease Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {h.status}
                      </span>

                      {h.rating && (
                        <div className="flex items-center justify-end gap-0.5 text-amber-500">
                          {Array.from({ length: h.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {h.review && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs italic">
                      &ldquo;{h.review}&rdquo;
                    </div>
                  )}
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

      {/* ------------------- MODAL 1: 3-STEP ADD / EDIT TENANT MODAL ------------------- */}
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
                <span className="truncate">Resident & Rent</span>
              </div>

              <div
                onClick={() => setCurrentStep(2)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 2 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span className="truncate">Gov ID Scan</span>
              </div>

              <div
                onClick={() => setCurrentStep(3)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 3 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span className="truncate">Lease Docs</span>
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
                    <label className="block font-bold text-[#FF6B00] uppercase mb-1">
                      Individual Monthly Rent ({workspaceCurrency}) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-extrabold text-sm pointer-events-none">
                        {workspaceCurrency}
                      </div>
                      <input
                        type="number"
                        required
                        min={0}
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        placeholder="1000"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#FF6B00] rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
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

      {/* ------------------- MODAL 2: NORMAL LEASE EXIT & RATING REVIEW MODAL ------------------- */}
      {showNormalExitModal && exitOccupant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleNormalExitSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Normal Lease Completion Exit
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Offboarding resident {exitOccupant.name} from {unitId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNormalExitModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Departure Info Banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <span className="font-bold block text-xs">Gradual Lease Offboarding Protocol</span>
                <p className="text-[11px] text-emerald-800">
                  Tenant has completed their stay. Saving this offboarding form will record their timeline in room history with your landlord review rating.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Departure Move-out Date</label>
                  <input
                    type="date"
                    required
                    value={exitMoveOutDate}
                    onChange={(e) => setExitMoveOutDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit Settlement</label>
                  <select
                    value={depositSettlement}
                    onChange={(e) => setDepositSettlement(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Full Deposit Refunded">Full Deposit Refunded ($100%)</option>
                    <option value="Partial Refund (Deductions Applied)">Partial Refund (Deductions Applied)</option>
                    <option value="Withheld Deposit">Withheld Deposit</option>
                  </select>
                </div>
              </div>

              {/* Keys Return Checkbox */}
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keysReturned}
                  onChange={(e) => setKeysReturned(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800 text-xs">
                  All room keys, smart access cards, and parking passes returned
                </span>
              </label>

              {/* Landlord Star Rating System */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <label className="block font-extrabold text-amber-900 uppercase text-[11px]">
                  Landlord Rating for {exitOccupant.name} (For Future Reference)
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= starRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-black text-amber-900 text-sm">
                    {starRating}.0 / 5.0 Stars
                  </span>
                </div>
              </div>

              {/* Review & Feedback Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Landlord Review & Tenancy Feedback Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Paid rent on time every month via Autopilot. Kept room clean and quiet..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNormalExitModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Normal Exit & Save Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 3: REMOVE / EVICT OCCUPANT MODAL ------------------- */}
      {showRemoveModal && removeOccupantTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleRemoveSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Remove / Evict Occupant
                  </h3>
                  <p className="text-xs text-rose-600 font-bold mt-1">
                    Emergency removal notice for {removeOccupantTarget.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Warning Banner */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-xs">Immediate Occupant Removal Protocol</span>
                  <p className="text-[11px] text-rose-700">
                    Use this option when removing an occupant due to non-payment, lease breach, or emergency. The removal reason will be archived in room history.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Primary Removal Reason *</label>
                <select
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Non-Payment of Rent / Financial Default">Non-Payment of Rent / Financial Default</option>
                  <option value="Breach of Lease Terms & Property Damage">Breach of Lease Terms & Property Damage</option>
                  <option value="Excessive Noise / Disturbance to Neighbors">Excessive Noise / Disturbance to Neighbors</option>
                  <option value="Unauthorized Occupant / Illegal Subletting">Unauthorized Occupant / Illegal Subletting</option>
                  <option value="Mutual Early Termination Agreement">Mutual Early Termination Agreement</option>
                  <option value="Emergency / Safety Violation">Emergency / Safety Violation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Removal Effective Date</label>
                  <input
                    type="date"
                    required
                    value={removalDate}
                    onChange={(e) => setRemovalDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Outstanding Balance Dues ($ / ₹)</label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Incident Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Incident Notes & Breach Details</label>
                <textarea
                  rows={3}
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder="Record details of the breach, formal warnings issued, or early termination agreement..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Flag Tenant Checkbox */}
              <label className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center gap-3 cursor-pointer text-rose-900">
                <input
                  type="checkbox"
                  checked={flagTenant}
                  onChange={(e) => setFlagTenant(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <span className="font-bold text-xs">
                  ⚠️ Flag resident profile in Tenant Registry for future landlord warnings
                </span>
              </label>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Removal & Archive Log</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
