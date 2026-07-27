"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  X, 
  Plus, 
  Minus,
  MapPin, 
  ShieldCheck, 
  ChevronDown, 
  Loader2, 
  CheckCircle2, 
  Layers, 
  Info,
  PenTool,
  SlidersHorizontal
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
  avgRent?: string;
  floorBreakdown?: { floor: number; units: number }[];
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty?: (newProp: PropertyData) => void;
  initialData?: PropertyData | null;
}

export const PROPERTY_CATEGORIES = [
  "🏢 Residential Apartment (Flat / Condo / Penthouse)",
  "🏡 Independent House / Villa / Builder Floor",
  "🎓 Independent Private Boys / Girls Hostel",
  "🎓 College & University Student Hostel",
  "🏫 School / Boarding School Hostel",
  "💼 Working Professionals Hostel / Co-Living",
  "🏠 PG / Paying Guest (Boys / Girls / Co-Ed)",
  "🏙️ Studio Apartment / 1 RK / Loft Suite",
  "🏢 Commercial Office Space / Tower",
  "🏬 Retail Shop & Showroom Floor",
  "🏭 Industrial Warehouse & Logistics Park",
  "🏖️ Short-Term Vacation Rental (Airbnb / Villa)",
  "🏨 Hospitality & Serviced Suites",
  "🌾 Agricultural / Farmhouse Estate",
];

export const ROOM_LAYOUT_OPTIONS = [
  // Residential Apartments & Homes
  "1 RK Studio (Room + Kitchenette • 1 Bath)",
  "1 BHK Executive Studio (1 Bed • 1 Bath • Kitchenette • Balcony)",
  "1.5 BHK Compact (1 Master Bed • 1 Study/Kid Room • 1 Bath)",
  "2 BHK Deluxe (2 Beds • 2 Baths • Living • Modular Kitchen • Balcony)",
  "2.5 BHK Family (2 Beds • 1 Study • 2 Baths • Living • Kitchen)",
  "3 BHK Luxury Corner (3 Beds • 3 Baths • Living • Modular Kitchen • 2 Balconies)",
  "3.5 BHK Sky Suite (3 Beds • Servants Room • 3.5 Baths • Dual Balconies)",
  "4 BHK Grand Residence (4 Master Bedrooms • 4 Baths • Puja Room • Terrace)",
  "Duplex Villa / Townhouse (3 Bedrooms • Private Garden • Garage)",
  "Penthouse Suite (4 Bedrooms • Private Pool / Deck • 360 View)",

  // Student Housing & Co-Living / Hostels
  "Single Private Occupancy Room (1 Single Bed • Workstation • Ensuite Bath)",
  "Co-Living Twin Sharing Pod (2 Single Beds • Dual Study Desks • Shared Bath)",
  "Co-Living Triple Occupancy Room (3 Bunk/Single Beds • Lockers • Ensuite Bath)",
  "Quad Sharing Hostel Dorm (4 Bunk Beds • Individual Lockers • Common Bath)",

  // Commercial Offices & Retail
  "Corporate Executive Office (1 Conference Room • 4 Private Cabins • 12 Workstations)",
  "Co-Working Flexi Desk Bay (Shared Open Floor • 20 Workstations)",
  "Commercial Retail Shop (Ground Floor Frontage • Storage Room • Restroom)",
  "Medical / Clinic Diagnostic Suite (Waiting Lounge • 3 Doctor Consultation Rooms)",
  "Restaurant & Cloud Kitchen Unit (Kitchen Infrastructure • Dining Space • Storage)",

  // Industrial & Specialty Units
  "Industrial Warehouse & Logistics Bay (High Ceiling • Loading Dock • Mezzanine Office)",
  "Self-Storage Lockable Bay (10x10 Climate Controlled)",

  // Custom User Layout
  "Other / Custom Layout (Specify your own custom architecture...)"
];

