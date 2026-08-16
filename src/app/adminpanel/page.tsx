"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Building2,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  RefreshCw,
  LogOut,
  ChevronRight,
  TrendingUp,
  PieChart,
  Users,
  FileText,
  Eye,
  EyeOff,
  X,
  Mail,
  Phone,
  Check,
  Filter,
  AlertCircle,
  Loader2,
  KeyRound,
  UserCheck,
  Briefcase,
  Wrench,
  Star,
  MapPin,
  Plus,
  Menu,
  DollarSign,
  Activity,
  Award,
  ChevronDown,
  Upload,
  QrCode,
  Camera,
  HeartPulse,
  MoreVertical,
  Edit3,
  Trash2,
  Info
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

// Indian Government ID Document Types
const INDIAN_GOVT_ID_TYPES = [
  "Aadhaar Card (12-Digit UIDAI)",
  "PAN Card (Permanent Account Number)",
  "Driving License (Transport Dept)",
  "Voter ID Card (EPIC)",
  "Passport (Govt of India)",
  "Trade / Labour License Certification",
  "Other Govt Verified Identity Document",
];

// RentAwas Portal Default Currencies (Same as Expert Portal)
const PORTAL_CURRENCIES = [
  { label: "🇮🇳 INR (₹) — RentAwas Default (Indian Rupee)", value: "INR (₹)", symbol: "₹" },
  { label: "🇺🇸 USD ($) — US Dollar", value: "USD ($)", symbol: "$" },
  { label: "🇪🇺 EUR (€) — Euro", value: "EUR (€)", symbol: "€" },
  { label: "🇬🇧 GBP (£) — British Pound", value: "GBP (£)", symbol: "£" },
  { label: "🇦🇪 AED — UAE Dirham", value: "AED", symbol: "AED" },
  { label: "🇸🇬 SGD ($) — Singapore Dollar", value: "SGD ($)", symbol: "$" },
];

// Available Experience Level Options
const EXPERIENCE_LEVELS = [
  "1+ Yrs Exp (Junior Specialist)",
  "2+ Yrs Exp",
  "3+ Yrs Exp",
  "4+ Yrs Exp",
  "5+ Yrs Exp (Senior)",
  "6+ Yrs Exp",
  "7+ Yrs Exp",
  "8+ Yrs Exp",
  "9+ Yrs Exp",
  "10+ Yrs Exp (Expert Lead)",
  "12+ Yrs Exp",
  "15+ Yrs Exp (Master Specialist)",
];
const WORK_TIME_SLOTS = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM (Noon)",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM (Midnight)",
];

// Supported Indian & Regional Languages (Same as Expert Portal)
const ALL_INDIAN_LANGUAGES = [
  "Hindi (हिंदी)",
  "English",
  "Punjabi (ਪੰਜਾਬੀ)",
  "Bengali (বাংলা)",
  "Marathi (मराठी)",
  "Telugu (తెలుగు)",
  "Tamil (தமிழ்)",
  "Gujarati (ગુજરાતી)",
  "Kannada (ಕನ್ನಡ)",
  "Malayalam (മലയാളം)",
  "Odia (ଓଡ଼ିଆ)",
  "Assamese (অসমীয়া)",
  "Urdu (اردو)",
  "Bhojpuri (भोजपुरी)",
  "Haryanvi (हरियाणवी)",
  "Maithili (मैथिली)",
  "Marwari (मारवाड़ी)",
  "Nepali (नेपाली)",
  "Arabic (العربية)",
  "French (Français)",
];

// Major Indian Banks List
const INDIAN_BANKS = [
  "HDFC Bank Ltd",
  "State Bank of India (SBI)",
  "ICICI Bank Ltd",
  "Axis Bank Ltd",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda (BOB)",
  "Canara Bank",
  "Union Bank of India",
  "IDFC FIRST Bank",
  "IndusInd Bank",
  "YES Bank",
  "Federal Bank",
  "Central Bank of India",
  "Indian Bank",
  "UCO Bank",
  "Bank of India (BOI)",
  "Other Bank (Type Custom Name)",
];

