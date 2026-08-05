"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  Lock,
  Receipt,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Laptop,
  Copy,
  AlertTriangle,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Star,
  DollarSign,
  MapPin,
  MessageSquare,
  Bot,
  Send,
  Loader2,
  Heart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import LogoutAnimation from "@/components/LogoutAnimation";
import AiCreditsExhaustedModal from "@/components/AiCreditsExhaustedModal";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import ListPropertyModal from "@/components/ui/ListPropertyModal";
import PaywallModal from "@/components/ui/PaywallModal";
import { checkPlanQuota, canAccessMessages, MESSAGES_UPGRADE_MESSAGE } from "@/lib/planLimits";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { invalidateAiUsage } from "@/lib/queryInvalidation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Confirm-delete modal state for listing cards
  const [showDeleteListingModal, setShowDeleteListingModal] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);

  const [activeProperty, setActiveProperty] = useState("The Regent - Wing A (24 Units)");
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic user profile & workspace active plan
  const [activePlan, setActivePlan] = useState("Trial Plan");
  const [hasPaidSubscription, setHasPaidSubscription] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: "Alexander Wright",
    email: "alexander.wright@rentawas.com",
    role: "Portfolio Owner",
    initials: "AW",
  });

  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(14);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(true);
  const [workspacePlanKey, setWorkspacePlanKey] = useState<string>("trial");
  const [unitsCount, setUnitsCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallFeatureName, setPaywallFeatureName] = useState<string>("Add New Item");
  const [paywallCustomMessage, setPaywallCustomMessage] = useState<string | null>(null);

  const messagesUnlocked = canAccessMessages({
    plan: workspacePlanKey,
    isTrialActive,
  });

  const openMessagesPaywall = () => {
    setPaywallFeatureName("Messages");
    setPaywallCustomMessage(MESSAGES_UPGRADE_MESSAGE);
    setShowPaywallModal(true);
  };

  const checkCanAddAction = (featureName: string = "Add New Item"): boolean => {
    const lower = featureName.toLowerCase();
    const action =
      lower.includes("unit")
        ? "unit"
        : lower.includes("property")
          ? "property"
          : "mutate";

    const result = checkPlanQuota({
      plan: workspacePlanKey,
      isTrialActive,
      unitsCount,
      propertiesCount,
      action,
      unitsToAdd: action === "unit" ? 1 : action === "property" ? 1 : 0,
    });

    if (result.ok) return true;

    setPaywallFeatureName(featureName);
    setPaywallCustomMessage(result.message);
    setShowPaywallModal(true);
    return false;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).checkCanAddAction = checkCanAddAction;
    }
  }, [isTrialActive, hasPaidSubscription, workspacePlanKey, unitsCount, propertiesCount]);

  // View Mode Switcher: Manage View (Operations) vs Listing View  // Mode Switcher & Listing State
  const [dashboardViewMode, setDashboardViewMode] = useState<"manage" | "listing">("manage");
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingSubTab, setListingSubTab] = useState<"inquiries" | "myListings" | "addNew">("inquiries");
  const [showAddPropertyWizard, setShowAddPropertyWizard] = useState(false);
  const [editingListingItem, setEditingListingItem] = useState<any | null>(null);

  // Landlord Listings (Fetched dynamically from /api/listings)
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  // Published Listings Pagination State (Max 8 items per page)
  const [listingsPage, setListingsPage] = useState(1);
  const LISTINGS_PER_PAGE = 8;
  const totalListingsPages = Math.ceil(myListings.length / LISTINGS_PER_PAGE) || 1;
  const paginatedListings = myListings.slice(
    (listingsPage - 1) * LISTINGS_PER_PAGE,
    listingsPage * LISTINGS_PER_PAGE
  );

  const fetchPublishedListings = async () => {
    setIsLoadingListings(true);
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        setMyListings([]);
        return;
      }
      const res = await fetch(`/api/listings?wid=${encodeURIComponent(activeWid)}&limit=100`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMyListings(json.data);
      } else {
        setMyListings([]);
      }
    } catch (err) {
      console.error("Error fetching published listings:", err);
      setMyListings([]);
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Tenant Inquiries (Fetched dynamically from /api/listings/inquiries)
  const [tenantLeads, setTenantLeads] = useState<any[]>([]);

  const fetchTenantInquiries = async () => {
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        setTenantLeads([]);
        return;
      }
      const res = await fetch(`/api/listings/inquiries?wid=${encodeURIComponent(activeWid)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTenantLeads(json.data);
      } else {
        setTenantLeads([]);
      }
    } catch (err) {
      console.error("Error fetching tenant inquiries:", err);
      setTenantLeads([]);
    }
  };

  const [activeMenuListingId, setActiveMenuListingId] = useState<string | null>(null);
  const [previewListingItem, setPreviewListingItem] = useState<any | null>(null);

  // AI Credits State
  const [aiCreditsUsed, setAiCreditsUsed] = useState<number>(0);
  const [aiCreditLimit, setAiCreditLimit] = useState<number>(20);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);

  // ─── RentAwas Buddy Listing AI Assistant State ────────────────────────────
  const [selectedBuddyListing, setSelectedBuddyListing] = useState<any | null>(null);
  const [showListingBuddyModal, setShowListingBuddyModal] = useState(false);
  const [listingBuddyQuestion, setListingBuddyQuestion] = useState("");
  const [listingBuddyLoading, setListingBuddyLoading] = useState(false);
  const [listingBuddyResponse, setListingBuddyResponse] = useState("");
  const [listingBuddyGeneratedAt, setListingBuddyGeneratedAt] = useState<string | null>(null);
  const [listingBuddyError, setListingBuddyError] = useState("");

  const openBuddyModalForListing = async (item: any) => {
    setSelectedBuddyListing(item);
    setShowListingBuddyModal(true);
    setListingBuddyQuestion("");
    setListingBuddyResponse("");
    setListingBuddyError("");

    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) return;
      const res = await fetch(`/api/ai/listing-summary?workspaceId=${activeWid}`);
      if (res.ok) {
        const json = await res.json();
        setAiCreditsUsed(json.creditsUsed ?? 0);
        setAiCreditLimit(json.creditLimit ?? 20);
      }
    } catch {}
  };

  const handleAskListingBuddy = async (customPrompt?: string) => {
    if (!selectedBuddyListing) return;
    const promptToUse = customPrompt || listingBuddyQuestion;
    if (!promptToUse.trim()) return;

    setListingBuddyLoading(true);
    setListingBuddyError("");
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch("/api/ai/listing-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedBuddyListing.id,
          workspaceId: activeWid,
          question: promptToUse,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "AI_CREDITS_EXHAUSTED") {
          setListingBuddyError(json.message || "AI credits exhausted. Upgrade your plan to ask more questions.");
        } else {
          setListingBuddyError(json.error || "Failed to get AI response.");
        }
        return;
      }
      setListingBuddyResponse(json.summary || "");
      setListingBuddyGeneratedAt(json.generatedAt || new Date().toISOString());
      setAiCreditsUsed(json.creditsUsed ?? aiCreditsUsed + 2);
      setAiCreditLimit(json.creditLimit ?? aiCreditLimit);
      setListingBuddyQuestion("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ai-credits-updated"));
      }
    } catch {
      setListingBuddyError("Network error. Could not reach AI service.");
    } finally {
      setListingBuddyLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const fetchAiCredits = async () => {
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) return;
      const res = await fetch(`/api/ai/property-summary?workspaceId=${activeWid}`);
      if (res.ok) {
        const json = await res.json();
        setAiCreditsUsed(json.creditsUsed ?? 0);
        setAiCreditLimit(json.creditLimit ?? 20);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPublishedListings();
    fetchTenantInquiries();
    fetchAiCredits();

    const handleCreditsUpdated = () => {
      fetchAiCredits();
      invalidateAiUsage(queryClient);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ai-credits-updated", handleCreditsUpdated);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ai-credits-updated", handleCreditsUpdated);
      }
    };
  }, [queryClient]);

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch("/api/listings/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, wid: Number(activeWid) || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        toast(`Inquiry status updated to ${newStatus}`, "success");
        fetchTenantInquiries();
      } else {
        toast(json.error || "Failed to update inquiry status", "error");
      }
    } catch (err) {
      toast("Failed to update inquiry status", "error");
    }
  };

  const toggleListingLiveStatus = async (id: string, currentIsLive: boolean) => {
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const nextIsLive = !currentIsLive;
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isLive: nextIsLive, wid: Number(activeWid) || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        toast(`Listing status updated to ${nextIsLive ? "Live" : "Draft"}`, "success");
        fetchPublishedListings();
      } else {
        toast(json.error || "Failed to update listing status", "error");
      }
    } catch (err) {
      toast("Failed to update listing status", "error");
    }
  };

  const openDeleteListingModal = (id: string) => {
    setDeletingListingId(id);
    setShowDeleteListingModal(true);
  };

  const confirmDeleteListing = async () => {
    if (!deletingListingId) return;
    setIsDeletingListing(true);
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch(
        `/api/listings?id=${encodeURIComponent(deletingListingId)}&wid=${encodeURIComponent(activeWid)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        toast("Property listing deleted", "info");
        fetchPublishedListings();
      } else {
        toast(json.error || "Failed to delete listing", "error");
      }
    } catch (err) {
      toast("Failed to delete listing", "error");
    } finally {
      setIsDeletingListing(false);
      setShowDeleteListingModal(false);
      setDeletingListingId(null);
    }
  };

  // Form state for New Free Property Listing
  const [newTitle, setNewTitle] = useState("");
  const [newRent, setNewRent] = useState("");
  const [newBhk, setNewBhk] = useState("2 BHK");
  const [newLocation, setNewLocation] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    setShowProfileMenu(false);
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
    async function loadWorkspacePlan() {
      try {
        const { ensureActiveWorkspaceId } = await import("@/lib/workspace");
        const activeWid = await ensureActiveWorkspaceId();
        if (!activeWid) return;

        const res = await fetch(`/api/workspace?wid=${activeWid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const pKey = String(json.data.plan || "trial").toLowerCase();
            const daysLeft = Number(json.data.trialDaysLeft ?? 0);
            const trialActive = Boolean(json.data.isTrialActive) || (pKey === "trial" && daysLeft > 0);

            setTrialDaysLeft(pKey === "trial" ? daysLeft : 0);
            setIsTrialActive(trialActive);
            setWorkspacePlanKey(pKey);
            setUnitsCount(Number(json.data.unitsCount ?? 0));
            setPropertiesCount(Number(json.data.propertiesCount ?? 0));

            if (pKey === "starter" || pKey === "pro" || pKey === "pro_plus" || pKey === "enterprise") {
              const labels: Record<string, string> = {
                starter: "Starter Plan",
                pro: "Pro Plan",
                pro_plus: "Pro Plus Plan",
                enterprise: "Pro Plus Plan",
              };
              setActivePlan(labels[pKey] || "Pro Plan");
              setHasPaidSubscription(true);
            } else if (pKey === "trial" && trialActive) {
              setActivePlan("Trial Plan");
              setHasPaidSubscription(false);
            } else {
              // Lapsed trial or explicit free plan
              setActivePlan("Free Plan");
              setHasPaidSubscription(false);
              setIsTrialActive(false);
              setTrialDaysLeft(0);
              setWorkspacePlanKey("free");
            }
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

  const manageNavItems = [
    { id: "overview", name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { id: "properties", name: "Properties & Units", href: "/dashboard/properties", icon: Building2 },
    { id: "payments", name: "Rent Payments", href: "/dashboard/payments", icon: CreditCard },
    { id: "messages", name: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: "PRO", requiresPro: true },
    { id: "leases", name: "Documents", href: "/dashboard/leases", icon: FileText },
    { id: "tenants", name: "Tenants & Health", href: "/dashboard/tenants", icon: Users },
    { id: "maintenance", name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    { id: "announcements", name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
    { id: "expenses", name: "Property Expenses", href: "/dashboard/expenses", icon: Receipt },
    { id: "settings", name: "Workspace Settings", href: "/dashboard/settings", icon: Settings },
    { id: "billing", name: "Plans & Billing", href: "/dashboard/billing", icon: CreditCard, badge: "PRO" },
    { id: "ai", name: "RentAwas AI", href: "/dashboard/ai", icon: Bot, badge: "AI" },
    { id: "support", name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  ];

  const listingNavItems = [
    { id: "inquiries", name: "Tenant Inquiries & Leads", subTab: "inquiries", icon: Users, badge: "FREE" },
    { id: "myListings", name: "My Published Listings", subTab: "myListings", icon: Building2 },
    { id: "publicSite", name: "Public Marketplace", href: "/find-property", external: true, icon: Search },
    { id: "settings", name: "Workspace Settings", href: "/dashboard/settings", icon: Settings },
    { id: "billing", name: "Plans & Billing", href: "/dashboard/billing", icon: CreditCard, badge: "PRO" },
    { id: "ai", name: "RentAwas AI", href: "/dashboard/ai", icon: Bot, badge: "AI" },
    { id: "support", name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
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

          {/* Mode Header Label */}
          {!isCollapsed && (
            <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider">
              <span className={dashboardViewMode === "listing" ? "text-[#FF6B00]" : "text-slate-400"}>
                {dashboardViewMode === "listing" ? "🔥 Marketplace Hub" : "🏢 Rental Operations"}
              </span>
            </div>
          )}

          {/* Dynamic Navigation Links */}
          <nav className="px-3 py-1 space-y-1">
            {(dashboardViewMode === "listing" ? listingNavItems : manageNavItems).map((item: any) => {
              const Icon = item.icon;
              const isListingItem = dashboardViewMode === "listing";
              const isActive = pathname !== "/dashboard"
                ? (item.href && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))))
                : isListingItem
                ? item.subTab === listingSubTab
                : pathname === item.href;

              if (isListingItem && item.subTab) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setListingSubTab(item.subTab as any);
                      if (pathname !== "/dashboard") {
                        router.push("/dashboard");
                      }
                      setSidebarOpen(false);
                    }}
                    title={isCollapsed ? item.name : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative group cursor-pointer text-left ${
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
                        FREE
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id || item.name}
                  href={item.requiresPro && !messagesUnlocked ? "#" : (item.href || "#")}
                  target={item.external ? "_blank" : undefined}
                  onClick={(e) => {
                    if (item.requiresPro && !messagesUnlocked) {
                      e.preventDefault();
                      openMessagesPaywall();
                      return;
                    }
                    setSidebarOpen(false);
                  }}
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
                      item.badge === "AUTO"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : item.badge === "PRO"
                          ? "bg-[#FF6B00]/20 text-[#FF6B00]"
                          : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {item.requiresPro && !messagesUnlocked ? (
                        <span className="inline-flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> PRO</span>
                      ) : (
                        item.badge
                      )}
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
              <button onClick={handleLogout} title="Log Out" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Right Main Content Column */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${pathname.startsWith("/dashboard/messages") ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}>
        {/* Fixed Top Desktop Header Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80">
          <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left Header Controls: Sidebar Toggle + Total AI Credits Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-[#FF6B00]" /> : <PanelLeftClose className="w-5 h-5 text-slate-500" />}
            </button>

            {/* Total AI Credits Badge */}
            <button 
              onClick={() => setShowRechargeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 hover:from-purple-200 hover:to-violet-200 border border-purple-300 shadow-2xs cursor-pointer shrink-0 transition-all group"
              title="Click to recharge AI Property & Resident Intelligence Credits"
            >
              <Bot className="w-4 h-4 text-purple-700 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-purple-950">
                {Math.max(0, aiCreditLimit - aiCreditsUsed)}/{aiCreditLimit} AI Credits
              </span>
              <span className="text-[9px] font-black text-violet-700 uppercase bg-white/90 px-1.5 py-0.5 rounded-md border border-violet-200 ml-1">
                +Recharge
              </span>
            </button>
          </div>

          {/* Global Search Command Trigger Bar */}
          <div 
            onClick={() => setShowSearchModal(true)}
            className="relative flex-1 max-w-md cursor-pointer group"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
            <div className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-500 flex items-center justify-between group-hover:bg-white group-hover:border-slate-300 transition-all">
              <span className="truncate">Search properties, residents, maintenance...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-500 rounded shadow-2xs">
                <span className="text-[9px]">Ctrl / ⌘</span> K
              </kbd>
            </div>
          </div>

          {/* Actions & Notifications */}
          <div className="flex items-center gap-3">

            {/* Wishlist — visible in both Manage & Listing view */}
            <Link
              href="/dashboard/wishlist"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider border shrink-0 ${
                pathname === "/dashboard/wishlist"
                  ? "bg-red-500 text-white border-red-500 shadow-xs"
                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
              }`}
              title="View saved marketplace properties"
            >
              <Heart className={`w-3.5 h-3.5 ${pathname === "/dashboard/wishlist" ? "fill-white" : ""}`} />
              <span>Wishlist</span>
            </Link>

            {/* View Mode Switcher Toggle: Manage View vs Listing View (Positioned right before STARTER PLAN badge) */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/90 flex items-center gap-1 shrink-0 font-sans">
              <button
                type="button"
                onClick={() => {
                  setDashboardViewMode("manage");
                  setShowListingModal(false);
                  toast("Switched to Rental Operations & Management View", "info");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dashboardViewMode === "manage"
                    ? "bg-[#0B132B] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title="Manage rental ledgers, tenant profiles, and maintenance"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manage View</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDashboardViewMode("listing");
                  setListingSubTab("inquiries");
                  if (pathname !== "/dashboard") {
                    router.push("/dashboard");
                  }
                  toast("Switched to Free Property Listing & Tenant Inquiries", "success");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  dashboardViewMode === "listing"
                    ? "bg-[#FF6B00] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title="List properties for free & view tenant inquiries"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Listing View</span>
              </button>
            </div>

            {/* Active Plan or 14-Day Free Trial Badge */}
            {isTrialActive ? (
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 transition-all cursor-pointer group shrink-0"
                title="14-Day Free Trial Active - All Features Unlocked"
              >
                <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} Days Trial` : "Trial Ending"}
                </span>
              </Link>
            ) : hasPaidSubscription ? (
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-[#FF6B00] transition-all cursor-pointer group shrink-0"
                title="View Subscription Plan Details"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider">{activePlan}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => checkCanAddAction("Add Operations")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 transition-all cursor-pointer group shrink-0"
                title="Free Plan — Upgrade for full features"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider">Free Plan</span>
              </button>
            )}

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

                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
          </div>
          </header>
        </div>

        {/* Page Main Content Area */}
        <main className={pathname.startsWith("/dashboard/messages") ? "p-0 flex-1 min-h-0 h-full overflow-hidden flex flex-col" : "p-4 sm:p-6 md:p-8 flex-1"}>
          {pathname !== "/dashboard" || dashboardViewMode === "manage" ? (
            children
          ) : (
            /* Landlord Free Listing & Tenant Inquiries Full Page Dashboard View */
            <div className="space-y-6 font-sans animate-in fade-in duration-200">
              
              {/* Header Banner */}
              <div className="bg-[#0B132B] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Landlord Free Listing & Marketplace Hub</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Property Listings & Tenant Inquiries
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    List vacant properties for 100% free with zero brokerage. See who contacted or selected your properties, manage inquiries, and confirm bookings.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3 shrink-0">
                  <Link
                    href="/dashboard/wishlist"
                    className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Heart className="w-4 h-4 fill-red-300 text-red-300" />
                    <span>My Wishlist</span>
                  </Link>
                  <button
                    onClick={() => setShowAddPropertyWizard(true)}
                    className="px-5 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>List New Property Free</span>
                  </button>
                  <Link
                    href="/find-property"
                    target="_blank"
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <span>Public Marketplace</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Published Listings</span>
                    <Building2 className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {myListings.filter((l) => l.isLive !== false && l.status !== "Draft").length} Active
                  </div>
                  <p className="text-[11px] font-bold text-emerald-600">✓ 100% Free • Zero Brokerage</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Tenant Inquiries</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{tenantLeads.length} Leads</div>
                  <p className="text-[11px] font-bold text-slate-500">Direct Landlord Contact Requests</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Tenants Chosen</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {tenantLeads.filter((l) => l.status === "Tenant Chosen").length} Selected
                  </div>
                  <p className="text-[11px] font-bold text-emerald-600">Agreement & Onboarding Ready</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Marketplace Views</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {(
                      myListings.reduce((sum, item) => sum + (item.viewsCount || 0), 0) ||
                      (myListings.length > 0 ? myListings.length * 142 : 0)
                    ).toLocaleString()}
                  </div>
                  <p className="text-[11px] font-bold text-blue-600">High Tenant Visibility</p>
                </div>
              </div>

              {/* Page Content Body */}

              {/* Page Content Body */}
              
              {/* SUB TAB 1: Tenant Inquiries & Leads (Who Contacted or Chosen) */}
              {listingSubTab === "inquiries" && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">Direct Tenant Inquiries & Contact Leads</h3>
                        <p className="text-xs text-slate-500">List of tenants who contacted or were selected for your property listings</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold self-start sm:self-auto">
                        ✓ Direct Landlord Inquiries
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3.5 px-4">Interested Tenant</th>
                            <th className="py-3.5 px-4">Contact Phone</th>
                            <th className="py-3.5 px-4">Property Interested</th>
                            <th className="py-3.5 px-4">Move-in Date</th>
                            <th className="py-3.5 px-4">Status / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-extrabold text-slate-900 text-sm">{lead.tenantName}</div>
                                <div className="text-[11px] text-slate-400 font-medium">{lead.email}</div>
                              </td>
                              <td className="py-4 px-4 font-bold text-slate-900 text-xs">
                                {lead.phone}
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-700">
                                {lead.propertyTitle}
                              </td>
                              <td className="py-4 px-4 text-slate-600 font-semibold">
                                {lead.moveInDate}
                              </td>
                              <td className="py-4 px-4">
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateInquiryStatus(lead.id, e.target.value)}
                                  className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer focus:outline-none border ${
                                    lead.status === "Tenant Chosen"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : lead.status === "Visit Scheduled"
                                      ? "bg-purple-100 text-purple-800 border-purple-300"
                                      : "bg-amber-100 text-amber-800 border-amber-300"
                                  }`}
                                >
                                  <option value="Inquiry Pending">Inquiry Pending</option>
                                  <option value="Visit Scheduled">Visit Scheduled</option>
                                  <option value="Tenant Chosen">Tenant Chosen</option>
                                  <option value="Contacted">Contacted</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB 2: My Published Listings */}
              {listingSubTab === "myListings" && (
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Your Active Free Property Listings</h3>
                      <p className="text-xs text-slate-500 font-medium">Manage your properties published on RentAwas Marketplace</p>
                    </div>
                    <button
                      onClick={() => setShowAddPropertyWizard(true)}
                      className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E56000] cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>List New Unit</span>
                    </button>
                  </div>

                  {isLoadingListings ? (
                    <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                      <div className="w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Loading your published property listings...</p>
                    </div>
                  ) : myListings.length === 0 ? (
                    <div className="py-12 px-6 text-center space-y-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="font-extrabold text-slate-900 text-sm">No Property Listings Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You have not published any vacant units yet. Create your first listing to start receiving direct tenant inquiries.
                      </p>
                      <button
                        onClick={() => setShowAddPropertyWizard(true)}
                        className="px-4 py-2.5 bg-[#FF6B00] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E56000] cursor-pointer inline-flex items-center gap-1.5 mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>List Property For Free</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                        {paginatedListings.map((item) => {
                          const rentDisplay =
                            typeof item.rent === "number"
                              ? `₹${item.rent.toLocaleString("en-IN")}/mo`
                              : item.rent || "₹0/mo";
                          const isCurrentlyLive = item.isLive !== false && item.status !== "Draft";
                          const locationText =
                            item.locality || item.city
                              ? `${item.locality || ""}${item.locality && item.city ? ", " : ""}${item.city || ""}`
                              : item.location || "Location specified";
                          const isMenuOpen = activeMenuListingId === item.id;

                          return (
                            <div
                              key={item.id}
                              className="p-5 border border-slate-200/90 rounded-2xl bg-white space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative"
                            >
                              <div className="space-y-3">
                                {/* Header Badges, Rent & 3-Dot Action Menu */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                        isCurrentlyLive
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {isCurrentlyLive ? "● Live on Marketplace" : "Draft (Private)"}
                                    </span>
                                    {item.whatsappEnabled && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                                        WhatsApp
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-[#FF6B00] shrink-0">{rentDisplay}</span>

                                    {/* 3-Dot Action Menu Button */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => setActiveMenuListingId(isMenuOpen ? null : item.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Listing Options"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {/* 3-Dot Dropdown Menu */}
                                      {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150 font-sans">
                                          <a
                                            href={`/find-property/${item.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setActiveMenuListingId(null)}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2 cursor-pointer block"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Preview Listing</span>
                                          </a>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuListingId(null);
                                              setEditingListingItem(item);
                                              setShowAddPropertyWizard(true);
                                              toast(`Editing listing ${item.title}`, "info");
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
                                          >
                                            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Edit Listing</span>
                                          </button>

                                          <div className="border-t border-slate-100 my-1" />

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuListingId(null);
                                              openDeleteListingModal(item.id);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                            <span>Delete Listing</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Thumbnail & Info */}
                                <div className="flex gap-3">
                                  {item.mainImage || item.image ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                                      <Image
                                        src={item.mainImage || item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
                                      <Building2 className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                     <a
                                       href={`/find-property/${item.id}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="font-extrabold text-slate-900 text-sm truncate hover:text-[#FF6B00] transition-colors block"
                                     >
                                       {item.title}
                                     </a>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                                      {locationText} • {item.propertyType || item.bhk || "Property"}
                                    </p>
                                    {item.contactPersonName && (
                                      <p className="text-[11px] text-slate-600 font-semibold mt-1 truncate">
                                        Contact: {item.contactPersonName} ({item.contactNumber || item.ownerPhone || "N/A"})
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Property Specs Data Chips & Average Rating Cell */}
                                <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px] font-semibold text-slate-600">
                                  <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1 font-bold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                    <span>{item.avgRating ? Number(item.avgRating).toFixed(1) : "4.8"} ★ ({item.reviewCount || 0} Reviews)</span>
                                  </div>

                                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-emerald-600" />
                                    <span>Deposit: {item.deposit ? `₹${item.deposit.toLocaleString("en-IN")}` : "N/A"}</span>
                                  </div>

                                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-purple-600" />
                                    <span>{item.availableFrom || "Ready to Move"}</span>
                                  </div>

                                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-600" />
                                    <span>Maint: {item.maintenance || "Included"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Controls Footer */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                                {/* Live vs Draft Sliding Toggle Switch */}
                                <button
                                  type="button"
                                  onClick={() => toggleListingLiveStatus(item.id, isCurrentlyLive)}
                                  className="flex items-center gap-2.5 cursor-pointer select-none border-none bg-transparent group"
                                  title={`Click to switch status to ${isCurrentlyLive ? "Draft" : "Live"}`}
                                >
                                  {/* Sliding Track Pill */}
                                  <div
                                    className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative p-0.5 shadow-inner ${
                                      isCurrentlyLive ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                  >
                                    {/* Sliding White Circle Knob */}
                                    <div
                                      className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-200 ease-in-out ${
                                        isCurrentlyLive ? "translate-x-5" : "translate-x-0"
                                      }`}
                                    />
                                  </div>

                                  {/* Status Label */}
                                  <span className={`text-xs font-extrabold transition-colors ${
                                    isCurrentlyLive ? "text-emerald-700" : "text-slate-500"
                                  }`}>
                                    {isCurrentlyLive ? "Live" : "Draft"}
                                  </span>
                                </button>

                                <div className="flex items-center gap-2">
                                   {/* RentAwas Buddy Button for Listing */}
                                   <button
                                     type="button"
                                     onClick={() => openBuddyModalForListing(item)}
                                     title="Ask RentAwas Buddy"
                                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer shrink-0 uppercase tracking-wider"
                                   >
                                     <Bot className="w-4 h-4" />
                                     <span>RentAwas Buddy</span>
                                   </button>

                                   <button
                                    onClick={() => {
                                      setListingSubTab("inquiries");
                                      toast(`Viewing tenant inquiries for ${item.title}`, "info");
                                    }}
                                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
                                  >
                                    Inquiries ({item.inquiriesCount || 0})
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Published Listings Pagination Controls Bar */}
                      {totalListingsPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100 font-sans">
                          <span className="text-xs text-slate-500 font-medium">
                            Showing <strong className="text-slate-900">{(listingsPage - 1) * LISTINGS_PER_PAGE + 1}</strong> to{" "}
                            <strong className="text-slate-900">{Math.min(listingsPage * LISTINGS_PER_PAGE, myListings.length)}</strong> of{" "}
                            <strong className="text-slate-900">{myListings.length}</strong> published listings
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setListingsPage((prev) => Math.max(prev - 1, 1))}
                              disabled={listingsPage === 1}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Prev</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalListingsPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                  key={pageNum}
                                  onClick={() => setListingsPage(pageNum)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    listingsPage === pageNum
                                      ? "bg-[#FF6B00] text-white shadow-xs"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => setListingsPage((prev) => Math.min(prev + 1, totalListingsPages))}
                              disabled={listingsPage === totalListingsPages}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUB TAB 3: Add New Free Listing Form */}
              {listingSubTab === "addNew" && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">List New Property For 100% Free</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Publish your vacant apartment or PG room to RentAwas Marketplace with zero brokerage and direct tenant calls.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newTitle || !newRent || !newLocation) {
                        toast("Please fill in property title, rent, and location.", "error");
                        return;
                      }
                      const newEntry = {
                        id: `LIST-${Date.now()}`,
                        title: newTitle,
                        rent: `₹${newRent}/mo`,
                        bhk: newBhk,
                        location: newLocation,
                        status: "Active",
                        inquiriesCount: 0,
                      };
                      setMyListings([newEntry, ...myListings]);
                      setNewTitle("");
                      setNewRent("");
                      setNewLocation("");
                      setListingSubTab("myListings");
                      toast("Property published for 100% Free Tenant Discovery!", "success");
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Property Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Sunny 2BHK Apartment with Lake View"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Monthly Rent ({currencySymbol}) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newRent}
                          onChange={(e) => setNewRent(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          BHK / Unit Type
                        </label>
                        <select
                          value={newBhk}
                          onChange={(e) => setNewBhk(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        >
                          <option value="1 BHK">1 BHK</option>
                          <option value="2 BHK">2 BHK</option>
                          <option value="3 BHK">3 BHK</option>
                          <option value="Single PG Bed">Single PG Bed</option>
                          <option value="Studio Flat">Studio Flat</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Location / Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g. Sector 54, Golf Course Road, Gurgaon"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Publish Property Listing For 100% Free
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal Command Palette (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Multi-Step Property Listing Wizard Modal */}
      <ListPropertyModal
        isOpen={showAddPropertyWizard}
        editingListing={editingListingItem}
        onClose={() => {
          setShowAddPropertyWizard(false);
          setEditingListingItem(null);
        }}
        onSuccess={() => {
          fetchPublishedListings();
          setListingSubTab("myListings");
          setEditingListingItem(null);
        }}
      />

      {/* Property Preview Modal */}
      {previewListingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#0B132B] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-extrabold text-base text-white truncate">
                  Property Listing Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewListingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Media Header */}
              {previewListingItem.mainImage || previewListingItem.image ? (
                <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  <Image
                    src={previewListingItem.mainImage || previewListingItem.image}
                    alt={previewListingItem.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black uppercase shadow-xs">
                    {previewListingItem.isLive !== false ? "Live on Marketplace" : "Draft"}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-950/80 text-white backdrop-blur-xs rounded-xl text-sm font-black">
                    {typeof previewListingItem.rent === "number"
                      ? `₹${previewListingItem.rent.toLocaleString("en-IN")}/mo`
                      : previewListingItem.rent}
                  </div>
                </div>
              ) : null}

              {/* Basic Info */}
              <div>
                <h2 className="text-xl font-black text-slate-900">{previewListingItem.title}</h2>
                <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>
                    {previewListingItem.fullAddress ||
                      `${previewListingItem.locality || ""}, ${previewListingItem.city || ""}`}
                  </span>
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Type</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{previewListingItem.propertyType || "Apartment"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Deposit</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">
                    {previewListingItem.deposit ? `₹${previewListingItem.deposit.toLocaleString("en-IN")}` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Available</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{previewListingItem.availableFrom || "Immediate"}</div>
                </div>
              </div>

              {/* Contact Person Box */}
              {previewListingItem.contactPersonName && (
                <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-black text-[#FF6B00] tracking-wider">Contact Person</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {previewListingItem.contactPersonName}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {previewListingItem.contactNumber || previewListingItem.ownerPhone}
                    </div>
                  </div>
                  {previewListingItem.whatsappEnabled && (
                    <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                      WhatsApp Enabled
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setPreviewListingItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <Link
                href="/find-property"
                target="_blank"
                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View on Public Marketplace</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Upgrade Modal */}
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => {
          setShowPaywallModal(false);
          setPaywallCustomMessage(null);
        }}
        featureName={paywallFeatureName}
        customMessage={paywallCustomMessage}
        isTrialExpired={!isTrialActive && !hasPaidSubscription}
        daysLeftInTrial={trialDaysLeft}
      />

      {/* Logout Animation Overlay */}
      <LogoutAnimation isLoggingOut={isLoggingOut} userRole="landlord" />

      {/* Recharge AI Credits Popup Modal */}
      <AiCreditsExhaustedModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        creditsUsed={aiCreditsUsed}
        creditLimit={aiCreditLimit}
        onRecharged={fetchAiCredits}
      />

      {/* ─────────────────────── LISTING RENTAWAS BUDDY AI MODAL ─────────────────────── */}
      {showListingBuddyModal && selectedBuddyListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-purple-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-none">RentAwas Buddy</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Ask anything about listing: {selectedBuddyListing.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowListingBuddyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* 1. TOP SECTION: BIG Textarea Input Field FIRST */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
                <label className="block text-xs font-black uppercase text-slate-800 tracking-wider">
                  Ask RentAwas Buddy a Custom Question:
                </label>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={listingBuddyQuestion}
                    onChange={(e) => setListingBuddyQuestion(e.target.value)}
                    placeholder={`Type anything about ${selectedBuddyListing.title}... (e.g. Is the rent price competitive? How can I get more inquiries? Summarise this listing)`}
                    disabled={listingBuddyLoading}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none disabled:opacity-50"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleAskListingBuddy()}
                      disabled={!listingBuddyQuestion.trim() || listingBuddyLoading || aiCreditsUsed >= aiCreditLimit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      <Send className="w-4 h-4" />
                      <span>Ask RentAwas Buddy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. SECOND SECTION: Big Choice Cards with Title & Info Subtitle */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Or Pick a Quick Listing Analysis Preset:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: "Listing Performance & Summary",
                      info: "Analyze listing visibility, tenant attraction & completeness",
                      icon: "🏷️",
                      border: "hover:border-violet-400 hover:bg-violet-50/60 border-slate-200/90",
                    },
                    {
                      title: "Pricing & Market Competitiveness",
                      info: "Compare rent, deposit & maintenance fees to local trends",
                      icon: "💰",
                      border: "hover:border-emerald-400 hover:bg-emerald-50/60 border-slate-200/90",
                    },
                    {
                      title: "Tenant Inquiries & Lead Quality",
                      info: "Review inquiry response rate, lead quality & interest",
                      icon: "📩",
                      border: "hover:border-amber-400 hover:bg-amber-50/60 border-slate-200/90",
                    },
                    {
                      title: "Description & SEO Optimization",
                      info: "Get tips to optimize listing title, amenities & photos",
                      icon: "✨",
                      border: "hover:border-rose-400 hover:bg-rose-50/60 border-slate-200/90",
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      disabled={listingBuddyLoading}
                      onClick={() => handleAskListingBuddy(preset.title)}
                      className={`p-4 bg-white border rounded-2xl text-left transition-all cursor-pointer shadow-2xs hover:shadow-md disabled:opacity-50 group ${preset.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{preset.icon}</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-snug">{preset.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">{preset.info}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. RESPONSE / LOADING / ERROR SECTION */}
              {/* Saved Date Note Banner */}
              {!listingBuddyLoading && listingBuddyResponse && listingBuddyGeneratedAt && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                    <span className="font-black">Note:</span> Generated on{" "}
                    <span className="font-black">
                      {new Date(listingBuddyGeneratedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>.
                    {" "}If listing details changed, ask a new question or click "Listing Performance & Summary".
                  </p>
                </div>
              )}

              {/* Loading State */}
              {listingBuddyLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-violet-600 animate-pulse" />
                    </div>
                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-extrabold text-slate-800">RentAwas Buddy is analyzing marketplace listing...</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Reviewing price benchmarks, inquiry rates & features</p>
                  </div>
                </div>
              )}

              {/* Credits Finished Alert Box */}
              {(aiCreditsUsed >= aiCreditLimit || listingBuddyError.toLowerCase().includes("exhausted")) && (
                <div className="p-5 bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-300 rounded-2xl text-center space-y-3 shadow-md animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                    <Zap className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-rose-950 uppercase tracking-wide">
                      Your AI Credits are finished!
                    </h4>
                    <p className="text-xs text-rose-800 font-semibold mt-1 leading-relaxed">
                      You have used all {aiCreditLimit} AI credits. Please recharge now to continue asking RentAwas Buddy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRechargeModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-purple-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/30 uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Recharge AI Credits Now</span>
                  </button>
                </div>
              )}

              {/* Error State */}
              {!listingBuddyLoading && listingBuddyError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-extrabold text-rose-900">Could Not Process Question</p>
                    <p className="text-xs text-rose-700 mt-1 font-medium leading-relaxed">{listingBuddyError}</p>
                  </div>
                </div>
              )}

              {/* AI Response Cards */}
              {!listingBuddyLoading && !listingBuddyError && listingBuddyResponse && (
                <div className="space-y-3 pt-1">
                  {listingBuddyResponse.split(/\n(?=###)/).filter(Boolean).map((section, idx) => {
                    const lines = section.trim().split("\n");
                    const heading = lines[0].replace(/^###\s*/, "").trim();
                    const content = lines.slice(1).join("\n").trim();

                    const sectionConfig: Record<string, { bg: string; border: string }> = {
                      "🏷️": { bg: "bg-blue-50", border: "border-blue-100" },
                      "💰": { bg: "bg-emerald-50", border: "border-emerald-100" },
                      "📩": { bg: "bg-amber-50", border: "border-amber-100" },
                      "✨": { bg: "bg-purple-50", border: "border-purple-100" },
                      "✅": { bg: "bg-violet-50", border: "border-violet-100" },
                    };
                    const emoji = heading.split(" ")[0];
                    const cfg = sectionConfig[emoji] || { bg: "bg-slate-50", border: "border-slate-200/80" };

                    return (
                      <div key={idx} className={`p-4 ${cfg.bg} border ${cfg.border} rounded-2xl space-y-2 shadow-2xs`}>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">{heading}</h4>
                        <div className="text-[12px] text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                          {content
                            .replace(/\*\*(.+?)\*\*/g, (_, m) => m)
                            .replace(/^[-•]\s*/gm, "• ")
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex items-center justify-between shrink-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <CreditCard className="w-3.5 h-3.5 text-violet-500" />
                <span>AI Cost: <span className="font-black text-violet-700">2 Credits</span> per query</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-semibold">
                  {aiCreditLimit - aiCreditsUsed > 0
                    ? `${aiCreditLimit - aiCreditsUsed} credits remaining`
                    : "No credits remaining"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowListingBuddyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Confirm Delete Listing Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteListingModal}
        onClose={() => {
          if (!isDeletingListing) {
            setShowDeleteListingModal(false);
            setDeletingListingId(null);
          }
        }}
        onConfirm={confirmDeleteListing}
        isLoading={isDeletingListing}
      />
    </div>
  );
}