export default function AddPropertyModal({ isOpen, onClose, onAddProperty, initialData }: AddPropertyModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(PROPERTY_CATEGORIES[0]);
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [floors, setFloors] = useState("4");
  const [defaultUnitsPerFloor, setDefaultUnitsPerFloor] = useState("3");
  
  // Custom per-floor room counts state
  const [isPerFloorCustom, setIsPerFloorCustom] = useState(false);
  const [floorUnitCounts, setFloorUnitCounts] = useState<number[]>([3, 3, 3, 3]);

  const [roomLayout, setRoomLayout] = useState(ROOM_LAYOUT_OPTIONS[0]);
  const [customRoomLayout, setCustomRoomLayout] = useState("");

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Sync initialData if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategory(initialData.category || PROPERTY_CATEGORIES[0]);
      setPincode(initialData.pincode || "");
      setAddress(initialData.address || "");
      setFloors(initialData.floors ? initialData.floors.toString() : "4");
      setDefaultUnitsPerFloor(initialData.unitsPerFloor ? initialData.unitsPerFloor.toString() : "3");
      setRoomLayout(initialData.roomLayout || ROOM_LAYOUT_OPTIONS[0]);

      if (initialData.floorBreakdown && initialData.floorBreakdown.length > 0) {
        setIsPerFloorCustom(true);
        setFloorUnitCounts(initialData.floorBreakdown.map((f) => f.units));
      } else {
        setIsPerFloorCustom(false);
      }
    } else {
      setName("");
      setCategory(PROPERTY_CATEGORIES[0]);
      setPincode("");
      setAddress("");
      setFloors("4");
      setDefaultUnitsPerFloor("3");
      setIsPerFloorCustom(false);
      setFloorUnitCounts([3, 3, 3, 3]);
      setRoomLayout(ROOM_LAYOUT_OPTIONS[0]);
      setCustomRoomLayout("");
    }
  }, [initialData, isOpen]);

  // Sync floorUnitCounts array when total floors or default units per floor changes
  useEffect(() => {
    if (initialData && isPerFloorCustom) return;

    const numFloors = Math.max(1, Math.min(100, Number(floors) || 1));
    const defaultUnits = Math.max(1, Number(defaultUnitsPerFloor) || 1);

    setFloorUnitCounts((prev) => {
      const updated = [...prev];
      if (updated.length < numFloors) {
        while (updated.length < numFloors) {
          updated.push(defaultUnits);
        }
      } else if (updated.length > numFloors) {
        return updated.slice(0, numFloors);
      }
      return updated;
    });
  }, [floors, defaultUnitsPerFloor, initialData, isPerFloorCustom]);

  if (!isOpen) return null;

  const numFloors = Math.max(1, Number(floors) || 1);
  const totalUnits = isPerFloorCustom
    ? floorUnitCounts.reduce((acc, curr) => acc + curr, 0)
    : numFloors * (Number(defaultUnitsPerFloor) || 1);

  const isCustomLayout = roomLayout.startsWith("Other / Custom Layout");
  const finalRoomLayout = isCustomLayout 
    ? (customRoomLayout.trim() || "Custom Architecture Layout") 
    : roomLayout;

  const handleUpdateFloorCount = (index: number, newCount: number) => {
    const validCount = Math.max(1, Math.min(50, newCount));
    setFloorUnitCounts((prev) => {
      const next = [...prev];
      next[index] = validCount;
      return next;
    });
  };

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

      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cleanCode)}&format=json&addressdetails=1`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const place = geoData[0];
        const displayName = place.display_name;
        setAddress(displayName);
        setLocationMessage(`Auto-filled: ${displayName.split(",").slice(0, 3).join(",")}`);
        toast(`Global location detected for postal code ${cleanCode}!`, "success");
        setIsFetchingLocation(false);
        return;
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

    const floorBreakdown = floorUnitCounts.map((count, i) => ({
      floor: i + 1,
      units: count,
    }));

    const isEditMode = !!initialData;
    const newProp: PropertyData = {
      id: initialData?.id || `PROP-${Math.floor(10 + Math.random() * 90)}`,
      name,
      category,
      pincode,
      address: address || "Primary City Location",
      floors: numFloors,
      unitsPerFloor: isPerFloorCustom ? Math.round(totalUnits / numFloors) : Number(defaultUnitsPerFloor),
      units: totalUnits,
      roomLayout: finalRoomLayout,
      floorBreakdown,
      avgRent: initialData?.avgRent,
    };

    if (onAddProperty) {
      onAddProperty(newProp);
    }

    toast(
      isEditMode
        ? `Property "${name}" updated successfully!`
        : `Property "${name}" created with ${numFloors} floors & ${totalUnits} total rooms across custom floor plans!`,
      "success"
    );
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
                {initialData ? "Edit Property Details" : "Add Property Setup"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {initialData ? `Update architecture configuration for ${initialData.name}` : "Configure building layout, floor counts & room allocation matrix"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Property Identity */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Building / Property Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grand Regency Executive Suites"
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

          {/* Section 2: Floors & Per-Floor Room Architecture */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Floors & Room Architecture</span>
              </h4>

              <span className="text-xs font-black text-slate-900 bg-amber-100/70 border border-amber-200 px-2.5 py-0.5 rounded-full">
                ={totalUnits} Total Units / Rooms
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Total Building Floors</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Default Rooms per Floor
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  disabled={isPerFloorCustom}
                  value={defaultUnitsPerFloor}
                  onChange={(e) => setDefaultUnitsPerFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Toggle Switch: Customize Rooms Per Floor Individually */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF6B00]" />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Specify room counts per floor individually</span>
                  <span className="text-[10px] text-slate-500">Enable if Floor 1 has 3 rooms, Floor 2 has 2 rooms, etc.</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isPerFloorCustom}
                onChange={(e) => setIsPerFloorCustom(e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
              />
            </div>

            {/* Per-Floor Room Counter Grid */}
            {isPerFloorCustom && (
              <div className="p-4 bg-orange-50/50 border border-orange-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs border-b border-orange-200/60 pb-2">
                  <span className="font-bold text-slate-900 uppercase text-[11px]">Individual Floor Room Breakdown</span>
                  <span className="text-[10px] text-orange-700 font-extrabold">
                    {numFloors} Floors Configured
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                  {floorUnitCounts.map((count, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                    >
                      <span className="font-bold text-slate-800">
                        {idx === 0 ? "Floor 1 (Ground)" : `Floor ${idx + 1}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateFloorCount(idx, count - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-8 text-center font-black text-slate-900 text-xs">
                          {count} {count === 1 ? "Room" : "Rooms"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpdateFloorCount(idx, count + 1)}
                          className="w-6 h-6 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-[#FF6B00] font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Rent Note */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2 text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                <strong>Room Rent Configuration:</strong> Rent varies per room & floor. You can set individual room rents inside the Property Floor Plan view.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Auto-generates {totalUnits} unit cards</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              {initialData ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{initialData ? "Save Property Changes" : "Create Property"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
