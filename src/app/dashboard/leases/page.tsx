"use client";

import { useState } from "react";
import { 
  Sparkles, 
  FileText, 
  Download, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Copy,
  Building2,
  AlertTriangle,
  Receipt,
  ClipboardCheck,
  FileCheck2,
  TrendingUp,
  Wrench,
  UserCheck,
  Globe,
  Printer,
  ChevronDown,
  Sun,
  Moon,
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface LegalDocumentTemplate {
  id: string;
  title: string;
  category: "Global & US/UK" | "India Specific" | "Notices & Extra Rules";
  icon: any;
  description: string;
  jurisdictions: string[];
}

export const LEGAL_DOCUMENTS: LegalDocumentTemplate[] = [
  {
    id: "res-lease",
    title: "1. Home Rent Agreement",
    category: "Global & US/UK",
    icon: FileText,
    description: "Standard 12-month or 24-month agreement for renting a home or flat.",
    jurisdictions: ["Seattle, WA (USA)", "New York, NY (USA)", "London (UK)", "Dubai (UAE)", "Sydney (Australia)"],
  },
  {
    id: "leave-license",
    title: "2. Rent Agreement (India)",
    category: "India Specific",
    icon: FileCheck2,
    description: "Standard 11-month rent agreement following Indian city and state rules.",
    jurisdictions: ["Maharashtra (Mumbai/Pune)", "Karnataka (Bengaluru)", "Delhi NCR (Gurugram/Noida)", "Telangana (Hyderabad)", "Tamil Nadu (Chennai)"],
  },
  {
    id: "comm-lease",
    title: "3. Commercial & Shop Lease",
    category: "Global & US/UK",
    icon: Building2,
    description: "Lease agreement for shops, offices, or commercial spaces.",
    jurisdictions: ["Global Standard Commercial", "India Commercial Code", "UK Commercial Lease", "US Commercial Lease"],
  },
  {
    id: "eviction-notice",
    title: "4. Notice to Vacate / Move Out",
    category: "Notices & Extra Rules",
    icon: AlertTriangle,
    description: "30 or 60-day notice for unpaid rent or asking a tenant to move out.",
    jurisdictions: ["US Notice Standard", "India Legal Notice", "UK Section 21 / Section 8", "UAE 12-Month Notice"],
  },
  {
    id: "rent-increase",
    title: "5. Rent Increase Notice",
    category: "Notices & Extra Rules",
    icon: TrendingUp,
    description: "Official letter informing tenant about upcoming rent increase.",
    jurisdictions: ["Global Rent Revision", "India Annual Rent Revision", "US Rent Ordinance Compliant"],
  },
  {
    id: "deposit-refund",
    title: "6. Security Deposit Refund Receipt",
    category: "Notices & Extra Rules",
    icon: Receipt,
    description: "Summary of security deposit refund showing repair deductions and final payout.",
    jurisdictions: ["US Escrow Refund Standard", "India Deposit Settlement", "UK Tenancy Deposit Scheme"],
  },
  {
    id: "inspection-report",
    title: "7. House Move-In / Move-Out Checklist",
    category: "Notices & Extra Rules",
    icon: ClipboardCheck,
    description: "Room-by-room check of house condition, lights, plumbing, and key handover.",
    jurisdictions: ["Global Standard Inventory Check", "India Unit Handover Form"],
  },
  {
    id: "pet-sublet",
    title: "8. Pet & Guest Rules Agreement",
    category: "Notices & Extra Rules",
    icon: ShieldCheck,
    description: "Rules for pets, extra guests, and prohibiting unauthorized subletting.",
    jurisdictions: ["Global Standard Pet Rider", "India Co-living Sublet Rider"],
  },
  {
    id: "maintenance-disclosure",
    title: "9. Repair & Maintenance Duties",
    category: "Notices & Extra Rules",
    icon: Wrench,
    description: "Clear list showing who pays for repairs (Landlord vs Tenant).",
    jurisdictions: ["Global Tenant Maintenance Rider", "India Structural Maintenance Clause"],
  },
  {
    id: "police-verification",
    title: "10. Police Verification & Society NOC",
    category: "India Specific",
    icon: UserCheck,
    description: "Police verification form and Housing Society move-in permission letter.",
    jurisdictions: ["India State Police Verification (Form 1)", "Global Housing Society Move-In Permission"],
  },
];

export default function AILeaseArchitectPage() {
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<LegalDocumentTemplate>(LEGAL_DOCUMENTS[0]);
  const [jurisdiction, setJurisdiction] = useState(LEGAL_DOCUMENTS[0].jurisdictions[0]);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("light");
  
  // Form States in simple English
  const [landlordName, setLandlordName] = useState("Alexander Wright");
  const [tenantName, setTenantName] = useState("Eleanor Vance");
  const [propertyAddress, setPropertyAddress] = useState("Regent Tower, Unit 302, 5th Ave");
  const [rentAmount, setRentAmount] = useState("3200");
  const [depositAmount, setDepositAmount] = useState("3200");
  const [effectiveDate, setEffectiveDate] = useState("2026-08-01");
  const [additionalTerms, setAdditionalTerms] = useState("Includes 1 covered parking space. Maintenance fees billed separately.");
  
  // Specific States
  const [noticeDays, setNoticeDays] = useState("30");
  const [escalationRate, setEscalationRate] = useState("5");
  const [deductions, setDeductions] = useState("250");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDocChange = (doc: LegalDocumentTemplate) => {
    setSelectedDoc(doc);
    setJurisdiction(doc.jurisdictions[0]);
    toast(`Template switched to ${doc.title.split(". ")[1]}`, "info");
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast(`AI successfully generated ${selectedDoc.title.split(". ")[1]}!`, "success");
    }, 600);
  };

  const handleCopy = () => {
    setCopied(true);
    toast("Document text copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = previewTheme === "dark";

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Documents
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>10 Easy Document Templates</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create rent agreements, move-out notices, security deposit receipts, and police verification forms in simple English.
          </p>
        </div>
      </div>

      {/* 10 Documents Selector Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#FF6B00]" />
            Choose Document Template (10 Available Options)
          </span>
          <span className="text-[11px] font-bold text-purple-600">
            Selected: {selectedDoc.title}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {LEGAL_DOCUMENTS.map((doc) => {
            const Icon = doc.icon;
            const isSelected = selectedDoc.id === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleDocChange(doc)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                    : "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? "bg-[#FF6B00] text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                    }`}>
                      {doc.category === "India Specific" ? "INDIA" : doc.category === "Global & US/UK" ? "GLOBAL" : "RULES"}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-tight truncate">{doc.title}</div>
                </div>
                <div className={`text-[10px] mt-2 line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                  {doc.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF6B00]" />
              <span>Fill {selectedDoc.title.split(". ")[1]} Details</span>
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* City / State Location Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Select City / State Location
              </label>
              <div className="relative">
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  {selectedDoc.jurisdictions.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Landlord Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Landlord / Owner Name
              </label>
              <input
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Tenant Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tenant / Renter Name
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* House / Property Address */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Property Address / House Location
              </label>
              <input
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Dynamic fields based on document type */}
            {selectedDoc.id === "eviction-notice" ? (
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Notice Period (Days)</label>
                <select
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="30">30 Days Notice</option>
                  <option value="60">60 Days Notice</option>
                  <option value="15">15 Days Urgent Notice</option>
                </select>
              </div>
            ) : selectedDoc.id === "rent-increase" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Current Rent ($)</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Rent Increase (%)</label>
                  <input
                    type="number"
                    value={escalationRate}
                    onChange={(e) => setEscalationRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            ) : selectedDoc.id === "deposit-refund" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit ($)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Repair Deductions ($)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Special Rules & Notes</label>
              <textarea
                rows={2}
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-70"
          >
            {isGenerating ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {selectedDoc.title.split(". ")[1]}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Document Preview Box */}
        <div className={`lg:col-span-7 border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden font-sans transition-colors duration-200 ${
          isDark
            ? "bg-[#141A26] text-white border-slate-800"
            : "bg-white text-slate-900 border-slate-200 shadow-slate-200/80"
        }`}>
          {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />}

          <div>
            {/* Header Action Toolbar */}
            <div className={`flex flex-wrap items-center justify-between pb-4 border-b gap-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Document Preview
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Light / Dark Theme Switcher (Icon Only + Tooltip) */}
                <button
                  type="button"
                  onClick={() => setPreviewTheme(isDark ? "light" : "dark")}
                  title={isDark ? "Switch to Light Paper View" : "Switch to Dark Theme View"}
                  className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                </button>

                {/* Copy Text Button (Icon Only + Tooltip) */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title={copied ? "Copied to Clipboard!" : "Copy Document Text"}
                  className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Print Document Button (Icon Only + Tooltip) */}
                <button
                  type="button"
                  onClick={() => alert(`Printing document PDF...`)}
                  title="Print Document / Save as PDF"
                  className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => alert(`Sending ${selectedDoc.title} to ${tenantName} for signature!`)}
                  className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send for Signature</span>
                </button>
              </div>
            </div>

            {/* Generated Document Content Preview */}
            <div className={`mt-6 text-xs leading-relaxed space-y-4 p-6 rounded-xl border max-h-[460px] overflow-y-auto custom-scrollbar transition-colors ${
              isDark
                ? "bg-[#0C1019] text-slate-300 border-slate-800/80"
                : "bg-slate-50 text-slate-800 border-slate-200/90 shadow-inner"
            }`}>
              
              {/* Document Title Header */}
              <div className={`text-center font-bold uppercase tracking-widest text-sm border-b pb-3 ${
                isDark ? "text-white border-slate-800" : "text-slate-900 border-slate-300"
              }`}>
                {selectedDoc.title.toUpperCase()} — {jurisdiction.toUpperCase()}
              </div>

              {/* Template 1: Home Rent Agreement */}
              {selectedDoc.id === "res-lease" && (
                <>
                  <p>
                    <strong>THIS RENT AGREEMENT</strong> is made on {effectiveDate}, between 
                    <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}> {landlordName} </span> (Owner / Landlord) and 
                    <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}> {tenantName} </span> (Tenant / Renter).
                  </p>
                  <p>
                    <strong>1. PROPERTY ADDRESS:</strong> House located at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span>.
                  </p>
                  <p>
                    <strong>2. RENT & DEPOSIT:</strong> Monthly rent is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${rentAmount}</strong> payable on the 1st of every month. Security deposit is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${depositAmount}</strong>.
                  </p>
                  <p>
                    <strong>3. SPECIAL RULES:</strong> {additionalTerms}
                  </p>
                </>
              )}

              {/* Template 2: Rent Agreement (India) */}
              {selectedDoc.id === "leave-license" && (
                <>
                  <p>
                    <strong>RENT AGREEMENT FOR 11 MONTHS</strong> made on {effectiveDate}.
                  </p>
                  <p>
                    <strong>OWNER (LANDLORD):</strong> <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span> | <strong>TENANT:</strong> <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>.
                  </p>
                  <p>
                    <strong>PROPERTY ADDRESS:</strong> House / Flat at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span> for 11 months.
                  </p>
                  <p>
                    <strong>RENT & DEPOSIT:</strong> Monthly rent is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>₹{rentAmount} / month</strong> and refundable security deposit is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>₹{depositAmount}</strong>.
                  </p>
                  <p>
                    <strong>POLICE VERIFICATION & REGISTRATION:</strong> This agreement will be registered online as per state government rules.
                  </p>
                </>
              )}

              {/* Template 3: Commercial & Shop Lease */}
              {selectedDoc.id === "comm-lease" && (
                <>
                  <p>
                    <strong>COMMERCIAL SHOP / OFFICE LEASE AGREEMENT</strong> for property at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span>.
                  </p>
                  <p>
                    <strong>LANDLORD:</strong> {landlordName} | <strong>TENANT:</strong> {tenantName}.
                  </p>
                  <p>
                    <strong>COMMERCIAL TERMS:</strong> Monthly Rent: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${rentAmount}</strong> + Taxes. Security Deposit: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${depositAmount}</strong>. Yearly Rent Increase: 5%.
                  </p>
                </>
              )}

              {/* Template 4: Notice to Vacate */}
              {selectedDoc.id === "eviction-notice" && (
                <>
                  <div className={`p-3 border font-bold text-center uppercase rounded-lg ${
                    isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    OFFICIAL NOTICE TO VACATE HOUSE
                  </div>
                  <p>
                    <strong>TO TENANT:</strong> <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>
                    <br />
                    <strong>PROPERTY ADDRESS:</strong> {propertyAddress}
                  </p>
                  <p className={isDark ? "text-amber-300" : "text-amber-700 font-medium"}>
                    PLEASE TAKE NOTICE that within <strong>{noticeDays} DAYS</strong> from receiving this notice, you are requested to clear all dues and hand over house keys to <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span>.
                  </p>
                </>
              )}

              {/* Template 5: Rent Increase Notice */}
              {selectedDoc.id === "rent-increase" && (
                <>
                  <p>
                    <strong>NOTICE OF RENT INCREASE</strong>
                  </p>
                  <p>
                    Dear <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>,
                  </p>
                  <p>
                    This is to inform you that starting from {effectiveDate}, the monthly rent for your house at {propertyAddress} will increase by {escalationRate}%. Your new monthly rent will be <strong>${(Number(rentAmount) * (1 + Number(escalationRate)/100)).toFixed(0)} / month</strong>.
                  </p>
                </>
              )}

              {/* Template 6: Deposit Refund Receipt */}
              {selectedDoc.id === "deposit-refund" && (
                <>
                  <p>
                    <strong>SECURITY DEPOSIT REFUND SUMMARY</strong>
                  </p>
                  <div className={`p-3 border rounded-lg space-y-1 ${
                    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div>Total Security Deposit Received: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${depositAmount}</strong></div>
                    <div>Minus Repair & Cleaning Charges: <strong className={isDark ? "text-red-400" : "text-red-600"}>-${deductions}</strong></div>
                    <div className={`border-t pt-1 font-bold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      Final Refund Amount Paid to {tenantName}: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${Number(depositAmount) - Number(deductions)}</strong>
                    </div>
                  </div>
                </>
              )}

              {/* Template 7: House Checklist */}
              {selectedDoc.id === "inspection-report" && (
                <>
                  <p>
                    <strong>HOUSE MOVE-IN / MOVE-OUT CONDITION CHECKLIST</strong>
                  </p>
                  <p>
                    Address: {propertyAddress} | Checked by Landlord ({landlordName}) & Tenant ({tenantName}).
                  </p>
                  <div className={`text-[11px] space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <div>✓ Living Room & Walls: Good Condition</div>
                    <div>✓ Kitchen Fans, Lights & Plumbing: Working Perfectly</div>
                    <div>✓ Bathroom Fittings & Taps: Checked Clean & Working</div>
                  </div>
                </>
              )}

              {/* Template 8: Pet & Guest Rules */}
              {selectedDoc.id === "pet-sublet" && (
                <>
                  <p>
                    <strong>PET RULES & SUBLETTING PERMISSION</strong>
                  </p>
                  <p>
                    Tenant <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span> is allowed to keep 1 domestic pet. Renting out rooms to outsiders or subletting without owner consent is not allowed.
                  </p>
                </>
              )}

              {/* Template 9: Repair Duties */}
              {selectedDoc.id === "maintenance-disclosure" && (
                <>
                  <p>
                    <strong>REPAIR RESPONSIBILITY LIST (OWNER VS TENANT)</strong>
                  </p>
                  <p>
                    <strong>Owner / Landlord Duties:</strong> Water leakage, roof repairs, main electrical box, painting external walls.
                    <br />
                    <strong>Tenant Duties:</strong> Changing light bulbs, cleaning water tap blockages, replacing AC remote batteries.
                  </p>
                </>
              )}

              {/* Template 10: Police Verification & Society NOC */}
              {selectedDoc.id === "police-verification" && (
                <>
                  <p>
                    <strong>TENANT POLICE VERIFICATION & HOUSING SOCIETY NOC</strong>
                  </p>
                  <p>
                    Tenant Name: <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span> | Owner Name: <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span>.
                  </p>
                  <p>
                    This is to declare that tenant details have been submitted for Police Verification and Housing Society Move-in approval for premises: {propertyAddress}.
                  </p>
                </>
              )}

              <div className={`pt-3 border-t text-[10px] flex justify-between ${
                isDark ? "border-slate-800 text-slate-400" : "border-slate-300 text-slate-600"
              }`}>
                <span>Generated by RentAwas Smart Document Engine</span>
                <span>Location Rules: {jurisdiction}</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
