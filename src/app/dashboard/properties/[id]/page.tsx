"use client";

import { useState } from "react";
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
  UserCheck
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Interface for unit item
export interface UnitItem {
  unitNo: string;
  type: string;
  sqft: string;
  rooms: string;
  rent: string;
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
    occupied: 23,
    monthlyYield: "$72,500",
    status: "96% Occupied",
    tag: "Residential Tower",
  },
  "PROP-2": {
    id: "PROP-2",
    name: "Downtown Horizon Suites",
    address: "800 Bellevue Way NE, Bellevue, WA 98004",
    floors: 4,
    units: 18,
    occupied: 17,
    monthlyYield: "$54,000",
    status: "94% Occupied",
    tag: "Luxury Apartments",
  },
  "PROP-3": {
    id: "PROP-3",
    name: "Oakwood Executive Residency",
    address: "2100 Westlake Ave, Seattle, WA 98121",
    floors: 3,
    units: 12,
    occupied: 11,
    monthlyYield: "$32,000",
    status: "91% Occupied",
    tag: "Executive Suites",
  },
  "PROP-4": {
    id: "PROP-4",
    name: "Skyline Manor",
    address: "1100 Mercer St, Seattle, WA 98109",
    floors: 2,
    units: 8,
    occupied: 7,
    monthlyYield: "$18,500",
    status: "88% Occupied",
    tag: "Boutique Housing",
  },
};

