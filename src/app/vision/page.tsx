"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";
import {
  Building2,
  Users,
  Wrench,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  BadgeCheck,
  Clock,
  Key,
  TrendingUp,
  FileText,
  UserCheck,
  Layers,
  HeartHandshake,
  Hotel,
  Rocket
} from "lucide-react";

export default function VisionPage() {
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [activePropertyType, setActivePropertyType] = useState("pg-hostel");

  const propertyTypes = [
    {
      id: "pg-hostel",
      title: "PGs & Student Hostels",
      icon: Hotel,
      badge: "Future On-Site & Remote Ops",
      desc: "Upcoming complete operational handover for multi-bed student & working professional hostels. From daily food staff to resident wardens and emergency maintenance.",
      highlights: [
        "Daily Housekeeping & Laundry Staffing",
        "Biometric Access & Warden Assistance",
        "Mess & Kitchen Facility Operations",
        "Automated Bed Allocation & Rent Receipts"
      ]
    },
    {
      id: "apartments",
      title: "Residential Apartments & Villas",
      badge: "Future Hands-Off Rental Yield",
      icon: Building2,
      iconColor: "text-cyan-400",
      desc: "Our vision is to turn individual flats or gated villa communities into effortless passive income streams with end-to-end tenant screening and asset upkeep.",
      highlights: [
        "Aadhaar Police-Verified Tenants",
        "Digital Rental Agreement Generation",
        "24/7 Rapid Emergency Maintenance",
        "Monthly Payout Statements & Reports"
      ]
    },
    {
      id: "hotels-hospitality",
      title: "Hotels & Hospitality Buildings",
      icon: Hotel,
      badge: "Future Hospitality Management",
      desc: "Full operational & facility staffing management for boutique hotels, guest houses, and service apartments.",
      highlights: [
        "24/7 Front-Desk & Guest Services",
        "On-Demand Housekeeping & Maintenance",
        "Automated Guest Check-in & Billing",
        "Complete Facility & Asset Upkeep"
      ]
    },
    {
      id: "commercial",
      title: "Commercial & Multi-Tenant Units",
      badge: "Future Institutional Management",
      icon: Layers,
      iconColor: "text-amber-400",
      desc: "Comprehensive lease administration, property asset protection, and utility maintenance for multi-tenant commercial spaces.",
      highlights: [
        "Automated Tax & Invoice Compliance",
        "Facility HVAC & Electrical Audits",
        "Commercial Tenant Screening",
        "Long-Term Lease Lifecycle Management"
      ]
    }
  ];

  const lifecycleSteps = [
    {
      num: "01",
      title: "Key Handover & Property Onboarding",
      desc: "Once your property construction or purchase is complete, you'll hand over the keys to RentAwas. We will audit the property, tag assets digitally, and prepare high-res listings.",
      icon: Key
    },
    {
      num: "02",
      title: "Tenant Sourcing & Background Verification",
      desc: "Our system will screen applicants with Aadhaar KYC, credit checks, and employment verification. Digital lease agreements will be generated instantly with e-signatures.",
      icon: UserCheck
    },
    {
      num: "03",
      title: "Automated Rent Collection & Payouts",
      desc: "Rent collection will run automatically through digital payment gateways with zero delay. Funds will be deposited directly into your bank account with receipt logs.",
      icon: TrendingUp
    },
    {
      num: "04",
      title: "RentAwas Experts 24/7 Maintenance",
      desc: "Our verified local technicians will handle AC servicing, plumbing leaks, carpentry, electrical fixes, and daily househelp staff with full service warranty coverage.",
      icon: Wrench
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar variant="dark" />

      {/* SECTION 1: HERO VISION BANNER (FUTURE ROADMAP) */}
      <section className="relative pt-32 sm:pt-36 pb-20 sm:pb-28 overflow-hidden border-b border-slate-800">
        {/* Glowing Ambient Highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#FF6B00]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Coming Soon / Roadmap Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest mx-auto">
            <Rocket className="w-4 h-4" />
            <span>Future Vision &amp; Upcoming Roadmap — Coming Soon</span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            The Future of RentAwas: <br />
            <span className="text-[#FF6B00]">End-to-End Property Management.</span>
          </h1>

          {/* Subtitle explicitly clarifying future vision */}
          <p className="text-slate-300 font-medium text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            As of now, we are actively engineering this vision for the future. Once your building or property is constructed, bought, or ready — whether it’s an Apartment, Villa, PG, Hostel, Hotel, Commercial Building, or Multi-Unit Real Estate — RentAwas will handle 100% of operations end-to-end.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEarlyAccessOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-orange-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Join Future Roadmap Waitlist →</span>
            </button>

            <Link
              href="/#platform"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-extrabold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Current Platform Tech</span>
            </Link>
          </div>

          {/* Vision Goals Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-[#FF6B00]">100%</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Future End-to-End Handover</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">Zero</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Target Owner Effort</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">24/7</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Planned Expert Support</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">All Buildings</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Full Operations &amp; Staffing</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE CORE VISION CONCEPT (CURRENT TRADITIONAL vs FUTURE RENTAWAS) */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              Where RentAwas Is Heading
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Our Vision: Solving Property Management Stress
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Currently, property owners face endless operational headaches. Here is how our upcoming roadmap will eliminate them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Current Pain Points */}
            <div className="bg-slate-950 border border-red-500/20 rounded-3xl p-8 space-y-6 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase">
                <span>Traditional Property Management (Today's Problems)</span>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Constant stress with tenant sourcing &amp; unverified applicants.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Chasing monthly rent dues and manually sending payment reminders.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Hiring expensive third-party local technicians for every small pipe leak.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>PG &amp; Hostel owners struggle with daily cooks, househelp &amp; security staffing.</span>
                </li>
              </ul>
            </div>

            {/* The Future RentAwas Vision */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-xl shadow-emerald-500/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Our Upcoming Vision (Future Phase)</span>
              </div>

              <ul className="space-y-4 text-sm text-slate-200 font-medium">
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Aadhaar Police-verified tenants will be sourced &amp; onboarded automatically.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automated digital rent collection with direct owner bank payouts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>RentAwas Experts will handle 24/7 AC, plumbing, electrical &amp; carpentry upkeep.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Complete PG &amp; Hostel management — househelp, cooks, security &amp; wardens.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: END-TO-END LIFECYCLE SPECTRUM */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              Upcoming Operational Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Our Planned 4-Step Management Process
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              How RentAwas will take your property from key handover to a fully automated income generator in the future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifecycleSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-orange-500/40 transition-all group backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center font-bold">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-[#FF6B00] transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white group-hover:text-[#FF6B00] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4: PROPERTY TYPES SPECIFIC SOLUTIONS */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              Future Asset Class Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Vision. Every Property Category.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Explore our planned operational models for Hostels, PGs, Apartments &amp; Commercial Units.
            </p>
          </div>

          {/* Interactive Selector Pills */}
          <div className="flex items-center justify-center flex-wrap gap-3 max-w-3xl mx-auto">
            {propertyTypes.map((pt) => {
              const IconComp = pt.icon;
              const isActive = activePropertyType === pt.id;

              return (
                <button
                  key={pt.id}
                  onClick={() => setActivePropertyType(pt.id)}
                  className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-2.5 ${
                    isActive
                      ? "bg-[#FF6B00] text-[#FFFFFF] border-[#FF6B00] shadow-lg shadow-orange-500/25 scale-[1.03]"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{pt.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Stage */}
          <div className="max-w-4xl mx-auto">
            {(() => {
              const pt = propertyTypes.find((p) => p.id === activePropertyType) || propertyTypes[0];
              const IconComponent = pt.icon;

              return (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pt.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center font-bold">
                          <IconComponent className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white">{pt.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">{pt.desc}</p>
                        </div>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-wider shrink-0">
                        {pt.badge}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                        Planned End-to-End Operations:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                        {pt.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/90 text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              );
            })()}
          </div>

        </div>
      </section>

      {/* SECTION 5: REGISTER INTEREST FOR FUTURE ONBOARDING */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 p-10 sm:p-14 rounded-3xl shadow-2xl">
          
          <div className="w-16 h-16 rounded-3xl bg-orange-500/20 border border-orange-500/40 text-[#FF6B00] flex items-center justify-center font-bold mx-auto shadow-lg">
            <Rocket className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Want To Be First In Line When Full Management Launches?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              Register your interest today to get early access to RentAwas End-to-End Property &amp; Hostel Management.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEarlyAccessOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-orange-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Register Interest For Future Onboarding →</span>
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Early Access Lead Capture Modal */}
      <EarlyAccessModal
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
      />
    </main>
  );
}
