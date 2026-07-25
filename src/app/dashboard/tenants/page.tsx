"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  Plus,
  X,
  Building2,
  Calendar,
  DollarSign,
  ChevronDown,
  UserPlus,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  IdCard,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

export interface TenantItem {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  leaseStart: string;
  leaseEnd?: string;
  healthScore: number;
  status: "Excellent" | "Good" | "Fair" | "Attention";
  onTimeRate: string;
  govIdAttached?: boolean;
  leaseDocAttached?: boolean;
}

export default function TenantsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<TenantItem | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Property & Units Mappings
  const propertyUnitsMap: Record<string, string[]> = {
    "The Regent - Wing A": ["Unit 101", "Unit 104", "Unit 201", "Unit 302", "Unit 304", "Unit 401", "Unit 502"],
    "Downtown Horizon Suites": ["Suite 101", "Suite 104", "Suite 202", "Suite 301", "Suite 408"],
    "Oakwood Executive Residency": ["Unit 101", "Unit 105", "Unit 201", "Unit 301"],
    "Skyline Manor": ["Unit 101", "Unit 201"]
  };

  // Step 1 Form State (Basic Info & Property)
  const [name, setName] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("The Regent - Wing A");
  const [selectedUnit, setSelectedUnit] = useState("Unit 401");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "US") || ALL_COUNTRIES[0]
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leaseStart, setLeaseStart] = useState("2026-08-01");
  const [monthlyRent, setMonthlyRent] = useState("2850");
  const [paymentChannel, setPaymentChannel] = useState("Autopilot ACH Direct");

  // Step 2 Form State (Government ID)
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("A-98102948");
  const [idCountry, setIdCountry] = useState("United States");
  const [govIdFile, setGovIdFile] = useState<string | null>("passport_front_scan.pdf");

  // Step 3 Form State (Rent Documents & Lease)
  const [docType, setDocType] = useState("Signed Residential Lease Agreement");
  const [leaseFile, setLeaseFile] = useState<string | null>("signed_lease_agreement_2026.pdf");
  const [aiVerifyEnabled, setAiVerifyEnabled] = useState(true);

  const [tenants, setTenants] = useState<TenantItem[]>([
    {
      id: "TEN-101",
      name: "Eleanor Vance",
      unit: "The Regent - Unit 302",
      phone: "+1 (555) 234-5678",
      email: "eleanor.vance@example.com",
      leaseStart: "2024-07-01",
      leaseEnd: "2027-06-30",
      healthScore: 98,
      status: "Excellent",
      onTimeRate: "100%",
      govIdAttached: true,
      leaseDocAttached: true,
    },
    {
      id: "TEN-102",
      name: "Marcus Sterling",
      unit: "The Regent - Unit 104",
      phone: "+1 (555) 876-5432",
      email: "marcus.s@example.com",
      leaseStart: "2024-11-15",
      leaseEnd: "2026-11-15",
      healthScore: 94,
      status: "Good",
      onTimeRate: "98%",
      govIdAttached: true,
      leaseDocAttached: true,
    },
    {
      id: "TEN-103",
      name: "Sophia Martinez",
      unit: "Horizon Suites - Unit 408",
      phone: "+1 (555) 345-6789",
      email: "sophia.m@example.com",
      leaseStart: "2025-02-01",
      leaseEnd: "2027-01-31",
      healthScore: 96,
      status: "Excellent",
      onTimeRate: "100%",
      govIdAttached: true,
      leaseDocAttached: true,
    },
    {
      id: "TEN-104",
      name: "David Chen",
      unit: "Oakwood - Unit 201",
      phone: "+1 (555) 901-2345",
      email: "david.c@example.com",
      leaseStart: "2025-08-15",
      leaseEnd: "2026-08-15",
      healthScore: 82,
      status: "Fair",
      onTimeRate: "85%",
      govIdAttached: true,
      leaseDocAttached: true,
    },
  ]);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePropertyChange = (newProp: string) => {
    setSelectedProperty(newProp);
    const availableUnits = propertyUnitsMap[newProp] || [];
    if (availableUnits.length > 0) {
      setSelectedUnit(availableUnits[0]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTenantId(null);
    setName("");
    setEmail("");
    setPhone("");
    setCurrentStep(1);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (t: TenantItem) => {
    setEditingTenantId(t.id);
    setName(t.name);
    setEmail(t.email);
    // Parse phone digit string if available
    setPhone(t.phone.replace(/^\+\d+\s*/, ""));
    
    // Split property and unit if combined with dash
    const parts = t.unit.split(" - ");
    if (parts.length === 2 && propertyUnitsMap[parts[0]]) {
      setSelectedProperty(parts[0]);
      setSelectedUnit(parts[1]);
    } else {
      setSelectedProperty("The Regent - Wing A");
      setSelectedUnit("Unit 401");
    }

    setLeaseStart(t.leaseStart);
    setCurrentStep(1);
    setShowAddModal(true);
  };

  const handleDeleteTenant = (t: TenantItem) => {
    setDeletingTenant(t);
  };

  const confirmDeleteTenant = () => {
    if (!deletingTenant) return;
    setTenants(tenants.filter((item) => item.id !== deletingTenant.id));
    toast(`Resident ${deletingTenant.name} removed from tenant registry.`, "info");
    setDeletingTenant(null);
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

    const combinedUnitLabel = `${selectedProperty} - ${selectedUnit}`;

    if (editingTenantId) {
      // Update existing tenant
      setTenants(
        tenants.map((t) =>
          t.id === editingTenantId
            ? {
                ...t,
                name,
                unit: combinedUnitLabel,
                phone: fullPhoneNumber,
                email,
                leaseStart,
              }
            : t
        )
      );
      toast(`Tenant ${name} updated successfully!`, "success");
    } else {
      // Add new tenant
      const newTenant: TenantItem = {
        id: `TEN-${Math.floor(100 + Math.random() * 900)}`,
        name,
        unit: combinedUnitLabel,
        phone: fullPhoneNumber,
        email,
        leaseStart,
        healthScore: 98,
        status: "Excellent",
        onTimeRate: "100%",
        govIdAttached: !!govIdFile,
        leaseDocAttached: !!leaseFile,
      };
      setTenants([newTenant, ...tenants]);
      toast(
        `Tenant ${name} onboarded to ${combinedUnitLabel} starting ${leaseStart}!`,
        "success"
      );
    }

    // Reset form & close modal
    setName("");
    setEmail("");
    setPhone("");
    setEditingTenantId(null);
    setCurrentStep(1);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tenants & Behavioral Health Scores</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {tenants.length} Active Residents
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Credit scoring, payment behavioral history, and lease contract tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tenant name or unit..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      {/* Tenant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTenants.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B132B] text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs font-semibold text-slate-500">{t.unit}</p>
                </div>
              </div>

              {/* Health Score & Quick Edit/Delete */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.healthScore} / 100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{t.status} Rating</div>
                </div>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    title="Edit Tenant"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTenant(t)}
                    title="Delete Tenant"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">On-Time Payment Rate</span>
                <span className="font-extrabold text-slate-900">{t.onTimeRate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lease Start Date</span>
                <span className="font-extrabold text-slate-900">{t.leaseStart}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="text-slate-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                {t.govIdAttached && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <IdCard className="w-3 h-3 text-blue-600" />
                    ID Verified
                  </span>
                )}
                {t.leaseDocAttached && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-emerald-600" />
                    Lease Signed
                  </span>
                )}
                <button
                  onClick={() => toast(`Opening communication channel for ${t.name}...`, "info")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ml-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------- DELETE CONFIRMATION MODAL ------------------- */}
      {deletingTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Remove Tenant Resident?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{deletingTenant.name}</strong> from <strong className="text-slate-900">{deletingTenant.unit}</strong>? This action will archive their lease record and payment history.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer w-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTenant}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs uppercase tracking-wider transition-all cursor-pointer w-full"
              >
                Yes, Remove Resident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MULTI-STEP WIZARD MODAL: ADD / EDIT TENANT ------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddTenantSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    {editingTenantId ? "Edit Tenant Profile & Lease" : "Add New Tenant Resident"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Multi-step resident onboarding & document verification.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Wizard Progress Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 text-xs">
              <div
                onClick={() => setCurrentStep(1)}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold cursor-pointer transition-all ${
                  currentStep === 1
                    ? "bg-[#FF6B00] text-white shadow-xs"
                    : currentStep > 1
                    ? "bg-slate-200 text-slate-700"
                    : "text-slate-400"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span className="truncate">Basic Info</span>
              </div>

              <div
                onClick={() => {
                  if (name.trim()) setCurrentStep(2);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold cursor-pointer transition-all ${
                  currentStep === 2
                    ? "bg-[#FF6B00] text-white shadow-xs"
                    : currentStep > 2
                    ? "bg-slate-200 text-slate-700"
                    : "text-slate-400"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span className="truncate">Gov ID</span>
              </div>

              <div
                onClick={() => {
                  if (name.trim()) setCurrentStep(3);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold cursor-pointer transition-all ${
                  currentStep === 3
                    ? "bg-[#FF6B00] text-white shadow-xs"
                    : "text-slate-400"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span className="truncate">Lease Docs</span>
              </div>
            </div>

            {/* ------------------- STEP 1: BASIC INFO & PROPERTY ------------------- */}
            {currentStep === 1 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Resident Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* 2 Separate Dropdowns: Property and Room / Unit */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Target Property</label>
                    <div className="relative">
                      <select
                        value={selectedProperty}
                        onChange={(e) => handlePropertyChange(e.target.value)}
                        className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="The Regent - Wing A">The Regent - Wing A</option>
                        <option value="Downtown Horizon Suites">Downtown Horizon Suites</option>
                        <option value="Oakwood Executive Residency">Oakwood Executive Residency</option>
                        <option value="Skyline Manor">Skyline Manor</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Room / Unit</label>
                    <div className="relative">
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {(propertyUnitsMap[selectedProperty] || []).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Field with Flag & Country Code Dropdown */}
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
                    <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email Address</label>
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
                    <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ($)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                        $
                      </div>
                      <input
                        type="number"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        placeholder="2850"
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
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
              </div>
            )}

            {/* ------------------- STEP 2: GOVERNMENT ID & VERIFICATION ------------------- */}
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Issuing Country / Authority</label>
                  <input
                    type="text"
                    value={idCountry}
                    onChange={(e) => setIdCountry(e.target.value)}
                    placeholder="e.g. United States or India"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Upload Government ID Dropzone */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload Government ID Document (Front & Back)</label>
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
                        toast("Government ID scan attached to tenant profile!", "success");
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer"
                    >
                      Select ID File
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------- STEP 3: LEASE AGREEMENT & RENT DOCUMENTS ------------------- */}
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Document Classification</label>
                  <div className="relative">
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full appearance-none pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Signed Residential Lease Agreement">Signed Residential Lease Agreement</option>
                      <option value="Proof of Income / Bank Paystubs">Proof of Income / Bank Paystubs</option>
                      <option value="Security Deposit Receipt">Security Deposit Receipt</option>
                      <option value="Background & Credit Audit Report">Background & Credit Audit Report</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Upload Lease Document Dropzone */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload Signed Lease Contract & Documents</label>
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    <FileText className="w-6 h-6 text-[#FF6B00] mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {leaseFile ? `Attached: ${leaseFile}` : "Drag & Drop Signed Tenancy Contract PDF"}
                    </div>
                    <p className="text-[10px] text-slate-400">Accepted formats: PDF, DOCX, Scanned Images</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLeaseFile("signed_residential_lease_2026.pdf");
                        toast("Signed Lease Agreement contract attached!", "success");
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer"
                    >
                      Select Contract File
                    </button>
                  </div>
                </div>

                {/* AI Verification Checkbox */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">AI Auto-Extraction & Verification</span>
                      <span className="text-[10px] text-slate-500">Automatically extract lease dates, rent pricing, and resident identity.</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiVerifyEnabled}
                    onChange={(e) => setAiVerifyEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((currentStep - 1) as any)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: {currentStep === 1 ? "Gov ID" : "Lease Docs"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{editingTenantId ? "Save Changes" : "Complete Resident Onboarding"}</span>
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
