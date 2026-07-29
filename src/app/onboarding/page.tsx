"use client";

import { useState } from "react";
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
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CurrencySelector from "@/components/ui/CurrencySelector";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 1: Business Profile & Workspace
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("Landlord / Individual Owner");
  const [operatingCity, setOperatingCity] = useState("");

  // Step 2: Operational Preferences & Currency
  const [currency, setCurrency] = useState("USD ($)");
  const [portfolioFocus, setPortfolioFocus] = useState("Residential Apartments & Flats");
  const [dueDay, setDueDay] = useState<number>(1);

  const businessTypes = [
    "Landlord / Individual Owner",
    "Property Management Firm",
    "PG / Co-Living Host",
    "Commercial Real Estate Manager",
    "Real Estate Broker / Channel Partner",
  ];

  const portfolioFocusOptions = [
    "Residential Apartments & Flats",
    "PG Beds & Co-Living Hostels",
    "Commercial Offices & Retail Shops",
    "Mixed Real Estate Portfolio",
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast("Please provide your Company or Workspace Name.", "info");
      return;
    }
    setCurrentStep(2);
  };

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinishing(true);

    try {
      const res = await fetch("/api/workspace/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          businessType,
          operatingCity: operatingCity.trim() || "Main City",
          currency,
          portfolioFocus,
          dueDay: Number(dueDay),
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast(`Welcome to RentAwas! Workspace configured for ${companyName.trim()} in ${currency}.`, "success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        toast(json.error || "Failed to complete onboarding", "error");
        setIsFinishing(false);
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      toast("Setting up workspace in offline mode...", "info");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden select-none">
      
      {/* Ambient Radial Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="RentAwas Logo" width={38} height={38} className="h-9 w-auto object-contain" />
          <span 
            className="text-2xl font-extrabold tracking-tight font-cormorant" 
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            <span className="text-white">Rent</span>
            <span className="text-[#FF6B00]">Awas</span>
          </span>
        </Link>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Step {currentStep} of 2 • Workspace Initialization
        </span>
      </header>

      {/* Main Onboarding Card */}
      <main className="max-w-2xl mx-auto w-full my-auto z-10 pt-6 pb-10">
        
        {/* Header Titles */}
        <div className="mb-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentStep === 1 ? "Step 1: Business Profile & Company Name" : "Step 2: Operating Preferences & Currency"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            {currentStep === 1 
              ? "Tell us about your business or property setup to customize your dashboard." 
              : "Set your primary currency and rent collection preferences."}
          </p>

          {/* 2-Step Tab Bar */}
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
              <span className="truncate">Company Profile</span>
            </div>

            <div
              onClick={() => {
                if (companyName.trim()) setCurrentStep(2);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold cursor-pointer transition-all ${
                currentStep === 2
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-500"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">2</span>
              <span className="truncate">Currency & Defaults</span>
            </div>
          </div>
        </div>

        {/* STEP 1 FORM */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="bg-[#141A26] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="space-y-4 text-xs">
              
              {/* Company / Workspace Name */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Company / Organization Name <span className="text-[#FF6B00]">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stark Property Management LLC or Awas Rentals"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Business Type / Role</span>
                </label>
                <div className="relative">
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {businessTypes.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Primary Operating City */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Primary Operating City / Region
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={operatingCity}
                    onChange={(e) => setOperatingCity(e.target.value)}
                    placeholder="e.g. Seattle WA, Mumbai, London, or Dubai"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

            </div>

            {/* Step 1 Control */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-3 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-lg shadow-orange-500/20 uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next: Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 FORM */}
        {currentStep === 2 && (
          <form onSubmit={handleFinishOnboarding} className="bg-[#141A26] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="space-y-4 text-xs">
              
              {/* Default Operating Currency */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Default Operating Currency</span>
                </label>
                <CurrencySelector
                  value={currency}
                  onChange={setCurrency}
                />
              </div>

              {/* Portfolio Focus */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Portfolio Focus & Target</span>
                </label>
                <div className="relative">
                  <select
                    value={portfolioFocus}
                    onChange={(e) => setPortfolioFocus(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {portfolioFocusOptions.map((pf) => (
                      <option key={pf} value={pf}>{pf}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Monthly Rent Due Date */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Default Rent Due Day of Month</span>
                </label>
                <div className="relative">
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full appearance-none pl-3.5 pr-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value={1}>1st of Every Month (Standard)</option>
                    <option value={5}>5th of Every Month</option>
                    <option value={10}>10th of Every Month</option>
                    <option value={15}>15th of Every Month</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Personalization Summary Box */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1 text-slate-400">
                <span className="font-bold text-white block">Initialization Summary</span>
                <p className="text-[11px] leading-relaxed">
                  Workspace <strong className="text-white">{companyName}</strong> will be configured with <strong className="text-amber-400">{currency}</strong> currency and rent due on the <strong className="text-emerald-400">{dueDay}th</strong> of every month.
                </p>
              </div>

            </div>

            {/* Step 2 Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isFinishing}
                className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isFinishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isFinishing ? "Saving & Launching..." : "Complete Setup & Launch"}</span>
              </button>
            </div>
          </form>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 z-10 font-sans">
        RentAwas Onboarding Engine &copy; {new Date().getFullYear()} ANSH Apps. All rights reserved.
      </footer>

    </div>
  );
}
