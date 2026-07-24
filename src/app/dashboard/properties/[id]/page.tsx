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
  ChevronDown
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

  const floorsList = Array.from({ length: floorsCount }, (_, i) => floorsCount - i); // Top floor down to 1st

  // Generate initial units if not already in state
  const getFloorUnits = (floorNum: number): UnitItem[] => {
    if (floorUnitsMap[floorNum]) {
      return floorUnitsMap[floorNum];
    }

    const isCommercial = property.tag.toLowerCase().includes("commercial") || property.tag.toLowerCase().includes("office");
    const isCoLiving = property.tag.toLowerCase().includes("student") || property.tag.toLowerCase().includes("co-living");

    let initialUnits: UnitItem[] = [];

    if (isCommercial) {
      initialUnits = [
        {
          unitNo: `Suite ${floorNum}01`,
          type: "Executive Corporate Suite",
          sqft: "1,850 sq ft",
          rooms: "1 Conf Room • 4 Cabins • 16 Workstations • Pantry",
          rent: "$6,500/mo",
          status: "Occupied",
          tenant: {
            name: "Apex Global Tech Solutions Ltd.",
            contact: "Sarah Jenkins (Admin Lead)",
            phone: "+1 (555) 392-1049",
            email: "s.jenkins@apextech.io",
            moveIn: "2024-03-01",
            leaseEnd: "2027-02-28",
            health: "Autopilot ACH — On Time",
          },
        },
        {
          unitNo: `Suite ${floorNum}02`,
          type: "Open Floor Workspace",
          sqft: "1,200 sq ft",
          rooms: "2 Private Cabins • 12 Workstations",
          rent: "$4,200/mo",
          status: "Vacant",
          tenant: null,
        },
      ];
    } else if (isCoLiving) {
      initialUnits = [
        {
          unitNo: `Room ${floorNum}01-A`,
          type: "Twin Sharing Deluxe Pod",
          sqft: "320 sq ft",
          rooms: "2 Single Beds • Study Desks • Attached Bath",
          rent: "$950/mo",
          status: "Occupied",
          tenant: {
            name: "Rohan Sharma & Alex Vance",
            contact: "Resident Scholars",
            phone: "+1 (555) 839-2019",
            email: "rohan.s@university.edu",
            moveIn: "2025-08-15",
            leaseEnd: "2026-06-30",
            health: "Autopilot UPI — Paid",
          },
        },
        {
          unitNo: `Room ${floorNum}01-B`,
          type: "Private Studio Pod",
          sqft: "250 sq ft",
          rooms: "1 Queen Bed • Kitchenette • Attached Bath",
          rent: "$1,250/mo",
          status: "Occupied",
          tenant: {
            name: "Claire Dupont",
            contact: "Postgrad Fellow",
            phone: "+1 (555) 902-3810",
            email: "claire.d@mit.edu",
            moveIn: "2025-09-01",
            leaseEnd: "2026-08-31",
            health: "Autopilot ACH — On Time",
          },
        },
      ];
    } else {
      // Default Residential Apartments
      initialUnits = [
        {
          unitNo: `Unit ${floorNum}01`,
          type: "2 BHK Executive Suite",
          sqft: "980 sq ft",
          rooms: "2 Bedrooms • 2 Baths • Living Room • Kitchen • Balcony",
          rent: "$3,200/mo",
          status: "Occupied",
          tenant: {
            name: "Eleanor Vance",
            contact: "Primary Resident",
            phone: "+1 (555) 234-5678",
            email: "eleanor.vance@gmail.com",
            moveIn: "2025-08-01",
            leaseEnd: "2026-07-31",
            health: "Autopilot ACH — 100% On-Time",
          },
        },
        {
          unitNo: `Unit ${floorNum}02`,
          type: "3 BHK Premium Corner",
          sqft: "1,350 sq ft",
          rooms: "3 Bedrooms • 3 Baths • Modular Kitchen • 2 Balconies",
          rent: "$4,100/mo",
          status: floorNum % 2 === 0 ? "Vacant" : "Occupied",
          tenant: floorNum % 2 === 0 ? null : {
            name: "Marcus Sterling",
            contact: "Primary Resident",
            phone: "+1 (555) 492-0192",
            email: "marcus.s@sterling.co",
            moveIn: "2024-11-15",
            leaseEnd: "2026-11-14",
            health: "Autopilot UPI — Paid",
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
            health: "Autopilot ACH — On Time",
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

    // Initialize default units for new floor
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
        health: "Autopilot ACH — Active",
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

      {/* Main Full Page Content Grid (Left Elevator Column 4 cols + Right Main Area 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Floor Elevator Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6B00]" />
              <span>Building Floors (Elevator)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{floorsCount} Levels</span>
          </div>

          <div className="space-y-2.5">
            {floorsList.map((fl) => {
              const isSelected = selectedFloor === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]"
                      : "bg-slate-50 text-slate-800 border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40"
                  }`}
                >
                  <div>
                    <span className="text-sm font-extrabold block">
                      Floor {fl} {fl === floorsCount ? "(Top Penthouse)" : fl === 1 ? "(Ground Floor)" : ""}
                    </span>
                    <span className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {property.tag.includes("Commercial") ? "2 Executive Suites" : `${getFloorUnits(fl).length} Units Configured`}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-black ${
                      isSelected ? "bg-[#FF6B00] text-white" : "bg-white text-slate-900 border border-slate-200"
                    }`}
                  >
                    F-{fl}
                  </span>
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
                  {/* Unit Title & Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{u.unitNo}</h3>
                        <span className="text-sm font-black text-[#FF6B00]">{u.rent}</span>
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
                    <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      <span>Room Breakdown & Layout</span>
                      <span className="text-slate-800 font-mono">{u.sqft}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {u.rooms}
                    </p>
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

                        <button
                          onClick={() => toast(`Generating AI Lease renewal notice for ${u.unitNo}...`, "success")}
                          className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>AI Docs</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Vacant Unit Call to Action */
                    <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Unit Available for Lease
                      </div>
                      <p className="text-[11px] text-slate-500">
                        List unit on Autopilot Portal or assign a new resident.
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
                  <p className="text-xs text-slate-500 mt-1">Append new floor level to {property.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFloorModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">New Floor Designation</label>
                <input
                  type="text"
                  disabled
                  value={`Floor ${floorsCount + 1} (Level ${floorsCount + 1})`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Floor Primary Usage Category</label>
                <div className="relative">
                  <select
                    value={newFloorUsage}
                    onChange={(e) => setNewFloorUsage(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Residential Living Suites">Residential Living Suites</option>
                    <option value="Executive Corporate Office">Executive Corporate Office</option>
                    <option value="Boutique Penthouse Terrace">Boutique Penthouse Terrace</option>
                    <option value="Fitness & Amenity Lounge">Fitness & Amenity Lounge</option>
                    <option value="Covered Parking & Storage">Covered Parking & Storage</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>Will auto-generate 2 starter unit slots on Floor {floorsCount + 1}.</span>
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
                <span>Create Floor Level</span>
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
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl relative font-sans"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Add New Unit</h3>
                  <p className="text-xs text-slate-500 mt-1">Add unit specification to Floor {unitFloorTarget}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Target Floor Level</label>
                  <div className="relative">
                    <select
                      value={unitFloorTarget}
                      onChange={(e) => setUnitFloorTarget(Number(e.target.value))}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      {floorsList.map((fl) => (
                        <option key={fl} value={fl}>Floor {fl}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
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
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Unit Category Layout</label>
                <div className="relative">
                  <select
                    value={newUnitType}
                    onChange={(e) => setNewUnitType(e.target.value)}
                    className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="2 BHK Executive Suite">2 BHK Executive Suite</option>
                    <option value="3 BHK Premium Corner">3 BHK Premium Corner</option>
                    <option value="1 BHK Studio Apartment">1 BHK Studio Apartment</option>
                    <option value="Penthouse Terrace Suite">Penthouse Terrace Suite</option>
                    <option value="Corporate Office Cabin">Corporate Office Cabin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Area (sq ft)</label>
                  <input
                    type="text"
                    value={newSqft}
                    onChange={(e) => setNewSqft(e.target.value)}
                    placeholder="e.g. 950 sq ft"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Base Rent ($ / ₹)</label>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => setNewRent(e.target.value)}
                    placeholder="3200"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Room Specs Breakdown</label>
                <input
                  type="text"
                  value={newRooms}
                  onChange={(e) => setNewRooms(e.target.value)}
                  placeholder="e.g. 2 Bedrooms • 2 Baths • Living Room • Balcony"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Occupancy Status</label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Vacant">Vacant (Ready)</option>
                      <option value="Occupied">Occupied (Assign Resident)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
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
