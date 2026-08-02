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
  X,
  Mail,
  Phone,
  Check,
  Filter,
  AlertCircle,
  Loader2,
  KeyRound,
  UserCheck
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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

  // Tab State: "overview" | "support" | "subscriptions" | "contact" | "feedback"
  const [activeTab, setActiveTab] = useState<
    "overview" | "support" | "subscriptions" | "contact" | "feedback"
  >("overview");

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

  const handleTabSwitch = (tab: "overview" | "support" | "subscriptions" | "contact" | "feedback") => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("ALL");
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
          priority: "High",
          isTenant: false,
        }),
      });

      if (res.ok) {
        toast("Sample support ticket created!", "success");
        fetchAdminData();
      } else {
        toast("Failed to create sample ticket", "error");
      }
    } catch (err) {
      toast("Error creating sample ticket", "error");
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* ADMIN TOP NAVIGATION HEADER */}
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <span className="h-4 w-px bg-slate-700 mx-1" />
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loadingData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-[#FF6B00]" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>admin@anshapps.com</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION BAR */}
      <div className="bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-xs font-extrabold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview &amp; Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "support"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Support Desk</span>
              {stats.openSupportTickets > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {stats.openSupportTickets}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "subscriptions"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Workspaces &amp; Plans</span>
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "contact"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact Inquiries</span>
              {stats.pendingContactInquiries > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-black text-[10px]">
                  {stats.pendingContactInquiries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>User Feedback</span>
            </button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Workspaces</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{stats.totalWorkspaces || 0}</div>
                <p className="text-[11px] text-slate-400">Registered Landlords &amp; Property Managers</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Support Tickets</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-400">{stats.openSupportTickets || 0}</div>
                <p className="text-[11px] text-slate-400">Out of {stats.totalSupportTickets || 0} total tickets</p>
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

    </main>
  );
}
