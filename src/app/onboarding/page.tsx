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
  Zap, 
  ShieldCheck, 
  Globe, 
  DollarSign, 
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CurrencySelector from "@/components/ui/CurrencySelector";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isFinishing, setIsFinishing] = useState(false);

  // Step 1 State: Workspace & Organization Setup
  const [orgName, setOrgName] = useState("Apex Property Management");
  const [currency, setCurrency] = useState("USD ($)");
  const [portfolioScale, setPortfolioScale] = useState("6-25 Units (Multi-Family)");

  // Step 2 State: Add First Property
  const [propertyName, setPropertyName] = useState("The Regent Executive Residency");
  const [propertyType, setPropertyType] = useState("Multi-Family Apartment Complex");
  const [unitCount, setUnitCount] = useState("12");
  const [propertyAddress, setPropertyAddress] = useState("742 Evergreen Terrace, San Francisco, CA");

  // Step 3 State: Autopilot Rent Collection & Bank Payout
  const [paymentGateway, setPaymentGateway] = useState("Autopilot ACH Direct (Zero Fee)");
  const [accountHolder, setAccountHolder] = useState("Apex Property Holdings LLC");
  const [accountNumber, setAccountNumber] = useState("•••• •••• 4920");
  const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(true);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!orgName.trim()) {
        toast("Please provide your Organization or Workspace Name.", "info");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!propertyName.trim()) {
        toast("Please provide your First Property Name.", "info");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinishing(true);
    toast(`Setting up workspace with ${currency} currency...`, "success");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
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
            {currentStep === 2 && "Step 2: Add Your First Property & Units"}
            {currentStep === 3 && "Step 3: Autopilot Rent Collection Payouts"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Configure your property telemetry, automated rent billing, and payout ledger in 3 simple steps.
          </p>

          {/* Progress Bar Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#141A26] p-2 rounded-2xl border border-slate-800 text-xs max-w-lg mx-auto mt-4">
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
              <span className="truncate">Workspace</span>
            </div>

            <div
              onClick={() => {
                if (orgName.trim()) setCurrentStep(2);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold cursor-pointer transition-all ${
                currentStep === 2
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : currentStep > 2
                  ? "bg-slate-800 text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              {currentStep > 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">2</span>
              )}
              <span className="truncate">First Property</span>
            </div>

            <div
              onClick={() => {
                if (orgName.trim() && propertyName.trim()) setCurrentStep(3);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold cursor-pointer transition-all ${
                currentStep === 3
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-500"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">3</span>
              <span className="truncate">Rent Collection</span>
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

          {/* STEP 2: ADD FIRST PROPERTY & UNITS */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  First Property Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. The Regent Executive Residency"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Property Type
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full appearance-none pl-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Multi-Family Apartment Complex">Multi-Family Apartment Complex</option>
                      <option value="Single Family Rental House">Single Family Rental House</option>
                      <option value="Commercial Office Building">Commercial Office Building</option>
                      <option value="Student Housing / PG Co-Living">Student Housing / PG Co-Living</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Total Units / Rooms
                  </label>
                  <input
                    type="number"
                    required
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    placeholder="12"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Property Street Address & Location
                </label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, San Francisco, CA"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: AUTOPILOT RENT COLLECTION & BANK PAYOUTS */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Preferred Rent Payout Channel
                </label>
                <div className="relative">
                  <select
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className="w-full appearance-none pl-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Autopilot ACH Direct (Zero Fee)">Autopilot ACH Direct (Zero Transaction Fee)</option>
                    <option value="Razorpay UPI Instant Gateway">Razorpay UPI Instant Gateway (India)</option>
                    <option value="Stripe Bank Connect">Stripe Bank Connect (Global)</option>
                    <option value="Direct Wire / Swift Transfer">Direct Wire / SWIFT Bank Transfer</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Payout Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="e.g. Apex Property Holdings LLC"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1.5">
                    Account / Routing / IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="•••• •••• 4920"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Auto Reminders Toggle */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-[#FF6B00] shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Automated Monthly Rent Billing</span>
                    <span className="text-[11px] text-slate-400">Send WhatsApp & Email payment links on the 1st of every month.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRemindersEnabled}
                  onChange={(e) => setAutoRemindersEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-lg shadow-orange-500/20 uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: {currentStep === 1 ? "First Property" : "Rent Collection"}</span>
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
