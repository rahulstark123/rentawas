"use client";

import { useState } from "react";
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
  Utensils
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
  const [bhk, setBhk] = useState("2 BHK");
  const [floor, setFloor] = useState("3rd Floor");

  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [tenantType, setTenantType] = useState("Any Allowed");
  const [availableFrom, setAvailableFrom] = useState("Immediately");
  const [maintenance, setMaintenance] = useState("Included");

  const [city, setCity] = useState("Bengaluru");
  const [locality, setLocality] = useState("");
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
      bhk,
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Property Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Flat / Apartment", "PG Bed", "House / Villa", "Studio"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          propertyType === type
                            ? "bg-[#0B132B] text-white border-[#0B132B] shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      BHK / Bedrooms
                    </label>
                    <select
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                      <option value="Single PG Bed">Single PG Bed</option>
                      <option value="Studio Flat">Studio Flat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Floor Level
                    </label>
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="e.g. 3rd of 12 Floors"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Tenant Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Any Allowed", "Family", "Bachelors", "Girls Only"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTenantType(cat)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          tenantType === cat
                            ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Available From
                    </label>
                    <select
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    >
                      <option value="Immediately">Immediately</option>
                      <option value="In 7 Days">In 7 Days</option>
                      <option value="1st of Next Month">1st of Next Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Maintenance Fee
                    </label>
                    <select
                      value={maintenance}
                      onChange={(e) => setMaintenance(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    >
                      <option value="Included">Included in Rent</option>
                      <option value="₹2,000 / mo">₹2,000 / Month</option>
                      <option value="₹3,500 / mo">₹3,500 / Month</option>
                    </select>
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
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 3: Location & Amenities
                </h4>

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
                      <div className="text-xs text-[#FF6B00] font-black">₹{rent}/month • {bhk}</div>
                      <div className="text-xs text-slate-500 font-medium">{locality}, {city}</div>
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
    </div>
  );
}
