"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, ShieldCheck, Zap, User, Mail, ChevronDown } from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { useToast } from "@/components/ui/Toast";

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EarlyAccessModal({ isOpen, onClose }: EarlyAccessModalProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [portfolioType, setPortfolioType] = useState("Landlord / Owner (1 - 5 Properties)");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast("Please fill in your Full Name and Email Address.", "error");
      return;
    }

    setIsSubmitting(true);
    const fullPhone = phone.trim() ? `${selectedCountry.dialCode} ${phone.trim()}` : "";

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: fullPhone,
          portfolioType,
          notes,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsSubmitted(true);
        toast("Application received! Our team will contact you shortly.", "success");
      } else {
        toast(json.error || "Failed to submit request", "error");
      }
    } catch (err) {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">

        {/* Top Header Background Banner */}
        <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] p-6 text-white relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Early Adopter Program</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Claim Your Early Access
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Join the early access list to lock in lifetime discounts and VIP perks.
          </p>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Thank You! Our Team Will Contact You Shortly.</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                Thank you <strong>{fullName}</strong>. We have received your early access application. Our team will reach out to <strong>{email}</strong> shortly with your VIP activation key!
              </p>
            </div>
            <button
              onClick={resetForm}
              className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-7 space-y-5">

            {/* Early Access Benefits Highlights Grid */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl text-center">
              <div className="space-y-0.5">
                <div className="text-[11px] font-black text-[#FF6B00]">15% EXTRA</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase">ANSH Apps</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 pl-1">
                <div className="text-[11px] font-black text-cyan-600">1 FREE PRO</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase">ANSH App Sub</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 pl-1">
                <div className="text-[11px] font-black text-amber-600">500 BONUS</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase">AI Credits</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 pl-1">
                <div className="text-[11px] font-black text-emerald-600">& MANY MORE</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase">VIP Perks</div>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                  />
                </div>
              </div>

              {/* Phone Number with Country Code Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Phone Number
                </label>
                <CountryPhoneInput
                  value={phone}
                  onChange={setPhone}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
              </div>

              {/* Portfolio / User Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Portfolio / Role Type
                </label>
                <div className="relative">
                  <select
                    value={portfolioType}
                    onChange={(e) => setPortfolioType(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Landlord / Owner (1 - 5 Properties)">Landlord / Owner (1 - 5 Properties)</option>
                    <option value="Landlord / Owner (6 - 20 Properties)">Landlord / Owner (6 - 20 Properties)</option>
                    <option value="Portfolio Owner (50+ Properties)">Portfolio Owner (50+ Properties)</option>
                    <option value="Tenant / Normal User">Tenant / Normal User</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Optional Note / Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Special Note / Request <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific features, questions, or custom requirements..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Claim Early Access Spot Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
