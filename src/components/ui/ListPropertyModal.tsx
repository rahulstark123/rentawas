"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  MapPin,
  Sparkles,
  DollarSign,
  Phone,
  ShieldCheck,
  Zap,
  Wifi,
  Car,
  Dumbbell,
  Lock,
  Tv,
  Utensils,
  ChevronDown,
  Check,
  Compass,
  Crosshair,
  Map,
  Navigation,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newListing: any) => void;
}

const AMENITIES_LIST = [
  { id: "wifi", label: "High-Speed WiFi", icon: Wifi },
  { id: "parking", label: "Covered Parking", icon: Car },
  { id: "gym", label: "Gym & Fitness", icon: Dumbbell },
  { id: "security", label: "24x7 Security", icon: Lock },
  { id: "tv", label: "Furnished & TV", icon: Tv },
  { id: "kitchen", label: "Modular Kitchen", icon: Utensils },
];

const TENANT_CATEGORY_OPTIONS = [
  "Any / Open to All",
  "Families & Married Couples",
  "Working Male Professionals",
  "Working Female Professionals",
  "Girls / Female Students Only",
  "Boys / Male Students Only",
  "Corporate & IT Professionals",
  "Expat / Foreign Nationals",
  "Doctors & Healthcare Staff",
  "Couples / Live-in Partners",
];

