"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Wrench,
  UserCheck,
  CheckCircle2,
  X,
  Send,
  ChevronRight,
  BadgeCheck,
  Loader2,
  Sparkles
} from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

export default function RentAwasExpertsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    profession: "🚰 Plumber & Pipe Specialist",
    customProfession: "",
    phoneNumber: "",
    pincode: "",
    city: "",
    state: "",
    fullAddress: "",
    experience: "3-5 years",
  });

  const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman & Nicobar Islands",
    "Chandigarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi (NCT)",
    "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const professionOptions = [
    "🚰 Plumber & Pipe Specialist",
    "⚡ Electrician & Wiring Technician",
    "🪚 Carpenter & Woodworking Specialist",
    "❄️ AC Service & Air Conditioning Repair",
    "🧺 Washing Machine & Appliance Repair",
    "🧹 Househelp / Maid & Domestic Staff",
    "🧹 Deep Cleaning & Sanitization Services",
    "🎨 Painter & Waterproofing Specialist",
    "📦 Packers & Movers Relocation",
    "🧺 Laundry & Dry Cleaning Service",
    "👶 Childcare, Babysitter & Attendant",
    "🔑 Locksmith & Emergency Key Fixer",
    "🐛 Pest Control & Anti-Termite Treatment",
    "📹 CCTV & Smart Security Installer",
    "🛋️ Sofa, Mattress & Carpet Shampoo Fixer",
    "🛠️ General Handyman & Local Services",
    "✨ Other Custom Service / Specialty",
  ];

  const expertCategories = [
    {
      title: "AC & Appliance Repair",
      desc: "AC service, washing machines, refrigerators, microwaves & home appliances.",
      image: "/rentawas experts/ac.jpg",
      tag: "Technician",
    },
    {
      title: "Plumbing & Sanitary",
      desc: "Leak repairs, pipe installations, water tanks, sanitaryware & tap fittings.",
      image: "/rentawas experts/plumber.jpg",
      tag: "Plumber",
    },
    {
      title: "Carpentry & Woodwork",
      desc: "Furniture assembly, door lock fitting, modular kitchen & woodwork fixes.",
      image: "/rentawas experts/Carpentar.jpg",
      tag: "Carpenter",
    },
    {
      title: "Househelp & Domestic Staff",
      desc: "Full-time maids, deep cleaning staff, cooks, laundry & home maintenance.",
      image: "/rentawas experts/Househelp.jpg",
      tag: "Househelp",
    },
    {
      title: "Pest Control Services",
      desc: "Termite treatment, cockroach control, anti-bug sprays & sanitization.",
      image: "/rentawas experts/pest control.jpg",
      tag: "Pest Control",
    },
    {
      title: "Packers & Movers",
      desc: "Home relocation, intercity shifting, furniture transport & packing.",
      image: "/rentawas experts/packers movers.jpg",
      tag: "Logistics",
    },
    {
      title: "Laundry & Dry Cleaning",
      desc: "Daily clothes wash, ironing, steam pressing & dry cleaning pick-up.",
      image: "/rentawas experts/laundry.jpg",
      tag: "Laundry",
    },
    {
      title: "Child Care & Nanny Help",
      desc: "Verified babysitters, infant care, after-school nannies & attendants.",
      image: "/rentawas experts/child care.jpg",
      tag: "Child Care",
    },
    {
      title: "Locksmith & Key Fixer",
      desc: "Emergency lock opening, key duplicate, digital lock install & security.",
      image: "/rentawas experts/locksmith.jpg",
      tag: "Locksmith",
    },
    {
      title: "And Many More Experts",
      desc: "Electricians, painters, interior decorators, gardeners & local specialists.",
      image: "/rentawas experts/many more.jpg",
      tag: "50+ Services",
    },
  ];

  const expertRoles = [
    "Technician",
    "Plumber",
    "Carpenter",
    "Electrician",
    "Househelp & Maid",
    "Appliance Repair",
    "Painter",
    "Packers & Movers",
    "Locksmith",
    "Laundry Service",
    "Many More...",
  ];

  const handlePincodeChange = async (pincodeVal: string) => {
    setFormData((prev) => ({ ...prev, pincode: pincodeVal }));

    if (pincodeVal.length === 6 && /^\d{6}$/.test(pincodeVal)) {
      setIsFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeVal}`);
        if (res.ok) {
          const data = await res.json();
          if (
            data &&
            data[0] &&
            data[0].Status === "Success" &&
            data[0].PostOffice &&
            data[0].PostOffice.length > 0
          ) {
            const po = data[0].PostOffice[0];
            setFormData((prev) => ({
              ...prev,
              city: po.District || po.Block || po.Circle || prev.city,
              state: po.State || prev.state,
              fullAddress: prev.fullAddress || `${po.Name}, ${po.District}, ${po.State} - ${pincodeVal}`,
            }));
          }
        }
      } catch (err) {
        console.error("Pincode lookup error:", err);
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setFormData({
        fullName: "",
        profession: "🚰 Plumber & Pipe Specialist",
        customProfession: "",
        phoneNumber: "",
        pincode: "",
        city: "",
        state: "",
        fullAddress: "",
        experience: "3-5 years",
      });
    }, 2500);
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden font-sans border-t border-slate-800/80">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Main Header & Positioning Statement */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" />
            <span>RentAwas Expert Network</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Want to Become RentAwas Experts?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            At RentAwas, we do not directly perform maintenance in-house — instead, we directly connect tenants and landlords with trusted, verified local independent experts!
          </p>

          {/* If you are a... list */}
          <div className="pt-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
              If you are a...
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {expertRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-200 hover:border-orange-500/50 hover:text-white transition-all cursor-default shadow-2xs"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 5 IMAGES PER ROW GRID (2 ROWS OF 5 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
          {expertCategories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 5) * 0.06 }}
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl hover:border-[#FF6B00]/70 hover:shadow-orange-500/10 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="h-56 sm:h-64 relative overflow-hidden bg-slate-950">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                {i === expertCategories.length - 1 && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-orange-500/40 text-[10px] font-black text-orange-400 uppercase tracking-wider shadow-md">
                    {cat.tag}
                  </span>
                )}
              </div>

              {/* Content Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between bg-slate-900/90">
                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-[#FF6B00] transition-colors leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1 leading-snug">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-[#FF6B00] font-extrabold">
                  <span>Join as Expert</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big Bottom Join Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Ready to Expand Your Service Business with RentAwas?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Become a verified expert. Connect directly with thousands of tenants and property owners needing urgent plumbing, electrical, carpentry, appliance &amp; domestic help.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 hover:scale-[1.02]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Join Now</span>
          </button>
        </div>
      </div>

      {/* PERFECTLY ALIGNED JOIN NOW APPLICANT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-9 space-y-6 shadow-2xl relative my-6 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Apply to Join RentAwas Experts</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-orange-500/20 text-[#FF6B00] border border-orange-500/30 uppercase">
                      VERIFIED LEADS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect directly with property owners &amp; tenants for daily service jobs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-white">Application Submitted Successfully!</h4>
                <p className="text-xs text-emerald-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-white">{formData.fullName}</span>! Our expert onboarding team will verify your address details for <span className="font-bold text-white">{formData.city}, {formData.state}</span> and contact you on <span className="font-mono text-white">{selectedCountry.dialCode} {formData.phoneNumber}</span> within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                
                {/* Row 1: Full Name & Service Profession */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                      Select Your Service / Profession *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white appearance-none focus:outline-none focus:border-[#FF6B00] cursor-pointer pr-10"
                      >
                        {professionOptions.map((opt, idx) => (
                          <option key={idx} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Conditional Custom Profession Field if 'Other' selected */}
                {formData.profession.includes("Other") && (
                  <div className="p-3.5 bg-slate-950 border border-orange-500/40 rounded-xl space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <label className="block font-extrabold uppercase tracking-wider text-orange-400 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Specify Your Custom Profession / Service *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customProfession}
                      onChange={(e) => setFormData({ ...formData, customProfession: e.target.value })}
                      placeholder="e.g. Solar Panel Technician, Aquarium Fixer, Chimney Cleaner..."
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                )}

                {/* Row 2: Shared Country Phone Component & Experience Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                      Mobile Phone Number *
                    </label>
                    <CountryPhoneInput
                      value={formData.phoneNumber}
                      onChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                      selectedCountry={selectedCountry}
                      onCountryChange={(country) => setSelectedCountry(country)}
                      darkTheme={true}
                    />
                  </div>

                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                      Experience Level *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white appearance-none focus:outline-none focus:border-[#FF6B00] cursor-pointer pr-10"
                      >
                        <option value="1-2 years" className="bg-slate-900 text-white">1-2 Years Experience</option>
                        <option value="3-5 years" className="bg-slate-900 text-white">3-5 Years Experience</option>
                        <option value="5-10 years" className="bg-slate-900 text-white">5-10 Years Experience</option>
                        <option value="10+ years" className="bg-slate-900 text-white">10+ Years Master Expert</option>
                        <option value="Licensed Agency" className="bg-slate-900 text-white">Licensed Business / Agency Shop</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Perfectly Aligned Pincode, City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center justify-between">
                      <span>Pincode / Postal Code *</span>
                      {isFetchingPincode && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" />}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 400001 / 10001"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                      Auto-fills city &amp; state for 6-digit PINs
                    </span>
                  </div>

                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                      State *
                    </label>
                    {selectedCountry.code === "IN" || selectedCountry.dialCode === "+91" ? (
                      <div className="relative">
                        <select
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white appearance-none focus:outline-none focus:border-[#FF6B00] cursor-pointer pr-10"
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-400">
                            Select State / UT
                          </option>
                          {INDIAN_STATES.map((st, idx) => (
                            <option key={idx} value={st} className="bg-slate-900 text-white">
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-slate-400 rotate-90 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                      />
                    )}
                  </div>
                </div>

                {/* Row 4: Full Workshop / Business Address */}
                <div>
                  <label className="block h-5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 leading-none flex items-center">
                    Full Workshop / Business Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.fullAddress}
                    onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                    placeholder="Enter street name, shop number, landmark, area & city address..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
