"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building,
  CheckCircle2,
  ChevronDown,
  Layers,
  MapPin,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CurrencySelector from "@/components/ui/CurrencySelector";
import { PROPERTY_CATEGORIES } from "@/components/ui/AddPropertyModal";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 1 State: Workspace & Organization Setup
  const [orgName, setOrgName] = useState("");
  const [currency, setCurrency] = useState("USD ($)");
  const [portfolioScale, setPortfolioScale] = useState("6-25 Units (Multi-Family)");

  // Step 2 State: Add First Property (Clean empty fields for tenant/landlord entry)
  const [propertyName, setPropertyName] = useState("");
  const [category, setCategory] = useState(PROPERTY_CATEGORIES[0]);
  const [floors, setFloors] = useState("");
  const [unitsPerFloor, setUnitsPerFloor] = useState("");
  const [pincode, setPincode] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Sync Portfolio Scale filled during Signup Page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScale = localStorage.getItem("signup_portfolio_scale");
      if (savedScale) {
        if (savedScale === "1-5") setPortfolioScale("1-5 Units (Single Owner)");
        else if (savedScale === "6-20") setPortfolioScale("6-25 Units (Multi-Family)");
        else if (savedScale === "21-50") setPortfolioScale("26-100 Units (Commercial)");
        else if (savedScale === "50+") setPortfolioScale("100+ Units (Institutional)");
      }
    }
  }, []);

  const numFloors = Number(floors) || 1;
  const numUnitsPerFloor = Number(unitsPerFloor) || 1;
  const totalCalculatedUnits = numFloors * numUnitsPerFloor;

  // Auto-fetch location from PIN / ZIP code globally
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setPincode(code);
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode.length >= 4) {
      setIsFetchingLocation(true);
      setLocationMessage(null);

      try {
        if (/^\d{6}$/.test(cleanCode)) {
          const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const autoAddr = `${po.Name}, ${po.District}, ${po.State}, India`;
            setPropertyAddress(autoAddr);
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
            setPropertyAddress(autoAddr);
            setLocationMessage(`Auto-filled: ${place["place name"]}, ${place["state abbreviation"]}`);
            toast(`Location auto-filled for ZIP ${cleanCode}!`, "success");
            setIsFetchingLocation(false);
            return;
          }
        }
      } catch (err) {
        console.error("Location fetch error", err);
      } finally {
        setIsFetchingLocation(false);
      }
    } else {
      setLocationMessage(null);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!orgName.trim()) {
        toast("Please provide your Organization or Workspace Name.", "info");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim()) {
      toast("Please provide your First Property Name.", "info");
      return;
    }
    setIsFinishing(true);
    toast(`Setting up workspace with ${currency} currency & ${propertyName} (${totalCalculatedUnits} units across ${floors} floors)...`, "success");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  const handleSkipProperty = () => {
    setIsFinishing(true);
    toast("Workspace initialized! You can add properties anytime from Dashboard.", "info");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Glow Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="RentAwas Logo" width={38} height={38} className="h-9 w-auto" />
          <span 
            className="text-2xl font-extrabold tracking-tight font-cormorant" 
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            <span className="text-white">Rent</span>
            <span className="text-[#FF6B00]">Awas</span>
          </span>
        </Link>
      </header>

      {/* Main Wizard Container */}
      <main className="max-w-2xl mx-auto w-full my-auto z-10 pt-6 pb-10">
        
        {/* Step Indicator Progress Header */}
        <div className="mb-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Landlord Account Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentStep === 1 && "Step 1: Workspace & Portfolio Identity"}
            {currentStep === 2 && "Step 2: Add Your First Property & Floor Plan"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Configure your property details, floor layout, and portfolio structure in 2 quick steps.
          </p>

          {/* Progress Bar Tabs (2 Steps Only) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-[#141A26] p-2 rounded-2xl border border-slate-800 text-xs max-w-md mx-auto mt-4">
            <div
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold cursor-pointer transition-all ${
                currentStep === 1
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : currentStep > 1
                  ? "bg-slate-800 text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              {currentStep > 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">1</span>
              )}
              <span className="truncate">Workspace Info</span>
            </div>

            <div
              onClick={() => {
                if (orgName.trim()) setCurrentStep(2);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold cursor-pointer transition-all ${
                currentStep === 2
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-500"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">2</span>
              <span className="truncate">First Property</span>
            </div>
          </div>
        </div>

        {/* Form Card Container */}
        <form
          onSubmit={handleFinishOnboarding}
          className="bg-[#141A26] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
        >
          
          {/* STEP 1: WORKSPACE & COMPANY SETUP */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Organization / Workspace Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Apex Property Management LLC"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Searchable Open-Source 150+ World Currency Selector */}
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Primary Currency & Ledger Locale
                  </label>
                  <CurrencySelector
                    value={currency}
                    onChange={setCurrency}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Portfolio Scale & Category
                  </label>
                  <div className="relative">
                    <select
                      value={portfolioScale}
                      onChange={(e) => setPortfolioScale(e.target.value)}
                      className="w-full appearance-none pl-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="1-5 Units (Single Owner)">1-5 Units (Single Owner)</option>
                      <option value="6-25 Units (Multi-Family)">6-25 Units (Multi-Family)</option>
                      <option value="26-100 Units (Commercial)">26-100 Units (Commercial Portfolio)</option>
                      <option value="100+ Units (Institutional)">100+ Units (Institutional Manager)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1.5 text-slate-400">
                <span className="font-bold text-white block">Workspace Personalization</span>
                <p className="text-[11px] leading-relaxed">
                  RentAwas will auto-configure your landlord dashboard, taxation templates, and localized currency formatting for <strong className="text-amber-400">{currency}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: ADD FIRST PROPERTY & UNITS (Matches AddPropertyModal inside app) */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Building / Property Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. The Regent Executive Residency or Wing A"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Property Category (Matches PROPERTY_CATEGORIES inside app) */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Property Category & Type
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none pl-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {PROPERTY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Floor Plan Metrics: Total Floors & Units Per Floor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Total Floors</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                    <span>Units / Rooms per Floor</span>
                    <span className="text-[10px] text-amber-400 font-extrabold normal-case">
                      ={totalCalculatedUnits} Total Units
                    </span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={unitsPerFloor}
                    onChange={(e) => setUnitsPerFloor(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* PIN / ZIP Code with Location Auto-Detect */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Postal / PIN Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder="e.g. 560001 or 90210"
                      className="w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                    {isFetchingLocation && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF6B00]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                    <span>Full Street Address</span>
                    {locationMessage && (
                      <span className="text-[10px] text-emerald-400 font-bold truncate max-w-[180px]">
                        {locationMessage}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      placeholder="e.g. 1420 5th Ave, Seattle, WA"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <div>
              {currentStep > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipProperty}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer underline decoration-slate-600 underline-offset-4"
                  >
                    Skip for Now
                  </button>
                </div>
              )}
            </div>

            <div>
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-lg shadow-orange-500/20 uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: First Property</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isFinishing}
                  className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isFinishing ? "Launching Dashboard..." : "Complete Setup & Launch"}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-xs text-slate-500 py-4 z-10">
        RentAwas Automated Landlord Telemetry Platform &copy; {new Date().getFullYear()}
      </footer>

    </div>
  );
}