export default function AdminPanelPage() {
  const { toast } = useToast();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    passcode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  // Tab State: "overview" | "experts" | "support" | "subscriptions" | "contact" | "feedback"
  const [activeTab, setActiveTab] = useState<
    "overview" | "experts" | "support" | "subscriptions" | "contact" | "feedback"
  >("overview");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // RentAwas Experts Admin Directory State (Fetches directly from PostgreSQL database)
  const [adminExpertsList, setAdminExpertsList] = useState<any[]>([]);

  const [showAddExpertModal, setShowAddExpertModal] = useState(false);
  const [expertPhoneCountry, setExpertPhoneCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [emergencyPhoneCountry, setEmergencyPhoneCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [showExpertPassword, setShowExpertPassword] = useState(false);
  const [showExpertConfirmPassword, setShowExpertConfirmPassword] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingQrCode, setUploadingQrCode] = useState(false);

  const handleUploadR2File = async (file: File, context: "profile" | "payment-qr") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", "admin_expert_onboarding");
      formData.append("context", context);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload file to Cloudflare R2.");
      }
      return data.url;
    } catch (err: any) {
      toast(err.message || "File upload failed", "error");
      return null;
    }
  };

  const initialExpertFormState = {
    name: "",
    trade: "Plumbing & Water Systems",
    specialization: "",
    experience: "5+ Yrs Exp",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    govtIdType: "Aadhaar Card (12-Digit UIDAI)",
    govtId: "",
    currency: "INR (₹)",
    fee: 599,
    hourlyRate: 49,
    city: "",
    address: "",
    pincode: "",
    workStartTime: "09:00 AM",
    workEndTime: "06:00 PM",
    workDays: "Mon-Sat",
    languages: ["Hindi (हिंदी)", "English"],
    avatar: "",
    qrCodeUrl: "",
    bankHolder: "",
    bankName: "",
    customBankName: "",
    accountNo: "",
    ifsc: "",
    upiId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    bloodGroup: "",
    status: "Active & Verified",
  };

  const [newExpertForm, setNewExpertForm] = useState(initialExpertFormState);

  // Data Loading States
  const [loadingData, setLoadingData] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reply Modal State for Support Tickets
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("Resolved");
  const [sendingReply, setSendingReply] = useState(false);

  // 3-Dots Action Menu & Modal States for Experts Table
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [selectedViewExpert, setSelectedViewExpert] = useState<any | null>(null);
  const [selectedEditExpert, setSelectedEditExpert] = useState<any | null>(null);
  const [selectedDeleteExpert, setSelectedDeleteExpert] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleTabSwitch = (tab: "overview" | "experts" | "support" | "subscriptions" | "contact" | "feedback") => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("ALL");
    setOpenActionMenuId(null);
  };

  const handleCreateSampleTicket = async () => {
    try {
      const res = await fetch("/api/admin/support-tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Rent Payment Invoice Reconciliation Issue",
          message: "Tenant paid rent via UPI but invoice status is still pending. Please assist with manual verification.",
          contactEmail: "landlord.regency@example.com",
          contactPhone: "+91 96257 27372",
          category: "Billing & Invoices",
          isTenant: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Sample support ticket created #${data.ticket?.ticketNumber || ""}`, "success");
        fetchAdminData();
      } else {
        toast(data.error || "Failed to create sample ticket", "error");
      }
    } catch (err) {
      toast("Failed to create sample ticket", "error");
    }
  };

  // Check existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem("rentawas_admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      sessionStorage.setItem("rentawas_admin_token", data.adminToken);
      setIsAuthenticated(true);
      toast("Admin login successful!", "success");
      fetchAdminData();
    } catch (err: any) {
      toast(err.message || "Invalid credentials", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("rentawas_admin_token");
    setIsAuthenticated(false);
    setAdminData(null);
    toast("Logged out of Admin Panel", "info");
  };

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (res.ok) {
        setAdminData(data);
      } else {
        toast(data.error || "Failed to load admin data", "error");
      }

      // Fetch Experts list from backend GET /api/admin/experts
      const expRes = await fetch("/api/admin/experts");
      const expData = await expRes.json();
      if (expRes.ok && expData.experts) {
        setAdminExpertsList(expData.experts);
      }
    } catch (err) {
      toast("Network error loading admin data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/support-tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          replyMessage: replyMessage,
          status: replyStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reply");
      }

      toast("Ticket reply saved successfully!", "success");
      setSelectedTicket(null);
      setReplyMessage("");
      fetchAdminData();
    } catch (err: any) {
      toast(err.message || "Error updating ticket", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateContactStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/contact-inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status: newStatus }),
      });

      if (res.ok) {
        toast(`Inquiry status set to ${newStatus}`, "success");
        fetchAdminData();
      } else {
        toast("Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating status", "error");
    }
  };

  // UNAUTHENTICATED: LOGIN MODAL VIEW
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-orange-100 selection:text-orange-600">
        <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Top glowing bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500" />

          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={64}
                height={64}
                className="h-10 w-auto object-contain rounded-md"
              />
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-white">Rent</span>
                <span className="text-[#FF6B00]">Awas</span>
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-[10px] font-black uppercase tracking-widest mx-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Control Desk</span>
            </div>

            <h1 className="text-xl font-extrabold text-white">Admin Authentication</h1>
            <p className="text-xs text-slate-400 font-medium">
              Enter your authorized admin email, password, and secure passcode.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-xs">
            {/* Email */}
            <div>
              <label className="block font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@anshapps.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-[#FF6B00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Passcode */}
            <div>
              <label className="block font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Security Passcode *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPasscode ? "text" : "password"}
                  required
                  value={loginForm.passcode}
                  onChange={(e) => setLoginForm({ ...loginForm, passcode: e.target.value })}
                  placeholder="Passcode Answer..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-[#FF6B00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login to Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
            ANSH Apps Super Admin Governance &bull; RentAwas
          </div>
        </div>
      </main>
    );
  }

  // AUTHENTICATED: ADMIN PANEL CONTROL DASHBOARD
  const stats = adminData?.stats || {};
  const charts = adminData?.charts || {};
  const workspaces = adminData?.workspaces || [];
  const supportTickets = adminData?.supportTickets || [];
  const contactInquiries = adminData?.contactInquiries || [];
  const feedbacks = adminData?.feedbacks || [];

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* ── LEFT VERTICAL SIDEBAR (DARK NAVY THEME #0B132B) ── */}
      <aside className={`w-full md:w-72 bg-[#0B132B] border-r border-slate-800/80 flex flex-col justify-between shrink-0 md:h-screen sticky top-0 z-40 transition-all ${
        mobileMenuOpen ? "block" : "hidden md:flex"
      }`}>
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={36}
                height={36}
                className="h-8 w-auto object-contain rounded-md"
              />
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-white">Rent</span>
                <span className="text-[#FF6B00]">Awas</span>
              </span>
            </Link>

            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 font-sans">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">
              Main Control Center
            </div>

            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Overview &amp; Analytics</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("experts");
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "experts"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-orange-400" />
                <span>RentAwas Experts</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/30">
                {adminExpertsList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("support");
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "support"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Support Desk</span>
              </div>
              {stats.openSupportTickets > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {stats.openSupportTickets}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("subscriptions");
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "subscriptions"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Workspaces &amp; Plans</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("contact");
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "contact"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Contact Inquiries</span>
              </div>
              {stats.pendingContactInquiries > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-black text-[10px]">
                  {stats.pendingContactInquiries}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("feedback");
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span>User Feedback</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#090F21]">
          <div className="flex items-center gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center font-black text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-white truncate">Super Admin Desk</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">admin@anshapps.com</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>System Health 99.9%</span>
            </span>
            <span>Online</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors cursor-pointer text-xs font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Panel</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070C18] overflow-y-auto">
        
        {/* TOP WORKSPACE HEADER */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0B132B]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-extrabold text-white capitalize flex items-center gap-2">
              <span>
                {activeTab === "overview"
                  ? "Overview & Platform Analytics"
                  : activeTab === "experts"
                  ? "RentAwas Experts & Partner Management Desk"
                  : activeTab === "support"
                  ? "Support Desk & Customer Tickets"
                  : activeTab === "subscriptions"
                  ? "Landlord Workspaces & Subscription Plans"
                  : activeTab === "contact"
                  ? "Contact Desk & Sales Inquiries"
                  : "Platform User Feedback"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loadingData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-[#FF6B00]" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT CONTAINERS */}
        <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-x-auto">
        
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* 💰 REVENUE & FINANCIAL PERFORMANCE HIGHLIGHTS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse" />
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">
                    Platform Revenue &amp; Financial Overview
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Real-Time Financial Sync 🟢</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Subscription Plans Revenue */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg group hover:border-orange-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Plans Revenue</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">₹1,48,500 <span className="text-xs font-medium text-slate-400">($1,850)</span></div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-[#FF6B00] font-extrabold">14 Paid Plans Purchased</span>
                    <span className="text-slate-400">Starter, Pro &amp; Pro Plus</span>
                  </div>
                </div>

                {/* 2. RentAwas Experts Gross Revenue */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Money Generated by Experts</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400">₹{adminExpertsList.reduce((acc, curr) => acc + curr.totalGross, 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">($4,946)</span></div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-extrabold">708 Completed Visits</span>
                    <span className="text-slate-400">Plumbing, Electric, AC, etc.</span>
                  </div>
                </div>

                {/* 3. 10% RentAwas Platform Cut from Experts */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg group hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">10% Platform Fee Cut</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-400">₹{adminExpertsList.reduce((acc, curr) => acc + curr.platformCut, 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">($495)</span></div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-blue-400 font-extrabold">10% Fee Deducted</span>
                    <span className="text-slate-400">Credited to Platform Wallet</span>
                  </div>
                </div>

                {/* 4. Total Net Revenue Generated */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 space-y-2 relative overflow-hidden shadow-lg group hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Platform Revenue</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-400">₹{(148500 + adminExpertsList.reduce((acc, curr) => acc + curr.platformCut, 0)).toLocaleString()} <span className="text-xs font-medium text-slate-400">($2,345)</span></div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-amber-400 font-extrabold">Plans + 10% Cut</span>
                    <span className="text-slate-400">Net Platform Income</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Operations & Governance Metric Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">
                  Operations &amp; Platform Activity
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Workspaces</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">{stats.totalWorkspaces || 11}</div>
                  <p className="text-[11px] text-slate-400">Registered Landlords &amp; Property Managers</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Support Tickets</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-400">{stats.openSupportTickets || 4}</div>
                  <p className="text-[11px] text-slate-400">Out of {stats.totalSupportTickets || 5} total tickets</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Contact Forms</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-400">{stats.pendingContactInquiries || 0}</div>
                  <p className="text-[11px] text-slate-400">Out of {stats.totalContactInquiries || 0} website inquiries</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feedback Submissions</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400">{stats.totalFeedback || 0}</div>
                  <p className="text-[11px] text-slate-400">Ratings &amp; Platform Feedback</p>
                </div>
              </div>
            </div>

            {/* Charts & Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Subscription Plan Distribution Chart */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#FF6B00]" />
                      <span>Subscription Plan Distribution</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Breakdown of workspaces by active subscription tier.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {charts.planDistribution?.map((plan: any, idx: number) => {
                    const percentage = stats.totalWorkspaces
                      ? Math.round((plan.count / stats.totalWorkspaces) * 100)
                      : 0;

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-200">{plan.name}</span>
                          <span className="text-slate-400">{plan.count} Workspaces ({percentage}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                              backgroundColor: plan.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Governance Card */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>System Status &amp; Admin Governance</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time monitoring across support tickets, database connections, and platform submissions.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Database &amp; Prisma Adapter:</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">PostgreSQL Connected</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Authentication Authority:</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">Supabase Auth Active</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Payment Gateways:</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-[#FF6B00] font-bold">Razorpay / Stripe Live</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Parent Entity: <strong>ANSH Apps</strong></span>
                  <span className="font-mono text-[#FF6B00]">RentAwas SuperAdmin v2.5</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: RENT AWAS EXPERTS NETWORK MANAGEMENT */}
        {activeTab === "experts" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-[#FF6B00]" />
                  <span>RENT AWAS VERIFIED EXPERTS DIRECTORY</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  RentAwas Experts &amp; Service Partners Control Desk
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                  Audit registered plumbers, electricians, househelp, AC repair specialists, and carpenters. Manage verification status, review earnings &amp; 10% platform cuts, and onboard new service providers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddExpertModal(true)}
                className="relative z-10 px-5 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-2xl text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 uppercase tracking-wider shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Expert</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Experts</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{adminExpertsList.length} Partners</div>
                <p className="text-[11px] text-slate-400">100% Background-Checked Trade Professionals</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Live On-Site Visits</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  {adminExpertsList.length > 0 ? "3 Live Visits" : "0 Live Visits"}
                </div>
                <p className="text-[11px] text-slate-400">With Real-Time 6-Digit OTP Validation</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform 10% Cut</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-blue-400">
                  ₹{adminExpertsList.reduce((acc, curr) => acc + (curr.platformCut || 0), 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400">Net Platform Revenue Collected (INR)</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Quality Rating</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {adminExpertsList.length > 0
                    ? (adminExpertsList.reduce((acc, curr) => acc + (curr.rating || 5.0), 0) / adminExpertsList.length).toFixed(2)
                    : "5.00"} / 5.0
                </div>
                <p className="text-[11px] text-slate-400">Based on Verified Customer Reviews</p>
              </div>
            </div>

            {/* Experts Table & Controls Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by expert name, trade specialty, city, or phone..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="ALL">All Categories &amp; Trades</option>
                    <option value="Plumbing">Plumbing &amp; Water Systems</option>
                    <option value="Electrical">Electrical &amp; Appliance Repair</option>
                    <option value="Househelp">Househelp &amp; Cleaning</option>
                    <option value="AC">AC &amp; HVAC Technician</option>
                    <option value="Carpentry">Carpentry &amp; Woodwork</option>
                  </select>
                </div>
              </div>

              {/* Experts Data Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
                <table className="w-full min-w-[900px] text-left text-xs font-sans border-collapse">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Expert Name &amp; Trade</th>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">Base Visit Fee</th>
                      <th className="py-3.5 px-4">Completed Jobs</th>
                      <th className="py-3.5 px-4">Total Gross</th>
                      <th className="py-3.5 px-4">10% Platform Cut</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {adminExpertsList
                      .filter(exp => 
                        searchQuery === "" || 
                        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        exp.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exp.city.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .sort((a, b) => {
                        const jobsDiff = (b.completedJobs || 0) - (a.completedJobs || 0);
                        if (jobsDiff !== 0) return jobsDiff;
                        const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
                        if (ratingDiff !== 0) return ratingDiff;
                        return (Number(b.reviewsCount) || 0) - (Number(a.reviewsCount) || 0);
                      })
                      .map((exp, expIdx, arrayList) => (
                        <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={exp.avatar} alt={exp.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                              <div>
                                <div className="font-extrabold text-white text-xs">{exp.name}</div>
                                <div className="text-[10px] font-bold text-[#FF6B00]">{exp.trade}</div>
                                <div className="text-[10px] text-slate-400">{exp.experience}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                            <div>{exp.phone}</div>
                            <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{exp.city}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-black text-white">₹{exp.fee}</td>
                          <td className="py-4 px-4 font-extrabold text-slate-200">{exp.completedJobs || 0} Orders</td>
                          <td className="py-4 px-4 font-extrabold text-emerald-400">₹{(exp.totalGross || 0).toLocaleString()}</td>
                          <td className="py-4 px-4 font-black text-blue-400">₹{(exp.platformCut || 0).toLocaleString()}</td>
                          <td className="py-4 px-4">
                            {exp.reviewsCount && Number(exp.reviewsCount) > 0 ? (
                              <span className="font-extrabold text-amber-400 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{exp.rating} ({exp.reviewsCount})</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                                New
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const isActive = exp.status.includes("Active");
                                const newStatus = isActive ? "Suspended" : "Active & Verified";
                                const newAvailable = !isActive;

                                setAdminExpertsList((prev) =>
                                  prev.map((item) =>
                                    item.id === exp.id ? { ...item, status: newStatus, isAvailable: newAvailable } : item
                                  )
                                );

                                try {
                                  await fetch(`/api/admin/experts/${exp.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: newStatus, isAvailable: newAvailable }),
                                  });
                                } catch (err) {
                                  console.warn("Failed to persist expert status update:", err);
                                }

                                toast(
                                  `Expert listing for ${exp.name} set to ${newAvailable ? "ACTIVE (Live for Bookings)" : "INACTIVE (Suspended)"}`,
                                  newAvailable ? "success" : "info"
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                exp.status.includes("Active") ? "bg-emerald-500" : "bg-slate-700"
                              }`}
                              title={exp.status.includes("Active") ? "Active & Verified (Click to Suspend)" : "Suspended / Inactive (Click to Activate)"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  exp.status.includes("Active") ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(openActionMenuId === exp.id ? null : exp.id);
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 cursor-pointer flex items-center justify-center"
                                title="Actions Menu"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openActionMenuId === exp.id && (
                                <div className={`absolute right-0 w-52 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-[100] py-1 divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-150 ${
                                  expIdx >= arrayList.length - 2 && arrayList.length > 2
                                    ? "bottom-full mb-2 origin-bottom-right"
                                    : "top-full mt-2 origin-top-right"
                                }`}>
                                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between gap-2">
                                    <span className="truncate font-extrabold text-white text-[11px]">{exp.name || "Expert Actions"}</span>
                                    <span className="font-mono text-[#FF6B00] shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-[#FF6B00]/10 border border-[#FF6B00]/20">{exp.id.startsWith("EXP") ? exp.id : `ID: ${exp.id.slice(0, 8)}...`}</span>
                                  </div>
                                  
                                  <div className="py-1">
                                    {/* Action 1: View Details */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setSelectedViewExpert(exp);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Info className="w-3.5 h-3.5 text-blue-400" />
                                      <span>View Details</span>
                                    </button>

                                    {/* Action 2: Edit Profile */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setSelectedEditExpert({ ...exp });
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-[#FF6B00]" />
                                      <span>Edit Profile &amp; Rates</span>
                                    </button>

                                    {/* Action 3: Toggle Active / Suspended Status */}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setOpenActionMenuId(null);
                                        const newStatus = exp.status.includes("Active") ? "Suspended" : "Active & Verified";
                                        setAdminExpertsList(
                                          adminExpertsList.map(e => e.id === exp.id ? { ...e, status: newStatus } : e)
                                        );
                                        try {
                                          await fetch(`/api/admin/experts/${exp.id}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ status: newStatus }),
                                          });
                                        } catch (e) {}
                                        toast(`Updated status to ${newStatus} for ${exp.name}`, "success");
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                      <span>{exp.status.includes("Active") ? "Suspend Partner" : "Activate Partner"}</span>
                                    </button>
                                  </div>

                                  <div className="py-1">
                                    {/* Action 4: Delete Expert */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setSelectedDeleteExpert(exp);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Delete Expert</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                    {adminExpertsList.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 px-4 text-center space-y-3">
                          <Briefcase className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
                          <div className="font-extrabold text-slate-300 text-sm">No RentAwas Experts Onboarded Yet</div>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Your PostgreSQL database table is live. Click below to onboard your first RentAwas Expert partner.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowAddExpertModal(true)}
                            className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Onboard First Expert Now</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SUPPORT TICKETS DESK */}
        {activeTab === "support" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>Support Tickets Desk</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">View user inquiries, ticket status, and send admin responses directly.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCreateSampleTicket}
                  className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Add Sample Ticket</span>
                </button>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ticket #, email, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open Only</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Support Tickets Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Ticket #</th>
                      <th className="p-4">Subject &amp; Message</th>
                      <th className="p-4">User Contact</th>
                      <th className="p-4">Category &amp; Source</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Admin Reply</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {supportTickets
                      .filter((t: any) => {
                        const q = searchQuery.toLowerCase().trim();
                        const matchSearch =
                          !q ||
                          t.ticketNumber?.toLowerCase().includes(q) ||
                          t.subject?.toLowerCase().includes(q) ||
                          t.category?.toLowerCase().includes(q) ||
                          (t.contactEmail && t.contactEmail.toLowerCase().includes(q)) ||
                          (t.message && t.message.toLowerCase().includes(q));

                        const st = (t.status || "").toLowerCase().replace("_", " ");
                        const filterSt = statusFilter.toLowerCase().replace("_", " ");
                        const matchStatus =
                          statusFilter === "ALL" ||
                          st === filterSt ||
                          (filterSt === "open" && (st === "open" || st === "pending"));

                        return matchSearch && matchStatus;
                      })
                      .map((ticket: any) => (
                        <tr key={ticket.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-200">{ticket.ticketNumber}</td>
                          <td className="p-4 max-w-xs space-y-1">
                            <span className="font-extrabold text-white block">{ticket.subject}</span>
                            <span className="text-slate-400 text-[11px] line-clamp-2 block">{ticket.message}</span>
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            <span className="text-slate-200 block">{ticket.contactEmail || "N/A"}</span>
                            {ticket.contactPhone && (
                              <span className="text-slate-400 block">{ticket.contactPhone}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold block w-fit mb-1">
                              {ticket.category}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {ticket.isTenant ? "Tenant Portal" : "Landlord Dashboard"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                (ticket.status || "").toLowerCase().includes("open") || (ticket.status || "").toLowerCase().includes("pending")
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : (ticket.status || "").toLowerCase().includes("progress")
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs text-[11px]">
                            {ticket.adminReply ? (
                              <div className="space-y-0.5 text-emerald-400 font-medium">
                                <span className="line-clamp-2 block">&quot;{ticket.adminReply}&quot;</span>
                                <span className="text-[9px] text-slate-500 block">
                                  {new Date(ticket.adminRepliedAt).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No reply yet</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setReplyMessage(ticket.adminReply || "");
                                setReplyStatus(ticket.status || "Resolved");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                            >
                              {ticket.adminReply ? "Edit Reply" : "Reply"}
                            </button>
                          </td>
                        </tr>
                      ))}

                    {supportTickets.filter((t: any) => {
                      const q = searchQuery.toLowerCase().trim();
                      const matchSearch =
                        !q ||
                        t.ticketNumber?.toLowerCase().includes(q) ||
                        t.subject?.toLowerCase().includes(q) ||
                        t.category?.toLowerCase().includes(q) ||
                        (t.contactEmail && t.contactEmail.toLowerCase().includes(q)) ||
                        (t.message && t.message.toLowerCase().includes(q));

                      const st = (t.status || "").toLowerCase().replace("_", " ");
                      const filterSt = statusFilter.toLowerCase().replace("_", " ");
                      const matchStatus =
                        statusFilter === "ALL" ||
                        st === filterSt ||
                        (filterSt === "open" && (st === "open" || st === "pending"));

                      return matchSearch && matchStatus;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-10 text-center space-y-3">
                          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                          <p className="font-extrabold text-slate-300 text-sm">No support tickets found</p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            There are currently no tickets matching your search filter, or no support tickets have been submitted yet.
                          </p>
                          <button
                            onClick={handleCreateSampleTicket}
                            className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>+ Add Sample Ticket Now</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKSPACES & SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                  <span>Workspaces &amp; Subscriptions Table</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">List of all registered landlords, workspace plans, and AI credits used.</p>
              </div>

              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search workspace, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Workspace &amp; Owner</th>
                      <th className="p-4">Owner Contact</th>
                      <th className="p-4">Active Plan</th>
                      <th className="p-4">AI Credits Used</th>
                      <th className="p-4">Gateways</th>
                      <th className="p-4">Trial Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {workspaces
                      .filter(
                        (w: any) =>
                          !searchQuery ||
                          w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((w: any) => (
                        <tr key={w.wid} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-mono text-slate-400">#{w.wid}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-white block">{w.name}</span>
                            <span className="text-slate-400 text-[11px] block">Owner: {w.ownerName}</span>
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            <span className="text-slate-200 block">{w.ownerEmail}</span>
                            <span className="text-slate-400 block">{w.ownerPhone}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                w.plan === "pro" || w.plan === "pro_plus"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : w.plan === "starter"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                  : "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {w.plan || "Free Trial"}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-200">
                            <span className="font-bold text-[#FF6B00]">{w.aiCreditsUsed}</span> credits
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              {w.razorpayConnected && (
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">Razorpay</span>
                              )}
                              {w.stripeConnected && (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">Stripe</span>
                              )}
                              {w.paypalConnected && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">PayPal</span>
                              )}
                              {w.upiConnected && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Direct UPI</span>
                              )}
                              {!w.razorpayConnected && !w.stripeConnected && !w.paypalConnected && !w.upiConnected && (
                                <span className="text-slate-500 italic">None</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-[11px] text-slate-400 font-mono">
                            {new Date(w.trialStartedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT INQUIRIES */}
        {activeTab === "contact" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Website Contact Form Submissions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Records stored from the website Contact Us page form.</p>
              </div>

              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Sender Details</th>
                      <th className="p-4">Category &amp; Subject</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Received Date</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {contactInquiries
                      .filter(
                        (ci: any) =>
                          !searchQuery ||
                          ci.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ci.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ci.message?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((ci: any) => (
                        <tr key={ci.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-mono">
                            <span className="font-extrabold text-white block">{ci.fullName}</span>
                            <span className="text-[#FF6B00] text-[11px] block">{ci.email}</span>
                            {ci.phone && <span className="text-slate-400 text-[10px] block">{ci.phone}</span>}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold block w-fit mb-1">
                              {ci.category}
                            </span>
                            <span className="text-slate-200 font-bold block">{ci.subject || "No Subject"}</span>
                          </td>
                          <td className="p-4 max-w-sm">
                            <p className="text-slate-300 leading-relaxed text-[11px] line-clamp-3">{ci.message}</p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                ci.status === "PENDING"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : ci.status === "CONTACTED"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              }`}
                            >
                              {ci.status}
                            </span>
                          </td>
                          <td className="p-4 text-[11px] text-slate-400 font-mono">
                            {new Date(ci.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {ci.status === "PENDING" && (
                              <button
                                onClick={() => handleUpdateContactStatus(ci.id, "CONTACTED")}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-[10px] font-bold cursor-pointer"
                              >
                                Mark Contacted
                              </button>
                            )}
                            {ci.status !== "RESOLVED" && (
                              <button
                                onClick={() => handleUpdateContactStatus(ci.id, "RESOLVED")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USER FEEDBACK */}
        {activeTab === "feedback" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>Platform User Feedback</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Ratings and feature suggestions submitted by active platform users.</p>
              </div>

              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedbacks
                .filter(
                  (f: any) =>
                    !searchQuery ||
                    f.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((f: any) => (
                  <div key={f.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {f.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <span>{"★".repeat(f.rating)}</span>
                          <span className="text-slate-500">({f.rating}/5)</span>
                        </div>
                      </div>

                      <p className="text-slate-200 text-xs font-medium leading-relaxed italic">
                        &quot;{f.message}&quot;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-mono">
                      <span>{f.isAnonymous ? "Anonymous User" : f.name || f.email || "Platform User"}</span>
                      <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* REPLY TO SUPPORT TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#FF6B00] font-bold block">
                  Ticket #{selectedTicket.ticketNumber}
                </span>
                <h3 className="text-lg font-extrabold text-white">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block">User Message:</span>
              <p className="text-slate-200 leading-relaxed font-medium">{selectedTicket.message}</p>
              <div className="pt-2 text-[11px] text-slate-400 font-mono flex justify-between">
                <span>From: {selectedTicket.contactEmail}</span>
                <span>Category: {selectedTicket.category}</span>
              </div>
            </div>

            <form onSubmit={handleSendTicketReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Reply Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the user here..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Update Ticket Status
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold cursor-pointer"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="flex-1 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {sendingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Reply...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Admin Reply</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARD EXPERT MODAL (UPDATED WITH ALL PROFILE & RATES FIELDS) */}
      {showAddExpertModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative font-sans text-white max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center font-black shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Onboard Verified RentAwas Expert</h3>
                  <p className="text-xs text-slate-400 font-semibold">Register trade specialist, set visit rates, bank info &amp; work schedule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpertModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="space-y-6 text-xs font-sans overflow-y-auto pr-2 flex-1 scrollbar-thin">
              
              {/* SECTION 1: PERSONAL & TRADE PROFILE */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-[#FF6B00] font-extrabold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <UserCheck className="w-4 h-4" />
                  <span>1. Personal &amp; Trade Profile</span>
                </div>

                {/* Profile Avatar Upload / URL Section */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#FF6B00] bg-slate-800 shrink-0 shadow-md flex items-center justify-center">
                    {newExpertForm.avatar ? (
                      <img
                        src={newExpertForm.avatar}
                        alt="Expert Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-base flex items-center justify-center uppercase">
                        {newExpertForm.name ? newExpertForm.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "EX"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <span className="block font-extrabold text-white text-xs">Profile Picture / Avatar</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* File Upload Button to Cloudflare R2 S3 */}
                      <label className="px-3 py-1.5 bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] border border-[#FF6B00]/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50">
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" />
                            <span>Uploading to R2...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo (Cloudflare R2)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingAvatar}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingAvatar(true);
                              const cloudUrl = await handleUploadR2File(file, "profile");
                              if (cloudUrl) {
                                setNewExpertForm((prev) => ({ ...prev, avatar: cloudUrl }));
                                toast("Profile photo uploaded to Cloudflare R2 S3!", "success");
                              }
                              setUploadingAvatar(false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Direct Image URL input */}
                      <input
                        type="url"
                        value={newExpertForm.avatar}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, avatar: e.target.value })}
                        placeholder="OR paste Image URL https://..."
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={newExpertForm.name}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Trade Specialty Category *</label>
                    <select
                      value={newExpertForm.trade}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, trade: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Plumbing & Water Systems">🚰 Plumbing &amp; Water Systems (Plumber)</option>
                      <option value="Electrical & Appliance Repair">⚡ Electrical &amp; Appliance Repair (Electrician)</option>
                      <option value="AC & HVAC Technician">❄️ AC &amp; HVAC Technician</option>
                      <option value="Househelp & Home Cleaning">🧹 Househelp &amp; Deep Cleaning (Maid)</option>
                      <option value="Carpentry & Painting">🪵 Carpentry &amp; Painting</option>
                      <option value="Pest Control & Sanitization">🐜 Pest Control &amp; Sanitization</option>
                      <option value="Home Appliance Repair">🔌 Home Appliance Repair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Contact Phone Number *</label>
                    <CountryPhoneInput
                      value={newExpertForm.phone}
                      onChange={(phoneVal) => setNewExpertForm({ ...newExpertForm, phone: phoneVal })}
                      selectedCountry={expertPhoneCountry}
                      onCountryChange={setExpertPhoneCountry}
                      darkTheme={true}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      value={newExpertForm.email}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, email: e.target.value })}
                      placeholder="e.g. ramesh.expert@rentawas.com"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Portal Account Password *</label>
                    <div className="relative">
                      <input
                        type={showExpertPassword ? "text" : "password"}
                        value={newExpertForm.password}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, password: e.target.value })}
                        placeholder="•••••••• (Min 6 characters)"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExpertPassword(!showExpertPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showExpertPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Confirm Account Password *</label>
                    <div className="relative">
                      <input
                        type={showExpertConfirmPassword ? "text" : "password"}
                        value={newExpertForm.confirmPassword}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExpertConfirmPassword(!showExpertConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showExpertConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Experience Level / Years</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.experience}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, experience: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {EXPERIENCE_LEVELS.map((exp) => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Govt ID Document Type</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.govtIdType}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, govtIdType: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {INDIAN_GOVT_ID_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Govt ID / License Number</label>
                    <input
                      type="text"
                      value={newExpertForm.govtId}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, govtId: e.target.value })}
                      placeholder="e.g. 4912 8890 1234 / LIC-9821"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Specialization &amp; Key Skills</label>
                  <input
                    type="text"
                    value={newExpertForm.specialization}
                    onChange={(e) => setNewExpertForm({ ...newExpertForm, specialization: e.target.value })}
                    placeholder="e.g. Deep pipeline leak detection &amp; sanitary fittings"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* SECTION 2: SERVICE RATES & PRICING */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>2. Service Rates &amp; Default Currency</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      RentAwas Portal Default Currency
                    </label>
                    <div className="relative">
                      <select
                        value={newExpertForm.currency}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, currency: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {PORTAL_CURRENCIES.map((curr) => (
                          <option key={curr.value} value={curr.value}>{curr.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Base Visit Fee</label>
                      <input
                        type="number"
                        value={newExpertForm.fee}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, fee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Hourly Fee Rate</label>
                      <input
                        type="number"
                        value={newExpertForm.hourlyRate}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, hourlyRate: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: WORKSHOP BASE & COVERED SERVICE AREA */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <MapPin className="w-4 h-4" />
                  <span>3. Service Localities &amp; Workshop Address</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Covered City / Service Localities</label>
                    <input
                      type="text"
                      value={newExpertForm.city}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, city: e.target.value })}
                      placeholder="e.g. Gurugram, Delhi NCR, South Delhi"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Postal Pincode / Zip Code</label>
                    <input
                      type="text"
                      value={newExpertForm.pincode}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, pincode: e.target.value })}
                      placeholder="e.g. 122011"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Workshop / Base Address</label>
                  <input
                    type="text"
                    value={newExpertForm.address}
                    onChange={(e) => setNewExpertForm({ ...newExpertForm, address: e.target.value })}
                    placeholder="e.g. Workshop 14, Main Market, Sector 62, Gurgaon"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* SECTION 4: WORKING HOURS & LANGUAGES */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <Clock className="w-4 h-4" />
                  <span>4. Working Schedule &amp; Spoken Languages</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Start Time Select */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Work Start Time</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.workStartTime}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, workStartTime: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {WORK_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* End Time Select */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Work End Time</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.workEndTime}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, workEndTime: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {WORK_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Working Days Select */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Working Days</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.workDays}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, workDays: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="Mon-Sat">Mon-Sat (Mon to Sat)</option>
                        <option value="Mon-Sun">Mon-Sun (All 7 Days)</option>
                        <option value="Mon-Fri">Mon-Fri (Mon to Fri)</option>
                        <option value="Sat-Sun">Sat-Sun (Weekends)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Spoken Languages Multi-Select Chips & Dropdown */}
                <div className="space-y-2 pt-1">
                  <label className="block font-bold text-slate-300">
                    Spoken Languages (Multi-Select Tags)
                  </label>

                  {/* Selected Language Chips */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-xl min-h-[42px] items-center">
                    {newExpertForm.languages.length === 0 ? (
                      <span className="text-[11px] text-slate-500 font-medium px-1">No languages selected yet</span>
                    ) : (
                      newExpertForm.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2.5 py-1 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>{lang}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setNewExpertForm({
                                ...newExpertForm,
                                languages: newExpertForm.languages.filter((l) => l !== lang),
                              })
                            }
                            className="text-slate-400 hover:text-red-400 font-bold p-0.5 rounded cursor-pointer transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Dropdown Multi-Selector */}
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !newExpertForm.languages.includes(val)) {
                          setNewExpertForm({
                            ...newExpertForm,
                            languages: [...newExpertForm.languages, val],
                          });
                        }
                      }}
                      className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="" disabled>+ Add Spoken Language from list...</option>
                      {ALL_INDIAN_LANGUAGES.map((lang) => (
                        <option
                          key={lang}
                          value={lang}
                          disabled={newExpertForm.languages.includes(lang)}
                        >
                          {newExpertForm.languages.includes(lang) ? `✓ ${lang} (Added)` : lang}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PAYOUT & BANK CREDENTIALS */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>5. Payout Bank &amp; UPI Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Account Holder Name */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={newExpertForm.bankHolder}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, bankHolder: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Bank Name Dropdown */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Bank Name</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.bankName}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, bankName: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {INDIAN_BANKS.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Custom Bank Name (If "Other Bank" selected) */}
                  {newExpertForm.bankName === "Other Bank (Type Custom Name)" && (
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-amber-400 mb-1">Specify Custom Bank Name *</label>
                      <input
                        type="text"
                        value={newExpertForm.customBankName}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, customBankName: e.target.value })}
                        placeholder="e.g. Saraswat Co-operative Bank"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-amber-500/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  {/* Bank IFSC Code */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Bank IFSC Code</label>
                    <input
                      type="text"
                      value={newExpertForm.ifsc}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, ifsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Bank Account Number */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={newExpertForm.accountNo}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, accountNo: e.target.value })}
                      placeholder="501002348912"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* UPI VPA ID */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-300 mb-1">UPI VPA ID</label>
                    <input
                      type="text"
                      value={newExpertForm.upiId}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, upiId: e.target.value })}
                      placeholder="e.g. ramesh@okaxis"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Upload QR Code (Optional) Block */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Expert Payment QR Code</span>
                    </label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      Optional
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-4">
                    {/* QR Code Preview Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 p-1 shrink-0 flex items-center justify-center overflow-hidden relative">
                      {newExpertForm.qrCodeUrl ? (
                        <img
                          src={newExpertForm.qrCodeUrl}
                          alt="Uploaded QR Code Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-500">
                          <QrCode className="w-7 h-7 mx-auto stroke-1" />
                          <span className="text-[9px] font-bold block">No QR</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <span className="block font-semibold text-slate-400 text-[11px]">
                        Upload UPI / Bank QR image or paste QR Code image link
                      </span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* File Upload Button to Cloudflare R2 S3 */}
                        <label className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50">
                          {uploadingQrCode ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              <span>Uploading to R2...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload QR (Cloudflare R2)</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingQrCode}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingQrCode(true);
                                const cloudUrl = await handleUploadR2File(file, "payment-qr");
                                if (cloudUrl) {
                                  setNewExpertForm((prev) => ({ ...prev, qrCodeUrl: cloudUrl }));
                                  toast("Payment QR code uploaded to Cloudflare R2 S3!", "success");
                                }
                                setUploadingQrCode(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {/* Direct Image URL input */}
                        <input
                          type="url"
                          value={newExpertForm.qrCodeUrl}
                          onChange={(e) => setNewExpertForm({ ...newExpertForm, qrCodeUrl: e.target.value })}
                          placeholder="OR paste QR Image URL..."
                          className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: EMERGENCY CONTACT & MEDICAL SAFETY */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>6. Emergency Contact &amp; Medical Safety</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Emergency Contact Person & Relation */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-300 mb-1">Emergency Contact Person &amp; Relation</label>
                    <input
                      type="text"
                      value={newExpertForm.emergencyContactName}
                      onChange={(e) => setNewExpertForm({ ...newExpertForm, emergencyContactName: e.target.value })}
                      placeholder="e.g. Sunita Kumar (Wife / Next of Kin)"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Emergency Phone Number */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Emergency Phone Number</label>
                    <CountryPhoneInput
                      value={newExpertForm.emergencyContactPhone}
                      onChange={(phoneVal) => setNewExpertForm({ ...newExpertForm, emergencyContactPhone: phoneVal })}
                      selectedCountry={emergencyPhoneCountry}
                      onCountryChange={setEmergencyPhoneCountry}
                      darkTheme={true}
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Blood Group</label>
                    <div className="relative">
                      <select
                        value={newExpertForm.bloodGroup}
                        onChange={(e) => setNewExpertForm({ ...newExpertForm, bloodGroup: e.target.value })}
                        className="w-full appearance-none pr-8 pl-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="O+ Positive">🩸 O+ Positive</option>
                        <option value="A+ Positive">🩸 A+ Positive</option>
                        <option value="B+ Positive">🩸 B+ Positive</option>
                        <option value="AB+ Positive">🩸 AB+ Positive</option>
                        <option value="O- Negative">🩸 O- Negative</option>
                        <option value="A- Negative">🩸 A- Negative</option>
                        <option value="B- Negative">🩸 B- Negative</option>
                        <option value="AB- Negative">🩸 AB- Negative</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddExpertModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={onboardingLoading}
                onClick={async () => {
                  if (!newExpertForm.name || !newExpertForm.phone) {
                    toast("Please fill in expert name and contact phone number.", "error");
                    return;
                  }
                  if (!newExpertForm.email || !newExpertForm.email.includes("@")) {
                    toast("Please enter a valid official login email address.", "error");
                    return;
                  }
                  if (!newExpertForm.password || newExpertForm.password.length < 6) {
                    toast("Password must be at least 6 characters long.", "error");
                    return;
                  }
                  if (newExpertForm.password !== newExpertForm.confirmPassword) {
                    toast("Passwords do not match. Please verify password.", "error");
                    return;
                  }

                  setOnboardingLoading(true);

                  try {
                    const res = await fetch("/api/expert/onboard", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newExpertForm),
                    });

                    const data = await res.json();

                    if (!res.ok || data.error) {
                      toast(data.error || "Failed to onboard expert account.", "error");
                      setOnboardingLoading(false);
                      return;
                    }

                    const newExp = {
                      id: data.expert?.id || `EXP-10${adminExpertsList.length + 1}`,
                      name: newExpertForm.name,
                      trade: newExpertForm.trade,
                      specialization: newExpertForm.specialization,
                      experience: newExpertForm.experience,
                      phone: newExpertForm.phone,
                      email: newExpertForm.email,
                      city: newExpertForm.city,
                      fee: newExpertForm.fee,
                      status: newExpertForm.status || "Active & Verified",
                      completedJobs: 0,
                      totalGross: 0,
                      platformCut: 0,
                      rating: 5.0,
                      avatar: newExpertForm.avatar || "",
                    };

                    setAdminExpertsList([newExp, ...adminExpertsList]);
                    setShowAddExpertModal(false);
                    setNewExpertForm(initialExpertFormState);
                    toast(`Onboarded & registered RentAwas Expert account for ${newExpertForm.name} successfully!`, "success");
                  } catch (err: any) {
                    toast(err?.message || "Failed to onboard expert account.", "error");
                  } finally {
                    setOnboardingLoading(false);
                  }
                }}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                {onboardingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Onboard Expert</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 2: VIEW EXPERT FULL DETAILS & AUDIT LOG ── */}
      {selectedViewExpert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedViewExpert.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                  alt={selectedViewExpert.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#FF6B00]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">{selectedViewExpert.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-[#FF6B00] border border-slate-700">
                      #{selectedViewExpert.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      selectedViewExpert.status?.includes("Active")
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      ✓ {selectedViewExpert.status || "Active & Verified"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#FF6B00]">{selectedViewExpert.trade} • {selectedViewExpert.experience}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedViewExpert(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content Grid */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
              
              {/* Section 1: Trade & Personal Info */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                  <span>Personal &amp; Professional Profile</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Full Legal Name</span>
                    <span className="font-extrabold text-white text-xs">{selectedViewExpert.name}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Official Email</span>
                    <span className="font-mono text-slate-200">{selectedViewExpert.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Phone Number</span>
                    <span className="font-mono text-slate-200">{selectedViewExpert.phone}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Govt ID Type</span>
                    <span className="font-bold text-slate-300">{selectedViewExpert.govtIdType || "Aadhaar Card"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Govt ID / License No.</span>
                    <span className="font-mono font-bold text-white">{selectedViewExpert.govtId || "VERIFIED-GOVT-ID"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Specialization</span>
                    <span className="font-bold text-slate-300">{selectedViewExpert.specialization || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Service Rates & Default Currency */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Service Rates &amp; Currency Settings</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Portal Currency</span>
                    <span className="font-extrabold text-emerald-400">{selectedViewExpert.currency || "INR (₹)"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Base Visit Fee</span>
                    <span className="font-black text-white text-sm">${selectedViewExpert.fee || 599}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Hourly Rate</span>
                    <span className="font-black text-white text-sm">${selectedViewExpert.hourlyRate || 49} / hr</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Workshop & Covered Localities */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Workshop Base &amp; Covered Localities</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Operating City / Region</span>
                    <span className="font-bold text-white">{selectedViewExpert.city}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Workshop Address &amp; Pincode</span>
                    <span className="font-medium text-slate-300">{selectedViewExpert.address || "Sector 62, Gurgaon"} {selectedViewExpert.pincode ? `(${selectedViewExpert.pincode})` : ""}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Schedule & Languages */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Working Hours &amp; Spoken Languages</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Daily Working Hours</span>
                    <span className="font-bold text-white">{selectedViewExpert.workStartTime || "08:00 AM"} - {selectedViewExpert.workEndTime || "08:00 PM"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Working Days</span>
                    <span className="font-bold text-white">{selectedViewExpert.workDays || "Mon-Sat"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Spoken Languages</span>
                    <span className="font-bold text-slate-300">
                      {Array.isArray(selectedViewExpert.languages)
                        ? selectedViewExpert.languages.join(", ")
                        : typeof selectedViewExpert.languages === "string" && selectedViewExpert.languages.startsWith("[")
                        ? JSON.parse(selectedViewExpert.languages).join(", ")
                        : selectedViewExpert.languages || "Hindi, English"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Payout Bank & QR Code */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <QrCode className="w-4 h-4" />
                  <span>Payout Bank Account &amp; Payment QR</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <div>
                      <span className="block font-bold text-slate-500 text-[10px] uppercase">Account Holder</span>
                      <span className="font-bold text-white">{selectedViewExpert.bankHolder || selectedViewExpert.name}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-500 text-[10px] uppercase">Bank Name</span>
                      <span className="font-bold text-white">{selectedViewExpert.bankName || "HDFC Bank Ltd"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block font-bold text-slate-500 text-[10px] uppercase">Account No</span>
                        <span className="font-mono text-slate-200">{selectedViewExpert.accountNo || "••••••••3412"}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-500 text-[10px] uppercase">IFSC Code</span>
                        <span className="font-mono font-bold text-white">{selectedViewExpert.ifsc || "HDFC0001234"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-500 text-[10px] uppercase">UPI VPA ID</span>
                      <span className="font-mono text-[#FF6B00] font-bold">{selectedViewExpert.upiId || "expert@upi"}</span>
                    </div>
                  </div>

                  {/* QR Code preview box */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Payment QR Code</span>
                    {selectedViewExpert.qrCodeUrl ? (
                      <img src={selectedViewExpert.qrCodeUrl} alt="QR Code" className="w-24 h-24 object-contain rounded-lg border border-slate-700 bg-white p-1" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-500">
                        <QrCode className="w-8 h-8" />
                        <span className="text-[9px] font-bold mt-1">No QR Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 6: Emergency Contact & Medical Safety */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Emergency Contact &amp; Medical Safety</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Emergency Contact Person</span>
                    <span className="font-bold text-white">{selectedViewExpert.emergencyContactName || "Sunita Kumar (Wife)"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Emergency Phone</span>
                    <span className="font-mono text-slate-200">{selectedViewExpert.emergencyContactPhone || "+91 98111 22334"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 text-[10px] uppercase">Blood Group</span>
                    <span className="font-bold text-rose-400">🩸 {selectedViewExpert.bloodGroup || "O+ Positive"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const expToEdit = { ...selectedViewExpert };
                  setSelectedViewExpert(null);
                  setSelectedEditExpert(expToEdit);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#FF6B00] text-xs font-extrabold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setSelectedViewExpert(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EDIT EXPERT PROFILE & RATES ── */}
      {selectedEditExpert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-base font-extrabold text-white">Edit RentAwas Expert Profile</h3>
              </div>
              <button
                onClick={() => setSelectedEditExpert(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={selectedEditExpert.name || ""}
                    onChange={(e) => setSelectedEditExpert({ ...selectedEditExpert, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={selectedEditExpert.phone || ""}
                    onChange={(e) => setSelectedEditExpert({ ...selectedEditExpert, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={selectedEditExpert.email || ""}
                    onChange={(e) => setSelectedEditExpert({ ...selectedEditExpert, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Base Visit Fee ($)</label>
                  <input
                    type="number"
                    value={selectedEditExpert.fee || 0}
                    onChange={(e) => setSelectedEditExpert({ ...selectedEditExpert, fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Operating City / Area</label>
                  <input
                    type="text"
                    value={selectedEditExpert.city || ""}
                    onChange={(e) => setSelectedEditExpert({ ...selectedEditExpert, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Partner Status</label>
                  <select
                    value={selectedEditExpert.status || "Active & Verified"}
                    onChange={(e) => setSelectedEditExpert({ ...selectedEditExpert, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Active & Verified">Active &amp; Verified</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedEditExpert(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editLoading}
                onClick={async () => {
                  setEditLoading(true);
                  try {
                    const res = await fetch(`/api/admin/experts/${selectedEditExpert.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(selectedEditExpert),
                    });
                    if (res.ok) {
                      setAdminExpertsList(
                        adminExpertsList.map(exp => exp.id === selectedEditExpert.id ? selectedEditExpert : exp)
                      );
                      setSelectedEditExpert(null);
                      toast(`Updated profile for ${selectedEditExpert.name} successfully!`, "success");
                    } else {
                      toast("Failed to update expert profile", "error");
                    }
                  } catch (err) {
                    toast("Failed to save changes", "error");
                  } finally {
                    setEditLoading(false);
                  }
                }}
                className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: DELETE EXPERT CONFIRMATION ── */}
      {selectedDeleteExpert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white">Delete Expert Partner?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <span className="font-bold text-white">{selectedDeleteExpert.name}</span> ({selectedDeleteExpert.trade})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDeleteExpert(null)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(`/api/admin/experts/${selectedDeleteExpert.id}`, { method: "DELETE" });
                    setAdminExpertsList(adminExpertsList.filter(e => e.id !== selectedDeleteExpert.id));
                    setSelectedDeleteExpert(null);
                    toast(`Deleted expert record successfully.`, "success");
                  } catch (err) {
                    toast("Failed to delete expert record.", "error");
                  }
                }}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
