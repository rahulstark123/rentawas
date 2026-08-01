"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  Layers, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  Bed, 
  Bath, 
  Maximize2, 
  Zap, 
  ShieldCheck, 
  Plus,
  MapPin,
  Sparkles,
  Search,
  Filter,
  X,
  UserPlus,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Receipt,
  Paperclip,
  Eye,
  History,
  Wrench,
  FileCheck,
  ExternalLink,
  Download,
  AlertTriangle,
  UserCheck,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Check,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { getActiveWorkspaceId, ensureActiveWorkspaceId } from "@/lib/workspace";
import { getActivePaymentMethods, type ActivePaymentMethod } from "@/lib/paymentMethods";
import CountryPhoneInput, { ALL_COUNTRIES, Country, getDefaultCountryByLocale } from "@/components/ui/CountryPhoneInput";

// Interface for unit item
export interface UnitItem {
  unitNo: string;
  type: string;
  sqft: string;
  rooms: string;
  rent: string;
  rawRent?: number;
  status: "Occupied" | "Vacant";
  tenant: {
    name: string;
    contact: string;
    phone: string;
    email: string;
    moveIn: string;
    leaseEnd: string;
    health: string;
  } | null;
}

// Mock data repository of properties
const PROPERTIES_DB: Record<string, {
  id: string;
  name: string;
  address: string;
  floors: number;
  units: number;
  occupied: number;
  monthlyYield: string;
  status: string;
  tag: string;
}> = {
  "PROP-1": {
    id: "PROP-1",
    name: "The Regent - Wing A",
    address: "1420 5th Ave, Seattle, WA 98101",
    floors: 6,
    units: 24,
    occupied: 0,
    monthlyYield: "$0",
    status: "0% Occupied",
    tag: "Residential Tower",
  },
  "PROP-2": {
    id: "PROP-2",
    name: "Downtown Horizon Suites",
    address: "800 Bellevue Way NE, Bellevue, WA 98004",
    floors: 4,
    units: 18,
    occupied: 0,
    monthlyYield: "$0",
    status: "0% Occupied",
    tag: "Luxury Apartments",
  },
  "PROP-3": {
    id: "PROP-3",
    name: "Oakwood Executive Residency",
    address: "2100 Westlake Ave, Seattle, WA 98121",
    floors: 3,
    units: 12,
    occupied: 0,
    monthlyYield: "$0",
    status: "0% Occupied",
    tag: "Executive Suites",
  },
  "PROP-4": {
    id: "PROP-4",
    name: "Skyline Manor",
    address: "1100 Mercer St, Seattle, WA 98109",
    floors: 2,
    units: 8,
    occupied: 0,
    monthlyYield: "$0",
    status: "0% Occupied",
    tag: "Boutique Housing",
  },
};

