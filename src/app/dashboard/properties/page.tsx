"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Plus, 
  Users, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  MoreVertical, 
  Edit, 
  Trash2, 
  TrendingUp,
  X,
  Layers,
  AlertTriangle,
  Copy,
  Check,
  Search,
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  CreditCard,
  Loader2,
  Zap,
} from "lucide-react";
import AddPropertyModal, { PropertyData } from "@/components/ui/AddPropertyModal";
import FloorPlanDrawer from "@/components/ui/FloorPlanDrawer";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { getActiveWorkspaceId, ensureActiveWorkspaceId } from "@/lib/workspace";
import AiCreditsExhaustedModal from "@/components/AiCreditsExhaustedModal";

export interface PropertyItem {
  id: string;
  name: string;
  address: string;
  floors: number;
  units: number;
  occupied: number;
  monthlyYield: string;
  rawMonthlyYield?: number;
  ytdExpenses?: string;
  rawYtdExpenses?: number;
  status: string;
  tag: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Auto-close 3-dots action menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeMenuId && menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  // Floor Plan Drawer State
  const [selectedFloorPlanProp, setSelectedFloorPlanProp] = useState<PropertyItem | null>(null);

  // Edit Modal State
  const [editingProp, setEditingProp] = useState<PropertyItem | null>(null);

