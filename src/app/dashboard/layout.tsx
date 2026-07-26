"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Zap, 
  FileText, 
  Wrench, 
  TrendingUp, 
  Settings, 
  CreditCard,
  HelpCircle,
  Bell, 
  Search, 
  Plus, 
  ChevronDown, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Receipt,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Laptop,
  Copy,
  AlertTriangle
} from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);

  const [activeProperty, setActiveProperty] = useState("The Regent - Wing A (24 Units)");
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic user profile & workspace active plan
  const [activePlan, setActivePlan] = useState("Pro Plan");
  const [userProfile, setUserProfile] = useState({
    name: "Alexander Wright",
    email: "alexander.wright@rentawas.com",
    role: "Portfolio Owner",
    initials: "AW",
  });

  useEffect(() => {
    async function loadWorkspacePlan() {
      try {
        const res = await fetch("/api/workspace?wid=1");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.plan) {
            const pKey = json.data.plan;
            setActivePlan(pKey === "enterprise" ? "Enterprise Plan" : pKey === "pro" ? "Pro Plan" : "Starter Plan");
          }
        }
      } catch (err) {
        console.warn("Workspace plan fetch error:", err);
      }
    }
    loadWorkspacePlan();
  }, []);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.fullName || user.email?.split("@")[0] || "Alexander Wright";
          const emailStr = user.email || "alexander.wright@rentawas.com";
          const roleStr = user.user_metadata?.role === "tenant" ? "Tenant Resident" : "Portfolio Owner";
          
          const nameParts = fullName.trim().split(" ");
          const initials = nameParts.length >= 2 
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
            : fullName.substring(0, 2).toUpperCase();

          setUserProfile({
            name: fullName,
            email: emailStr,
            role: roleStr,
            initials: initials || "AW",
          });
        }
      } catch (err) {
        console.error("Auth profile fetch error:", err);
      }
    }
    loadUserData();
  }, []);

  // Click Outside Listener for Profile Dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  // Global Keyboard Shortcut: Ctrl + K or Cmd + K to trigger search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Viewport width detection (< 1000px unavailable screen, < 1200px collapsed sidebar)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1000) {
        setIsScreenTooSmall(true);
        setIsCollapsed(true);
      } else {
        setIsScreenTooSmall(false);
        if (width < 1200) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
        }
      }
    };

    handleResize(); // Initial check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Properties & Units", href: "/dashboard/properties", icon: Building2 },
    { name: "Rent Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "AI Documents", href: "/dashboard/leases", icon: FileText, spark: true },
    { name: "Tenants & Health", href: "/dashboard/tenants", icon: Users },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench, count: 3 },
    { name: "Property Expenses", href: "/dashboard/expenses", icon: Receipt },
    { name: "Workspace Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Plans & Billing", href: "/dashboard/billing", icon: CreditCard, badge: "PRO" },
    { name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  ];

  const properties = [
    "The Regent - Wing A (24 Units)",
    "Downtown Horizon Suites (18 Units)",
    "Oakwood Executive Residency (12 Units)",
    "Skyline Manor (8 Units)"
  ];

  const notifications = [
    { id: 1, title: "Autopilot Collection Success", desc: "Collected $4,200 from 3 tenants via Auto-Debit", time: "10m ago", icon: Zap, color: "text-emerald-500 bg-emerald-50" },
    { id: 2, title: "Maintenance Request #402", desc: "Plumbing issue reported in Unit 304 (Urgent)", time: "1h ago", icon: Wrench, color: "text-orange-500 bg-orange-50" },
    { id: 3, title: "Lease Expiring Soon", desc: "Unit 201 lease expires in 25 days. Draft renewal ready.", time: "3h ago", icon: FileText, color: "text-purple-500 bg-purple-50" },
  ];

  // Render Full Page Notice when screen width is below 1000px
  if (isScreenTooSmall) {
    return (
      <div className="min-h-screen w-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6 sm:p-10 font-sans relative overflow-hidden select-none">
        
        {/* Ambient Glow Effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#141A26] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Brand Logo Header */}
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.png" alt="RentAwas Logo" width={40} height={40} className="h-10 w-auto" />
            <span 
              className="text-2xl font-extrabold tracking-tight font-cormorant" 
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              <span className="text-white">Rent</span>
              <span className="text-[#FF6B00]">Awas</span>
            </span>
          </div>

          {/* Graphic Icon Display */}
          <div className="relative w-20 h-20 mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-[#FF6B00] shadow-inner">
            <Monitor className="w-10 h-10" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full border-2 border-[#141A26]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          {/* Headline & Explanation */}
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Desktop Screen Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              As of now, we are not available for small screen sizes under <strong className="text-amber-400">1000px</strong>.
            </p>
          </div>

          {/* Notice Box */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-left text-xs space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Recommended Resolution</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              RentAwas Landlord Mission Control requires a laptop or desktop computer (<strong className="text-white">≥ 1000px width</strong>) for property floor plan telemetry and financial ledgers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText("https://app.rentawas.com");
                toast("Desktop Portal URL copied to clipboard!", "success");
              }}
              className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Desktop Portal Link</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* Mobile Top Header Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <Image src="/logo.png" alt="RentAwas" width={32} height={32} className="h-8 w-auto" />
          <span 
            className="text-xl font-extrabold font-cormorant" 
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            <span className="text-[#0B132B]">Rent</span>
            <span className="text-[#FF6B00]">Awas</span>
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Dark Backdrop Overlay for Mobile Drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-200"
        />
      )}

      {/* Collapsible Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Brand Logo Header */}
          <div className={`p-4 border-b border-slate-800 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/" className="flex items-center gap-2 group truncate">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={36}
                height={36}
                className="h-8 w-auto object-contain shrink-0 group-hover:opacity-90 transition-opacity"
              />
              {!isCollapsed && (
                <span 
                  className="text-xl font-extrabold tracking-tight text-white font-cormorant truncate"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  <span className="text-white">Rent</span>
                  <span className="text-[#FF6B00]">Awas</span>
                </span>
              )}
            </Link>
          </div>

          {/* Property Selector Switcher */}
          {!isCollapsed ? (
            <div className="p-4 relative">
              <button
                onClick={() => setShowPropertyMenu(!showPropertyMenu)}
                className="w-full bg-[#141A26] hover:bg-[#1A2234] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="truncate">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-orange-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Active Portfolio
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{activeProperty}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
              </button>

              {/* Property Menu Overlay */}
              {showPropertyMenu && (
                <div className="absolute top-full left-4 right-4 mt-1 bg-[#141A26] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                  {properties.map((prop, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveProperty(prop);
                        setShowPropertyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeProperty === prop ? "bg-[#FF6B00] text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {prop}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-slate-800 flex items-center justify-center text-orange-400" title={activeProperty}>
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative group cursor-pointer ${
                    isActive
                      ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:text-white hover:bg-[#141A26]"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {!isCollapsed && item.spark && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      item.badge === "AUTO" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {!isCollapsed && item.count && (
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">

          {/* User Profile & Logout */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} pt-1`}>
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6B00] to-amber-400 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userProfile.initials}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{userProfile.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userProfile.role}</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <Link href="/login" title="Log Out" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Right Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
        {/* Fixed Top Desktop Header Bar */}
        <header className="bg-white border-b border-slate-200/80 shrink-0 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Desktop Sidebar Toggle Switch */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-[#FF6B00]" /> : <PanelLeftClose className="w-5 h-5 text-slate-500" />}
          </button>

          {/* Global Search Command Trigger Bar */}
          <div 
            onClick={() => setShowSearchModal(true)}
            className="relative flex-1 max-w-md cursor-pointer group"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
            <div className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-500 flex items-center justify-between group-hover:bg-white group-hover:border-slate-300 transition-all">
              <span className="truncate">Search properties, residents, maintenance...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-500 rounded shadow-2xs">
                <span className="text-[9px]">Ctrl</span> K
              </kbd>
            </div>
          </div>

          {/* Actions & Notifications */}
          <div className="flex items-center gap-3">

            {/* Active Plan Badge before Profile Icon */}
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-[#FF6B00] transition-all cursor-pointer group shrink-0"
              title="View Subscription Plan Details"
            >
              <Zap className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">{activePlan}</span>
            </Link>

            {/* Profile Menu Trigger & Dropdown */}
            <div className="relative" ref={showProfileMenu ? profileMenuRef : null}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-[#0B132B] text-white font-extrabold text-xs flex items-center justify-center shadow-xs hover:ring-2 hover:ring-[#FF6B00] transition-all cursor-pointer"
              title={userProfile.name}
            >
              {userProfile.initials}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-2 z-50 space-y-1 font-sans animate-in fade-in duration-150">
                {/* User Summary Header */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs truncate max-w-[160px]">{userProfile.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#FF6B00] text-white uppercase shrink-0">
                      {userProfile.role.includes("Owner") ? "PRO" : "TENANT"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{userProfile.email}</div>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* Options List */}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Workspace Settings</span>
                </Link>

                <Link
                  href="/dashboard/billing"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Plans & Subscription</span>
                </Link>

                <Link
                  href="/dashboard/support"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Help & Support</span>
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log Out</span>
                </Link>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* Global Search Modal Command Palette (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

    </div>
  );
}