export default function PropertyFloorPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { formatCurrency, currencySymbol } = useCurrency();

  const propId = (params?.id as string) || "PROP-1";
  const propertyMock = PROPERTIES_DB[propId] || PROPERTIES_DB["PROP-1"];

  const [loading, setLoading] = useState(true);

  const [propertyData, setPropertyData] = useState({
    id: propId,
    name: propertyMock.name,
    address: propertyMock.address,
    floors: propertyMock.floors,
    units: propertyMock.units,
    occupied: propertyMock.occupied,
    monthlyYield: propertyMock.monthlyYield,
    rawMonthlyYield: 0,
    status: propertyMock.status,
    tag: propertyMock.tag,
  });

  const [floorsCount, setFloorsCount] = useState<number>(propertyMock.floors || 4);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "occupied" | "vacant">("all");

  // Dynamic Units State indexed by Floor Number
  const [floorUnitsMap, setFloorUnitsMap] = useState<Record<number, UnitItem[]>>({});

  // Fetch live property details & unit matrix from API
  useEffect(() => {
    async function loadPropertyDetails() {
      setLoading(true);
      try {
        const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
        if (!activeWid) return;
        const res = await fetch(`/api/properties/${propId}?wid=${activeWid}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          const apiProp = json.data;
          const totalUnitsCount = apiProp.units ? apiProp.units.length : (apiProp.totalUnits || 0);
          const occupiedCount = apiProp.units ? apiProp.units.filter((u: any) => u.isOccupied).length : 0;
          const totalYield = apiProp.units 
            ? apiProp.units.filter((u: any) => u.isOccupied).reduce((acc: number, u: any) => acc + (u.rent || 0), 0) 
            : 0;
          const occPercent = totalUnitsCount > 0 ? Math.round((occupiedCount / totalUnitsCount) * 100) : 0;

          setPropertyData({
            id: apiProp.id,
            name: apiProp.name,
            address: apiProp.address,
            floors: apiProp.floors || 1,
            units: totalUnitsCount,
            occupied: occupiedCount,
            rawMonthlyYield: totalYield,
            monthlyYield: `$${totalYield.toLocaleString()}`,
            status: `${occPercent}% Occupied`,
            tag: apiProp.category || "Property",
          });

          setFloorsCount(apiProp.floors || 1);

          // Build floorUnitsMap from API units
          if (apiProp.units && apiProp.units.length > 0) {
            const apiFloorMap: Record<number, UnitItem[]> = {};
            apiProp.units.forEach((u: any) => {
              const fl = u.floorNumber || 1;
              if (!apiFloorMap[fl]) apiFloorMap[fl] = [];

              const primaryTenant = u.tenants && u.tenants.length > 0 ? u.tenants[0] : null;

              apiFloorMap[fl].push({
                unitNo: u.unitNumber,
                type: u.type || "Standard Suite",
                sqft: u.sqft || "850 sq ft",
                rooms: u.rooms || "2 Bedrooms • 2 Baths • Living • Kitchen",
                rawRent: u.rent || 0,
                rent: `$${(u.rent || 0).toLocaleString()}/mo`,
                status: u.isOccupied ? "Occupied" : "Vacant",
                tenant: primaryTenant ? {
                  name: primaryTenant.fullName || primaryTenant.name || "Resident",
                  contact: "Primary Resident",
                  phone: primaryTenant.phone || "+1 (555) 000-0000",
                  email: primaryTenant.email || "resident@rentawas.com",
                  moveIn: primaryTenant.moveInDate ? new Date(primaryTenant.moveInDate).toISOString().split("T")[0] : "2025-01-01",
                  leaseEnd: primaryTenant.leaseEndDate ? new Date(primaryTenant.leaseEndDate).toISOString().split("T")[0] : "2026-01-01",
                  health: "Active Tenant",
                } : null,
              });
            });
            setFloorUnitsMap(apiFloorMap);
          }
        }
      } catch (err) {
        console.warn("Could not fetch property detail API:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPropertyDetails();
  }, [propId]);

  // Modals state
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // Room Telemetry Details Drawer / Modal State
  const [selectedDetailUnit, setSelectedDetailUnit] = useState<UnitItem | null>(null);
  const [detailTab, setDetailTab] = useState<"resident" | "docs" | "history" | "maintenance" | "bills">("resident");

  // Add Floor Modal Form State
  // (floor is created empty; units are added via Add Unit modal)

  // Add Unit Modal Form State
  const [unitFloorTarget, setUnitFloorTarget] = useState<number>(1);
  const [newUnitNo, setNewUnitNo] = useState("");
  const [newUnitType, setNewUnitType] = useState("2 BHK Executive Suite");
  const [newSqft, setNewSqft] = useState("950 sq ft");
  const [newRooms, setNewRooms] = useState("2 Bedrooms • 2 Baths • Living Room • Kitchen • Balcony");
  const [newRent, setNewRent] = useState("");
  const [newStatus, setNewStatus] = useState<"Occupied" | "Vacant">("Vacant");
  const [newTenantName, setNewTenantName] = useState("");

  // Unit Actions State (3-dots menu, Edit Unit, Delete Unit)
  const [activeUnitMenuNo, setActiveUnitMenuNo] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [editFloorTarget, setEditFloorTarget] = useState<number>(1);
  const [editUnitNo, setEditUnitNo] = useState("");
  const [editRent, setEditRent] = useState("");
  const [editStatus, setEditStatus] = useState<"Vacant" | "Occupied">("Vacant");
  const [editTenantName, setEditTenantName] = useState("");

  const [deletingUnit, setDeletingUnit] = useState<UnitItem | null>(null);
  const [confirmUnitNameInput, setConfirmUnitNameInput] = useState("");
  const [isUnitCopied, setIsUnitCopied] = useState(false);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);

  // Assign Tenant 4-Step Modal State
  const [assigningUnitNo, setAssigningUnitNo] = useState<string | null>(null);
  const [currentTenantStep, setCurrentTenantStep] = useState<1 | 2 | 3 | 4>(1);
  const [tenantName, setTenantName] = useState("");
  const [tenantBedSlot, setTenantBedSlot] = useState("");
  const [tenantMonthlyRent, setTenantMonthlyRent] = useState("");
  const [tenantRentDueDay, setTenantRentDueDay] = useState("1");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantSelectedCountry, setTenantSelectedCountry] = useState<Country>(() => getDefaultCountryByLocale(ALL_COUNTRIES));
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantLeaseStart, setTenantLeaseStart] = useState("");
  const [tenantIdType, setTenantIdType] = useState("Passport / Travel Document");
  const [tenantIdNumber, setTenantIdNumber] = useState("");
  const [collectFirstRent, setCollectFirstRent] = useState(true);
  const [firstRentAmount, setFirstRentAmount] = useState("");
  const [firstRentMethod, setFirstRentMethod] = useState("");
  const [firstRentPaid, setFirstRentPaid] = useState(true);
  const [activePaymentMethods, setActivePaymentMethods] = useState<ActivePaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const loadActivePaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        setActivePaymentMethods([]);
        setFirstRentMethod("");
        return;
      }
      const res = await fetch(`/api/workspace?wid=${encodeURIComponent(String(activeWid))}`);
      if (!res.ok) {
        setActivePaymentMethods([]);
        setFirstRentMethod("");
        return;
      }
      const json = await res.json();
      const methods = getActivePaymentMethods(json.data);
      setActivePaymentMethods(methods);
      setFirstRentMethod(methods[0]?.name || "");
    } catch {
      setActivePaymentMethods([]);
      setFirstRentMethod("");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          const match = ALL_COUNTRIES.find((c) => c.code === data.country_code);
          if (match) setTenantSelectedCountry(match);
        }
      })
      .catch(() => {});
  }, []);

  const openAssignTenantModal = (unitNo: string) => {
    setAssigningUnitNo(unitNo);
    setTenantName("");
    setTenantBedSlot("");
    setTenantMonthlyRent("");
    setTenantRentDueDay("1");
    setTenantPhone("");
    setTenantEmail("");
    setTenantLeaseStart(new Date().toISOString().split("T")[0]);
    setTenantIdNumber("");
    setTenantIdType("Passport / Travel Document");
    setCollectFirstRent(true);
    setFirstRentAmount("");
    setFirstRentMethod("");
    setFirstRentPaid(true);
    setCurrentTenantStep(1);
    void loadActivePaymentMethods();
  };

  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);

  const handleAssignTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTenantStep < 4) {
      if (currentTenantStep === 1) {
        if (!tenantName.trim() || !tenantEmail.trim()) {
          toast("Please fill in Resident Name and Email before proceeding.", "info");
          return;
        }
        if (!tenantMonthlyRent || Number(tenantMonthlyRent) <= 0) {
          toast("Please enter a valid monthly rent amount.", "info");
          return;
        }
        if (!firstRentAmount) setFirstRentAmount(tenantMonthlyRent);
        setCurrentTenantStep(2);
      } else if (currentTenantStep === 2) {
        setCurrentTenantStep(3);
      } else if (currentTenantStep === 3) {
        setCurrentTenantStep(4);
      }
      return;
    }

    if (isSubmittingTenant) return;
    if (!tenantName.trim() || !assigningUnitNo) return;

    if (collectFirstRent && activePaymentMethods.length === 0) {
      toast("Connect a payment integration in Settings before recording move-in payment, or uncheck collect rent.", "info");
      return;
    }
    if (collectFirstRent && !firstRentMethod) {
      toast("Select a payment method from your active integrations.", "info");
      return;
    }

    setIsSubmittingTenant(true);

    const fullPhoneNumber = tenantPhone.trim()
      ? `${tenantSelectedCountry.dialCode} ${tenantPhone.trim()}`
      : "";

    const rentVal = Number(tenantMonthlyRent) || 0;
    const dueDay = Math.min(28, Math.max(1, parseInt(tenantRentDueDay, 10) || 1));
    const moveInAmount = Number(firstRentAmount || tenantMonthlyRent) || rentVal;

    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      await fetch(`/api/units/${encodeURIComponent(assigningUnitNo)}/occupants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tenantName,
          email: tenantEmail,
          phone: fullPhoneNumber,
          monthlyRent: rentVal,
          rentDueDay: dueDay,
          leaseStart: tenantLeaseStart,
          propertyId: propId,
          floorNumber: selectedFloor,
          bedSlot: tenantBedSlot || null,
          govIdType: tenantIdType,
          govIdNumber: tenantIdNumber || null,
          collectFirstRent,
          firstRentAmount: moveInAmount,
          firstRentMethod,
          firstRentPaid,
          wid: activeWid ? Number(activeWid) : undefined,
        }),
      });
    } catch (err) {
      console.warn("Could not save tenant via API:", err);
    } finally {
      setIsSubmittingTenant(false);
    }

    setFloorUnitsMap((prevMap) => {
      const currentFlUnits = prevMap[selectedFloor] || [];
      const updatedFlUnits = currentFlUnits.map((u) => {
        if (u.unitNo === assigningUnitNo) {
          return {
            ...u,
            status: "Occupied" as const,
            rent: rentVal > 0 ? `${currencySymbol}${rentVal}/mo` : u.rent,
            tenant: {
              name: tenantName,
              contact: "Primary Resident",
              phone: fullPhoneNumber || "—",
              email: tenantEmail || "resident@rentawas.com",
              moveIn: tenantLeaseStart || new Date().toISOString().split("T")[0],
              leaseEnd: "2027-07-31",
              health: "Active Tenant",
            },
          };
        }
        return u;
      });
      return { ...prevMap, [selectedFloor]: updatedFlUnits };
    });

    toast(
      collectFirstRent
        ? `Resident "${tenantName}" assigned. Move-in rent of ${formatCurrency(moveInAmount)} recorded.`
        : `Resident "${tenantName}" assigned to ${assigningUnitNo} successfully!`,
      "success"
    );
    setAssigningUnitNo(null);
  };

  const floorsList = Array.from({ length: floorsCount }, (_, i) => floorsCount - i);

  // Units for a floor — never invent demo units; empty means truly vacant floor
  const getFloorUnits = (floorNum: number): UnitItem[] => {
    return floorUnitsMap[floorNum] || [];
  };

  const currentRawUnits = getFloorUnits(selectedFloor);
  const currentUnits = currentRawUnits.filter((u) => {
    if (filterStatus === "occupied" && u.status !== "Occupied") return false;
    if (filterStatus === "vacant" && u.status !== "Vacant") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.unitNo.toLowerCase().includes(q) || u.type.toLowerCase().includes(q) || (u.tenant?.name || "").toLowerCase().includes(q);
    }
    return true;
  });

  // Handler: Add Floor Level
  const handleAddFloorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFloorNumber = floorsCount + 1;
    setFloorsCount(newFloorNumber);
    setSelectedFloor(newFloorNumber);
    setFloorUnitsMap((prev) => ({ ...prev, [newFloorNumber]: [] }));
    toast(`Floor ${newFloorNumber} created. Add units to this floor when ready.`, "success");
    setShowAddFloorModal(false);
  };

  // Handler: Add Unit
  const handleAddUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetFl = unitFloorTarget || selectedFloor;
    const cleanNum = newUnitNo.replace(/\D/g, "").trim();

    if (!cleanNum) {
      toast("Please enter a unit number before creating.", "info");
      return;
    }
    if (!newRent.trim() || Number(newRent) <= 0) {
      toast("Please enter a valid monthly rent amount.", "info");
      return;
    }

    const finalUnitNo = `Unit ${cleanNum}`;
    const existingOnFloor = getFloorUnits(targetFl);
    const isDuplicate = existingOnFloor.some((u) => u.unitNo.toLowerCase() === finalUnitNo.toLowerCase());

    if (isDuplicate) {
      toast(`Unit "${finalUnitNo}" already exists on Floor ${targetFl}! Please use a different unit number.`, "error");
      return;
    }

    const rentVal = parseFloat(newRent) || 0;

    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch(`/api/properties/${propertyData.id}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: activeWid ? Number(activeWid) : undefined,
          unitNumber: finalUnitNo,
          floorNumber: targetFl,
          rent: rentVal,
          isOccupied: newStatus === "Occupied",
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast(json.error || "Failed to create unit.", "error");
        return;
      }
    } catch (err) {
      console.warn("Could not save unit via API:", err);
      toast("Could not save unit to server. Please try again.", "error");
      return;
    }

    const newUnitObj: UnitItem = {
      unitNo: finalUnitNo,
      type: newUnitType,
      sqft: newSqft || "950 sq ft",
      rooms: newRooms || "2 Bedrooms • 2 Baths • Kitchen",
      rawRent: rentVal,
      rent: `${currencySymbol}${rentVal.toLocaleString()}/mo`,
      status: newStatus,
      tenant: newStatus === "Occupied" ? {
        name: newTenantName.trim() || "New Resident",
        contact: "Primary Resident",
        phone: "+1 (555) 019-2831",
        email: "resident@rentawas.com",
        moveIn: "2026-08-01",
        leaseEnd: "2027-07-31",
        health: "ACH — Active",
      } : null,
    };

    setFloorUnitsMap((prev) => ({
      ...prev,
      [targetFl]: [newUnitObj, ...(prev[targetFl] || [])],
    }));

    setPropertyData((prev) => {
      const nextYield = newStatus === "Occupied" ? prev.rawMonthlyYield + rentVal : prev.rawMonthlyYield;
      const nextOccupied = newStatus === "Occupied" ? prev.occupied + 1 : prev.occupied;
      const nextUnits = prev.units + 1;
      const occPercent = nextUnits > 0 ? Math.round((nextOccupied / nextUnits) * 100) : 0;
      return {
        ...prev,
        units: nextUnits,
        occupied: nextOccupied,
        rawMonthlyYield: nextYield,
        monthlyYield: `${currencySymbol}${nextYield.toLocaleString()}`,
        status: `${occPercent}% Occupied`,
      };
    });

    setSelectedFloor(targetFl);
    setNewUnitNo("");
    setNewRent("");
    setNewTenantName("");
    setShowAddUnitModal(false);
    toast(`${finalUnitNo} created on Floor ${targetFl}!`, "success");
  };

  if (loading) {
    return (
      <div className="space-y-8 font-sans animate-in fade-in duration-200 min-h-[60vh] flex flex-col justify-center items-center py-24">
        <div className="p-4 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-200/80 shadow-md animate-bounce mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
          <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin" />
          <span>Fetching Property & Inventory Data...</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 mt-1">Loading real building specs and unit floor maps</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Breadcrumb Nav & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties Inventory</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {propertyData.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
              {propertyData.tag}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{propertyData.address}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              toast(`Loading dedicated analytics for ${propertyData.name}...`, "info");
              router.push(`/dashboard/properties/${propertyData.id}/analytics`);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition-all uppercase tracking-wider cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
            <span>Property Analytics</span>
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).checkCanAddAction) {
                if (!(window as any).checkCanAddAction("Add New Property Unit")) return;
              }
              setUnitFloorTarget(selectedFloor);
              setNewUnitNo("");
              setNewRent("");
              setNewTenantName("");
              setShowAddUnitModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Unit to F-{selectedFloor}</span>
          </button>
        </div>
      </div>

      {/* Property Overview Ribbon Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Floors</span>
          <span className="text-xl font-black text-slate-900">{floorsCount} Floors</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Unit Inventory</span>
          <span className="text-xl font-black text-slate-900">{propertyData.units} Units</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Occupancy Rate</span>
          <span className="text-xl font-black text-emerald-600">{propertyData.status}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Monthly Gross Yield</span>
          <span className="text-xl font-black text-slate-900">{formatCurrency(propertyData.rawMonthlyYield || 0)}</span>
        </div>
      </div>

      {/* Main Floor Plan Architecture Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Vertical Floor Navigation (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6B00]" />
              <span>Building Floors ({floorsCount})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Select to Filter</span>
          </div>

          <div className="space-y-2">
            {floorsList.map((flNum) => {
              const isSelected = selectedFloor === flNum;
              const unitsOnFl = getFloorUnits(flNum);
              const occupiedOnFl = unitsOnFl.filter((u) => u.status === "Occupied").length;

              return (
                <button
                  key={flNum}
                  onClick={() => setSelectedFloor(flNum)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        isSelected ? "bg-[#FF6B00] text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      F{flNum}
                    </div>
                    <div>
                      <div className="font-bold text-xs">
                        {flNum === 1 ? "Floor 1 (Ground Level)" : `Floor ${flNum}`}
                      </div>
                      <div className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {occupiedOnFl}/{unitsOnFl.length} Units Occupied
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isSelected ? "text-[#FF6B00]" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddFloorModal(true)}
            className="w-full py-2.5 border border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 text-[#FF6B00] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Floor Level</span>
          </button>
        </div>

        {/* Right Main Column: Full Floor Breakdown & Units (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar: Search & Status Filter */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit, tenant, or room..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
                {(["all", "occupied", "vacant"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      filterStatus === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floor Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">
              Floor {selectedFloor} Units & Room Details
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Showing {currentUnits.length} Units
            </span>
          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentUnits.length === 0 && (
              <div className="md:col-span-2 p-10 rounded-2xl border border-dashed border-slate-200 bg-white text-center space-y-3">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">No units on Floor {selectedFloor} yet</p>
                <p className="text-xs text-slate-500">Add a unit with a number and monthly rent to get started.</p>
                <button
                  type="button"
                  onClick={() => {
                    setUnitFloorTarget(selectedFloor);
                    setShowAddUnitModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Unit
                </button>
              </div>
            )}
            {currentUnits.map((u) => {
              const isOccupied = u.status === "Occupied";
              return (
                <div
                  key={u.unitNo}
                  className={`bg-white border rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all space-y-5 ${
                    isOccupied ? "border-slate-200/90" : "border-amber-200 bg-amber-50/20"
                  }`}
                >
                  {/* Unit Title & Status Badge with Eye Icon Telemetry Button */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">{u.unitNo}</h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{u.type}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* EYE ICON: Full Details Page Link */}
                      <Link
                        href={`/dashboard/properties/${propId}/unit/${encodeURIComponent(u.unitNo)}`}
                        className="p-1.5 px-2.5 rounded-lg bg-orange-50 hover:bg-[#FF6B00] text-[#FF6B00] hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                        title="View Full Room Telemetry & History Page"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </Link>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isOccupied
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {u.status}
                      </span>

                      {/* 3-Dots Unit Actions Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveUnitMenuNo(activeUnitMenuNo === u.unitNo ? null : u.unitNo)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Unit Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeUnitMenuNo === u.unitNo && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 font-sans animate-in fade-in duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                openAssignTenantModal(u.unitNo);
                                setActiveUnitMenuNo(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-[#FF6B00] hover:bg-orange-50 flex items-center gap-2 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Add Resident / Tenant</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setEditingUnit(u);
                                setEditFloorTarget(selectedFloor);
                                setEditUnitNo(u.unitNo.replace(/\D/g, ""));
                                setEditRent(u.rent ? u.rent.replace(/\D/g, "") : "");
                                setEditStatus(u.status as any);
                                setEditTenantName(u.tenant?.name || "");
                                setActiveUnitMenuNo(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit Unit</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingUnit(u);
                                setConfirmUnitNameInput("");
                                setIsUnitCopied(false);
                                setActiveUnitMenuNo(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Unit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unit Quick Stats Ribbon (Monthly Rent & Active Tickets) */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                        Monthly Rent
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(u.rawRent !== undefined ? u.rawRent : (parseFloat(String(u.rent || "").replace(/[^0-9.]/g, "")) || 0))}/mo
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                        Active Tickets
                      </span>
                      <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-500" />
                        <span>0 Open</span>
                      </span>
                    </div>
                  </div>

                  {/* Tenant Details (If Occupied) */}
                  {isOccupied && u.tenant ? (
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3.5 font-sans">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold">
                            {u.tenant.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-white leading-none">
                              {u.tenant.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{u.tenant.contact}</div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          {u.tenant.health}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Move-in Date</span>
                          <span className="font-medium text-slate-200">{u.tenant.moveIn}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Lease Expiry</span>
                          <span className="font-medium text-slate-200">{u.tenant.leaseEnd}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => toast(`Calling ${u.tenant?.name} (${u.tenant?.phone})...`, "info")}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Call Resident</span>
                        </button>

                        <Link
                          href={`/dashboard/properties/${propId}/unit/${encodeURIComponent(u.unitNo)}`}
                          className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Vacant Unit Call to Action */
                    <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Unit Available for Lease
                      </div>
                      <p className="text-[11px] text-slate-500">
                        List unit on Portal or assign a new resident.
                      </p>
                      <button
                        onClick={() => openAssignTenantModal(u.unitNo)}
                        className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-bold shadow-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Assign Tenant to {u.unitNo}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ------------------- ROOM TELEMETRY & HISTORY MODAL (EYE ICON TRIGGER) ------------------- */}
      {selectedDetailUnit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-50 text-[#FF6B00]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">{selectedDetailUnit.unitNo} Telemetry & History</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6B00] text-white">
                      {selectedDetailUnit.rent}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDetailUnit.type} • {selectedDetailUnit.sqft} • {propertyData.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailUnit(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5-Tabs Navigation */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
              {[
                { id: "resident", label: "Who is Living", icon: Users },
                { id: "docs", label: "Tenant Docs", icon: FileCheck },
                { id: "history", label: "Room History", icon: History },
                { id: "maintenance", label: "Maintenance", icon: Wrench },
                { id: "bills", label: "Bills & Ledger", icon: Receipt },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: WHO IS LIVING (RESIDENT INFO) */}
            {detailTab === "resident" && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs">
                {selectedDetailUnit.tenant ? (
                  <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-lg">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-lg font-black shadow-md">
                          {selectedDetailUnit.tenant.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-white">{selectedDetailUnit.tenant.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{selectedDetailUnit.tenant.contact} • Active Resident</p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedDetailUnit.tenant.health}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-800/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Contact Phone</span>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{selectedDetailUnit.tenant.phone}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-800/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>{selectedDetailUnit.tenant.email}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-800/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Lease Start Date</span>
                        <div className="text-xs font-bold text-slate-200">{selectedDetailUnit.tenant.moveIn}</div>
                      </div>

                      <div className="p-3.5 bg-slate-800/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Lease Expiry Date</span>
                        <div className="text-xs font-bold text-amber-400">{selectedDetailUnit.tenant.leaseEnd}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => toast(`Calling ${selectedDetailUnit.tenant?.name}...`, "info")}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Direct Call</span>
                      </button>

                      <button
                        onClick={() => toast(`Sending email notification to ${selectedDetailUnit.tenant?.email}...`, "info")}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span>Send Email</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-amber-50/60 border border-amber-200 rounded-2xl text-center space-y-3">
                    <UserCheck className="w-10 h-10 text-amber-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">Room Currently Vacant</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No active resident is living in {selectedDetailUnit.unitNo}. Assign a new tenant to generate lease documents.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TENANT DOCS & VERIFICATION */}
            {detailTab === "docs" && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Government ID Verification</span>
                      <span className="text-[11px] text-slate-500">Aadhaar / Passport / Driver's License — State Database Verified</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                    VERIFIED ✓
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Signed Rental Lease Agreement", size: "2.4 MB • PDF Document", status: "Signed & Active" },
                    { title: "Police Background Verification", size: "1.1 MB • Official Seal", status: "Clear" },
                    { title: "Government Identity Proof", size: "850 KB • Aadhaar / Passport", status: "Verified" },
                    { title: "Security Deposit Receipt", size: "420 KB • Digital Ledger", status: "Deposited" },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-[#FF6B00] shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{doc.title}</span>
                          <span className="text-[10px] text-slate-400">{doc.size}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toast(`Downloading ${doc.title}...`, "success")}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ROOM HISTORY */}
            {detailTab === "history" && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total Historical Yield from {selectedDetailUnit.unitNo}</span>
                  <span className="font-black text-emerald-600 text-sm">$42,800 Generated</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Past Resident Timeline</h4>

                  {[
                    { name: selectedDetailUnit.tenant?.name || "Current Occupant", period: "Nov 2024 – Present", rent: selectedDetailUnit.rent, status: "Active Occupant", review: "5.0 ★ Excellent" },
                    { name: "Elena Rostova", period: "Jan 2023 – Oct 2024 (21 mos)", rent: "$3,100/mo", status: "Lease Completed", review: "4.9 ★ Clean Move-out" },
                    { name: "James Peterson", period: "Feb 2021 – Dec 2022 (22 mos)", rent: "$2,900/mo", status: "Lease Completed", review: "4.8 ★ Deposit Refunded" },
                  ].map((h, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs">
                          {h.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{h.name}</span>
                          <span className="text-[11px] text-slate-500">{h.period} • {h.rent}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 block mb-0.5">
                          {h.status}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">{h.review}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MAINTENANCE & TICKETS */}
            {detailTab === "maintenance" && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Maintenance & Repair Log for {selectedDetailUnit.unitNo}</h4>
                  <button
                    onClick={() => toast(`Opening Maintenance ticket creation for ${selectedDetailUnit.unitNo}...`, "info")}
                    className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log New Ticket</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: "TKT-402", issue: "HVAC Air Conditioning Filter Cleaning", priority: "Medium", status: "In Progress", date: "24 Jul 2026", tech: "Apex Climate Co." },
                    { id: "TKT-319", issue: "Master Bathroom Faucet Replacement", priority: "Low", status: "Completed ✓", date: "12 Jan 2026", tech: "QuickPlumb Services ($120)" },
                    { id: "TKT-208", issue: "Balcony Sliding Door Latch Repair", priority: "Low", status: "Completed ✓", date: "04 Aug 2025", tech: "Handyman Pro ($65)" },
                  ].map((t) => (
                    <div key={t.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-[#FF6B00] shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{t.id}: {t.issue}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{t.date} • Technician: {t.tech}</div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status.includes("Completed") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: BILLS & UTILITY INVOICES */}
            {detailTab === "bills" && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Monthly Billing Status: All Invoices Paid</span>
                  </div>
                  <span className="font-black text-xs">$0.00 Outstanding</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { inv: "INV-2026-07", title: "July Monthly Rent Invoice", amount: selectedDetailUnit.rent, date: "24 Jul 2026", status: "Paid ✓" },
                    { inv: "UTIL-2026-07", title: "Sub-meter Water & Power Utility Bill", amount: "$145.00", date: "20 Jul 2026", status: "Paid ✓" },
                    { inv: "INV-2026-06", title: "June Monthly Rent Invoice", amount: selectedDetailUnit.rent, date: "24 Jun 2026", status: "Paid ✓" },
                  ].map((b) => (
                    <div key={b.inv} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{b.inv} — {b.title}</span>
                          <span className="font-black text-[#FF6B00]">{b.amount}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Paid Date: {b.date}</div>
                      </div>

                      <button
                        onClick={() => toast(`Downloading PDF invoice receipt for ${b.inv}...`, "success")}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Invoice</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetailUnit(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer uppercase tracking-wider"
              >
                Close Telemetry
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------- MODAL 1: ADD FLOOR LEVEL MODAL ------------------- */}
      {showAddFloorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddFloorSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative font-sans"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Add Floor Level</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Floor {floorsCount + 1} will be added to {propertyData.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFloorModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                Floor <strong className="text-slate-900">{floorsCount + 1}</strong> will be added empty.
                You can create units on it afterward with unit number and rent.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddFloorModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Floor {floorsCount + 1}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 2: ADD UNIT MODAL ------------------- */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddUnitSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative font-sans max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Add Unit / Room</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Creating unit on Floor {unitFloorTarget}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Target Floor</label>
                <div className="relative">
                  <select
                    value={unitFloorTarget}
                    onChange={(e) => setUnitFloorTarget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {floorsList.map((fl) => (
                      <option key={fl} value={fl}>Floor {fl}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Unit Number (Numeric Only) *</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]+"
                  value={newUnitNo}
                  onChange={(e) => setNewUnitNo(e.target.value.replace(/\D/g, ""))}
                  placeholder={`e.g. ${unitFloorTarget}05`}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                    newUnitNo && (getFloorUnits(unitFloorTarget || selectedFloor) || []).some((u) => u.unitNo.toLowerCase() === `unit ${newUnitNo.replace(/\D/g, "")}`.toLowerCase())
                      ? "border-red-400 focus:ring-red-500"
                      : "border-slate-200 focus:ring-[#FF6B00]"
                  }`}
                />
                {newUnitNo && (getFloorUnits(unitFloorTarget || selectedFloor) || []).some((u) => u.unitNo.toLowerCase() === `unit ${newUnitNo.replace(/\D/g, "")}`.toLowerCase()) && (
                  <div className="p-2.5 mt-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Unit &quot;Unit {newUnitNo.replace(/\D/g, "")}&quot; already exists on Floor {unitFloorTarget || selectedFloor}! Please use a different unit number.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ({currencySymbol}) *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                      {currencySymbol}
                    </div>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newRent}
                      onChange={(e) => setNewRent(e.target.value)}
                      placeholder="3200"
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Initial Status</label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {newStatus === "Occupied" && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Primary Resident Name</label>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Unit</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL: EDIT UNIT MODAL ------------------- */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const targetFl = editFloorTarget || selectedFloor;
              const cleanNum = editUnitNo.replace(/\D/g, "");
              const updatedUnitNo = cleanNum ? `Unit ${cleanNum}` : editingUnit.unitNo;

              // Check if duplicate on target floor (unless unchanged)
              if (
                updatedUnitNo.toLowerCase() !== editingUnit.unitNo.toLowerCase() &&
                (getFloorUnits(targetFl) || []).some(
                  (u) => u.unitNo.toLowerCase() === updatedUnitNo.toLowerCase()
                )
              ) {
                toast(`Unit "${updatedUnitNo}" already exists on Floor ${targetFl}!`, "error");
                return;
              }

              const updatedUnitObj: UnitItem = {
                ...editingUnit,
                unitNo: updatedUnitNo,
                rent: editRent ? `$${editRent}/mo` : "$0/mo",
                status: editStatus,
                tenant:
                  editStatus === "Occupied"
                    ? {
                        name: editTenantName.trim() || editingUnit.tenant?.name || "Resident",
                        contact: "Primary Resident",
                        phone: editingUnit.tenant?.phone || "+1 (555) 000-0000",
                        email: editingUnit.tenant?.email || "resident@rentawas.com",
                        moveIn: editingUnit.tenant?.moveIn || "2026-08-01",
                        leaseEnd: editingUnit.tenant?.leaseEnd || "2027-07-31",
                        health: "Active Tenant",
                      }
                    : null,
              };

              // If floor changed, remove from old floor and add to new floor
              if (targetFl !== selectedFloor) {
                const oldFlUnits = getFloorUnits(selectedFloor).filter((u) => u.unitNo !== editingUnit.unitNo);
                const newFlUnits = [updatedUnitObj, ...getFloorUnits(targetFl)];
                setFloorUnitsMap((prev) => ({
                  ...prev,
                  [selectedFloor]: oldFlUnits,
                  [targetFl]: newFlUnits,
                }));
              } else {
                const updatedUnitsOnFl = getFloorUnits(selectedFloor).map((u) =>
                  u.unitNo === editingUnit.unitNo ? updatedUnitObj : u
                );
                setFloorUnitsMap((prev) => ({ ...prev, [selectedFloor]: updatedUnitsOnFl }));
              }

              toast(`${updatedUnitNo} updated successfully!`, "success");
              setEditingUnit(null);
            }}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative font-sans max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Edit Unit / Room</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Editing {editingUnit.unitNo} on Floor {editFloorTarget}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUnit(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Unit Number (Numeric Only)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editUnitNo}
                  onChange={(e) => setEditUnitNo(e.target.value.replace(/\D/g, ""))}
                  placeholder={`e.g. ${editFloorTarget}05`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ({currencySymbol})</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                      {currencySymbol}
                    </div>
                    <input
                      type="number"
                      value={editRent}
                      onChange={(e) => setEditRent(e.target.value)}
                      placeholder="3200"
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Occupancy Status</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {editStatus === "Occupied" && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Primary Resident Name</label>
                  <input
                    type="text"
                    value={editTenantName}
                    onChange={(e) => setEditTenantName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUnit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <span>Save Unit Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL: DELETE UNIT CONFIRMATION MODAL ------------------- */}
      {deletingUnit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">Permanently Delete {deletingUnit.unitNo}?</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">This destructive action cannot be undone.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeletingUnit(null);
                  setConfirmUnitNameInput("");
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danger Warning Alert Note Box */}
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs space-y-1.5 text-red-900">
              <span className="font-extrabold uppercase tracking-wider block text-[11px] text-red-700">
                ⚠️ Unit Deletion Notice:
              </span>
              <p className="text-xs leading-relaxed text-red-800 font-medium">
                Deleting <strong>{deletingUnit.unitNo}</strong> on Floor {selectedFloor} will permanently remove this room and any associated tenant lease records.
              </p>
            </div>

            {/* Target Unit Code Box with Copy Button */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                Target Unit Code:
              </span>
              <div className="flex items-center justify-between p-3 bg-slate-100/90 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm select-all">
                <span className="truncate pr-2">{deletingUnit.unitNo}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(deletingUnit.unitNo);
                    setIsUnitCopied(true);
                    setTimeout(() => setIsUnitCopied(false), 2000);
                  }}
                  className="p-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-2xs"
                >
                  {isUnitCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isUnitCopied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            {/* Type to Confirm Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Type unit code or number to confirm:
              </label>
              <input
                type="text"
                value={confirmUnitNameInput}
                onChange={(e) => setConfirmUnitNameInput(e.target.value)}
                placeholder={deletingUnit.unitNo}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeletingUnit(null);
                  setConfirmUnitNameInput("");
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  (confirmUnitNameInput.trim().toLowerCase() !== deletingUnit.unitNo.toLowerCase() &&
                   confirmUnitNameInput.trim().toLowerCase() !== deletingUnit.unitNo.replace(/\D/g, "").toLowerCase()) ||
                  isDeletingUnit
                }
                onClick={async () => {
                  setIsDeletingUnit(true);
                  const currentUnitsOnFl = getFloorUnits(selectedFloor);
                  const updatedFlUnits = currentUnitsOnFl.filter((u) => u.unitNo !== deletingUnit.unitNo);
                  setFloorUnitsMap((prev) => ({ ...prev, [selectedFloor]: updatedFlUnits }));
                  toast(`${deletingUnit.unitNo} permanently deleted from Floor ${selectedFloor}!`, "info");
                  setIsDeletingUnit(false);
                  setDeletingUnit(null);
                  setConfirmUnitNameInput("");
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-xl shadow-md shadow-red-500/20 uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingUnit ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeletingUnit ? "Deleting..." : "Permanently Delete Unit"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------- MODAL: 3-STEP ASSIGN TENANT MODAL ------------------- */}
      {assigningUnitNo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAssignTenantSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Assign Resident to {assigningUnitNo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {propertyData.name} • Floor {selectedFloor}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssigningUnitNo(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Step Wizard Navigation Pills */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[10px] sm:text-xs font-bold">
              {[
                { step: 1 as const, label: "Resident & Rent" },
                { step: 2 as const, label: "Gov ID" },
                { step: 3 as const, label: "Lease Docs" },
                { step: 4 as const, label: "Move-in Pay" },
              ].map((item) => (
                <div
                  key={item.step}
                  onClick={() => setCurrentTenantStep(item.step)}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1 ${
                    currentTenantStep === item.step ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">
                    {item.step}
                  </span>
                  <span className="truncate hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </div>

            {/* STEP 1: BASIC INFO, BED SLOT & USER RENT */}
            {currentTenantStep === 1 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Resident Name *</label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Bed / Room Label</label>
                    <input
                      type="text"
                      value={tenantBedSlot}
                      onChange={(e) => setTenantBedSlot(e.target.value)}
                      placeholder="e.g. Room A / Bed 1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#FF6B00] uppercase mb-1">
                      Monthly Rent ({currencySymbol}) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-extrabold text-sm pointer-events-none">
                        {currencySymbol}
                      </div>
                      <input
                        type="number"
                        required
                        min={0}
                        value={tenantMonthlyRent}
                        onChange={(e) => {
                          setTenantMonthlyRent(e.target.value);
                          if (!firstRentAmount || firstRentAmount === tenantMonthlyRent) {
                            setFirstRentAmount(e.target.value);
                          }
                        }}
                        placeholder="1000"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-orange-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Monthly Rent Due Day *
                  </label>
                  <div className="relative">
                    <select
                      value={tenantRentDueDay}
                      onChange={(e) => setTenantRentDueDay(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={String(day)}>
                          Day {day} of every month
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Recurring rent invoices will generate on this calendar day each month (capped at day 28 for all regions).
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <CountryPhoneInput
                    selectedCountry={tenantSelectedCountry}
                    onCountryChange={setTenantSelectedCountry}
                    value={tenantPhone}
                    onChange={setTenantPhone}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="resident@email.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Move-in / Lease Start</label>
                    <input
                      type="date"
                      value={tenantLeaseStart}
                      onChange={(e) => setTenantLeaseStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GOV ID SCAN */}
            {currentTenantStep === 2 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Government ID Type</label>
                    <div className="relative">
                      <select
                        value={tenantIdType}
                        onChange={(e) => setTenantIdType(e.target.value)}
                        className="w-full appearance-none pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="Passport / Travel Document">Passport / Travel Document</option>
                        <option value="National ID Card">National ID Card</option>
                        <option value="Driver's License">Driver&apos;s License</option>
                        <option value="Residence Permit">Residence Permit</option>
                        <option value="Other Government ID">Other Government ID</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">ID Number / Code</label>
                    <input
                      type="text"
                      value={tenantIdNumber}
                      onChange={(e) => setTenantIdNumber(e.target.value)}
                      placeholder="Document number"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload ID Document (PDF / Scan)</label>
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center space-y-1">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">Click or drag file to upload</span>
                    <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LEASE DOCS */}
            {currentTenantStep === 3 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#FF6B00] block text-xs">Lease documents (optional)</span>
                  <p className="text-slate-600 text-[11px]">
                    Upload signed lease or tenancy agreement for {assigningUnitNo}. You can also add these later from Documents.
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center space-y-1">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 block">Upload lease / tenancy agreement</span>
                  <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</span>
                </div>
              </div>
            )}

            {/* STEP 4: MOVE-IN / CURRENT PERIOD PAYMENT */}
            {currentTenantStep === 4 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-800 block text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    Move-in / current period rent
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    If the resident is moving in now, collect rent for the current billing period.
                    Ongoing invoices will then generate every month on day <strong>{tenantRentDueDay}</strong>.
                  </p>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectFirstRent}
                    onChange={(e) => setCollectFirstRent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Collect rent for this period now</span>
                    <span className="text-[11px] text-slate-500">
                      Uncheck to skip and only set up recurring rent from the due day onward.
                    </span>
                  </div>
                </label>

                {collectFirstRent && (
                  <div className="space-y-3.5 pl-1">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Amount to collect ({currencySymbol}) *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-extrabold text-sm pointer-events-none">
                          {currencySymbol}
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={firstRentAmount || tenantMonthlyRent}
                          onChange={(e) => setFirstRentAmount(e.target.value)}
                          placeholder={tenantMonthlyRent || "0"}
                          className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Adjust for prorated move-in amounts if needed. Defaults to full monthly rent.
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Payment method (from Integrations)
                      </label>
                      {loadingPaymentMethods ? (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading active channels…
                        </div>
                      ) : activePaymentMethods.length === 0 ? (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
                          <p className="font-bold">No payment integrations are active</p>
                          <p>
                            Connect a channel in{" "}
                            <Link href="/dashboard/settings" className="underline font-bold text-[#FF6B00]">
                              Settings → Integrations
                            </Link>{" "}
                            to record move-in payment here.
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={firstRentMethod}
                            onChange={(e) => setFirstRentMethod(e.target.value)}
                            className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                          >
                            {activePaymentMethods.map((m) => (
                              <option key={m.id} value={m.name}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={firstRentPaid}
                        onChange={(e) => setFirstRentPaid(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">Mark as paid now</span>
                    </label>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-900">Resident:</strong> {tenantName || "—"}
                  </p>
                  <p>
                    <strong className="text-slate-900">Monthly rent:</strong>{" "}
                    {tenantMonthlyRent ? formatCurrency(Number(tenantMonthlyRent)) : "—"} · Due day {tenantRentDueDay}
                  </p>
                  <p>
                    <strong className="text-slate-900">Unit:</strong> {assigningUnitNo} · Floor {selectedFloor}
                  </p>
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (currentTenantStep > 1) {
                    setCurrentTenantStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                  } else {
                    setAssigningUnitNo(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {currentTenantStep > 1 ? "Back" : "Cancel"}
              </button>

              {currentTenantStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentTenantStep === 1) {
                      if (!tenantName.trim() || !tenantEmail.trim()) {
                        toast("Please fill in Resident Name and Email before proceeding.", "info");
                        return;
                      }
                      if (!tenantMonthlyRent || Number(tenantMonthlyRent) <= 0) {
                        toast("Please enter a valid monthly rent amount.", "info");
                        return;
                      }
                      if (!firstRentAmount) setFirstRentAmount(tenantMonthlyRent);
                      setCurrentTenantStep(2);
                    } else if (currentTenantStep === 2) {
                      setCurrentTenantStep(3);
                    } else if (currentTenantStep === 3) {
                      setCurrentTenantStep(4);
                    }
                  }}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmittingTenant}
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingTenant ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>
                    {collectFirstRent ? "Assign & Record Payment" : "Assign Resident"}
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
