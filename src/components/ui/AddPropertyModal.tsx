"use client";

import { useState } from "react";
import { Building2, X, Plus, MapPin, DollarSign, ShieldCheck, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface PropertyData {
  id: string;
  name: string;
  category: string;
  address: string;
  units: number;
  avgRent: string;
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty?: (newProp: PropertyData) => void;
}

export const PROPERTY_CATEGORIES = [
  "🏢 Residential Apartment Complex",
  "🏡 Single-Family Rental Home (Villa / Townhouse)",
  "🏢 Commercial Office Space / Tower",
  "🏬 Retail Shop & Shopping Mall Floor",
  "🎓 Student Housing & Co-Living Hostel",
  "🏭 Industrial Warehouse & Logistics Park",
  "🏖️ Short-Term Vacation Rental (Airbnb / Villa)",
  "🏥 Healthcare & Medical Suite",
  "🏨 Hospitality & Serviced Suites",
  "📦 Self-Storage Facility",
  "🌾 Agricultural / Farm Estate",
  "🚗 Parking Garage / Storage Lots",
];

export default function AddPropertyModal({ isOpen, onClose, onAddProperty }: AddPropertyModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(PROPERTY_CATEGORIES[0]);
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("16");
  const [avgRent, setAvgRent] = useState("3000");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProp: PropertyData = {
      id: `PROP-${Math.floor(10 + Math.random() * 90)}`,
      name,
      category,
      address: address || "Primary City Location",
      units: Number(units) || 12,
      avgRent: `$${avgRent}`,
    };

    if (onAddProperty) {
      onAddProperty(newProp);
    }

    toast(`Property "${name}" created with ${units} units!`, "success");
    setName("");
    setAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                Add New Property to Portfolio
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generate automatic unit inventory and Autopilot disbursal accounts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          {/* Property Name */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Property / Building Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cedar Heights Residency"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          {/* Property Category Dropdown with perfectly aligned ChevronDown */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Property Category (12 Options Available)
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
              >
                {PROPERTY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Full Street Address */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace, Suite 100, Seattle WA"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          {/* Units & Avg Rent */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Total Unit Count</label>
              <input
                type="number"
                min={1}
                max={500}
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Avg Base Rent ($ / ₹)</label>
              <input
                type="number"
                value={avgRent}
                onChange={(e) => setAvgRent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
          </div>

          <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <span>Autopilot Rent disbursal routing will auto-link for this new building.</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Property</span>
          </button>
        </div>
      </form>
    </div>
  );
}
