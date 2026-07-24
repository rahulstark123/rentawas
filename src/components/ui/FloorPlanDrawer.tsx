"use client";

import { useState } from "react";
import { 
  Building2, 
  X, 
  Layers, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Sparkles,
  Bed,
  Bath,
  Maximize2,
  Zap,
  ShieldCheck,
  Plus
} from "lucide-react";
import { PropertyItem } from "@/app/dashboard/properties/page";
import { useToast } from "@/components/ui/Toast";

interface FloorPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyItem | null;
}

export default function FloorPlanDrawer({ isOpen, onClose, property }: FloorPlanDrawerProps) {
  const { toast } = useToast();
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  if (!isOpen || !property) return null;

  const totalFloors = property.floors || 4;
  const floorsList = Array.from({ length: totalFloors }, (_, i) => totalFloors - i); // Top floor down to 1st

  // Generate deterministic units per floor based on property category
  const getFloorUnits = (floorNum: number) => {
    const isCommercial = property.tag.toLowerCase().includes("commercial") || property.tag.toLowerCase().includes("office");
    const isCoLiving = property.tag.toLowerCase().includes("student") || property.tag.toLowerCase().includes("co-living");

    if (isCommercial) {
      return [
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
    }

    if (isCoLiving) {
      return [
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
    }

    // Default Residential Apartments
    return [
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
  };

  const currentUnits = getFloorUnits(selectedFloor);

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FF6B00] text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {property.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                  {property.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{property.address}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{property.floors} Floors</span>
                <span>•</span>
                <span className="text-slate-300 font-bold">{property.units} Units Total</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Body Grid */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Column: Floor Elevator Selector */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-2 shrink-0">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Select Floor (Elevator View)</span>
            </div>

            {floorsList.map((fl) => {
              const isSelected = selectedFloor === fl;
              return (
                <button
                  key={fl}
                  onClick={() => {
                    setSelectedFloor(fl);
                    setSelectedUnit(null);
                  }}
                  className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-800 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">
                      Floor {fl} {fl === totalFloors ? "(Top Penthouse)" : fl === 1 ? "(Ground Level)" : ""}
                    </span>
                    <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {property.tag.includes("Commercial") ? "Corporate Suites" : "4 Residential Apartments"}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSelected ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    F-{fl}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Units & Room Wise Tenant Details */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 bg-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Floor {selectedFloor} Breakdown</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {currentUnits.length} Units On This Level
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Room layouts, amenities, monthly rent, and room-wise resident status.
                </p>
              </div>

              <button
                onClick={() => toast(`Adding new unit layout to Floor ${selectedFloor}...`, "info")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Unit to F-{selectedFloor}</span>
              </button>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {currentUnits.map((u) => {
                const isOccupied = u.status === "Occupied";
                return (
                  <div
                    key={u.unitNo}
                    className={`border rounded-2xl p-5 transition-all space-y-4 ${
                      isOccupied 
                        ? "bg-white border-slate-200 shadow-2xs hover:shadow-md" 
                        : "bg-orange-50/30 border-orange-200/80 shadow-2xs"
                    }`}
                  >
                    {/* Unit Title & Status Badge */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{u.unitNo}</h4>
                          <span className="text-xs font-bold text-[#FF6B00]">{u.rent}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">{u.type}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isOccupied
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>

                    {/* Rooms & Amenity Specification */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                        <span>Room Breakdown & Specs</span>
                        <span className="text-slate-700 font-mono">{u.sqft}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                        {u.rooms}
                      </p>
                    </div>

                    {/* Tenant Details (If Occupied) */}
                    {isOccupied && u.tenant ? (
                      <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-3 font-sans">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold">
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
                            onClick={() => toast(`Calling ${u.tenant.name} (${u.tenant.phone})...`, "info")}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>Contact Resident</span>
                          </button>

                          <button
                            onClick={() => toast(`Generating AI Lease renewal notice for ${u.unitNo}...`, "success")}
                            className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Lease Docs</span>
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

      </div>
    </div>
  );
}
