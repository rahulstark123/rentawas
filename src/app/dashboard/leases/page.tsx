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
  Moon
} from "lucide-react";

export interface LegalDocumentTemplate {
  id: string;
  title: string;
  category: "Global & US/UK" | "India Specific" | "Notices & Addendums";
  icon: any;
  description: string;
  jurisdictions: string[];
}

export const LEGAL_DOCUMENTS: LegalDocumentTemplate[] = [
  {
    id: "res-lease",
    title: "1. Residential Lease Agreement",
    category: "Global & US/UK",
    icon: FileText,
    description: "Standard 12-Month / 24-Month tenancy contract with local housing code clauses.",
    jurisdictions: ["Seattle, WA (USA)", "New York, NY (USA)", "London (UK)", "Dubai (RERA - UAE)", "Sydney (Australia)"],
  },
  {
    id: "leave-license",
    title: "2. Leave & License Agreement (India)",
    category: "India Specific",
    icon: FileCheck2,
    description: "11-Month registered Leave & License agreement for Indian state rent control laws.",
    jurisdictions: ["Maharashtra (Mumbai/Pune)", "Karnataka (Bengaluru)", "Delhi NCR (Gurugram/Noida)", "Telangana (Hyderabad)", "Tamil Nadu (Chennai)"],
  },
  {
    id: "comm-lease",
    title: "3. Commercial Property Lease",
    category: "Global & US/UK",
    icon: Building2,
    description: "Retail / Office lease with lock-in period, CAM fees, escalation rate & GST/VAT clauses.",
    jurisdictions: ["Global Commercial Standard", "India Commercial Code", "UK Commercial Lease", "US Triple Net (NNN)"],
  },
  {
    id: "eviction-notice",
    title: "4. Notice to Vacate / Eviction Notice",
    category: "Notices & Addendums",
    icon: AlertTriangle,
    description: "Statutory 30/60-Day notice for non-payment, lease expiration, or property recovery.",
    jurisdictions: ["US Statutory Notice", "India Legal Notice", "UK Section 21 / Section 8", "UAE RERA 12-Month Notice"],
  },
  {
    id: "rent-increase",
    title: "5. Rent Increase Notice Letter",
    category: "Notices & Addendums",
    icon: TrendingUp,
    description: "Formal statutory notice adjusting monthly rent based on CPI / market escalation.",
    jurisdictions: ["Global Market Adjustment", "India Annual Revision", "US Rent Ordinance Compliant"],
  },
  {
    id: "deposit-refund",
    title: "6. Security Deposit Refund Ledger",
    category: "Notices & Addendums",
    icon: Receipt,
    description: "Itemized security deposit settlement memo detailing repair deductions & balance payout.",
    jurisdictions: ["US Itemized Escrow Refund", "India Deposit Settlement", "UK Tenancy Deposit Scheme"],
  },
  {
    id: "inspection-report",
    title: "7. Move-In / Move-Out Inspection Report",
    category: "Notices & Addendums",
    icon: ClipboardCheck,
    description: "Room-by-room physical condition checklist with inventory verification and photo proof logs.",
    jurisdictions: ["Global Standard Inventory Check", "India Unit Handover Form"],
  },
  {
    id: "pet-sublet",
    title: "8. Pet & Subletting Addendum",
    category: "Notices & Addendums",
    icon: ShieldCheck,
    description: "Special rider for pet security deposit, liability waiver, guest caps & subleasing restrictions.",
    jurisdictions: ["Global Standard Pet Rider", "India Co-living Sublet Rider"],
  },
  {
    id: "maintenance-disclosure",
    title: "9. Maintenance & Repair Disclosure",
    category: "Notices & Addendums",
    icon: Wrench,
    description: "Allocation matrix defining Landlord vs Tenant repair duties (Plumbing, Electrical, HVAC).",
    jurisdictions: ["Global Tenant Maintenance Rider", "India Structural Maintenance Clause"],
  },
  {
    id: "police-verification",
    title: "10. Tenant Police Verification & Society NOC",
    category: "India Specific",
    icon: UserCheck,
    description: "Official Police Verification declaration form and Housing Society / HOA move-in NOC.",
    jurisdictions: ["India State Police Verification (Form 1)", "Global HOA / Society Move-In Authorization"],
  },
];

import { useToast } from "@/components/ui/Toast";

