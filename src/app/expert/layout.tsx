"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  FileCheck,
  FileText,
  DollarSign,
  Star,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import LogoutAnimation from "@/components/LogoutAnimation";

// Inner component that uses useSearchParams — must be inside <Suspense>
function ExpertSidebarNav({
  expertNavItems,
  setSidebarOpen,
}: {
  expertNavItems: { id: string; name: string; href: string; icon: any; badge?: string }[];
  setSidebarOpen: (v: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "assignments";

  return (
    <nav className="space-y-1 pt-1">
      {expertNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          (item.id === "assignments" &&
            (currentTab === "assignments" ||
              currentTab === "jobs" ||
              !searchParams.get("tab"))) ||
          item.id === currentTab;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              isActive
                ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-[#141A26]"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
            <span className="truncate flex-1">{item.name}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function ExpertPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [activeExpertId, setActiveExpertId] = useState<string>("");
  const [expertEmail, setExpertEmail] = useState<string>("");
  const [expertName, setExpertName] = useState("Rahul");
  const [expertTrade, setExpertTrade] = useState("Plumbing & Water Systems");
  const [expertRating, setExpertRating] = useState("4.9");

  // Fetch expert profile info for sidebar & header
  useEffect(() => {
    async function loadExpertProfile() {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { user } } = await supabase.auth.getUser();

        let param = "";
        if (user?.email) {
          param = `?email=${encodeURIComponent(user.email)}`;
        } else if (typeof window !== "undefined" && localStorage.getItem("rentawas_expert_email")) {
          param = `?email=${encodeURIComponent(localStorage.getItem("rentawas_expert_email")!)}`;
        } else if (typeof window !== "undefined" && localStorage.getItem("rentawas_expert_id")) {
          param = `?id=${encodeURIComponent(localStorage.getItem("rentawas_expert_id")!)}`;
        }

        const res = await fetch(`/api/admin/experts${param}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.experts) && json.experts.length > 0) {
          const exp = json.experts[0];
          if (exp.id) setActiveExpertId(exp.id);
          if (exp.email) setExpertEmail(exp.email);
          if (exp.name) setExpertName(exp.name);
          if (exp.trade) setExpertTrade(exp.trade);
          if (exp.rating != null) setExpertRating(Number(exp.rating).toFixed(1));
          if (exp.isAvailable !== undefined) setIsOnline(exp.isAvailable !== false);
        }
      } catch (err) {
        console.warn("Failed to load expert profile in layout:", err);
      }
    }
    loadExpertProfile();
  }, []);

  // Fetch initial availability status from DB for this active expert
  useEffect(() => {
    async function loadAvailability() {
      try {
        const expId = activeExpertId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const expEmail = expertEmail || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_email") : "");
        const query = expId ? `?id=${encodeURIComponent(expId)}` : expEmail ? `?email=${encodeURIComponent(expEmail)}` : "";
        const res = await fetch(`/api/expert/availability${query}`);
        const json = await res.json();
        if (res.ok && json.isAvailable !== undefined) {
          setIsOnline(json.isAvailable);
        }
      } catch (err) {
        console.warn("Failed to fetch expert availability:", err);
      }
    }
    loadAvailability();
  }, [activeExpertId, expertEmail]);

  // Fetch real average rating for layout header
  useEffect(() => {
    async function loadRealRating() {
      try {
        const expId = activeExpertId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const expEmail = expertEmail || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_email") : "");
        const params = new URLSearchParams();
        if (expId) params.set("expertId", expId);
        if (expEmail) params.set("expertEmail", expEmail);
        const query = params.toString() ? `?${params.toString()}` : "";

        const res = await fetch(`/api/expert-reviews${query}`);
        const json = await res.json();
        if (res.ok && json.averageRating != null) {
          setExpertRating(Number(json.averageRating).toFixed(1));
        }
      } catch (err) {
        console.warn("Failed to load real rating in layout:", err);
      }
    }
    loadRealRating();
  }, [activeExpertId, expertEmail]);

  const handleToggleOnline = async () => {
    const nextVal = !isOnline;
    setIsOnline(nextVal);
    try {
      const expId = activeExpertId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
      const expEmail = expertEmail || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_email") : "");

      await fetch("/api/expert/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: expId || undefined,
          email: expEmail || undefined,
          isAvailable: nextVal,
        }),
      });

      if (expId || expEmail) {
        await fetch("/api/admin/experts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: expId || undefined,
            email: expEmail || undefined,
            isAvailable: nextVal,
            status: nextVal ? "Active & Verified" : "Offline / Busy",
          }),
        });
      }
    } catch (err) {
      console.warn("Failed to update expert availability in DB:", err);
    }
  };

  const expertNavItems = [
    { id: "assignments", name: "My Active Assignments", href: "/expert/dashboard?tab=assignments", icon: Briefcase, badge: "LIVE" },
    { id: "overview", name: "Overview & Analytics", href: "/expert/dashboard?tab=overview", icon: LayoutDashboard },
    { id: "reports", name: "My Documents", href: "/expert/dashboard?tab=reports", icon: FileText },
    { id: "earnings", name: "Earnings & Payouts", href: "/expert/dashboard?tab=earnings", icon: DollarSign },
    { id: "reviews", name: "Client Reviews & Rating", href: "/expert/dashboard?tab=reviews", icon: Star },
    { id: "profile", name: "Expert Profile & Rates", href: "/expert/dashboard?tab=profile", icon: Settings },
  ];

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      router.push("/login");
    }, 1800);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex font-sans">
      {/* Logout Animation Overlay */}
      <LogoutAnimation isLoggingOut={isLoggingOut} userRole="user" />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Expert Left Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-full bg-[#0B132B] border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 overflow-y-auto shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <Link href="/expert/dashboard" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={36}
                height={36}
                className="h-8 w-auto object-contain shrink-0 group-hover:opacity-90 transition-opacity"
              />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-cormorant flex items-center gap-1.5">
                  <span className="text-white">Rent</span>
                  <span className="text-[#FF6B00]">Awas</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">EXPERT</span>
                </span>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Expert Portal</div>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Expert Online Availability Card */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booking Status</span>
              <button
                type="button"
                onClick={handleToggleOnline}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOnline ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isOnline ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-black">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              <span className={isOnline ? "text-emerald-400 font-extrabold" : "text-slate-400"}>
                {isOnline ? "Available for New Bookings" : "Offline / Busy"}
              </span>
            </div>
          </div>

          {/* Nav Items — wrapped in Suspense because ExpertSidebarNav uses useSearchParams */}
          <Suspense
            fallback={
              <nav className="space-y-1 pt-1">
                {expertNavItems.map((item) => (
                  <div key={item.id} className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </nav>
            }
          >
            <ExpertSidebarNav expertNavItems={expertNavItems} setSidebarOpen={setSidebarOpen} />
          </Suspense>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] font-extrabold text-xs flex items-center justify-center shrink-0">
                {expertName ? expertName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "EX"}
              </div>
              <div className="truncate">
                <div className="text-xs font-extrabold text-white truncate">{expertName}</div>
                <div className="text-[10px] font-bold text-[#FF6B00] truncate">{expertTrade}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 text-slate-900">
        {/* Top Navbar Header */}
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-extrabold text-slate-900">RentAwas Expert Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Ratings: <strong className="text-slate-900">{expertRating} ⭐</strong></span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content - Independent Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
