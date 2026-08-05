"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  FileText, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Home,
  Megaphone,
  MessageSquare,
  User,
  ShieldCheck,
  Zap,
  Building,
  Heart,
  HelpCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import LogoutAnimation from "@/components/LogoutAnimation";
import { hasActiveRentPaymentChannels } from "@/lib/paymentMethods";
import { useTenantMe, useTenantWorkspace } from "@/hooks/useTenantMe";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [canPayRent, setCanPayRent] = useState(false);

  const { data: tenantMe } = useTenantMe();
  const { data: workspace } = useTenantWorkspace(tenantMe?.workspaceId);

  const [tenantProfile, setTenantProfile] = useState<{
    name: string;
    email: string;
    unitNumber: string;
    propertyName: string;
    propertyAddress: string;
    monthlyRent: number;
    initials: string;
    maintenancesCount: number;
    documentsCount: number;
  }>({
    name: "Resident",
    email: "tenant@rentawas.com",
    unitNumber: "Unit 302",
    propertyName: "The Regent",
    propertyAddress: "1420 5th Ave, Seattle WA",
    monthlyRent: 3200,
    initials: "RS",
    maintenancesCount: 0,
    documentsCount: 0,
  });

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Signout error:", err);
    }
    setTimeout(() => {
      router.push("/login");
    }, 1300);
  };

  useEffect(() => {
    if (!tenantMe) return;
    const d = tenantMe;
    const nameParts = String(d.name || "Resident").trim().split(" ");
    const init =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : String(d.name || "TN").substring(0, 2).toUpperCase();
    const realDocsCount =
      (Array.isArray(d.documents) ? d.documents.length : 0) +
      (d.govIdUrl ? 1 : 0) +
      (d.leaseDocUrl ? 1 : 0);

    setTenantProfile({
      name: d.name,
      email: d.email,
      unitNumber: d.unitNumber,
      propertyName: d.propertyName,
      propertyAddress: d.propertyAddress,
      monthlyRent: d.monthlyRent || 3200,
      initials: init || "TN",
      maintenancesCount: Array.isArray(d.maintenances) ? d.maintenances.length : 0,
      documentsCount: realDocsCount,
    });
  }, [tenantMe]);

  useEffect(() => {
    setCanPayRent(hasActiveRentPaymentChannels(workspace));
  }, [workspace]);

  const navItems = [
    { name: "My Resident Overview", href: "/tenant/dashboard", icon: LayoutDashboard },
    { name: "Pay Rent & Receipts", href: "/tenant/payments", icon: CreditCard, badge: "DUE SOON" },
    { name: "My Wishlist", href: "/tenant/wishlist", icon: Heart },
    { name: "Messages", href: "/tenant/messages", icon: MessageSquare },
    { name: "Maintenance Requests", href: "/tenant/maintenance", icon: Wrench },
    { name: "My Documents", href: "/tenant/documents", icon: FileText },
    { name: "Building Notices", href: "/tenant/notices", icon: Megaphone },
    { name: "RentAwas Help & Support", href: "/tenant/support", icon: HelpCircle },
  ];

  const notifications = [
    { id: 1, title: "Rent Due Reminder", desc: `Rent ($${tenantProfile.monthlyRent.toLocaleString()}) is due soon. Auto-debit scheduled.`, time: "2h ago", icon: CreditCard, color: "text-amber-500 bg-amber-50" },
    { id: 2, title: "Plumber Vendor Dispatched", desc: "Ticket #402 update: Vendor arriving today between 2-4 PM.", time: "5h ago", icon: Wrench, color: "text-purple-500 bg-purple-50" },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-purple-100 selection:text-purple-600">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-40">
        <Link href="/tenant/dashboard" className="flex items-center gap-1.5">
          <Image src="/logo.png" alt="RentAwas" width={36} height={36} className="h-8 w-auto" />
          <span 
            className="text-xl font-extrabold font-cormorant" 
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            <span className="text-[#0B132B]">Rent</span>
            <span className="text-[#FF6B00]">Awas</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-bold uppercase">Resident</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Stationary Left Sidebar Navigation for Tenant */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="RentAwas Logo"
                width={42}
                height={42}
                className="h-9 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
              <div>
                <span 
                  className="text-2xl font-extrabold tracking-tight text-white font-cormorant block leading-none"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  <span className="text-white">Rent</span>
                  <span className="text-[#FF6B00]">Awas</span>
                </span>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mt-0.5">
                  Resident Portal
                </span>
              </div>
            </Link>
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
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 uppercase tracking-widest border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Bar */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {tenantProfile.initials}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{tenantProfile.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{tenantProfile.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} title="Log Out" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Right Main Content Column - Far-right scrollbar */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${pathname.startsWith("/tenant/messages") ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}>
        {/* Sticky Top Header & Notice Banner Container */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shrink-0">
          <header className="px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Resident Portal</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Lease Active
              </span>
            </div>

            <div className="flex items-center gap-3">
              {canPayRent ? (
                <Link
                  href="/tenant/payments?pay=1"
                  className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl transition-all shadow-xs uppercase tracking-wider"
                >
                  Pay Rent (${(tenantProfile.monthlyRent || 3200).toLocaleString()})
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="No payment channels enabled by your landlord yet"
                  className="px-3.5 py-1.5 bg-[#FF6B00] text-white text-xs font-bold rounded-xl shadow-xs uppercase tracking-wider opacity-50 cursor-not-allowed"
                >
                  Pay Rent (${(tenantProfile.monthlyRent || 3200).toLocaleString()})
                </button>
              )}
            </div>
          </header>
        </div>

        {/* Scrollable Resident Main Pane */}
        <main className={pathname.startsWith("/tenant/messages") ? "flex-1 p-0 min-h-0 h-full overflow-hidden flex flex-col" : "flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8"}>
          {children}
        </main>
      </div>

      <LogoutAnimation isLoggingOut={isLoggingOut} userRole="resident" />
    </div>
  );
}