  // Delete Confirmation Modal State
  const [deletingProp, setDeletingProp] = useState<PropertyItem | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // ─── Workspace ID ────────────────────────────────────────────────────────────
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (wid) setWorkspaceId(wid);
    })();
  }, []);

  // ─── TanStack Query ──────────────────────────────────────────────────────────
  // Cache stores raw API properties (shared with dashboard). Map in `select` for UI.
  const { data: propertyList = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/properties?wid=${workspaceId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
      return [];
    },
    select: (data): PropertyItem[] =>
      (Array.isArray(data) ? data : []).map((item: any): PropertyItem => ({
        id: item.id,
        name: item.name,
        address: item.address,
        floors: item.floors || 1,
        units: item.totalUnits ?? item.units ?? 0,
        occupied: item.occupiedUnits ?? item.occupied ?? 0,
        rawMonthlyYield:
          item.rawMonthlyYield !== undefined
            ? item.rawMonthlyYield
            : parseFloat(String(item.monthlyYield || "").replace(/[^0-9.]/g, "")) || 0,
        monthlyYield: item.monthlyYield || "$0",
        rawYtdExpenses: item.rawYtdExpenses || 0,
        ytdExpenses: "$0",
        status: item.status || "0% Occupied",
        tag: item.tag || item.category || "Property",
      })),
  });

  // Include !workspaceId: query is disabled until wid resolves, so isLoading is false otherwise
  const isLoading = !workspaceId || propertiesLoading;

  // ─── RentAwas Buddy AI Assistant State ─────────────────────────────────────
  const [selectedBuddyProp, setSelectedBuddyProp] = useState<PropertyItem | null>(null);
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [buddyQuestion, setBuddyQuestion] = useState("");
  const [buddyLoading, setBuddyLoading] = useState(false);
  const [buddyResponse, setBuddyResponse] = useState("");
  const [buddyGeneratedAt, setBuddyGeneratedAt] = useState<string | null>(null);
  const [buddyError, setBuddyError] = useState("");
  const [buddyCreditsUsed, setBuddyCreditsUsed] = useState(0);
  const [buddyCreditLimit, setBuddyCreditLimit] = useState(20);
  const [buddyPlan, setBuddyPlan] = useState("free");

  const openBuddyModal = async (prop: PropertyItem) => {
    setSelectedBuddyProp(prop);
    setShowBuddyModal(true);
    setBuddyQuestion("");
    setBuddyResponse("");
    setBuddyError("");
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) return;
      const res = await fetch(`/api/ai/property-summary?workspaceId=${activeWid}&propertyId=${encodeURIComponent(prop.id)}`);
      if (res.ok) {
        const json = await res.json();
        setBuddyCreditsUsed(json.creditsUsed ?? 0);
        setBuddyCreditLimit(json.creditLimit ?? 20);
        setBuddyPlan(json.plan ?? "free");
      }
    } catch {}
  };

  const handleAskBuddy = async (customPrompt?: string) => {
    if (!selectedBuddyProp) return;
    const promptToUse = customPrompt || buddyQuestion;
    if (!promptToUse.trim()) return;

    setBuddyLoading(true);
    setBuddyError("");
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch("/api/ai/property-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedBuddyProp.id,
          workspaceId: activeWid,
          question: promptToUse,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "AI_CREDITS_EXHAUSTED") {
          setBuddyError(json.message || "AI credits exhausted. Upgrade your plan to ask more questions.");
        } else {
          setBuddyError(json.error || "Failed to get AI response.");
        }
        return;
      }
      setBuddyResponse(json.summary || "");
      setBuddyGeneratedAt(json.generatedAt || new Date().toISOString());
      setBuddyCreditsUsed(json.creditsUsed ?? buddyCreditsUsed + 2);
      setBuddyCreditLimit(json.creditLimit ?? buddyCreditLimit);
      setBuddyPlan(json.plan ?? buddyPlan);
      setBuddyQuestion("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ai-credits-updated"));
      }
    } catch {
      setBuddyError("Network error. Could not reach AI service.");
    } finally {
      setBuddyLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const canAddProperty = (unitsToAdd?: number): boolean => {
    if (typeof window !== "undefined" && (window as any).checkCanAddAction) {
      return (window as any).checkCanAddAction("Add New Property", unitsToAdd);
    }
    return true;
  };

  const openAddPropertyModal = () => {
    if (!canAddProperty()) return;
    setShowAddModal(true);
  };

  const filteredPropertyList = propertyList.filter((prop) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      prop.name.toLowerCase().includes(q) ||
      prop.address.toLowerCase().includes(q) ||
      prop.tag.toLowerCase().includes(q) ||
      prop.status.toLowerCase().includes(q)
    );
  });


  // Refresh properties list (called after mutations)
  const fetchProperties = async () => {
    queryClient.invalidateQueries({ queryKey: ["properties", workspaceId] });
  };


  const handleAddProperty = async (newProp: PropertyData) => {
    const numFloors = newProp.floors || 4;
    const computedUnits = newProp.units || numFloors * 4;
    const unitsPerFloor = newProp.unitsPerFloor || Math.ceil(computedUnits / numFloors);
    const totalUnits = numFloors * unitsPerFloor;

    if (!canAddProperty(totalUnits)) return;

    const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
    if (!activeWid) {
      toast("Account not found. Please sign in again.", "error");
      return;
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: Number(activeWid),
          name: newProp.name,
          category: newProp.category,
          pincode: newProp.pincode,
          address: newProp.address,
          floors: numFloors,
          unitsPerFloor,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast(`Property "${newProp.name}" created successfully!`, "success");
        fetchProperties();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("workspace-usage-updated"));
        }
        return;
      }

      toast(json.error || "Your plan does not allow adding more properties.", "error");
    } catch (err) {
      console.warn("Failed to create property via API:", err);
      toast("Error creating property.", "error");
    }
  };

  const handleDeleteProperty = async (id: string, name: string) => {
    const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
    try {
      const res = await fetch(`/api/properties/${id}?wid=${activeWid}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast(`Property "${name}" deleted from database!`, "info");
        fetchProperties();
        setActiveMenuId(null);
        return;
      }
    } catch (err) {
      console.warn("Delete API call failed:", err);
      toast("Error deleting property.", "error");
    }

    setActiveMenuId(null);
  };

  const handleSaveEditProperty = async (updatedData: any) => {
    if (editingProp) {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      try {
        const res = await fetch(`/api/properties/${editingProp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wid: Number(activeWid),
            name: updatedData.name,
            address: updatedData.address,
            floors: updatedData.floors,
            unitsPerFloor: updatedData.unitsPerFloor,
            category: updatedData.category,
            pincode: updatedData.pincode,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast(`Property "${updatedData.name}" updated in database!`, "success");
          fetchProperties();
          setEditingProp(null);
          return;
        }
      } catch (err) {
        console.warn("Patch API call failed:", err);
        toast("Error updating property.", "error");
      }

      setEditingProp(null);
    } else {
      handleAddProperty(updatedData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Properties & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hierarchical portfolio management of buildings, total floors, and unit availability.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties, address..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add New Property Button */}
          <button
            onClick={openAddPropertyModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Property Cards Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5 animate-pulse">
              {/* Header row — badge + 3-dot skeleton */}
              <div className="flex items-start justify-between">
                <div className="space-y-2.5">
                  <div className="h-4 w-24 bg-slate-200 rounded-md" />
                  <div className="h-5 w-52 bg-slate-200 rounded-lg" />
                  <div className="h-3.5 w-36 bg-slate-100 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                  <div className="h-7 w-7 bg-slate-100 rounded-lg" />
                </div>
              </div>

              {/* Metrics row — 4 stat boxes */}
              <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-3 w-12 bg-slate-200 rounded" />
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>

              {/* Occupancy bar skeleton */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-12 bg-slate-200 rounded" />
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100">
                <div className="h-8 flex-1 bg-slate-100 rounded-xl" />
                <div className="h-8 flex-1 bg-slate-100 rounded-xl" />
                <div className="h-8 flex-1 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPropertyList.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4 my-8">
          <div className="w-16 h-16 bg-orange-50 text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto border border-orange-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? `No Properties Found Matching "${searchQuery}"` : "No Properties Found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? "Try searching for a different property name, category tag, or address."
                : "Your database currently has no properties added. Click below to add your first property and generate floor/unit inventory."}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
            >
              <span>Clear Search Query</span>
            </button>
          ) : (
            <button
              onClick={openAddPropertyModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Property</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPropertyList.map((prop) => (
            <div
              key={prop.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all space-y-5 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 uppercase tracking-wider">
                    {prop.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{prop.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{prop.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {prop.status}
                  </span>

                  {/* 3-Dots Options Menu Button */}
                  <div className="relative" ref={activeMenuId === prop.id ? menuContainerRef : null}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === prop.id ? null : prop.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Property Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Context Menu Dropdown */}
                    {activeMenuId === prop.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 font-sans animate-in fade-in duration-150">
                        <button
                          onClick={() => {
                            setEditingProp(prop);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit Property</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            toast(`Loading yield analytics for ${prop.name}...`, "info");
                            router.push(`/dashboard/properties/${prop.id}/analytics`);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                          <span>View Analytics</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setDeletingProp(prop);
                            setConfirmNameInput("");
                            setIsCopied(false);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Property</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Breakdown with Total Floors, Units, Monthly Yield & YTD Expenses */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    Floors
                  </span>
                  <span className="text-xs font-black text-slate-900">{prop.floors} Floors</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Occupied</span>
                  <span className="text-xs font-black text-emerald-600">{prop.occupied}/{prop.units} Units</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Monthly Yield</span>
                  <span className="text-xs font-black text-slate-900">{formatCurrency(prop.rawMonthlyYield || 0)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">YTD Expenses</span>
                  <Link href="/dashboard/expenses" className="text-xs font-black text-[#FF6B00] hover:underline block">
                    {formatCurrency(prop.rawYtdExpenses || 0)}
                  </Link>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2">
                <Link 
                  href={`/dashboard/properties/${prop.id}`}
                  className="text-xs font-bold text-[#FF6B00] hover:text-[#E56000] flex items-center gap-1 cursor-pointer"
                >
                  <span>View Floor Plans & Units</span>
                  <ChevronRight className="w-4 h-4 text-[#FF6B00]" />
                </Link>

                {/* RentAwas Buddy Button */}
                <button
                  onClick={() => openBuddyModal(prop)}
                  title="Ask RentAwas Buddy"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer shrink-0 uppercase tracking-wider"
                >
                  <Bot className="w-4 h-4" />
                  <span>RentAwas Buddy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddProperty={handleAddProperty}
      />

      {/* Edit Property Modal (Uses exact same rich AddPropertyModal component) */}
      <AddPropertyModal
        isOpen={!!editingProp}
        onClose={() => setEditingProp(null)}
        initialData={editingProp as any}
        onAddProperty={handleSaveEditProperty}
      />

      {/* Delete Property Confirmation Modal */}
      {deletingProp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">Permanently Delete Property?</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">This destructive action cannot be undone.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeletingProp(null);
                  setConfirmNameInput("");
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danger Warning Alert Note Box */}
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs space-y-1.5 text-red-900">
              <span className="font-extrabold uppercase tracking-wider block text-[11px] text-red-700">
                ⚠️ Cascade Deletion Notice:
              </span>
              <p className="text-xs leading-relaxed text-red-800 font-medium">
                Deleting this property will permanently delete all associated <strong>building floors</strong>, <strong>unit inventory</strong>, <strong>tenant leases</strong>, and <strong>financial yield analytics</strong>.
              </p>
            </div>

            {/* Target Property Name Box with Copy Button */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                Target Property Name:
              </span>
              <div className="flex items-center justify-between p-3 bg-slate-100/90 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm select-all">
                <span className="truncate pr-2">{deletingProp.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(deletingProp.name);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="p-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-2xs"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isCopied ? "Copied!" : "Copy Name"}</span>
                </button>
              </div>
            </div>

            {/* Type to Confirm Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Type property name to confirm:
              </label>
              <input
                type="text"
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                placeholder={deletingProp.name}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeletingProp(null);
                  setConfirmNameInput("");
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await handleDeleteProperty(deletingProp.id, deletingProp.name);
                  setIsDeleting(false);
                  setDeletingProp(null);
                  setConfirmNameInput("");
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-xl shadow-md shadow-red-500/20 uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── RENTAWAS BUDDY AI MODAL ─────────────────────── */}
      {showBuddyModal && selectedBuddyProp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-purple-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-none">RentAwas Buddy</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Ask anything about {selectedBuddyProp.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBuddyModal(false)}
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
                    value={buddyQuestion}
                    onChange={(e) => setBuddyQuestion(e.target.value)}
                    placeholder={`Type anything about ${selectedBuddyProp.name}... (e.g. What is the occupancy rate? Are there any pending maintenance issues? What is the monthly yield?)`}
                    disabled={buddyLoading}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none disabled:opacity-50"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleAskBuddy()}
                      disabled={!buddyQuestion.trim() || buddyLoading || buddyCreditsUsed >= buddyCreditLimit}
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
                  Or Pick a Quick Analysis Preset:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: "Summarise Property",
                      info: "Get a full 360° overview of operations, yield & risks",
                      icon: "📊",
                      border: "hover:border-emerald-400 hover:bg-emerald-50/60 border-slate-200/90",
                    },
                    {
                      title: "Revenue & Financials",
                      info: "Analyze gross yield, billings & pending rent payments",
                      icon: "💰",
                      border: "hover:border-amber-400 hover:bg-amber-50/60 border-slate-200/90",
                    },
                    {
                      title: "Risk & Maintenance Check",
                      info: "Review high-priority tickets, open issues & risks",
                      icon: "⚠️",
                      border: "hover:border-rose-400 hover:bg-rose-50/60 border-slate-200/90",
                    },
                    {
                      title: "Tenant Health & Leases",
                      info: "Check active resident scores & 60-day lease expirations",
                      icon: "👥",
                      border: "hover:border-violet-400 hover:bg-violet-50/60 border-slate-200/90",
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      disabled={buddyLoading}
                      onClick={() => handleAskBuddy(preset.title)}
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
              {!buddyLoading && buddyResponse && buddyGeneratedAt && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                    <span className="font-black">Note:</span> Generated on{" "}
                    <span className="font-black">
                      {new Date(buddyGeneratedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>.
                    {" "}If your property data changed, ask a new question or click "Summarise Property".
                  </p>
                </div>
              )}

              {/* Loading State */}
              {buddyLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-violet-600 animate-pulse" />
                    </div>
                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-extrabold text-slate-800">RentAwas Buddy is analyzing data...</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Reviewing building units, active tenants & finances</p>
                  </div>
                </div>
              )}

              {/* Credits Finished Alert Box */}
              {(buddyCreditsUsed >= buddyCreditLimit || buddyError.toLowerCase().includes("exhausted")) && (
                <div className="p-5 bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-300 rounded-2xl text-center space-y-3 shadow-md animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                    <Zap className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-rose-950 uppercase tracking-wide">
                      Your AI Credits are finished!
                    </h4>
                    <p className="text-xs text-rose-800 font-semibold mt-1 leading-relaxed">
                      You have used all {buddyCreditLimit} AI credits. Please recharge now to continue asking RentAwas Buddy.
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
              {!buddyLoading && buddyError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-extrabold text-rose-900">Could Not Process Question</p>
                    <p className="text-xs text-rose-700 mt-1 font-medium leading-relaxed">{buddyError}</p>
                  </div>
                </div>
              )}

              {/* AI Response Cards */}
              {!buddyLoading && !buddyError && buddyResponse && (
                <div className="space-y-3 pt-1">
                  {buddyResponse.split(/\n(?=###)/).filter(Boolean).map((section, idx) => {
                    const lines = section.trim().split("\n");
                    const heading = lines[0].replace(/^###\s*/, "").trim();
                    const content = lines.slice(1).join("\n").trim();

                    const sectionConfig: Record<string, { bg: string; border: string }> = {
                      "🏠": { bg: "bg-blue-50", border: "border-blue-100" },
                      "📊": { bg: "bg-emerald-50", border: "border-emerald-100" },
                      "💰": { bg: "bg-amber-50", border: "border-amber-100" },
                      "⚠️": { bg: "bg-rose-50", border: "border-rose-100" },
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
                  {buddyCreditLimit - buddyCreditsUsed > 0
                    ? `${buddyCreditLimit - buddyCreditsUsed} credits remaining`
                    : "No credits remaining"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowBuddyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Recharge AI Credits Popup Modal */}
      <AiCreditsExhaustedModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        creditsUsed={buddyCreditsUsed}
        creditLimit={buddyCreditLimit}
      />
    </div>
  );
}
