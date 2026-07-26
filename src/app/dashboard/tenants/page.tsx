"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  Plus,
  X,
  Building2,
  Calendar,
  DollarSign,
  ChevronDown,
  UserPlus,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  IdCard,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
  LogOut,
  Star,
  Loader2,
  Wrench,
  Receipt,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Layers
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country, getDefaultCountryByLocale } from "@/components/ui/CountryPhoneInput";
import { uploadFile, validateFile } from "@/lib/upload";

export interface TenantItem {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  leaseStart: string;
  leaseEnd?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  healthScore: number;
  status: "Excellent" | "Good" | "Fair" | "Attention";
  onTimeRate: string;
  govIdAttached?: boolean;
  govIdUrl?: string;
  leaseDocAttached?: boolean;
  leaseDocUrl?: string;
  unitId?: string;
  propertyId?: string;
  workspaceId?: number;
  floorNumber?: number;
  currentStatus?: string;
}

const ITEMS_PER_PAGE = 10;

export default function TenantsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // View mode state (Card vs Table)
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Status Filter State (Current vs Past vs All)
  const [statusFilter, setStatusFilter] = useState<"Current" | "Past" | "All">("Current");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // API Metadata lists for cascading selects
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [propertyUnits, setPropertyUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Step 1 Form State - ALL EMPTY BY DEFAULT (NOT PRE-FILLED)
  const [name, setName] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => getDefaultCountryByLocale(ALL_COUNTRIES));
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");

  // Multiple Uploaded Media State (Government ID & Lease Documents)
  interface UploadedMediaDoc {
    id: string;
    name: string;
    url: string;
    type: string;
  }

  const [govIdDocs, setGovIdDocs] = useState<UploadedMediaDoc[]>([]);
  const [leaseDocs, setLeaseDocs] = useState<UploadedMediaDoc[]>([]);

  // Step 2 Form State (R2 Upload)
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("");
  const [govIdFile, setGovIdFile] = useState<string | null>(null);
  const [govIdUrl, setGovIdUrl] = useState<string | null>(null);
  const [govIdUploading, setGovIdUploading] = useState(false);
  const [govIdProgress, setGovIdProgress] = useState(0);

  // Step 3 Form State (R2 Upload)
  const [docType, setDocType] = useState("Signed Residential Lease Agreement");
  const [leaseFile, setLeaseFile] = useState<string | null>(null);
  const [leaseUrl, setLeaseUrl] = useState<string | null>(null);
  const [leaseUploading, setLeaseUploading] = useState(false);
  const [leaseProgress, setLeaseProgress] = useState(0);

  // MODAL 2: NORMAL LEASE EXIT MODAL STATE
  const [showNormalExitModal, setShowNormalExitModal] = useState(false);
  const [exitTenant, setExitTenant] = useState<TenantItem | null>(null);
  const [exitMoveOutDate, setExitMoveOutDate] = useState("2026-07-25");
  const [depositSettlement, setDepositSettlement] = useState("Full Deposit Refunded");
  const [keysReturned, setKeysReturned] = useState(true);
  const [starRating, setStarRating] = useState(5);
  const [exitHealthScore, setExitHealthScore] = useState<number>(85);
  const [reviewNotes, setReviewNotes] = useState("");

  // MODAL 3: REMOVE / EVICT RESIDENT MODAL STATE
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTenantTarget, setRemoveTenantTarget] = useState<TenantItem | null>(null);
  const [removalReason, setRemovalReason] = useState("Non-Payment of Rent / Financial Default");
  const [removalDate, setRemovalDate] = useState("2026-07-25");
  const [dueAmount, setDueAmount] = useState("1200");
  const [removeHealthScore, setRemoveHealthScore] = useState<number>(45);
  const [incidentNotes, setIncidentNotes] = useState("");
  const [flagTenant, setFlagTenant] = useState(true);

  // Main Tenants State
  const [tenants, setTenants] = useState<TenantItem[]>([]);

  // Fetch real tenants from database
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tenants");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const loaded: TenantItem[] = json.data.map((t: any) => {
            const propName = t.unit?.property?.name || "Property";
            const unitNo = t.unit?.unitNumber || "Unit 101";
            
            let score = t.healthScore || 80;
            if (!t.healthScore || t.healthScore === 95) {
              score = 75;
              if (t.govIdUrl) score += 10;
              if (t.leaseDocUrl) score += 10;
              if (t.phone && t.phone.trim()) score += 5;
            }

            return {
              id: t.id,
              name: t.name,
              unit: `${propName} - ${unitNo}`,
              phone: t.phone || "",
              email: t.email || "",
              leaseStart: t.leaseStart ? new Date(t.leaseStart).toISOString().split("T")[0] : "2026-01-01",
              leaseEnd: t.leaseEnd ? new Date(t.leaseEnd).toISOString().split("T")[0] : "2026-12-31",
              monthlyRent: t.monthlyRent || 0,
              securityDeposit: t.securityDeposit || 0,
              healthScore: score,
              status: score >= 90 ? "Excellent" : score >= 80 ? "Good" : "Fair",
              onTimeRate: "100%",
              govIdAttached: Boolean(t.govIdUrl),
              govIdUrl: t.govIdUrl,
              leaseDocAttached: Boolean(t.leaseDocUrl),
              leaseDocUrl: t.leaseDocUrl,
              unitId: t.unitId,
              propertyId: t.propertyId || t.unit?.propertyId,
              workspaceId: t.workspaceId || t.unit?.workspaceId || t.unit?.property?.workspaceId,
              floorNumber: t.floorNumber || t.unit?.floorNumber || 1,
              currentStatus: t.currentStatus || (t.unitId ? "Current" : "Past"),
            };
          });
          setTenants(loaded);
        }
      }
    } catch (err) {
      console.warn("Could not fetch tenants from database:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live properties from API with robust fallback
  const fetchPropertiesList = async () => {
    try {
      const res = await fetch("/api/properties?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setPropertiesList(json.data);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch properties list from API:", err);
    }
    // Fallback properties if DB has 0 items or API call is loading
    setPropertiesList([
      { id: "prop-regent", name: "The Regent - Wing A", totalFloors: 5 },
      { id: "prop-horizon", name: "Downtown Horizon Suites", totalFloors: 4 },
      { id: "prop-oakwood", name: "Oakwood Executive Residency", totalFloors: 3 },
      { id: "prop-skyline", name: "Skyline Manor", totalFloors: 2 }
    ]);
  };

  useEffect(() => {
    fetchTenants();
    fetchPropertiesList();
  }, []);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "Current") {
      return t.currentStatus === "Current" || (Boolean(t.unitId) && t.currentStatus !== "Exited" && t.currentStatus !== "Evicted");
    }
    if (statusFilter === "Past") {
      return t.currentStatus === "Past" || t.currentStatus === "Exited" || t.currentStatus === "Evicted" || !t.unitId;
    }
    return true;
  });

  // Reset pagination to page 1 on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ---------------- CASCADING DROPDOWN HANDLERS ----------------
  // 1. When Property changes -> Fetch units for that property & reset floor/unit
  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedFloor("");
    setSelectedUnitId("");
    setMonthlyRent("");
    setPropertyUnits([]);

    if (!propertyId) return;

    setLoadingUnits(true);
    try {
      const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/units`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setPropertyUnits(json.data);
          setLoadingUnits(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch units for property:", err);
    }

    // Comprehensive fallback units for all floors (Occupied & Vacant)
    const fallbackUnits: any[] = [];
    for (let f = 1; f <= 5; f++) {
      fallbackUnits.push(
        { id: `${propertyId}-u${f}01`, unitNumber: `Unit ${f}01`, floorNumber: f, rent: 1500 + f * 200, isOccupied: false },
        { id: `${propertyId}-u${f}02`, unitNumber: `Unit ${f}02`, floorNumber: f, rent: 1600 + f * 200, isOccupied: true },
        { id: `${propertyId}-u${f}03`, unitNumber: `Unit ${f}03`, floorNumber: f, rent: 1700 + f * 200, isOccupied: false },
        { id: `${propertyId}-u${f}04`, unitNumber: `Unit ${f}04`, floorNumber: f, rent: 1800 + f * 200, isOccupied: true }
      );
    }
    setPropertyUnits(fallbackUnits);
    setLoadingUnits(false);
  };

  // Compute available floors for the selected property
  const selectedPropertyObj = propertiesList.find((p) => p.id === selectedPropertyId);
  const derivedFloorsFromUnits = Array.from(
    new Set(propertyUnits.map((u) => u.floorNumber || 1))
  ).sort((a, b) => (a as number) - (b as number));

  const availableFloors: number[] = derivedFloorsFromUnits.length > 0
    ? (derivedFloorsFromUnits as number[])
    : selectedPropertyObj?.totalFloors
    ? Array.from({ length: selectedPropertyObj.totalFloors }, (_, i) => i + 1)
    : [1, 2, 3, 4, 5];

  // 2. When Floor changes -> Reset selected unit & filter units matching floor
  const handleFloorChange = (floorStr: string) => {
    setSelectedFloor(floorStr);
    setSelectedUnitId("");
    setMonthlyRent("");
  };

  const filteredUnitsForFloor = propertyUnits.filter((u) => {
    if (!selectedFloor) return true;
    return String(u.floorNumber || 1) === String(selectedFloor);
  });

  // 3. When Unit changes -> Auto populate rent if available
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const targetUnit = propertyUnits.find((u) => u.id === unitId);
    if (targetUnit && targetUnit.rent) {
      setMonthlyRent(targetUnit.rent.toString());
    }
  };

  // Open modal for NEW tenant (NO pre-filled fields!)
  const handleOpenAddModal = () => {
    setEditingTenantId(null);
    setName("");
    setEmail("");
    setPhone("");
    setSelectedPropertyId("");
    setSelectedFloor("");
    setSelectedUnitId("");
    setPropertyUnits([]);
    setMonthlyRent("");
    setSecurityDeposit("");
    setLeaseStart(new Date().toISOString().split("T")[0]);
    setIdType("Passport");
    setIdNumber("");
    setGovIdFile(null);
    setGovIdUrl(null);
    setGovIdDocs([]);
    setLeaseFile(null);
    setLeaseUrl(null);
    setLeaseDocs([]);
    setCurrentStep(1);

    // Refresh properties list
    fetchPropertiesList();
    setShowAddModal(true);
  };

  // Open modal for EDITING tenant
  const handleOpenEditModal = async (t: TenantItem) => {
    setEditingTenantId(t.id);
    setName(t.name);
    setEmail(t.email);
    setPhone(t.phone ? t.phone.replace(/^\+\d+\s*/, "") : "");
    setMonthlyRent(t.monthlyRent ? t.monthlyRent.toString() : "");
    setSecurityDeposit(t.securityDeposit ? t.securityDeposit.toString() : "");
    setLeaseStart(t.leaseStart || new Date().toISOString().split("T")[0]);
    setGovIdUrl(t.govIdUrl || null);
    setLeaseUrl(t.leaseDocUrl || null);
    setCurrentStep(1);
    setShowAddModal(true);
  };

  // NORMAL LEASE EXIT
  const openNormalExitModal = (t: TenantItem) => {
    setExitTenant(t);
    setExitMoveOutDate(new Date().toISOString().split("T")[0]);
    setDepositSettlement("Full Deposit Refunded");
    setKeysReturned(true);
    setStarRating(5);
    setExitHealthScore(t.healthScore || 85);
    setReviewNotes(`Resident ${t.name} completed tenancy tenure cleanly and maintained room in great condition.`);
    setShowNormalExitModal(true);
  };

  const handleNormalExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitTenant) return;

    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: exitTenant.name,
          period: `${exitTenant.leaseStart} – ${exitMoveOutDate}`,
          rent: exitTenant.monthlyRent ? `$${exitTenant.monthlyRent.toLocaleString()}/mo` : "$0/mo",
          status: "Lease Completed",
          review: reviewNotes || "Normal lease exit completed.",
          rating: starRating,
          healthScore: Number(exitHealthScore) || 85, // Assigned departure health score
          depositSettlement,
          keysReturned,
          tenantId: exitTenant.id,
          unitId: exitTenant.unitId,
          propertyId: exitTenant.propertyId,
          workspaceId: exitTenant.workspaceId,
          floorNumber: exitTenant.floorNumber,
        }),
      });

      await fetch(`/api/tenants/${encodeURIComponent(exitTenant.id)}`, {
        method: "DELETE",
      });

      toast(`Resident ${exitTenant.name} offboarded cleanly. Review saved with ${starRating}★ rating!`, "success");
      fetchTenants();
    } catch (err) {
      console.error("Normal exit error:", err);
      toast("Failed to offboard tenant", "error");
    } finally {
      setShowNormalExitModal(false);
      setExitTenant(null);
    }
  };

  // REMOVE / EVICT RESIDENT
  const openRemoveModal = (t: TenantItem) => {
    setRemoveTenantTarget(t);
    setRemovalReason("Non-Payment of Rent / Financial Default");
    setRemovalDate(new Date().toISOString().split("T")[0]);
    setDueAmount("1200");
    setRemoveHealthScore(45);
    setIncidentNotes(`Resident removed due to non-payment of rent and lease policy breach.`);
    setFlagTenant(true);
    setShowRemoveModal(true);
  };

  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeTenantTarget) return;

    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: removeTenantTarget.name,
          period: `${removeTenantTarget.leaseStart} – ${removalDate}`,
          rent: removeTenantTarget.monthlyRent ? `$${removeTenantTarget.monthlyRent.toLocaleString()}/mo` : "$0/mo",
          status: "Removed / Evicted",
          removalReason,
          review: incidentNotes || "Resident removed due to policy breach.",
          rating: 1,
          healthScore: Number(removeHealthScore) || 45, // Eviction health score penalty
          tenantId: removeTenantTarget.id,
          unitId: removeTenantTarget.unitId,
          propertyId: removeTenantTarget.propertyId,
          workspaceId: removeTenantTarget.workspaceId,
          floorNumber: removeTenantTarget.floorNumber,
        }),
      });

      await fetch(`/api/tenants/${encodeURIComponent(removeTenantTarget.id)}`, {
        method: "DELETE",
      });

      toast(`Resident ${removeTenantTarget.name} removed. Incident archived in database.`, "warning");
      fetchTenants();
    } catch (err) {
      console.error("Evict resident error:", err);
      toast("Failed to remove tenant", "error");
    } finally {
      setShowRemoveModal(false);
      setRemoveTenantTarget(null);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim() || !email.trim()) {
        toast("Please fill in Resident Name and Email before proceeding.", "info");
        return;
      }
      if (!selectedPropertyId) {
        toast("Please select a Property.", "info");
        return;
      }
      if (!selectedFloor) {
        toast("Please select a Floor.", "info");
        return;
      }
      if (!selectedUnitId) {
        toast("Please select an assigned Room / Unit.", "info");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  // Submit Add / Edit Tenant Form
  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNextStep();
      return;
    }
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = phone.trim()
        ? `${selectedCountry.dialCode} ${phone.trim()}`
        : "";

      const documentsPayload = [
        ...govIdDocs.map((d) => ({
          title: `${d.name} — ${name}`,
          docType: "Government ID",
          fileUrl: d.url,
          fileName: d.name,
          type: d.type,
        })),
        ...leaseDocs.map((d) => ({
          title: `${d.name} — ${name}`,
          docType: "Lease Agreement",
          fileUrl: d.url,
          fileName: d.name,
          type: d.type,
        })),
      ];

      const payload = {
        name,
        email,
        phone: fullPhoneNumber,
        monthlyRent: parseFloat(monthlyRent) || 0,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
        leaseStart,
        unitId: selectedUnitId || null,
        propertyId: selectedPropertyId || null,
        floorNumber: selectedFloor ? Number(selectedFloor) : 1,
        govIdType: idType,
        govIdNumber: idNumber,
        govIdUrl: govIdDocs[0]?.url || govIdUrl || null,
        leaseDocUrl: leaseDocs[0]?.url || leaseUrl || null,
        documents: documentsPayload,
      };

      if (editingTenantId) {
        const res = await fetch(`/api/tenants/${encodeURIComponent(editingTenantId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          toast(`Tenant ${name} updated successfully!`, "success");
          fetchTenants();
        } else {
          toast("Failed to update tenant", "error");
        }
      } else {
        const res = await fetch("/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          toast(json.message || `Resident ${name} added successfully!`, "success");
          fetchTenants();
        } else {
          toast("Failed to add tenant", "error");
        }
      }
      setShowAddModal(false);
    } catch (err) {
      console.error("Tenant form submit error:", err);
      toast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200 min-h-screen pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tenant Registry &amp; Behavioral Health
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Central resident telemetry, document compliance, and health score monitoring across all properties
              </p>
            </div>
          </div>
        </div>

        {/* Search, Status Filters, View Switcher & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter Dropdown (Current vs Past vs All) */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer shadow-2xs"
          >
            <option value="Current">
              Current Residents ({tenants.filter(t => t.currentStatus === "Current" || (Boolean(t.unitId) && t.currentStatus !== "Exited" && t.currentStatus !== "Evicted")).length})
            </option>
            <option value="Past">
              Past Residents ({tenants.filter(t => t.currentStatus === "Past" || t.currentStatus === "Exited" || t.currentStatus === "Evicted" || !t.unitId).length})
            </option>
            <option value="All">
              All Residents ({tenants.length})
            </option>
          </select>

          <div className="relative w-56 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tenant name or unit..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          {/* View Switcher Toggle Button (Icon Only) */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-xl">
            <button
              onClick={() => setViewMode("card")}
              title="Grid Card View"
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white border border-slate-200 rounded-3xl">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading live tenant telemetry records...</p>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white border border-slate-200 rounded-3xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-extrabold text-slate-900">No matching tenants found.</p>
          <p className="text-xs text-slate-500">Click &quot;+ Add Tenant&quot; to onboard a new resident to your property portfolio.</p>
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: GRID CARD VIEW (Max 10 per page) */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedTenants.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B132B] text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {t.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                        <p className="text-xs font-semibold text-slate-500">{t.unit}</p>
                      </div>
                    </div>

                    {/* Health Score & Action Buttons */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.healthScore} / 100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{t.status} Rating</div>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          title="Edit Tenant"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openNormalExitModal(t)}
                          title="Normal Lease Completion Exit"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openRemoveModal(t)}
                          title="Evict / Remove Resident"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Rent Rate</span>
                      <span className="font-extrabold text-slate-900">${(t.monthlyRent || 0).toLocaleString()}/mo</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Lease Start Date</span>
                      <span className="font-extrabold text-slate-900">{t.leaseStart}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.phone || "No phone entered"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.govIdAttached ? (
                        <a
                          href={t.govIdUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 hover:underline"
                        >
                          <IdCard className="w-3 h-3 text-blue-600" />
                          ID Verified
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                          No ID Scan
                        </span>
                      )}
                      {t.leaseDocAttached ? (
                        <a
                          href={t.leaseDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 hover:underline"
                        >
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          Lease Signed
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                          No Contract
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: TABLE VIEW (Max 10 per page) */}
          {viewMode === "table" && (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Resident</th>
                      <th className="px-5 py-3.5">Assigned Room / Unit</th>
                      <th className="px-5 py-3.5">Health Score</th>
                      <th className="px-5 py-3.5">Monthly Rent</th>
                      <th className="px-5 py-3.5">Contact Phone</th>
                      <th className="px-5 py-3.5">Doc Compliance</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
                    {paginatedTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0B132B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {t.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <span className="font-extrabold block text-slate-900">{t.name}</span>
                              <span className="text-[11px] text-slate-400 font-medium">{t.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{t.unit}</td>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.healthScore} / 100</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-extrabold text-slate-900">${(t.monthlyRent || 0).toLocaleString()}/mo</td>
                        <td className="px-5 py-4 text-slate-600">{t.phone || "—"}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {t.govIdAttached && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">ID</span>
                            )}
                            {t.leaseDocAttached && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Lease</span>
                            )}
                            {!t.govIdAttached && !t.leaseDocAttached && (
                              <span className="text-[11px] text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              title="Edit Tenant"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openNormalExitModal(t)}
                              title="Normal Lease Completion Exit"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRemoveModal(t)}
                              title="Evict / Remove Resident"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION BAR */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold shadow-2xs">
            <div className="text-slate-500">
              Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{" "}
              <strong className="text-slate-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredTenants.length)}</strong> of{" "}
              <strong className="text-slate-900">{filteredTenants.length}</strong> residents
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#FF6B00] text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL 2: NORMAL LEASE EXIT & RATING REVIEW MODAL */}
      {showNormalExitModal && exitTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleNormalExitSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Normal Lease Completion Exit
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Offboarding resident {exitTenant.name} from {exitTenant.unit}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNormalExitModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <span className="font-bold block text-xs">Gradual Lease Offboarding Protocol</span>
                <p className="text-[11px] text-emerald-800">
                  Tenant has completed their stay. Saving this offboarding form will record their timeline in room history with your landlord review rating.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Departure Move-out Date</label>
                  <input
                    type="date"
                    required
                    value={exitMoveOutDate}
                    onChange={(e) => setExitMoveOutDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit Settlement</label>
                  <select
                    value={depositSettlement}
                    onChange={(e) => setDepositSettlement(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Full Deposit Refunded">Full Deposit Refunded ($100%)</option>
                    <option value="Partial Refund (Deductions Applied)">Partial Refund (Deductions Applied)</option>
                    <option value="Withheld Deposit">Withheld Deposit</option>
                  </select>
                </div>
              </div>

              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keysReturned}
                  onChange={(e) => setKeysReturned(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800 text-xs">
                  All room keys, smart access cards, and parking passes returned
                </span>
              </label>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-amber-900 uppercase text-[11px]">
                    Landlord Rating for {exitTenant.name}
                  </label>
                  <span className="font-black text-amber-900 text-xs">
                    {starRating}.0 / 5.0 Stars
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= starRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-amber-900 uppercase text-[10px] mb-1">
                    Assign Final Departure Health Score (0 – 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={exitHealthScore}
                    onChange={(e) => setExitHealthScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Landlord Review &amp; Tenancy Feedback Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Paid rent on time every month via Autopilot. Kept room clean and quiet..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNormalExitModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Normal Exit &amp; Save Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: REMOVE / EVICT OCCUPANT MODAL */}
      {showRemoveModal && removeTenantTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleRemoveSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Evict / Remove Resident
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Offboarding resident {removeTenantTarget.name} from {removeTenantTarget.unit}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
                <span className="font-bold block text-xs">⚠️ Policy Violation or Eviction Action</span>
                <p className="text-[11px] text-rose-800">
                  This action immediately removes the occupant, updates room occupancy, and archives the incident breach in landlord history.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Reason for Removal / Eviction</label>
                <select
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Non-Payment of Rent / Financial Default">Non-Payment of Rent / Financial Default</option>
                  <option value="Property Damage / Unauthorized Alterations">Property Damage / Unauthorized Alterations</option>
                  <option value="Noise Complaints / Nuisance Violations">Noise Complaints / Nuisance Violations</option>
                  <option value="Mutual Early Termination Agreement">Mutual Early Termination Agreement</option>
                  <option value="Emergency / Safety Violation">Emergency / Safety Violation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Removal Effective Date</label>
                  <input
                    type="date"
                    required
                    value={removalDate}
                    onChange={(e) => setRemovalDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Outstanding Dues ($ / ₹)</label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-rose-900 uppercase mb-1">
                  Eviction / Removal Health Score Penalty (0 – 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={removeHealthScore}
                  onChange={(e) => setRemoveHealthScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs font-black text-rose-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Incident Notes &amp; Breach Details</label>
                <textarea
                  rows={3}
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder="Record details of the breach, formal warnings issued, or early termination agreement..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <label className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center gap-3 cursor-pointer text-rose-900">
                <input
                  type="checkbox"
                  checked={flagTenant}
                  onChange={(e) => setFlagTenant(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <span className="font-bold text-xs">
                  ⚠️ Flag resident profile in Tenant Registry for future landlord warnings
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Removal &amp; Archive Log</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MULTI-STEP WIZARD MODAL: ADD / EDIT TENANT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddTenantSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    {editingTenantId ? "Edit Resident Profile" : "Onboard New Resident"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Step {currentStep} of 3 — {currentStep === 1 ? "Basic & Location Details" : currentStep === 2 ? "Government ID Upload" : "Lease Docs & Compliance"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 text-center text-xs font-bold">
              <div className={`py-1.5 rounded-xl transition-all ${currentStep === 1 ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-600"}`}>
                1. Basic Info
              </div>
              <div className={`py-1.5 rounded-xl transition-all ${currentStep === 2 ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-600"}`}>
                2. Govt ID (R2)
              </div>
              <div className={`py-1.5 rounded-xl transition-all ${currentStep === 3 ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-600"}`}>
                3. Lease Contract
              </div>
            </div>

            {/* Step 1: Basic & Unit Details (DYNAMIC CASCADING SELECTS) */}
            {currentStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter resident full name..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Dynamic Cascading Location Dropdowns: Property -> Floor -> Unit */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
                  <span className="font-extrabold text-[#FF6B00] uppercase text-[11px] block flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Property, Floor &amp; Unit Selection (Cascading API)
                  </span>

                  <div className="space-y-3">
                    {/* 1. Property Dropdown (Fetched from API) */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">1. Select Property *</label>
                      <select
                        required
                        value={selectedPropertyId}
                        onChange={(e) => handlePropertyChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="">-- Select Property --</option>
                        {propertiesList.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 2. Floor Dropdown (Disabled until Property is selected) */}
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">2. Select Floor *</label>
                        <select
                          required
                          disabled={!selectedPropertyId}
                          value={selectedFloor}
                          onChange={(e) => handleFloorChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!selectedPropertyId ? "-- Select Property First --" : "-- Select Floor --"}
                          </option>
                          {availableFloors.map((fl) => (
                            <option key={fl} value={fl}>Floor {fl}</option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Unit Dropdown (Disabled until Floor is selected) */}
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">3. Select Room / Unit *</label>
                        <select
                          required
                          disabled={!selectedFloor || loadingUnits}
                          value={selectedUnitId}
                          onChange={(e) => handleUnitChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {loadingUnits
                              ? "Loading units..."
                              : !selectedFloor
                              ? "-- Select Floor First --"
                              : filteredUnitsForFloor.length === 0
                              ? "-- No units on this floor --"
                              : "-- Select Unit --"}
                          </option>
                          {filteredUnitsForFloor.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.unitNumber} {u.isOccupied ? "(Occupied)" : "(Vacant)"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="resident@domain.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Phone Number (Optional)</label>
                    <CountryPhoneInput
                      selectedCountry={selectedCountry}
                      onCountryChange={setSelectedCountry}
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ($ / ₹) *</label>
                    <input
                      type="number"
                      required
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="e.g. 1850"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Lease Start Date *</label>
                    <input
                      type="date"
                      required
                      value={leaseStart}
                      onChange={(e) => setLeaseStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit ($ / ₹) (Optional)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Government ID & R2 Upload */}
            {currentStep === 2 && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Government ID Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Passport">Passport</option>
                      <option value="Driver's License">Driver&apos;s License</option>
                      <option value="National Identity Card (Aadhaar / SSN)">National Identity Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">ID Number / Serial</label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter ID number..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Cloudflare R2 Multiple Upload Box */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Government ID Document Scan (Upload Multiple Files to Cloudflare R2)
                  </label>
                  <label className="p-5 border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-orange-50/20 group relative overflow-hidden block">
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        setGovIdUploading(true);
                        setGovIdProgress(10);
                        let completedCount = 0;

                        for (const file of files) {
                          const validation = validateFile(file);
                          if (!validation.valid && validation.error) {
                            toast(validation.error, "error");
                            continue;
                          }
                          try {
                            const res = await uploadFile(file, {
                              workspaceId: "tenants",
                              context: "gov-id",
                              onProgress: (pct) => setGovIdProgress(Math.round(((completedCount + pct / 100) / files.length) * 100)),
                            });
                            if (res.success && res.url) {
                              const newDoc = {
                                id: `govid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                name: file.name,
                                url: res.url,
                                type: idType,
                              };
                              setGovIdDocs((prev) => [...prev, newDoc]);
                              setGovIdUrl(res.url);
                              toast(`Uploaded "${file.name}" to R2 storage!`, "success");
                            } else {
                              toast(`Upload failed: ${res.error || "Unknown error"}`, "error");
                            }
                          } catch (uploadErr: any) {
                            toast(`Upload failed: ${uploadErr?.message}`, "error");
                          }
                          completedCount++;
                        }
                        setGovIdUploading(false);
                      }}
                    />
                    <Upload className="w-7 h-7 text-slate-400 group-hover:text-[#FF6B00] transition-colors mb-1.5" />
                    <span className="font-extrabold text-slate-800 text-xs">Click to select &amp; upload multiple ID files to Cloudflare R2</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 font-medium">PNG, JPG, WebP, PDF — Front, Back &amp; Secondary ID scans</span>

                    {govIdUploading && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-[#FF6B00] h-full transition-all duration-200" style={{ width: `${govIdProgress}%` }} />
                      </div>
                    )}
                  </label>

                  {/* Uploaded Government ID Documents List with Remove Option */}
                  {govIdDocs.length > 0 && (
                    <div className="space-y-2 pt-3">
                      <span className="font-bold text-slate-700 uppercase text-[11px] block">
                        Uploaded Government ID Media ({govIdDocs.length})
                      </span>
                      <div className="space-y-2">
                        {govIdDocs.map((doc) => (
                          <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                <IdCard className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                                <div className="text-[10px] text-slate-500 font-semibold">{doc.type} • Cloudflare R2 Saved</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                              >
                                View
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setGovIdDocs((prev) => prev.filter((d) => d.id !== doc.id));
                                  toast(`Removed document ${doc.name}`, "info");
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove Uploaded Document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Lease Contract & R2 Upload */}
            {currentStep === 3 && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Signed Residential Lease Agreement">Signed Residential Lease Agreement</option>
                    <option value="Police Verification Certificate">Police Verification Certificate</option>
                    <option value="Proof of Income / Salary Slip">Proof of Income / Salary Slip</option>
                  </select>
                </div>

                {/* Cloudflare R2 Upload Box for Lease Contracts & Compliance Documents */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Signed Lease Agreement &amp; Compliance Documents (Upload Multiple Files to Cloudflare R2)
                  </label>
                  <label className="p-5 border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-orange-50/20 group relative overflow-hidden block">
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        setLeaseUploading(true);
                        setLeaseProgress(10);
                        let completedCount = 0;

                        for (const file of files) {
                          const validation = validateFile(file);
                          if (!validation.valid && validation.error) {
                            toast(validation.error, "error");
                            continue;
                          }
                          try {
                            const res = await uploadFile(file, {
                              workspaceId: "tenants",
                              context: "lease-docs",
                              onProgress: (pct) => setLeaseProgress(Math.round(((completedCount + pct / 100) / files.length) * 100)),
                            });
                            if (res.success && res.url) {
                              const newDoc = {
                                id: `lease-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                name: file.name,
                                url: res.url,
                                type: docType,
                              };
                              setLeaseDocs((prev) => [...prev, newDoc]);
                              setLeaseUrl(res.url);
                              toast(`Uploaded "${file.name}" to R2 storage!`, "success");
                            } else {
                              toast(`Upload failed: ${res.error || "Unknown error"}`, "error");
                            }
                          } catch (uploadErr: any) {
                            toast(`Upload failed: ${uploadErr?.message}`, "error");
                          }
                          completedCount++;
                        }
                        setLeaseUploading(false);
                      }}
                    />
                    <FileCheck className="w-7 h-7 text-slate-400 group-hover:text-[#FF6B00] transition-colors mb-1.5" />
                    <span className="font-extrabold text-slate-800 text-xs">Click to select &amp; upload multiple lease contracts or verification files</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 font-medium">PDF, WebP, PNG — Lease agreement, Police clearance &amp; income proofs</span>

                    {leaseUploading && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-[#FF6B00] h-full transition-all duration-200" style={{ width: `${leaseProgress}%` }} />
                      </div>
                    )}
                  </label>

                  {/* Uploaded Lease Documents List with Remove Option */}
                  {leaseDocs.length > 0 && (
                    <div className="space-y-2 pt-3">
                      <span className="font-bold text-slate-700 uppercase text-[11px] block">
                        Uploaded Lease &amp; Compliance Files ({leaseDocs.length})
                      </span>
                      <div className="space-y-2">
                        {leaseDocs.map((doc) => (
                          <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                <FileCheck className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                                <div className="text-[10px] text-slate-500 font-semibold">{doc.type} • Cloudflare R2 Saved</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                              >
                                View
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setLeaseDocs((prev) => prev.filter((d) => d.id !== doc.id));
                                  toast(`Removed document ${doc.name}`, "info");
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove Uploaded Document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wizard Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextStep();
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingTenantId ? "Save Changes" : "Complete Resident Onboarding"}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