export default function ListPropertyModal({
  isOpen,
  onClose,
  onSuccess,
}: ListPropertyModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [propertyType, setPropertyType] = useState("Flat / Apartment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [tenantTypes, setTenantTypes] = useState<string[]>(["Any / Open to All"]);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("Immediately (Ready to Move)");
  const [maintenance, setMaintenance] = useState("Included in Monthly Rent");
  const [customMaintenance, setCustomMaintenance] = useState("");

  const toggleTenantCategory = (cat: string) => {
    if (cat === "Any / Open to All") {
      setTenantTypes(["Any / Open to All"]);
      return;
    }
    const filtered = tenantTypes.filter((c) => c !== "Any / Open to All");
    if (filtered.includes(cat)) {
      const next = filtered.filter((c) => c !== cat);
      setTenantTypes(next.length === 0 ? ["Any / Open to All"] : next);
    } else {
      setTenantTypes([...filtered, cat]);
    }
  };

  const [pincode, setPincode] = useState("560038");
  const [stateName, setStateName] = useState("Karnataka");
  const [city, setCity] = useState("Bengaluru");
  const [locality, setLocality] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [isSearchingPincode, setIsSearchingPincode] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 12.9716,
    lng: 77.5946,
  });

  // Debounced Pincode/Zip Worldwide Lookup (1.5s delay to prevent API spam)
  useEffect(() => {
    const trimmedPin = pincode.trim();
    if (!trimmedPin || trimmedPin.length < 3) return;

    const handler = setTimeout(async () => {
      try {
        setIsSearchingPincode(true);

        // 1. Indian 6-digit PIN code lookup
        if (/^\d{6}$/.test(trimmedPin)) {
          const res = await fetch(`https://api.postalpincode.in/pincode/${trimmedPin}`);
          if (res.ok) {
            const json = await res.json();
            if (json && json[0] && json[0].Status === "Success" && json[0].PostOffice?.length > 0) {
              const po = json[0].PostOffice[0];
              const dist = po.District || po.Division || "";
              const st = po.State || "";
              const loc = po.Name || po.Block || "";
              if (dist) setCity(dist);
              if (st) setStateName(st);
              if (loc) setLocality(loc);
              setFullAddress(`${loc ? loc + ", " : ""}${dist}, ${st} - ${trimmedPin}`);
              toast(`Auto-filled address for PIN Code ${trimmedPin}`, "success");
              setIsSearchingPincode(false);
              return;
            }
          }
        }

        // 2. Global Worldwide Postal Code Lookup via OpenStreetMap Nominatim
        const globalRes = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(trimmedPin)}&format=jsonv2&addressdetails=1`
        );
        if (globalRes.ok) {
          const globalData = await globalRes.json();
          if (Array.isArray(globalData) && globalData.length > 0) {
            const place = globalData[0];
            const addr = place.address || {};
            const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
            const detectedState = addr.state || addr.region || addr.country || "";
            const detectedLocality = addr.suburb || addr.neighbourhood || (place.display_name ? place.display_name.split(",")[0] : "");

            if (detectedCity) setCity(detectedCity);
            if (detectedState) setStateName(detectedState);
            if (detectedLocality) setLocality(detectedLocality);
            setFullAddress(`${detectedLocality ? detectedLocality + ", " : ""}${detectedCity}, ${detectedState} ${trimmedPin}`);
            toast(`Global address auto-detected for postal code ${trimmedPin}`, "success");
          }
        }
      } catch (err) {
        console.warn("Pincode lookup error:", err);
      } finally {
        setIsSearchingPincode(false);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [pincode]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "wifi",
    "parking",
    "security",
  ]);
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
  );

  const [ownerName, setOwnerName] = useState("Alexander Wright");
  const [ownerPhone, setOwnerPhone] = useState("+91 98765 43210");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  if (!isOpen) return null;

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!title.trim()) {
        toast("Please enter a property title.", "error");
        return;
      }
    } else if (currentStep === 2) {
      if (!rent) {
        toast("Please specify the monthly rent.", "error");
        return;
      }
    } else if (currentStep === 3) {
      if (!locality.trim()) {
        toast("Please enter locality / address.", "error");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePublish = () => {
    const newEntry = {
      id: `LIST-${Date.now()}`,
      title,
      rent: `₹${parseInt(rent).toLocaleString("en-IN")}/mo`,
      bhk: propertyType,
      description,
      location: `${locality}, ${city}`,
      status: "Active",
      inquiriesCount: 0,
      image: imageUrl,
      ownerPhone,
    };
    onSuccess(newEntry);
    toast("Property published to RentAwas Marketplace for 100% Free!", "success");
    onClose();
    // Reset
    setCurrentStep(1);
    setTitle("");
    setRent("");
    setLocality("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0B132B] p-6 text-white shrink-0 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {currentStep} of 4 • 100% Free Listing</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              List New Vacant Property
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Zero broker fees • Direct tenant inquiries
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="bg-slate-100 h-1.5 w-full shrink-0">
          <div
            className="bg-[#FF6B00] h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Step Indicator Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <span className={currentStep === 1 ? "text-[#FF6B00] font-black" : ""}>
            1. Basic Info
          </span>
          <span className={currentStep === 2 ? "text-[#FF6B00] font-black" : ""}>
            2. Rent & Deposit
          </span>
          <span className={currentStep === 3 ? "text-[#FF6B00] font-black" : ""}>
            3. Location & Amenities
          </span>
          <span className={currentStep === 4 ? "text-[#FF6B00] font-black" : ""}>
            4. Review & Publish
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleNextStep}>
            
            {/* STEP 1: Basic Property Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 1: Property Configuration
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Property Type *
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer shadow-2xs"
                    >
                      <optgroup label="🏢 Residential Apartments & Condos">
                        <option value="Flat / Apartment">Flat / Apartment (1BHK, 2BHK, 3BHK...)</option>
                        <option value="Condominium (Condo)">Condominium (Condo)</option>
                        <option value="Studio Apartment / 1 RK">Studio Apartment / 1 RK</option>
                        <option value="Penthouse & Terrace Unit">Penthouse &amp; Terrace Unit</option>
                        <option value="Loft & Duplex Suite">Loft &amp; Duplex Suite</option>
                        <option value="Executive Serviced Apartment">Executive Serviced Apartment</option>
                      </optgroup>

                      <optgroup label="🏡 Houses & Independent Villas">
                        <option value="House / Villa">Independent House / Villa</option>
                        <option value="Builder Floor (Individual Floor)">Builder Floor (Individual Floor)</option>
                        <option value="Townhouse / Row House">Townhouse / Row House</option>
                        <option value="Bungalow / Gated Villa">Bungalow / Gated Villa</option>
                        <option value="Farmhouse / Estate">Farmhouse / Estate</option>
                      </optgroup>

                      <optgroup label="🎓 Hostels, PG & Student Housing">
                        <option value="Independent Private Boys Hostel">Independent Private Boys Hostel</option>
                        <option value="Independent Private Girls Hostel">Independent Private Girls Hostel</option>
                        <option value="College & University Student Hostel">College &amp; University Student Hostel</option>
                        <option value="School / Boarding School Hostel">School / Boarding School Hostel</option>
                        <option value="PG / Paying Guest (Boys/Girls/Co-Ed)">PG / Paying Guest (Boys, Girls, Co-Ed)</option>
                        <option value="Working Professionals Hostel / Co-Living">Working Professionals Hostel / Co-Living</option>
                        <option value="Co-Living Shared Suite / Pod">Co-Living Shared Suite / Pod</option>
                      </optgroup>

                      <optgroup label="🏢 Commercial & Business Spaces">
                        <option value="Commercial Office Space">Commercial Office Space</option>
                        <option value="Retail Shop / Showroom">Retail Shop / Showroom</option>
                        <option value="Co-Working Space">Co-Working Space / Desk</option>
                        <option value="Warehouse / Storage Bay">Warehouse / Storage Bay</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Property Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Luxury 2BHK Apartment with Balcony"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Property Description &amp; Highlights</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">Optional details for prospective tenants</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of the property highlights, floor level, bedroom layouts, nearby landmarks, rules, or special facilities (e.g. Spacious 2BHK on 3rd Floor with North facing balcony, 24x7 power backup, near Tech Park)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] leading-relaxed resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Pricing & Deposit */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 2: Rent & Deposit Terms
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Monthly Rent (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      placeholder="e.g. 28500"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Preferred Tenant Categories *</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">Select multiple if applicable</span>
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] flex items-center justify-between cursor-pointer text-left shadow-2xs min-h-[42px]"
                    >
                      <div className="flex flex-wrap gap-1.5 items-center max-w-[88%] py-0.5">
                        {tenantTypes.length === 0 ? (
                          <span className="text-slate-400 font-normal">Select preferred tenant categories...</span>
                        ) : (
                          tenantTypes.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 text-[11px] font-extrabold"
                            >
                              <span>{cat}</span>
                              <X
                                className="w-3 h-3 hover:text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTenantCategory(cat);
                                }}
                              />
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isTenantDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Inline Expanding Dropdown Menu */}
                    {isTenantDropdownOpen && (
                      <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-2 max-h-56 overflow-y-auto space-y-1 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                        {TENANT_CATEGORY_OPTIONS.map((cat) => {
                          const isSelected = tenantTypes.includes(cat);
                          return (
                            <div
                              key={cat}
                              onClick={() => toggleTenantCategory(cat)}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
                                />
                                <span>{cat}</span>
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-[#FF6B00]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Available From *
                    </label>
                    <select
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Immediately (Ready to Move)">Immediately (Ready to Move)</option>
                      <option value="Within 7 Days">Within 7 Days</option>
                      <option value="Within 15 Days">Within 15 Days</option>
                      <option value="1st of Next Month">1st of Next Month</option>
                      <option value="15th of Next Month">15th of Next Month</option>
                      <option value="Under Renovation (Available Soon)">Under Renovation (Available Soon)</option>
                      <option value="Under Construction / Pre-Booking">Under Construction / Pre-Booking</option>
                      <option value="Specific Date (Contact Owner)">Specific Date (Contact Owner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Maintenance Fee *
                    </label>
                    <select
                      value={maintenance}
                      onChange={(e) => setMaintenance(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="N/A (Not Applicable)">N/A (Not Applicable)</option>
                      <option value="Included in Monthly Rent">Included in Monthly Rent</option>
                      <option value="₹1,000 / Month">₹1,000 / Month</option>
                      <option value="₹1,500 / Month">₹1,500 / Month</option>
                      <option value="₹2,000 / Month">₹2,000 / Month</option>
                      <option value="₹2,500 / Month">₹2,500 / Month</option>
                      <option value="₹3,000 / Month">₹3,000 / Month</option>
                      <option value="₹3,500 / Month">₹3,500 / Month</option>
                      <option value="₹5,000 / Month">₹5,000 / Month</option>
                      <option value="As Per Society Bill (Actuals)">As Per Society Bill (Actuals)</option>
                      <option value="Extra (Billed Annually)">Extra (Billed Annually)</option>
                      <option value="Other / Custom Amount">Other / Custom Amount</option>
                    </select>

                    {maintenance === "Other / Custom Amount" && (
                      <div className="mt-2.5 animate-in fade-in zoom-in-95 duration-150">
                        <label className="block text-[11px] font-extrabold text-[#FF6B00] uppercase tracking-wider mb-1">
                          Specify Custom Amount (₹ / Month) *
                        </label>
                        <input
                          type="number"
                          required
                          value={customMaintenance}
                          onChange={(e) => setCustomMaintenance(e.target.value)}
                          placeholder="e.g. 1800"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#FF6B00]/50 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Location & Amenities */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-slate-900">
                    Step 3: Location &amp; Amenities
                  </h4>

                  {/* Interactive Map Picker Button */}
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{pinnedCoords ? "Pinned on Map ✓" : "Pin Location on Map"}</span>
                  </button>
                </div>

                {/* Grid 1: Pincode & State / Region */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Pincode / Postal Code *</span>
                      {isSearchingPincode && (
                        <span className="text-[10px] text-[#FF6B00] font-bold flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Detecting Location...</span>
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 560038 or 90210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Grid 2: City & Locality */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City / Metropolis *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Locality / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Indiranagar, 100 Feet Road"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Full Street Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Building &amp; Street Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. Flat #402, 4th Floor, Grand Regency Enclave, 12th Main Road, Indiranagar"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Key Amenities Included
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedAmenities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAmenity(item.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review & Owner Contact */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 4: Contact Settings & Preview
                </h4>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                  <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Listing Summary Preview
                  </div>
                  
                  <div className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <Image
                        src={imageUrl}
                        alt="Property preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{title || "Property Title"}</div>
                      <div className="text-xs text-[#FF6B00] font-black">₹{rent || "0"}/month • {propertyType}</div>
                      <div className="text-xs text-slate-500 font-medium">{locality || "Locality"}, {city || "City"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Owner Contact Name
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Direct Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Enable direct WhatsApp inquiry messages from prospective tenants
                  </span>
                </label>
              </motion.div>
            )}

            {/* Bottom Step Control Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish 100% Free Listing</span>
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
      {/* Interactive Map Location Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-extrabold text-slate-900 text-base">Pin Property Location on Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Interactive Map Container */}
            <div className="relative h-64 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-inner group">
              {/* Map grid lines & tiles background */}
              <div
                className="absolute inset-0 opacity-40 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:16px_16px]"
              />
              
              {/* Simulated Map Visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00] flex items-center justify-center animate-bounce mb-2">
                  <MapPin className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div className="text-white font-extrabold text-xs tracking-wide">
                  {locality || city ? `${locality || "Indiranagar"}, ${city || "Bengaluru"}` : "Bengaluru, Karnataka"}
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-1">
                  GPS: {pinnedCoords?.lat.toFixed(4)}° N, {pinnedCoords?.lng.toFixed(4)}° E
                </div>
                {fullAddress && (
                  <div className="text-[10px] text-slate-400 max-w-xs truncate mt-0.5">
                    {fullAddress}
                  </div>
                )}
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setPinnedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        toast("Current GPS location pinned!", "success");
                      });
                    } else {
                      toast("GPS location captured!", "info");
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FF6B00] text-white rounded-lg text-[10px] font-extrabold shadow-2xs hover:bg-[#E56000] cursor-pointer"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Locate Me</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                Pincode: <span className="font-bold text-slate-900">{pincode || "560038"}</span> • State: <span className="font-bold text-slate-900">{stateName || "Karnataka"}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  toast("Property location coordinates confirmed on map!", "success");
                  setShowMapPicker(false);
                }}
                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all uppercase tracking-wider"
              >
                Confirm Map Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
