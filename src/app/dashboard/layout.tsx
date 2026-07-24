"use client";

import { useState } from "react";
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
  Bell, 
  Search, 
  Plus, 
  ChevronDown, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProperty, setActiveProperty] = useState("The Regent - Wing A");
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Properties & Units", href: "/dashboard/properties", icon: Building2 },
    { name: "Autopilot Rent", href: "/dashboard/payments", icon: Zap, badge: "AUTO" },
    { name: "AI Lease Architect", href: "/dashboard/leases", icon: FileText, spark: true },
    { name: "Tenants & Health", href: "/dashboard/tenants", icon: Users },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench, count: 3 },
    { name: "Yield & Analytics", href: "/dashboard/analytics", icon: TrendingUp },
    { name: "Workspace Settings", href: "/dashboard/settings", icon: Settings },
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <Image src="/logo.png" alt="RentAwas" width={36} height={36} className="h-8 w-auto" />
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
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Stationary Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={42}
                height={42}
                className="h-9 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
              <span 
                className="text-2xl font-extrabold tracking-tight text-white font-cormorant"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                <span className="text-white">Rent</span>
                <span className="text-[#FF6B00]">Awas</span>
              </span>
            </Link>
          </div>

          {/* Property Selector Switcher */}
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
                      setActiveProperty(prop.split(" (")[0]);
                      setShowPropertyMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      activeProperty === prop.split(" (")[0]
                        ? "bg-[#FF6B00] text-white font-bold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{prop}</span>
                    {activeProperty === prop.split(" (")[0] && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                      : "text-slate-300 hover:bg-[#141A26] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 uppercase tracking-widest border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.spark && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  )}
                  {item.count && (
                    <span className="w-5 h-5 rounded-full bg-orange-500/30 border border-orange-400/40 text-orange-200 text-[10px] font-bold flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & System Status */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
          {/* Autopilot Quick Status Card */}
          <div className="bg-[#141A26] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <IconAutopilotRent className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Autopilot Engine</div>
                <div className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6B00] to-amber-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AW
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Alexander Wright</div>
                <div className="text-[10px] text-slate-400 truncate">Portfolio Owner</div>
              </div>
            </div>
            <Link href="/login" title="Log Out" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Right Main Content Column - Scrollbar positioned at far right edge of browser screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
        {/* Fixed Top Desktop Header Bar */}
        <header className="bg-white border-b border-slate-200/80 shrink-0 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, tenants, leases, or tickets (Press / to search)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
            />
          </div>

          {/* Actions & Notifications */}
          <div className="flex items-center gap-3">
            {/* Quick Action Button */}
            <Link
              href="/dashboard/leases"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold transition-all shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lease</span>
            </Link>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B00] ring-2 ring-white" />
              </button>

              {/* Notification Overlay */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
                    <span className="text-[10px] font-bold text-[#FF6B00] cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => {
                      const NIcon = n.icon;
                      return (
                        <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start">
                          <div className={`p-2 rounded-lg shrink-0 ${n.color}`}>
                            <NIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{n.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">{n.time}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick User Avatar */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0B132B] text-white font-bold text-xs flex items-center justify-center border border-slate-300">
                AW
              </div>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

    </div>
  );
}
