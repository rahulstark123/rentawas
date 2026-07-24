"use client";

import { useState } from "react";
import { 
  Building2, 
  X, 
  Plus, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  ChevronDown, 
  Loader2, 
  CheckCircle2, 
  Layers, 
  Bed, 
  Sparkles,
  Maximize2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface PropertyData {
  id: string;
  name: string;
  category: string;
  pincode: string;
  address: string;
  floors: number;
  unitsPerFloor: number;
  units: number;
  roomLayout: string;
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

export const ROOM_LAYOUT_OPTIONS = [
  "2 BHK Deluxe (2 Beds • 2 Baths • Living • Kitchen • Balcony)",
  "3 BHK Luxury Corner (3 Beds • 3 Baths • Living • Modular Kitchen • 2 Balconies)",
  "1 BHK Executive Studio (1 Bed • 1 Bath • Kitchenette)",
  "Corporate Office Workspace (1 Conf Room • 4 Cabins • 12 Workstations)",
  "Co-Living Twin Pod (2 Single Beds • Study Desks • Attached Bath)",
];

export default function AddPropertyModal({ isOpen, onClose, onAddProperty }: AddPropertyModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(PROPERTY_CATEGORIES[0]);
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [floors, setFloors] = useState("4");
  const [unitsPerFloor, setUnitsPerFloor] = useState("4");
  const [roomLayout, setRoomLayout] = useState(ROOM_LAYOUT_OPTIONS[0]);
  const [avgRent, setAvgRent] = useState("3200");

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const numFloors = Number(floors) || 1;
  const numUnitsPerFloor = Number(unitsPerFloor) || 1;
  const totalUnits = numFloors * numUnitsPerFloor;
  const estYield = (totalUnits * (Number(avgRent) || 0)).toLocaleString();

  // Auto-fetch location from PIN / ZIP code globally
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setPincode(code);
    
    if (code.trim().length >= 4) {
      fetchAddressFromPincode(code);
    } else {
      setLocationMessage(null);
    }
  };

  const fetchAddressFromPincode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    setIsFetchingLocation(true);
    setLocationMessage(null);

    try {
      // 1. Try Indian Postal Code API if 6-digit number
      if (/^\d{6}$/.test(cleanCode)) {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const autoAddr = `${po.Name}, ${po.District}, ${po.State}, India`;
          setAddress(autoAddr);
          setLocationMessage(`Auto-filled: ${po.Name}, ${po.District}, ${po.State}`);
          toast(`Location auto-filled for Pincode ${cleanCode}!`, "success");
          setIsFetchingLocation(false);
          return;
        }
      }

      // 2. Try US Zippopotam API if 5-digit number
      if (/^\d{5}$/.test(cleanCode)) {
        const res = await fetch(`https://api.zippopotam.us/us/${cleanCode}`);
        if (res.ok) {
          const data = await res.json();
          const place = data.places[0];
          const autoAddr = `${place["place name"]}, ${place["state abbreviation"]}, United States`;
          setAddress(autoAddr);
          setLocationMessage(`Auto-filled: ${place["place name"]}, ${place["state abbreviation"]}`);
          toast(`Location auto-filled for ZIP ${cleanCode}!`, "success");
          setIsFetchingLocation(false);
          return;
        }
      }

      // 3. Fallback: Global OpenStreetMap / Nominatim search
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cleanCode)}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const displayName = data[0].display_name;
          setAddress(displayName);
          setLocationMessage(`Auto-filled: ${displayName.split(",").slice(0, 3).join(",")}`);
          toast(`Global location detected for postal code ${cleanCode}!`, "success");
          setIsFetchingLocation(false);
          return;
        }
      }

      setLocationMessage("Pincode entered. Please complete street address.");
    } catch (err) {
      console.error("Location lookup error", err);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProp: PropertyData = {
      id: `PROP-${Math.floor(10 + Math.random() * 90)}`,
      name,
      category,
      pincode,
      address: address || "Primary City Location",
      floors: numFloors,
      unitsPerFloor: numUnitsPerFloor,
      units: totalUnits,
      roomLayout,
      avgRent: `$${avgRent}`,
    };

    if (onAddProperty) {
      onAddProperty(newProp);
    }

    toast(`Property "${name}" created with ${numFloors} floors (${totalUnits} total units & rooms)!`, "success");
    setName("");
    setPincode("");
    setAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto font-sans"
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
                Configure Building Name, Category, Floors, Units per Floor, and Room Details.
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
          
          {/* Section 1: Property Identity */}
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

          {/* Property Category */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Property Category (12 Options)
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

          {/* Global Pincode & Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 uppercase">
                Postal / ZIP / Pincode (Global Auto-Fill)
              </label>
              {isFetchingLocation && (
                <span className="text-[10px] text-[#FF6B00] font-bold flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Auto-fetching location...
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={handlePincodeChange}
                placeholder="e.g. 400001 (Mumbai), 98101 (Seattle), 10001 (NYC)"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
              </div>
            </div>

            {locationMessage && (
              <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{locationMessage}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Full Street Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Auto-populates upon entering pincode, or type street address..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          {/* Section 2: Floors & Room Layout Configuration */}
          <div className="pt-2 border-t border-slate-100 space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Floors & Room Architecture Configuration</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Total Floors</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Units / Floor</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={unitsPerFloor}
                  onChange={(e) => setUnitsPerFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Rent / Unit ($ / ₹)</label>
                <input
                  type="number"
                  value={avgRent}
                  onChange={(e) => setAvgRent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Default Room Layout & Amenities Breakdown
              </label>
              <div className="relative">
                <select
                  value={roomLayout}
                  onChange={(e) => setRoomLayout(e.target.value)}
                  className="w-full appearance-none pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  {ROOM_LAYOUT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Live Building Architecture Preview Summary */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                  Building Inventory Auto-Generation Preview
                </span>
                <span className="text-xs font-extrabold text-orange-400">${estYield} / mo Yield</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Building Inventory</span>
                  <span className="font-extrabold text-white">{numFloors} Floors × {numUnitsPerFloor} Units = {totalUnits} Units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Configured Room Layout</span>
                  <span className="font-semibold text-slate-200 truncate block">{roomLayout.split("(")[0]}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <span>Autopilot Rent disbursal routing will auto-link for all {totalUnits} units.</span>
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
            <span>Create Property ({totalUnits} Units)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
