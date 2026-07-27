"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  FileCheck,
  Eye,
  EyeOff,
  Copy,
  X,
  Lock
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
    stripe: false,
    razorpay: false,
    paypal: false,
  });

  // Razorpay Integration Modal & Credentials State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayEnvMode, setRazorpayEnvMode] = useState<"live" | "test">("live");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayMerchantVpa, setRazorpayMerchantVpa] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [savingRazorpay, setSavingRazorpay] = useState(false);

  const toggleIntegration = (id: string, name: string) => {
    if (id === "razorpay") {
      setShowRazorpayModal(true);
      return;
    }
    if (id === "stripe") {
      setShowStripeModal(true);
      return;
    }
    if (id === "paypal") {
      setShowPaypalModal(true);
      return;
    }
    const isCurrentlyConnected = !!connectedMap[id];
    setConnectedMap((prev) => ({ ...prev, [id]: !isCurrentlyConnected }));
    toast(
      !isCurrentlyConnected
        ? `Integration connected: ${name}`
        : `Integration disconnected: ${name}`,
      !isCurrentlyConnected ? "success" : "info"
    );
  };

  // PayPal Integration Modal & Credentials State
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalEnvMode, setPaypalEnvMode] = useState<"live" | "test">("live");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalMerchantEmail, setPaypalMerchantEmail] = useState("");
  const [paypalWebhookId, setPaypalWebhookId] = useState("");
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [savingPaypal, setSavingPaypal] = useState(false);

  const handleSavePaypal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalClientId.trim() || !paypalClientSecret.trim()) {
      toast("Client ID and Client Secret are required for PayPal configuration!", "error");
      return;
    }

    try {
      setSavingPaypal(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          paypalClientId,
          paypalClientSecret,
          paypalMerchantEmail,
          paypalWebhookId,
          paypalEnvMode,
          paypalConnected: true,
        }),
      });

      if (res.ok) {
        setConnectedMap((prev) => ({ ...prev, paypal: true }));
        setShowPaypalModal(false);
        toast("PayPal Client API credentials saved successfully! International wallet payment gateway activated.", "success");
      } else {
        toast("Failed to save PayPal configuration.", "error");
      }
    } catch (err) {
      toast("Error saving PayPal settings.", "error");
    } finally {
      setSavingPaypal(false);
    }
  };

  const handleDisconnectPaypal = async () => {
    try {
      setSavingPaypal(true);
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          paypalConnected: false,
        }),
      });
      setConnectedMap((prev) => ({ ...prev, paypal: false }));
      setShowPaypalModal(false);
      toast("PayPal integration disconnected.", "info");
    } catch (err) {
      toast("Error disconnecting PayPal.", "error");
    } finally {
      setSavingPaypal(false);
    }
  };

  // Stripe Integration Modal & Credentials State
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeEnvMode, setStripeEnvMode] = useState<"live" | "test">("live");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [stripeConnectAccountId, setStripeConnectAccountId] = useState("");
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [savingStripe, setSavingStripe] = useState(false);

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripePublishableKey.trim() || !stripeSecretKey.trim()) {
      toast("Publishable Key and Secret Key are required for Stripe configuration!", "error");
      return;
    }

    try {
      setSavingStripe(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          stripePublishableKey,
          stripeSecretKey,
          stripeWebhookSecret,
          stripeConnectAccountId,
          stripeEnvMode,
          stripeConnected: true,
        }),
      });

      if (res.ok) {
        setConnectedMap((prev) => ({ ...prev, stripe: true }));
        setShowStripeModal(false);
        toast("Stripe API Keys & Connect credentials saved successfully! Global payment gateway activated.", "success");
      } else {
        toast("Failed to save Stripe configuration.", "error");
      }
    } catch (err) {
      toast("Error saving Stripe settings.", "error");
    } finally {
      setSavingStripe(false);
    }
  };

  const handleDisconnectStripe = async () => {
    try {
      setSavingStripe(true);
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          stripeConnected: false,
        }),
      });
      setConnectedMap((prev) => ({ ...prev, stripe: false }));
      setShowStripeModal(false);
      toast("Stripe integration disconnected.", "info");
    } catch (err) {
      toast("Error disconnecting Stripe.", "error");
    } finally {
      setSavingStripe(false);
    }
  };

  const handleSaveRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razorpayKeyId.trim() || !razorpayKeySecret.trim()) {
      toast("Key ID and Key Secret are required for Razorpay configuration!", "error");
      return;
    }

    try {
      setSavingRazorpay(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          razorpayKeyId,
          razorpayKeySecret,
          razorpayMerchantVpa,
          razorpayWebhookSecret,
          razorpayEnvMode,
          razorpayConnected: true,
        }),
      });

      if (res.ok) {
        setConnectedMap((prev) => ({ ...prev, razorpay: true }));
        setShowRazorpayModal(false);
        toast("Razorpay API Keys & VPA saved and verified successfully! Tenant payment gateway activated.", "success");
      } else {
        toast("Failed to save Razorpay configuration.", "error");
      }
    } catch (err) {
      toast("Error saving Razorpay settings.", "error");
    } finally {
      setSavingRazorpay(false);
    }
  };

  const handleDisconnectRazorpay = async () => {
    try {
      setSavingRazorpay(true);
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          razorpayConnected: false,
        }),
      });
      setConnectedMap((prev) => ({ ...prev, razorpay: false }));
      setShowRazorpayModal(false);
      toast("Razorpay integration disconnected.", "info");
    } catch (err) {
      toast("Error disconnecting Razorpay.", "error");
    } finally {
      setSavingRazorpay(false);
    }
  };

  // Saved Feedback
  const [isSaved, setIsSaved] = useState(false);

  // Team Members State & API Integration
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [team, setTeam] = useState<any[]>([]);

  const fetchWorkspaceSettings = async () => {
    try {
      const res = await fetch("/api/workspace?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.razorpayKeyId) setRazorpayKeyId(json.data.razorpayKeyId);
          if (json.data.razorpayKeySecret) setRazorpayKeySecret(json.data.razorpayKeySecret);
          if (json.data.razorpayMerchantVpa) setRazorpayMerchantVpa(json.data.razorpayMerchantVpa);
          if (json.data.razorpayWebhookSecret) setRazorpayWebhookSecret(json.data.razorpayWebhookSecret);
          if (json.data.razorpayEnvMode) setRazorpayEnvMode(json.data.razorpayEnvMode as any);
          if (json.data.razorpayConnected !== undefined) {
            setConnectedMap((prev) => ({ ...prev, razorpay: json.data.razorpayConnected }));
          }

          if (json.data.stripePublishableKey) setStripePublishableKey(json.data.stripePublishableKey);
          if (json.data.stripeSecretKey) setStripeSecretKey(json.data.stripeSecretKey);
          if (json.data.stripeWebhookSecret) setStripeWebhookSecret(json.data.stripeWebhookSecret);
          if (json.data.stripeConnectAccountId) setStripeConnectAccountId(json.data.stripeConnectAccountId);
          if (json.data.stripeEnvMode) setStripeEnvMode(json.data.stripeEnvMode as any);
          if (json.data.stripeConnected !== undefined) {
            setConnectedMap((prev) => ({ ...prev, stripe: json.data.stripeConnected }));
          }

          if (json.data.paypalClientId) setPaypalClientId(json.data.paypalClientId);
          if (json.data.paypalClientSecret) setPaypalClientSecret(json.data.paypalClientSecret);
          if (json.data.paypalMerchantEmail) setPaypalMerchantEmail(json.data.paypalMerchantEmail);
          if (json.data.paypalWebhookId) setPaypalWebhookId(json.data.paypalWebhookId);
          if (json.data.paypalEnvMode) setPaypalEnvMode(json.data.paypalEnvMode as any);
          if (json.data.paypalConnected !== undefined) {
            setConnectedMap((prev) => ({ ...prev, paypal: json.data.paypalConnected }));
          }
        }
      }
    } catch (err) {
      console.warn("Could not load workspace settings:", err);
    }
  };

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
    fetchWorkspaceSettings();
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
          { id: "integrations", label: "Integrations", icon: Blocks, badge: "3 SUPPORTED" },
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
                  <span>Payment Gateway &amp; Banking Integrations</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect direct payment processors and settlement gateways for automated rent collection.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>3 Payment Integrations Supported</span>
                </span>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {["All Integrations", "Payment Gateways", "Instant Settlement"].map((cat) => (
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

          {/* Integration Cards Grid - strictly Stripe, Razorpay & PayPal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "stripe",
                name: "Stripe Connect & ACH Direct",
                category: "Payment Gateway",
                logo: "/assests/stripe icon.jpeg",
                description: "Automated monthly rent collection via ACH Direct Debit, Credit/Debit Cards, Apple Pay, and Google Pay.",
                meta: "Fee: 0.5% ACH Cap ($5 max) • Global Payouts",
                popular: true,
              },
              {
                id: "razorpay",
                name: "Razorpay & UPI Instant Settlement",
                category: "Payment Gateway",
                logo: "/assests/razorpay icon.jpeg",
                description: "Instant UPI QR Code scan (PhonePe, GPay, Paytm) & NetBanking settlements for Indian & SE Asian properties.",
                meta: "0% Fee on UPI • Instant VPA Settlement",
                popular: true,
              },
              {
                id: "paypal",
                name: "PayPal & Venmo Commerce",
                category: "Payment Gateway",
                logo: "/assests/paypal icon.svg",
                description: "Accept international card payments, PayPal wallets, and Venmo transfers from global & expat residents.",
                meta: "Venmo QR Code • International Cards & Wallets",
                popular: false,
              },
            ]
              .filter((item) => {
                const matchesSearch =
                  item.name.toLowerCase().includes(integrationSearch.toLowerCase()) ||
                  item.description.toLowerCase().includes(integrationSearch.toLowerCase());
                return matchesSearch;
              })
              .map((item) => {
                const isConnected = !!connectedMap[item.id];
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative ${
                      isConnected ? "border-slate-200/90" : "border-slate-200/60 opacity-90"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Bar: Logo, Name & Toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            <Image
                              src={item.logo}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-contain max-h-full w-auto"
                            />
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
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
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
                      <div className="text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-500 font-medium">
                        {item.meta}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`text-[11px] font-extrabold flex items-center gap-1.5 ${
                        isConnected ? "text-emerald-600" : "text-slate-400"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Razorpay Integration Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowRazorpayModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/assests/razorpay icon.jpeg"
                  alt="Razorpay"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Razorpay Gateway API Setup</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase">
                    UPI &amp; CARDS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your official Razorpay Key ID, Key Secret, and VPA to allow tenants to pay rent instantly via PhonePe, GPay, Paytm &amp; Cards.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRazorpay} className="space-y-5 text-xs">
              
              {/* Environment Radio Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  API Environment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRazorpayEnvMode("live")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      razorpayEnvMode === "live"
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Live Production</div>
                      <div className="text-[10px] text-slate-500 font-mono">rzp_live_...</div>
                    </div>
                    {razorpayEnvMode === "live" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRazorpayEnvMode("test")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      razorpayEnvMode === "test"
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Test Sandbox Mode</div>
                      <div className="text-[10px] text-slate-500 font-mono">rzp_test_...</div>
                    </div>
                    {razorpayEnvMode === "test" && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Key ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Razorpay Key ID *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Found in Razorpay Dashboard &gt; API Keys</span>
                </label>
                <input
                  type="text"
                  required
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder={razorpayEnvMode === "live" ? "rzp_live_9a8B7c6D5e4F3g" : "rzp_test_9a8B7c6D5e4F3g"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Key Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Razorpay Key Secret *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Private authentication key</span>
                </label>
                <div className="relative">
                  <input
                    type={showRazorpaySecret ? "text" : "password"}
                    required
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Merchant VPA / UPI ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Merchant VPA / UPI ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Direct UPI QR settlement</span>
                </label>
                <input
                  type="text"
                  value={razorpayMerchantVpa}
                  onChange={(e) => setRazorpayMerchantVpa(e.target.value)}
                  placeholder="e.g. rentawas@razorpay or management@icici"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Webhook Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Webhook Secret (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Verifies payment events</span>
                </label>
                <input
                  type="text"
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  placeholder="whsec_rzp_98765432"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Webhook Setup Instructions Note Box */}
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2 text-blue-950">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Razorpay Webhook Setup Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://rentawas.com/api/webhooks/razorpay");
                      toast("Webhook URL copied to clipboard!", "success");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-blue-700 hover:text-blue-900 font-extrabold text-[10px] rounded-lg border border-blue-200 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="font-mono text-[10px] text-blue-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-blue-200/90 flex items-center justify-between">
                  <span>https://rentawas.com/api/webhooks/razorpay</span>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[11px]">How to configure in Razorpay:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                    <li>Copy <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">https://rentawas.com/api/webhooks/razorpay</code></li>
                    <li>Open <strong>Razorpay Dashboard &gt; Settings &gt; Webhooks</strong></li>
                    <li>Paste the URL and select events: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">payment.captured</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">order.paid</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">payment.failed</code></li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {connectedMap.razorpay ? (
                  <button
                    type="button"
                    onClick={handleDisconnectRazorpay}
                    disabled={savingRazorpay}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingRazorpay}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                  >
                    {savingRazorpay ? (
                      <span>Saving &amp; Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save &amp; Connect Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Stripe Integration Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowStripeModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/assests/stripe icon.jpeg"
                  alt="Stripe"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Stripe Connect &amp; ACH Setup</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase">
                    GLOBAL &amp; ACH
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Configure your Stripe API Publishable Key &amp; Secret Key to process global credit/debit cards, ACH Direct Debit, Apple Pay, and Google Pay.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStripe} className="space-y-5 text-xs">
              
              {/* Environment Radio Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  API Environment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStripeEnvMode("live")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      stripeEnvMode === "live"
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Live Production</div>
                      <div className="text-[10px] text-slate-500 font-mono">pk_live_... / sk_live_...</div>
                    </div>
                    {stripeEnvMode === "live" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStripeEnvMode("test")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      stripeEnvMode === "test"
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Test Sandbox Mode</div>
                      <div className="text-[10px] text-slate-500 font-mono">pk_test_... / sk_test_...</div>
                    </div>
                    {stripeEnvMode === "test" && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Publishable Key Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Stripe Publishable Key *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Found in Stripe Dashboard &gt; API Keys</span>
                </label>
                <input
                  type="text"
                  required
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  placeholder={stripeEnvMode === "live" ? "pk_live_51M..." : "pk_test_51M..."}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Secret Key Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Stripe Secret Key *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Private server authentication key</span>
                </label>
                <div className="relative">
                  <input
                    type={showStripeSecret ? "text" : "password"}
                    required
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeSecret(!showStripeSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Signing Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Webhook Signing Secret (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Verifies Stripe signature</span>
                </label>
                <input
                  type="text"
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="whsec_1234567890abcdef..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Stripe Connect Account ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Stripe Connect Account ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Connected Merchant Account</span>
                </label>
                <input
                  type="text"
                  value={stripeConnectAccountId}
                  onChange={(e) => setStripeConnectAccountId(e.target.value)}
                  placeholder="e.g. acct_1M9x2kL0PqRst"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Webhook Setup Instructions Note Box */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2 text-indigo-950">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Stripe Webhook Setup Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://rentawas.com/api/webhooks/stripe");
                      toast("Stripe Webhook URL copied to clipboard!", "success");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-indigo-700 hover:text-indigo-900 font-extrabold text-[10px] rounded-lg border border-indigo-200 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="font-mono text-[10px] text-indigo-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-indigo-200/90 flex items-center justify-between">
                  <span>https://rentawas.com/api/webhooks/stripe</span>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[11px]">How to configure in Stripe:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                    <li>Copy <code className="bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded font-mono">https://rentawas.com/api/webhooks/stripe</code></li>
                    <li>Open <strong>Stripe Dashboard &gt; Developers &gt; Webhooks &gt; Add Endpoint</strong></li>
                    <li>Paste the URL and select events: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">payment_intent.succeeded</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">invoice.paid</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">charge.failed</code></li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {connectedMap.stripe ? (
                  <button
                    type="button"
                    onClick={handleDisconnectStripe}
                    disabled={savingStripe}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingStripe}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                  >
                    {savingStripe ? (
                      <span>Saving &amp; Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save &amp; Connect Stripe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PayPal Integration Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowPaypalModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/assests/paypal icon.svg"
                  alt="PayPal"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">PayPal &amp; Venmo Commerce API Setup</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-100 text-sky-800 uppercase">
                    GLOBAL WALLETS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your PayPal REST API Client ID, Client Secret, and Merchant Email to process international tenant payments and Venmo transfers.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePaypal} className="space-y-5 text-xs">
              
              {/* Environment Radio Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  API Environment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaypalEnvMode("live")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paypalEnvMode === "live"
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Live Production</div>
                      <div className="text-[10px] text-slate-500 font-mono">api-3t.paypal.com</div>
                    </div>
                    {paypalEnvMode === "live" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaypalEnvMode("test")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paypalEnvMode === "test"
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Sandbox Mode</div>
                      <div className="text-[10px] text-slate-500 font-mono">api-m.sandbox.paypal.com</div>
                    </div>
                    {paypalEnvMode === "test" && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Client ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal REST Client ID *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Found in PayPal Developer &gt; Apps</span>
                </label>
                <input
                  type="text"
                  required
                  value={paypalClientId}
                  onChange={(e) => setPaypalClientId(e.target.value)}
                  placeholder="e.g. A21AA...or Sandbox Client ID"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              {/* Client Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal Client Secret *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Private authentication key</span>
                </label>
                <div className="relative">
                  <input
                    type={showPaypalSecret ? "text" : "password"}
                    required
                    value={paypalClientSecret}
                    onChange={(e) => setPaypalClientSecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPaypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Merchant Business Email Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal Merchant Account Email (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">For payout routing</span>
                </label>
                <input
                  type="email"
                  value={paypalMerchantEmail}
                  onChange={(e) => setPaypalMerchantEmail(e.target.value)}
                  placeholder="e.g. billing@grandregency.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              {/* Webhook ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal Webhook ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">17-character Webhook ID</span>
                </label>
                <input
                  type="text"
                  value={paypalWebhookId}
                  onChange={(e) => setPaypalWebhookId(e.target.value)}
                  placeholder="e.g. 8AB1234567890CDEF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              {/* Webhook Setup Instructions Note Box */}
              <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2 text-sky-950">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-600" />
                    <span>PayPal Webhook Setup Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://rentawas.com/api/webhooks/paypal");
                      toast("PayPal Webhook URL copied to clipboard!", "success");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-sky-700 hover:text-sky-900 font-extrabold text-[10px] rounded-lg border border-sky-200 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="font-mono text-[10px] text-sky-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-sky-200/90 flex items-center justify-between">
                  <span>https://rentawas.com/api/webhooks/paypal</span>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[11px]">How to configure in PayPal:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                    <li>Copy <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded font-mono">https://rentawas.com/api/webhooks/paypal</code></li>
                    <li>Open <strong>PayPal Developer Portal &gt; My Apps &amp; Credentials &gt; Webhooks &gt; Add Webhook</strong></li>
                    <li>Paste the URL and select events: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">PAYMENT.CAPTURE.COMPLETED</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">CHECKOUT.ORDER.APPROVED</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">PAYMENT.CAPTURE.DENIED</code></li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {connectedMap.paypal ? (
                  <button
                    type="button"
                    onClick={handleDisconnectPaypal}
                    disabled={savingPaypal}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingPaypal}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                  >
                    {savingPaypal ? (
                      <span>Saving &amp; Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save &amp; Connect PayPal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
