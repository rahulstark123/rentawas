"use client";

import { useState } from "react";
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
  Layers
} from "lucide-react";
import AddPropertyModal, { PropertyData } from "@/components/ui/AddPropertyModal";
import FloorPlanDrawer from "@/components/ui/FloorPlanDrawer";
import { useToast } from "@/components/ui/Toast";

export interface PropertyItem {
  id: string;
  name: string;
  address: string;
  floors: number;
  units: number;
  occupied: number;
  monthlyYield: string;
  ytdExpenses?: string;
  status: string;
  tag: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Floor Plan Drawer State
  const [selectedFloorPlanProp, setSelectedFloorPlanProp] = useState<PropertyItem | null>(null);

  // Edit Modal State
  const [editingProp, setEditingProp] = useState<PropertyItem | null>(null);

  const [propertyList, setPropertyList] = useState<PropertyItem[]>([
    {
      id: "PROP-1",
      name: "The Regent - Wing A",
      address: "1420 5th Ave, Seattle, WA 98101",
      floors: 6,
      units: 24,
      occupied: 23,
      monthlyYield: "$72,500",
      ytdExpenses: "$1,870",
      status: "96% Occupied",
      tag: "Residential Tower",
    },
    {
      id: "PROP-2",
      name: "Downtown Horizon Suites",
      address: "800 Bellevue Way NE, Bellevue, WA 98004",
      floors: 4,
      units: 18,
      occupied: 17,
      monthlyYield: "$54,000",
      ytdExpenses: "$3,800",
      status: "94% Occupied",
      tag: "Luxury Apartments",
    },
    {
      id: "PROP-3",
      name: "Oakwood Executive Residency",
      address: "2100 Westlake Ave, Seattle, WA 98121",
      floors: 3,
      units: 12,
      occupied: 12,
      monthlyYield: "$38,400",
      ytdExpenses: "$1,200",
      status: "100% Occupied",
      tag: "Executive Suites",
    },
    {
      id: "PROP-4",
      name: "Skyline Manor",
      address: "400 Pine St, Seattle, WA 98101",
      floors: 2,
      units: 8,
      occupied: 7,
      monthlyYield: "$22,000",
      ytdExpenses: "$350",
      status: "87.5% Occupied",
      tag: "Mixed Use",
    },
  ]);

  const handleAddProperty = (newProp: PropertyData) => {
    const numFloors = newProp.floors || 4;
    const computedUnits = newProp.units || numFloors * 4;

    setPropertyList([
      {
        id: newProp.id,
        name: newProp.name,
        address: newProp.address,
        floors: numFloors,
        units: computedUnits,
        occupied: 0,
        monthlyYield: `${newProp.avgRent || "$0"}/mo`,
        ytdExpenses: "$0",
        status: "0% Occupied (New)",
        tag: newProp.category.replace(/^[^\s]+\s/, ""), // remove emoji prefix for tag
      },
      ...propertyList,
    ]);
  };

  const handleDeleteProperty = (id: string, name: string) => {
    setPropertyList(propertyList.filter((p) => p.id !== id));
    setActiveMenuId(null);
    toast(`Property "${name}" removed from portfolio!`, "info");
  };

  const handleSaveEditProperty = (updatedData: any) => {
    if (editingProp) {
      setPropertyList((prev) =>
        prev.map((p) =>
          p.id === editingProp.id
            ? {
                ...p,
                name: updatedData.name,
                address: updatedData.address,
                floors: updatedData.floors,
                units: updatedData.units,
                category: updatedData.category,
                pincode: updatedData.pincode,
                roomLayout: updatedData.roomLayout,
                floorBreakdown: updatedData.floorBreakdown,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Properties & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hierarchical portfolio management of buildings, total floors, and unit availability.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {propertyList.map((prop) => (
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
                <div className="relative">
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
                          router.push("/dashboard/analytics");
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                        <span>View Analytics</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => handleDeleteProperty(prop.id, prop.name)}
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
                <span className="text-xs font-black text-slate-900">{prop.monthlyYield}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">YTD Expenses</span>
                <Link href="/dashboard/expenses" className="text-xs font-black text-[#FF6B00] hover:underline block">
                  {prop.ytdExpenses || "$1,450"}
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
    </div>
  );
}