export default function PropertyFloorPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const propId = (params?.id as string) || "PROP-1";
  const property = PROPERTIES_DB[propId] || PROPERTIES_DB["PROP-1"];

  const [floorsCount, setFloorsCount] = useState<number>(property.floors || 4);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "occupied" | "vacant">("all");

  // Dynamic Units State indexed by Floor Number
  const [floorUnitsMap, setFloorUnitsMap] = useState<Record<number, UnitItem[]>>({});

  // Modals state
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // Room Telemetry Details Drawer / Modal State
  const [selectedDetailUnit, setSelectedDetailUnit] = useState<UnitItem | null>(null);
  const [detailTab, setDetailTab] = useState<"resident" | "docs" | "history" | "maintenance" | "bills">("resident");

  // Add Floor Modal Form State
  const [newFloorUsage, setNewFloorUsage] = useState("Residential Living Suites");

  // Add Unit Modal Form State
  const [unitFloorTarget, setUnitFloorTarget] = useState<number>(1);
  const [newUnitNo, setNewUnitNo] = useState("");
  const [newUnitType, setNewUnitType] = useState("2 BHK Executive Suite");
  const [newSqft, setNewSqft] = useState("950 sq ft");
  const [newRooms, setNewRooms] = useState("2 Bedrooms • 2 Baths • Living Room • Kitchen • Balcony");
  const [newRent, setNewRent] = useState("3200");
  const [newStatus, setNewStatus] = useState<"Occupied" | "Vacant">("Vacant");
  const [newTenantName, setNewTenantName] = useState("");

  const floorsList = Array.from({ length: floorsCount }, (_, i) => floorsCount - i);

  // Generate initial units if not already in state
  const getFloorUnits = (floorNum: number): UnitItem[] => {
    if (floorUnitsMap[floorNum]) {
      return floorUnitsMap[floorNum];
    }

    const isCommercial = property.tag.toLowerCase().includes("commercial") || property.tag.toLowerCase().includes("office");

    let initialUnits: UnitItem[] = [];

    if (isCommercial) {
      initialUnits = [
        {
          unitNo: `Unit ${floorNum}01`,
          type: "Commercial Office Suite A",
          sqft: "1,850 sq ft",
          rooms: "4 Workstation Cabins • 1 Conference Room • Server Rack • Kitchenette",
          rent: "$6,200/mo",
          status: "Occupied",
          tenant: {
            name: "Apex Global Financial LLC",
            contact: "Corporate Tenant",
            phone: "+1 (555) 392-1029",
            email: "finance@apexglobal.com",
            moveIn: "2023-03-01",
            leaseEnd: "2026-02-28",
            health: "Auto-Debit — Active",
          },
        },
        {
          unitNo: `Unit ${floorNum}02`,
          type: "Retail Frontage Shop",
          sqft: "1,200 sq ft",
          rooms: "Open Retail Display • Storage Bay • Private Restroom",
          rent: "$4,800/mo",
          status: "Vacant",
          tenant: null,
        },
      ];
    } else {
      initialUnits = [
        {
          unitNo: `Unit ${floorNum}01`,
          type: "2 BHK Executive Suite",
          sqft: "980 sq ft",
          rooms: "2 Bedrooms • 2 Baths • Living • Modular Kitchen • Balcony",
          rent: "$3,200/mo",
          status: "Occupied",
          tenant: {
            name: "Eleanor Vance",
            contact: "Primary Resident",
            phone: "+1 (555) 234-5678",
            email: "eleanor.vance@company.com",
            moveIn: "2025-01-15",
            leaseEnd: "2026-01-14",
            health: "ACH — Auto Paid",
          },
        },
        {
          unitNo: `Unit ${floorNum}02`,
          type: "3 BHK Deluxe Corner",
          sqft: "1,250 sq ft",
          rooms: "3 Bedrooms • 3 Baths • Living • Kitchen • 2 Balconies",
          rent: "$4,100/mo",
          status: floorNum % 2 === 0 ? "Vacant" : "Occupied",
          tenant: floorNum % 2 === 0 ? null : {
            name: "Marcus Sterling",
            contact: "Primary Resident",
            phone: "+1 (555) 492-0192",
            email: "marcus.s@sterling.co",
            moveIn: "2024-11-15",
            leaseEnd: "2026-11-14",
            health: "UPI — Instant Paid",
          },
        },
        {
          unitNo: `Unit ${floorNum}03`,
          type: "1 BHK Studio Apartment",
          sqft: "650 sq ft",
          rooms: "1 Bedroom • 1 Bath • Open Plan Kitchen",
          rent: "$2,450/mo",
          status: "Occupied",
          tenant: {
            name: "Sophia Martinez",
            contact: "Primary Resident",
            phone: "+1 (555) 718-2940",
            email: "sophia.m@designstudio.com",
            moveIn: "2026-01-10",
            leaseEnd: "2027-01-09",
            health: "ACH — On Time",
          },
        },
        {
          unitNo: `Unit ${floorNum}04`,
          type: "2 BHK Penthouse View",
          sqft: "1,050 sq ft",
          rooms: "2 Bedrooms • 2 Baths • Terrace View • Covered Parking",
          rent: "$3,600/mo",
          status: "Occupied",
          tenant: {
            name: "David Chen",
            contact: "Primary Resident",
            phone: "+1 (555) 902-1182",
            email: "david.c@chentech.org",
            moveIn: "2025-05-01",
            leaseEnd: "2026-04-30",
            health: "Pending Reminders",
          },
        },
      ];
    }

    return initialUnits;
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

    const defaultUnits: UnitItem[] = [
      {
        unitNo: `Unit ${newFloorNumber}01`,
        type: newFloorUsage,
        sqft: "1,100 sq ft",
        rooms: "2 Bedrooms • 2 Baths • Balcony",
        rent: "$3,400/mo",
        status: "Vacant",
        tenant: null,
      },
      {
        unitNo: `Unit ${newFloorNumber}02`,
        type: newFloorUsage,
        sqft: "1,250 sq ft",
        rooms: "3 Bedrooms • 2 Baths • Balcony",
        rent: "$3,800/mo",
        status: "Vacant",
        tenant: null,
      },
    ];

    setFloorUnitsMap((prev) => ({ ...prev, [newFloorNumber]: defaultUnits }));
    toast(`Floor ${newFloorNumber} added to ${property.name}!`, "success");
    setShowAddFloorModal(false);
  };

  // Handler: Add Unit
  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFl = unitFloorTarget || selectedFloor;
    const finalUnitNo = newUnitNo.trim() || `Unit ${targetFl}0${(getFloorUnits(targetFl).length + 1)}`;

    const newUnitObj: UnitItem = {
      unitNo: finalUnitNo,
      type: newUnitType,
      sqft: newSqft || "950 sq ft",
      rooms: newRooms || "2 Bedrooms • 2 Baths • Kitchen",
      rent: `$${newRent}/mo`,
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

    const existingUnits = getFloorUnits(targetFl);
    const updatedUnits = [newUnitObj, ...existingUnits];

    setFloorUnitsMap((prev) => ({ ...prev, [targetFl]: updatedUnits }));
    toast(`${finalUnitNo} created on Floor ${targetFl}!`, "success");
    setNewUnitNo("");
    setNewTenantName("");
    setShowAddUnitModal(false);
  };

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
              {property.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
              {property.tag}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{property.address}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              toast(`Loading dedicated analytics for ${property.name}...`, "info");
              router.push(`/dashboard/properties/${property.id}/analytics`);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition-all uppercase tracking-wider cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
            <span>Property Analytics</span>
          </button>

          <button
            onClick={() => setShowAddFloorModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>Add Floor Level</span>
          </button>

          <button
            onClick={() => {
              setUnitFloorTarget(selectedFloor);
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
          <span className="text-xl font-black text-slate-900">{floorsCount * 4} Units</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Occupancy Rate</span>
          <span className="text-xl font-black text-emerald-600">{property.status}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Monthly Gross Yield</span>
          <span className="text-xl font-black text-slate-900">{property.monthlyYield}</span>
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
            <span>+ Add New Floor Level</span>
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
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{u.unitNo}</h3>
                        <span className="text-sm font-black text-[#FF6B00]">{u.rent}</span>
                        
                        {/* EYE ICON: Full Details Page Link */}
                        <Link
                          href={`/dashboard/properties/${propId}/unit/${encodeURIComponent(u.unitNo)}`}
                          className="p-1.5 px-2.5 rounded-lg bg-orange-50 hover:bg-[#FF6B00] text-[#FF6B00] hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ml-1 shadow-2xs"
                          title="View Full Room Telemetry & History Page"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Details</span>
                        </Link>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{u.type}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isOccupied
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>

                  {/* Rooms & Amenity Specification */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      <span>Room Breakdown & Layout</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {u.rooms}
                    </p>
                  </div>

                  {/* Unit Outlays & Expense History Badge */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/80 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Receipt className="w-4 h-4 text-[#FF6B00]" />
                      <span>Unit Outlays: <strong className="text-slate-900">$1,450</strong></span>
                    </div>
                    <Link 
                      href="/dashboard/expenses"
                      className="text-[11px] font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>1 Bill Attached</span>
                      <Paperclip className="w-3.5 h-3.5" />
                    </Link>
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
                        onClick={() => toast(`Opening Tenant Onboarding form for ${u.unitNo}...`, "success")}
                        className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-bold shadow-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
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
                    {selectedDetailUnit.type} • {selectedDetailUnit.sqft} • {property.name}
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
                  <p className="text-xs text-slate-500 mt-0.5">Floor {floorsCount + 1} will be added to {property.name}</p>
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
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Floor Usage & Designation</label>
                <select
                  value={newFloorUsage}
                  onChange={(e) => setNewFloorUsage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="Residential Living Suites">Residential Living Suites</option>
                  <option value="Penthouse & Sky Villas">Penthouse & Sky Villas</option>
                  <option value="Commercial Office Space">Commercial Office Space</option>
                  <option value="Student Housing / Co-Living">Student Housing / Co-Living</option>
                </select>
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
                <select
                  value={unitFloorTarget}
                  onChange={(e) => setUnitFloorTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  {floorsList.map((fl) => (
                    <option key={fl} value={fl}>Floor {fl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Unit Number / Code</label>
                <input
                  type="text"
                  value={newUnitNo}
                  onChange={(e) => setNewUnitNo(e.target.value)}
                  placeholder={`e.g. Unit ${unitFloorTarget}05`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ($)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                      $
                    </div>
                    <input
                      type="number"
                      value={newRent}
                      onChange={(e) => setNewRent(e.target.value)}
                      placeholder="3200"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Vacant">Vacant</option>
                    <option value="Occupied">Occupied</option>
                  </select>
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

    </div>
  );
}
