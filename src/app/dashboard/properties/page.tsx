"use client";

import { useState, useEffect, useRef } from "react";
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
  Search
} from "lucide-react";
import AddPropertyModal, { PropertyData } from "@/components/ui/AddPropertyModal";
import FloorPlanDrawer from "@/components/ui/FloorPlanDrawer";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { getActiveWorkspaceId, ensureActiveWorkspaceId } from "@/lib/workspace";

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

  const [loading, setLoading] = useState(true);
  const [propertyList, setPropertyList] = useState<PropertyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch properties workspace-wise (scoped by active workspace wid)
  const fetchProperties = async () => {
    const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
    if (!activeWid) {
      setPropertyList([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/properties?wid=${activeWid}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: PropertyItem[] = json.data.map((item: any) => {
          const rawYield = item.rawMonthlyYield !== undefined 
            ? item.rawMonthlyYield 
            : (parseFloat(String(item.monthlyYield || "").replace(/[^0-9.]/g, "")) || 0);

          return {
            id: item.id,
            name: item.name,
            address: item.address,
            floors: item.floors || 1,
            units: item.totalUnits || 0,
            occupied: item.occupiedUnits || 0,
            rawMonthlyYield: rawYield,
            monthlyYield: item.monthlyYield || "$0",
            rawYtdExpenses: item.rawYtdExpenses || 0,
            ytdExpenses: "$0",
            status: item.status || "0% Occupied",
            tag: item.tag || item.category || "Property",
          };
        });
        setPropertyList(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch properties from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAddProperty = async (newProp: PropertyData) => {
    const numFloors = newProp.floors || 4;
    const computedUnits = newProp.units || numFloors * 4;
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
          unitsPerFloor: newProp.unitsPerFloor || Math.ceil(computedUnits / numFloors),
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast(`Property "${newProp.name}" created successfully!`, "success");
        fetchProperties();
        return;
      }
    } catch (err) {
      console.warn("Failed to create property via API, adding locally:", err);
    }

    // Local fallback if API fails
    setPropertyList([
      {
        id: newProp.id || `LOCAL-${Date.now()}`,
        name: newProp.name,
        address: newProp.address,
        floors: numFloors,
        units: computedUnits,
        occupied: 0,
        monthlyYield: `${newProp.avgRent || "$0"}/mo`,
        ytdExpenses: "$0",
        status: "0% Occupied (New)",
        tag: newProp.category.replace(/^[^\s]+\s/, ""),
      },
      ...propertyList,
    ]);
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
      console.warn("Delete API call failed, removing locally:", err);
    }

    setPropertyList(propertyList.filter((p) => p.id !== id));
    setActiveMenuId(null);
    toast(`Property "${name}" removed from portfolio!`, "info");
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
        console.warn("Patch API call failed, updating locally:", err);
      }

      setPropertyList((prev) =>
        prev.map((p) =>
          p.id === editingProp.id
            ? {
                ...p,
                name: updatedData.name,
                address: updatedData.address,
                floors: updatedData.floors,
                units: updatedData.units,
                tag: updatedData.category || p.tag,
              }
            : p
        )
      );
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
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Property Cards Grid or Empty State */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#FF6B00] rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading your property portfolio...</p>
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
              onClick={() => setShowAddModal(true)}
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
                disabled={confirmNameInput.trim() !== deletingProp.name.trim() || isDeleting}
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
    </div>
  );
}