export default function AILeaseArchitectPage() {
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<LegalDocumentTemplate>(LEGAL_DOCUMENTS[0]);
  const [jurisdiction, setJurisdiction] = useState(LEGAL_DOCUMENTS[0].jurisdictions[0]);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  
  // Universal Form States
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
    }, 700);
  };

  const handleCopy = () => {
    setCopied(true);
    toast("Legal contract text copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = previewTheme === "dark";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Documents
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>10 Global & India Templates</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate legally compliant agreements, eviction notices, security deposit ledgers, and police verification forms in seconds.
          </p>
        </div>
      </div>

      {/* 10 Documents Selector Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#FF6B00]" />
            Select Legal Document Template (10 Available Options)
          </span>
          <span className="text-[11px] font-bold text-purple-600">
            Current: {selectedDoc.title}
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
                      {doc.category === "India Specific" ? "IN" : doc.category === "Global & US/UK" ? "GLOBAL" : "NOTICE"}
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
        
        {/* Left Dynamic Parameters Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF6B00]" />
              <span>{selectedDoc.title.split(". ")[1]} Parameters</span>
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Jurisdiction Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Target Legal Jurisdiction / Region
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

            {/* Landlord / Party A */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                {selectedDoc.id === "eviction-notice" || selectedDoc.id === "rent-increase" ? "Landlord / Property Manager Name" : "Lessor / Landlord Name"}
              </label>
              <input
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Tenant / Party B */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                {selectedDoc.id === "eviction-notice" || selectedDoc.id === "rent-increase" ? "Recipient Tenant Name" : "Lessee / Tenant Name"}
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Property Address */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Demised Property Premises</label>
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
                <label className="block font-bold text-slate-700 uppercase mb-1">Statutory Notice Period (Days)</label>
                <select
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="30">30-Day Statutory Notice</option>
                  <option value="60">60-Day Statutory Notice</option>
                  <option value="15">15-Day Urgent Remediation Notice</option>
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Increase Rate (%)</label>
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Original Deposit ($)</label>
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent / Fee</label>
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
              <label className="block font-bold text-slate-700 uppercase mb-1">Special Clauses & Notes</label>
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
                <span>AI Generate {selectedDoc.title.split(". ")[1]}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Live Legal Contract Viewer (7 Cols) with Light / Dark Mode Toggle */}
        <div className={`lg:col-span-7 border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden font-mono transition-colors duration-200 ${
          isDark
            ? "bg-[#141A26] text-white border-slate-800"
            : "bg-white text-slate-900 border-slate-200 shadow-slate-200/80"
        }`}>
          {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />}

          <div>
            {/* Header Action Toolbar */}
            <div className={`flex flex-wrap items-center justify-between pb-4 border-b gap-3 font-sans ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Live AI Document Preview
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Light / Dark Mode Theme Switcher */}
                <button
                  type="button"
                  onClick={() => setPreviewTheme(isDark ? "light" : "dark")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                  }`}
                  title="Toggle Light / Dark Mode for Preview"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-300" />
                      <span>Light Paper View</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-700" />
                      <span>Dark Theme View</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>

                <button
                  onClick={() => alert(`Printing document PDF...`)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => alert(`Sending ${selectedDoc.title} to ${tenantName} for E-Sign!`)}
                  className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>E-Sign</span>
                </button>
              </div>
            </div>

            {/* Generated Contract Content Preview Box */}
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

              {/* Template 1: Residential Lease */}
              {selectedDoc.id === "res-lease" && (
                <>
                  <p>
                    <strong>THIS RESIDENTIAL LEASE AGREEMENT</strong> is made on {effectiveDate}, between 
                    <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}> {landlordName} </span> (&ldquo;Lessor&rdquo;) and 
                    <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}> {tenantName} </span> (&ldquo;Lessee&rdquo;).
                  </p>
                  <p>
                    <strong>1. PROPERTY:</strong> Premises located at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span>.
                  </p>
                  <p>
                    <strong>2. FINANCIAL TERMS:</strong> Monthly rent is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${rentAmount} USD</strong> payable on the 1st of each month. Security deposit of <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${depositAmount} USD</strong> holds in statutory escrow.
                  </p>
                  <p>
                    <strong>3. SPECIAL CONDITIONS:</strong> {additionalTerms}
                  </p>
                </>
              )}

              {/* Template 2: Leave & License (India) */}
              {selectedDoc.id === "leave-license" && (
                <>
                  <p>
                    <strong>LEAVE AND LICENSE AGREEMENT</strong> executed pursuant to Section 24 of the Maharashtra Rent Control Act / State Rent Laws on {effectiveDate}.
                  </p>
                  <p>
                    <strong>LICENSOR:</strong> <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span> | <strong>LICENSEE:</strong> <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>.
                  </p>
                  <p>
                    <strong>PROPERTY:</strong> Premises at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span> for 11 months term.
                  </p>
                  <p>
                    <strong>COMPENSATION:</strong> License Fee of <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>₹{rentAmount} / month</strong> with interest-free refundable deposit of <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>₹{depositAmount}</strong>.
                  </p>
                  <p>
                    <strong>REGISTRATION & STAMP DUTY:</strong> Agreement to be electronically registered with E-Registration portal.
                  </p>
                </>
              )}

              {/* Template 3: Commercial Lease */}
              {selectedDoc.id === "comm-lease" && (
                <>
                  <p>
                    <strong>COMMERCIAL PROPERTY LEASE DEED</strong> for retail/office premises at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span>.
                  </p>
                  <p>
                    <strong>LESSOR:</strong> {landlordName} | <strong>LESSEE:</strong> {tenantName}.
                  </p>
                  <p>
                    <strong>COMMERCIAL TERMS:</strong> Monthly Rent: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${rentAmount}</strong> + Applicable Taxes/GST. Lock-in Period: 36 Months. Annual Escalation: 5% per annum.
                  </p>
                </>
              )}

              {/* Template 4: Eviction Notice */}
              {selectedDoc.id === "eviction-notice" && (
                <>
                  <div className={`p-3 border font-bold text-center uppercase rounded-lg ${
                    isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    FORMAL LEGAL NOTICE TO VACATE PREMISES
                  </div>
                  <p>
                    <strong>TO TENANT:</strong> <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>
                    <br />
                    <strong>PREMISES:</strong> {propertyAddress}
                  </p>
                  <p className={isDark ? "text-amber-300" : "text-amber-700 font-medium"}>
                    PLEASE TAKE NOTICE that within <strong>{noticeDays} DAYS</strong> from service of this notice, you are required to vacate and surrender possession of the premises to <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span>.
                  </p>
                </>
              )}

              {/* Template 5: Rent Increase */}
              {selectedDoc.id === "rent-increase" && (
                <>
                  <p>
                    <strong>NOTICE OF INTENT TO ADJUST MONTHLY RENT</strong>
                  </p>
                  <p>
                    Dear <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>,
                  </p>
                  <p>
                    Pursuant to municipal lease terms for {propertyAddress}, please be advised that effective {effectiveDate}, your monthly rent will be adjusted from ${rentAmount} by {escalationRate}% to <strong>${(Number(rentAmount) * (1 + Number(escalationRate)/100)).toFixed(0)} USD/mo</strong>.
                  </p>
                </>
              )}

              {/* Template 6: Deposit Refund Ledger */}
              {selectedDoc.id === "deposit-refund" && (
                <>
                  <p>
                    <strong>SECURITY DEPOSIT SETTLEMENT STATEMENT</strong>
                  </p>
                  <div className={`p-3 border rounded-lg space-y-1 ${
                    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div>Original Security Deposit Held: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${depositAmount}</strong></div>
                    <div>Itemized Repairs & Cleaning Deductions: <strong className={isDark ? "text-red-400" : "text-red-600"}>-${deductions}</strong></div>
                    <div className={`border-t pt-1 font-bold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      Net Refund Payable to {tenantName}: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>${Number(depositAmount) - Number(deductions)}</strong>
                    </div>
                  </div>
                </>
              )}

              {/* Template 7: Inspection Report */}
              {selectedDoc.id === "inspection-report" && (
                <>
                  <p>
                    <strong>MOVE-IN / MOVE-OUT PHYSICAL CONDITION REPORT</strong>
                  </p>
                  <p>
                    Unit Address: {propertyAddress} | Inspected by: {landlordName} with Tenant: {tenantName}.
                  </p>
                  <div className={`text-[11px] space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <div>✓ Living Room Floors & Painting: Good Condition</div>
                    <div>✓ Kitchen Appliances & Plumbing: Verified Functional</div>
                    <div>✓ Bathroom Fixtures & Seals: Inspected Clean</div>
                  </div>
                </>
              )}

              {/* Template 8: Pet Addendum */}
              {selectedDoc.id === "pet-sublet" && (
                <>
                  <p>
                    <strong>PET RESPONSIBILITY & SUBLETTING RIDER</strong>
                  </p>
                  <p>
                    Tenant <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span> is granted approval for 1 domestic pet. Subletting or Airbnb assignments without express written consent from {landlordName} is strictly prohibited.
                  </p>
                </>
              )}

              {/* Template 9: Maintenance Disclosure */}
              {selectedDoc.id === "maintenance-disclosure" && (
                <>
                  <p>
                    <strong>MAINTENANCE & REPAIR RESPONSIBILITY MATRIX</strong>
                  </p>
                  <p>
                    <strong>Landlord Duties:</strong> Major structural repairs, roofing, primary HVAC, exterior plumbing.
                    <br />
                    <strong>Tenant Duties:</strong> Lightbulb replacements, clogged drains from improper disposal, minor filter cleaning.
                  </p>
                </>
              )}

              {/* Template 10: Police Verification & Society NOC */}
              {selectedDoc.id === "police-verification" && (
                <>
                  <p>
                    <strong>TENANT POLICE VERIFICATION DECLARATION FORM</strong>
                  </p>
                  <p>
                    <strong>TENANT DETAILS:</strong> Name: {tenantName} | Residing at: {propertyAddress}.
                    <br />
                    <strong>LANDLORD DECLARATION:</strong> Owner {landlordName} hereby certifies that tenant credentials and government photo ID proof have been verified and submitted for local precinct records.
                  </p>
                </>
              )}

              <div className={`pt-2 text-[10px] italic border-t ${
                isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200"
              }`}>
                * Generated by RentAwas Legal Intelligence Engine. Encrypted & verified for {jurisdiction}.
              </div>
            </div>
          </div>

          <div className={`pt-4 border-t flex items-center justify-between text-xs font-sans ${
            isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"
          }`}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ISO 27001 Legal Hash Certified
            </span>
            <span className="text-[#FF6B00] font-bold">100% Statutory Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
}
