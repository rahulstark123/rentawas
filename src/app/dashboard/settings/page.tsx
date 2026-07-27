"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Save, 
  Plus, 
  DollarSign, 
  Check, 
  Trash2,
  ChevronDown,
  Blocks,
  Zap,
  Search,
  ExternalLink,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Globe,
  Sparkles,
  Sliders,
  Puzzle,
  ArrowRight,
  FileText,
  PhoneCall,
  FileCheck
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function WorkspaceSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "team">("general");

  // General Settings State
  const [orgName, setOrgName] = useState("Grand Regency Management LLC");
  const [companyType, setCompanyType] = useState("LLC (Limited Liability Company)");
  const [taxId, setTaxId] = useState("EIN 92-8491029 / GSTIN 27AAACR1234F1Z9");
  const [registeredAddress, setRegisteredAddress] = useState("1420 5th Ave, Suite 3000, Seattle, WA 98101");
  const [landlordName, setLandlordName] = useState("Alexander Wright");
  const [landlordRole, setLandlordRole] = useState("Managing Director & Asset Owner");
  const [currency, setCurrency] = useState("USD ($)");
  const [jurisdiction, setJurisdiction] = useState("Seattle, WA (USA)");
  const [companyEmail, setCompanyEmail] = useState("support@regencymanagement.com");
  const [companyPhone, setCompanyPhone] = useState("+1 (555) 019-2834");
  const [customSubdomain, setCustomSubdomain] = useState("regency.rentawas.com");
  const [tagline, setTagline] = useState("Premier Residential & Executive Asset Management");
  const [timezone, setTimezone] = useState("(UTC-08:00) Pacific Time (US & Canada)");
  const [fiscalYearStart, setFiscalYearStart] = useState("January (Standard Calendar Year)");

  // Payout Settings State
  const [bankName, setBankName] = useState("JPMorgan Chase Bank");
  const [accountNumber, setAccountNumber] = useState("•••• •••• •••• 8942");
  const [payoutSchedule, setPayoutSchedule] = useState("instant");

  // Integrations State & Filters
  const [integrationSearch, setIntegrationSearch] = useState("");
  const [selectedIntegrationCategory, setSelectedIntegrationCategory] = useState("All");
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({
    stripe: true,
    razorpay: true,
    quickbooks: true,
    plaid: true,
    whatsapp: true,
    zapier: true,
    google_cal: true,
    slack: true,
    twilio: true,
    docusign: true,
  });

  const toggleIntegration = (id: string, name: string) => {
    const isCurrentlyConnected = !!connectedMap[id];
    setConnectedMap((prev) => ({ ...prev, [id]: !isCurrentlyConnected }));
    toast(
      !isCurrentlyConnected
        ? `Integration connected: ${name}`
        : `Integration disconnected: ${name}`,
      !isCurrentlyConnected ? "success" : "info"
    );
  };

  // Saved Feedback
  const [isSaved, setIsSaved] = useState(false);

  // Team Members State & API Integration
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [team, setTeam] = useState<any[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberCountryCode, setMemberCountryCode] = useState("+1");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState("Manager"); // "Owner", "Admin", "Manager", "Employee"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const res = await fetch("/api/workspace/team?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setTeam(json.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone ? `${m.countryCode || "+1"} ${m.phone}` : "N/A",
            role: m.role || "Manager",
            status: m.status || "Active",
          })));
        }
      }
    } catch (err) {
      console.warn("Could not fetch team from API:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    if (password && password !== confirmPassword) {
      toast("Passwords do not match! Please check again.", "error");
      return;
    }

    try {
      const res = await fetch("/api/workspace/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: memberName,
          email: memberEmail,
          countryCode: memberCountryCode,
          phone: memberPhone,
          role: memberRole,
          password: password || undefined,
          wid: 1, // Workspace ID
        }),
      });

      if (res.ok) {
        const json = await res.json();
        toast(json.message || `Team member "${memberName}" added successfully!`, "success");
        fetchTeamMembers();
      } else {
        toast("Failed to add team member", "error");
      }
    } catch {
      toast("Failed to add team member", "error");
    }

    setMemberName("");
    setMemberEmail("");
    setMemberPhone("");
    setPassword("");
    setConfirmPassword("");
    setMemberRole("Manager");
    setShowAddModal(false);
  };

  const handleDeleteMember = async (member: any) => {
    if (member.role === "Owner") {
      toast("Cannot revoke access for Workspace Owner.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/workspace/team/${encodeURIComponent(member.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Access revoked for "${member.name}".`, "info");
        fetchTeamMembers();
      } else {
        setTeam((prev) => prev.filter((t) => t.id !== member.id));
        toast(`Team member removed.`, "info");
      }
    } catch {
      setTeam((prev) => prev.filter((t) => t.id !== member.id));
      toast(`Team member removed.`, "info");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workspace & Landlord Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure organization profile, bank payout accounts, and team access.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
        {[
          { id: "general", label: "Organization & Profile", icon: Building2 },
          { id: "integrations", label: "Integrations", icon: Blocks, badge: "10 CONNECTED" },
          { id: "team", label: "Team Members", icon: Users, count: team.length },
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
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                  {tab.badge}
                </span>
              )}
              {tab.count && (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization & Profile */}
      {activeTab === "general" && (
        <div className="space-y-6">
          
          {/* Card 1: Company Legal Identity & Tax Registration */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF6B00]" />
              <span>Company Legal Identity & Registration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Organization / Company Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Entity / Business Type
                </label>
                <div className="relative">
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="LLC (Limited Liability Company)">LLC (Limited Liability Company)</option>
                    <option value="Sole Proprietorship / Individual Landlord">Sole Proprietorship / Individual Landlord</option>
                    <option value="Private Limited Corporation (Pvt Ltd / Inc)">Private Limited Corporation (Pvt Ltd / Inc)</option>
                    <option value="Real Estate Investment Trust (REIT)">Real Estate Investment Trust (REIT)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Tax Identification Number (EIN / GSTIN / SSN)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Registered Headquarters Address
                </label>
                <input
                  type="text"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Primary Landlord / Asset Manager Profile */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Primary Landlord & Representative Contact</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Primary Contact Full Name
                </label>
                <input
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Official Title / Role
                </label>
                <input
                  type="text"
                  value={landlordRole}
                  onChange={(e) => setLandlordRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Official Notification Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Direct Contact Phone Number
                </label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Regional Preferences & Fiscal Calendar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Regional Preferences & Fiscal Calendar</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Default Operating Currency
                </label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="USD ($)">USD ($) — United States Dollar</option>
                    <option value="INR (₹)">INR (₹) — Indian Rupee</option>
                    <option value="GBP (£)">GBP (£) — British Pound</option>
                    <option value="EUR (€)">EUR (€) — Eurozone Euro</option>
                    <option value="AED (AED)">AED (AED) — UAE Dirham</option>
                    <option value="AUD ($)">AUD ($) — Australian Dollar</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Primary Municipal Jurisdiction
                </label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Workspace Operating Timezone
                </label>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="(UTC-08:00) Pacific Time (US & Canada)">(UTC-08:00) Pacific Time (US & Canada)</option>
                    <option value="(UTC+05:30) Indian Standard Time (IST)">(UTC+05:30) Indian Standard Time (IST)</option>
                    <option value="(UTC+00:00) London (GMT / BST)">(UTC+00:00) London (GMT / BST)</option>
                    <option value="(UTC+04:00) Dubai (GST)">(UTC+04:00) Dubai (GST)</option>
                    <option value="(UTC-05:00) Eastern Time (US & Canada)">(UTC-05:00) Eastern Time (US & Canada)</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Fiscal Year Start Month
                </label>
                <div className="relative">
                  <select
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="January (Standard Calendar Year)">January (Standard Calendar Year)</option>
                    <option value="April (India / UK Fiscal Year)">April (India / UK Fiscal Year)</option>
                    <option value="July (Q3 Fiscal Start)">July (Q3 Fiscal Start)</option>
                    <option value="October (Q4 Fiscal Start)">October (Q4 Fiscal Start)</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Integrations Catalog Grid */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Header Banner & Stats */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Blocks className="w-5 h-5 text-[#FF6B00]" />
                  <span>Third-Party Integrations &amp; Connected Apps</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect payment processors, accounting platforms, CRM tools, communication channels, and API webhooks.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>10 Connected Apps</span>
                </span>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {["All", "Payments", "Accounting", "Communication", "Tenant KYC", "Automation", "Legal"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedIntegrationCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedIntegrationCategory === cat
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={integrationSearch}
                  onChange={(e) => setIntegrationSearch(e.target.value)}
                  placeholder="Search integrations..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: "stripe",
                name: "Stripe Connect & ACH",
                category: "Payments",
                icon: CreditCard,
                iconBg: "bg-indigo-50 border-indigo-200 text-indigo-600",
                description: "Automated monthly rent collection via ACH Direct Debit, Credit/Debit Cards, Apple Pay, and Google Pay.",
                meta: "Fee: 0.5% cap ($5 max) • Real-time Webhooks",
                popular: true,
              },
              {
                id: "razorpay",
                name: "Razorpay & UPI Instant",
                category: "Payments",
                icon: Zap,
                iconBg: "bg-blue-50 border-blue-200 text-blue-600",
                description: "Instant UPI QR Code scan, PhonePe, GPay & NetBanking settlements for Indian rental properties.",
                meta: "0% Fee on UPI • Instant VPA Settlement",
                popular: true,
              },
              {
                id: "quickbooks",
                name: "QuickBooks Online",
                category: "Accounting",
                icon: FileText,
                iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
                description: "Bi-directional ledger sync for rent invoices, maintenance expenses, tax reports, and Chart of Accounts.",
                meta: "Auto Sync: Every 6 hours • Multi-entity support",
                popular: true,
              },
              {
                id: "xero",
                name: "Xero Cloud Accounting",
                category: "Accounting",
                icon: Building2,
                iconBg: "bg-cyan-50 border-cyan-200 text-cyan-600",
                description: "Reconcile rental payments, security deposits, and contractor invoices automatically with Xero accounts.",
                meta: "Bank Reconciliation API • Invoice Matching",
              },
              {
                id: "plaid",
                name: "Plaid Bank Verification",
                category: "Tenant KYC",
                icon: ShieldCheck,
                iconBg: "bg-slate-100 border-slate-300 text-slate-900",
                description: "Instantly verify tenant bank balances, income proofs, and account routing during online tenant onboarding.",
                meta: "12,000+ US/UK Banks • Income Audit API",
              },
              {
                id: "whatsapp",
                name: "WhatsApp Business API",
                category: "Communication",
                icon: MessageSquare,
                iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
                description: "Send automated rent due reminders, PDF payment receipts, and maintenance ticket updates via WhatsApp.",
                meta: "Official Meta API • High Delivery Rate",
                popular: true,
              },
              {
                id: "zapier",
                name: "Zapier Automation Hub",
                category: "Automation",
                icon: Puzzle,
                iconBg: "bg-orange-50 border-orange-200 text-orange-600",
                description: "Trigger custom 5,000+ app workflows on new tenant creation, rent invoice issuance, or maintenance requests.",
                meta: "Custom Webhooks • 5,000+ Apps Supported",
                popular: true,
              },
              {
                id: "google_cal",
                name: "Google Calendar Sync",
                category: "Communication",
                icon: Calendar,
                iconBg: "bg-blue-50 border-blue-200 text-blue-600",
                description: "Automatically schedule unit walkthroughs, vendor maintenance visits, and lease renewal reminders.",
                meta: "Bi-directional Calendar Sync",
              },
              {
                id: "slack",
                name: "Slack Team Alerts",
                category: "Communication",
                icon: MessageSquare,
                iconBg: "bg-purple-50 border-purple-200 text-purple-600",
                description: "Get real-time channel alerts when a tenant submits urgent maintenance, pays rent, or signs a new lease.",
                meta: "Bot Webhooks • Channel Alerts",
              },
              {
                id: "twilio",
                name: "Twilio SMS & Voice",
                category: "Communication",
                icon: PhoneCall,
                iconBg: "bg-rose-50 border-rose-200 text-rose-600",
                description: "Broadcast SMS notices to property residents or send 2-factor OTP verification during tenant login.",
                meta: "Global SMS Delivery • Automated Triggers",
              },
              {
                id: "docusign",
                name: "DocuSign E-Signature",
                category: "Legal",
                icon: FileCheck,
                iconBg: "bg-amber-50 border-amber-200 text-amber-600",
                description: "Seamlessly execute e-signed residential lease agreements, pet addendums, and move-in inspection forms.",
                meta: "Audit-Trail Verified • PDF E-Sign",
              },
              {
                id: "paypal",
                name: "PayPal & Venmo Business",
                category: "Payments",
                icon: DollarSign,
                iconBg: "bg-sky-50 border-sky-200 text-sky-600",
                description: "Accept international card payments and Venmo transfers from global & expat residents.",
                meta: "Venmo QR Code • International Cards",
              },
            ]
              .filter((item) => {
                const matchesCat =
                  selectedIntegrationCategory === "All" || item.category === selectedIntegrationCategory;
                const matchesSearch =
                  item.name.toLowerCase().includes(integrationSearch.toLowerCase()) ||
                  item.description.toLowerCase().includes(integrationSearch.toLowerCase());
                return matchesCat && matchesSearch;
              })
              .map((item) => {
                const Icon = item.icon;
                const isConnected = !!connectedMap[item.id];
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative ${
                      isConnected ? "border-slate-200/90" : "border-slate-200/60 opacity-90"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Icon, Category & Toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{item.name}</h4>
                              {item.popular && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 uppercase">
                                  POPULAR
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Connected Status Switch */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleIntegration(item.id, item.name)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isConnected ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isConnected ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                        {item.description}
                      </p>

                      {/* Meta Pill */}
                      <div className="text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-500 font-medium">
                        {item.meta}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`text-[11px] font-extrabold flex items-center gap-1 ${
                        isConnected ? "text-emerald-600" : "text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span>{isConnected ? "Connected & Active" : "Available"}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isConnected) {
                            toggleIntegration(item.id, item.name);
                          } else {
                            toast(`Opening ${item.name} API & Webhook Configuration...`, "info");
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isConnected
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                            : "bg-[#FF6B00] hover:bg-[#E56000] text-white shadow-xs"
                        }`}
                      >
                        {isConnected ? "Configure Keys" : "+ Connect"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 3: Team & Role Access */}
      {activeTab === "team" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF6B00]" />
              <span>Team Members & Property Manager Permissions</span>
            </h3>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Member</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Phone Number</th>
                  <th className="pb-3 px-2">Access Role</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {team.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-slate-800 text-sm">No Team Members Added</span>
                        <p className="text-xs text-slate-400 max-w-sm">
                          No team members found for this workspace. Click &ldquo;Add Team Member&rdquo; above to grant access.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  team.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-2 text-slate-600">{m.email}</td>
                      <td className="py-3 px-2 text-slate-600">{m.phone}</td>
                      <td className="py-3 px-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {m.role !== "Owner" && (
                          <button
                            onClick={() => handleDeleteMember(m)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <form onSubmit={handleAddMember} className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-extrabold text-slate-900 leading-none">Add Team Member</h3>
            <p className="text-xs text-slate-500">Enter team member details to grant access to workspace #1.</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="sarah.j@regencymanagement.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={memberCountryCode}
                    onChange={(e) => setMemberCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer shrink-0"
                  >
                    <option value="+1">🇺🇸 +1 (US/CA)</option>
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+65">🇸🇬 +65 (SG)</option>
                    <option value="+49">🇩🇪 +49 (DE)</option>
                    <option value="+33">🇫🇷 +33 (FR)</option>
                  </select>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Access Role *</label>
                <div className="relative">
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer pr-9"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Add Team Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
