"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";
import LottiePlayer from "@/components/ui/LottiePlayer";
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
  Rocket,
  Search,
  CreditCard,
  Image as ImageIcon,
  Compass,
  Footprints
} from "lucide-react";

export default function VisionPage() {
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [activePropertyType, setActivePropertyType] = useState("pg-hostel");

  const roadmapSectionRef = useRef<HTMLDivElement>(null);
  const thread1Ref = useRef<SVGPathElement>(null);
  const thread2Ref = useRef<SVGPathElement>(null);

  const timelineSectionRef = useRef<HTMLDivElement>(null);
  const block1Ref = useRef<HTMLDivElement>(null);
  const block2Ref = useRef<HTMLDivElement>(null);
  const block3Ref = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  // SVG Threads GSAP ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const path1 = thread1Ref.current;
    const path2 = thread2Ref.current;
    const section = roadmapSectionRef.current;

    if (!path1 || !path2 || !section) return;

    const length1 = path1.getTotalLength();
    const length2 = path2.getTotalLength();

    path1.style.strokeDasharray = `${length1}`;
    path1.style.strokeDashoffset = `${length1}`;
    path2.style.strokeDasharray = `${length2}`;
    path2.style.strokeDashoffset = `${length2}`;

    const ctx = gsap.context(() => {
      gsap.to(path1, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          end: "85% 75%",
          scrub: 0.8,
        },
      });

      gsap.to(path2, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          end: "85% 75%",
          scrub: 0.8,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Section 3 One Stop Solution GSAP Timeline ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const b1 = block1Ref.current;
    const b2 = block2Ref.current;
    const b3 = block3Ref.current;
    const playhead = playheadRef.current;
    const section = timelineSectionRef.current;

    if (!b1 || !b2 || !b3 || !playhead || !section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "bottom 55%",
          scrub: 0.8,
        },
      });

      tl.to(b1, { opacity: 1, x: 0, ease: "power2.out" }, 0.0)
        .to(b2, { opacity: 1, x: 0, ease: "power2.out" }, 0.25)
        .to(b3, { opacity: 1, x: 0, ease: "power2.out" }, 0.5)
        .to(playhead, { left: "100%", ease: "none" }, 0.0);
    }, section);

    return () => ctx.revert();
  }, []);

  const roadmapContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: roadmapContainerRef,
    offset: ["start 75%", "end 80%"]
  });

  const pathHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  const roadmapSteps = [
    {
      stepNum: "01",
      badge: "STEP 1 — DISCOVERY & LISTINGS",
      title: "RentAwas Listing & Search Feature",
      desc: "Explore or list any type of real estate asset — Residential Flats, PGs, Student Hostels, Boutique Hotels, Commercial Buildings, or Multi-Unit Complexes.",
      points: [
        "Search & filter by city locality, price range, and building category (Hotels, Hostels, Apartments).",
        "Direct-owner listings with zero broker fees or middleman charges.",
        "High-definition photo galleries, detailed amenities & instant owner inquiry connect."
      ],
      imagePos: "left",
      icon: Search,
      color: "from-orange-500 to-amber-500",
      imagePlaceholderText: "Image Placeholder: RentAwas Listing & Search UI",
      lottieUrl: "https://lottie.host/85570ba1-a1bb-4fc8-8ee7-5a69abc867c9/6m0NyxJ1an.json",
      recolorLottie: false
    },
    {
      stepNum: "02",
      badge: "STEP 2 — PROPERTY MANAGEMENT SUITE",
      title: "Smart Property Management Tool",
      desc: "A powerful unified dashboard for property owners, landlords, and building operators to manage units, automate rent billing, and track occupancy.",
      points: [
        "Multi-unit & multi-building portfolio management with real-time occupancy tracking.",
        "Automated rent invoicing, payment reminders, UPI/gateway collection & direct bank payouts.",
        "Instant AI legal rental agreement generator with electronic signatures & cloud logs."
      ],
      imagePos: "right",
      icon: Building2,
      color: "from-amber-500 to-emerald-500",
      imagePlaceholderText: "Image Placeholder: Owner Management Dashboard UI",
      lottieUrl: "https://lottie.host/8213e2bc-d3af-456e-b628-092ef4659c12/c0MgkCb2Si.json",
      recolorLottie: true
    },
    {
      stepNum: "03",
      badge: "STEP 3 — TENANT & RESIDENT PORTAL",
      title: "Tenant Portal & Experience Hub",
      desc: "An intuitive self-service portal for tenants and renters to pay monthly rent, track maintenance requests, and store digital lease documents.",
      points: [
        "1-Click digital rent payment via Credit Cards, UPI, NetBanking, or automated auto-debit.",
        "Digital maintenance ticketing system — upload photos of issues & track live technician progress.",
        "Instant access to digital rental agreements, payment receipts, and property notices."
      ],
      imagePos: "left",
      icon: Users,
      color: "from-emerald-500 to-cyan-500",
      imagePlaceholderText: "Image Placeholder: Tenant Portal & Payments App UI",
      lottieUrl: "https://lottie.host/43872128-21e4-4524-83f4-175dfd18d725/PqQNbcBfMc.json",
      recolorLottie: false
    },
    {
      stepNum: "04",
      badge: "STEP 4 — EXPERT HOME SERVICES",
      title: "RentAwas Doorstep Experts",
      desc: "On-demand dispatch of background-checked local technicians to fix plumbing, AC, electrical, and carpentry issues with guaranteed service satisfaction.",
      points: [
        "Rapid technician dispatch for AC jet servicing, pipe leaks, wiring repairs & carpentry work.",
        "Aadhaar-verified, background-checked independent technicians & home maintenance staff.",
        "Direct doorstep booking for AC servicing, plumbing, carpentry, electrical & domestic househelp."
      ],
      imagePos: "right",
      icon: Wrench,
      color: "from-cyan-500 to-purple-500",
      imagePlaceholderText: "Image Placeholder: RentAwas Doorstep Experts Service UI",
      lottieUrl: "https://lottie.host/29abc956-ef79-4952-976d-ba7a2701e340/lBw6aIM745.json",
      recolorLottie: false
    },
    {
      stepNum: "05",
      badge: "STEP 5 — FULL END TO END HANDOVER",
      title: "Complete Key Handover & Full Facility Operations",
      desc: "Simply buy the property or construct the building and hand over the keys to RentAwas. RentAwas manages 100% of operations — from daily food & dining, resident staff, housekeeping, and maintenance to total facility management.",
      points: [
        "100% hands-off property ownership — buy or construct your real estate asset and hand over the keys to RentAwas.",
        "End to end facility operations: daily resident meals & catering, housekeeping, security wardens, and 24/7 maintenance staff.",
        "Automated monthly rent collection and direct owner bank payouts with real-time portfolio analytics."
      ],
      isFullWidth: true,
      icon: Key,
      color: "from-purple-500 to-orange-500"
    }
  ];

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
            The Future of RentAwas <br />
            <span className="text-[#FF6B00]">End to End Property Management.</span>
          </h1>

          {/* Subtitle explicitly clarifying future vision */}
          <p className="text-slate-300 font-medium text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            As of now, we are actively engineering this vision for the future. Once your building or property is constructed, bought, or ready — whether it’s an Apartment, Villa, PG, Hostel, Hotel, Commercial Building, or Multi-Unit Real Estate — RentAwas will handle 100% of operations end to end.
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
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-[#FF6B00]">100%</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Future End-to-End Handover</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">Zero</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Target Owner Effort</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">24/7</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Planned Expert Support</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">All Buildings</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Full Operations &amp; Staffing</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR ROADMAP (INTERACTIVE ANIMATED ZIG-ZAG PATH - CLEAN WHITE THEME) */}
      <section ref={roadmapSectionRef} className="py-32 md:py-40 bg-white relative overflow-hidden border-y border-slate-200">

        {/* GSAP SVG Dual Draw Threads (Thread 1 from "O", Thread 2 from "p") */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 2700"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="thread1-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="thread2-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow-thread" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Thread 1 (Left Margin -> Curves inward to meet behind Step 5 center) */}
            <path
              ref={thread1Ref}
              d="M 100,0 C 40,120 160,240 100,360 C 40,480 160,600 100,720 C 40,840 160,960 100,1080 C 40,1200 160,1320 100,1440 C 40,1560 160,1680 100,1800 C 40,1920 160,2040 100,2160 C 50,2240 280,2300 500,2300"
              stroke="#FF6B00"
              strokeWidth="2.5"
              strokeOpacity="0.9"
              strokeLinecap="round"
              filter="url(#glow-thread)"
            />

            {/* Thread 2 (Right Margin -> Curves inward to meet behind Step 5 center) */}
            <path
              ref={thread2Ref}
              d="M 900,0 C 960,120 840,240 900,360 C 960,480 840,600 900,720 C 960,840 840,960 900,1080 C 960,1200 840,1320 900,1440 C 960,1560 840,1680 900,1800 C 960,1920 840,2040 900,2160 C 950,2240 720,2300 500,2300"
              stroke="#FF6B00"
              strokeWidth="2.5"
              strokeOpacity="0.9"
              strokeLinecap="round"
              filter="url(#glow-thread)"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-black uppercase tracking-widest mx-auto">
              <Compass className="w-4 h-4" />
              <span>Ecosystem Journey</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-[#0B132B] tracking-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Our <span className="text-[#FF6B00]">Roadmap</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              An interactive step-by-step path of how RentAwas connects discovery, smart management, resident portals, and doorstep expert services into one seamless platform.
            </p>
          </div>

          {/* Vertical Road Line & Milestone Nodes Container */}
          <div ref={roadmapContainerRef} className="relative">

            {/* Steps 1 to 4 Alternating Grid with Central Footstep Trail */}
            <div className="relative space-y-36 md:space-y-56">

              {/* Central Animated Footstep Trail (Desktop Center - Extends till bottom of Step 4 green area) */}
              <div className="hidden md:flex flex-col items-center justify-between absolute left-1/2 -translate-x-1/2 top-10 -bottom-16 z-10 pointer-events-none">
                {Array.from({ length: 28 }).map((_, fIdx) => (
                  <motion.div
                    key={fIdx}
                    initial={{ opacity: 0.2, color: "#CBD5E1", scale: 0.85 }}
                    whileInView={{ opacity: 1, color: "#FF6B00", scale: 1.25 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`transition-all duration-300 ${fIdx % 2 === 0
                      ? "-translate-x-5 -scale-x-100 rotate-[155deg]"
                      : "translate-x-5 scale-x-100 rotate-[155deg]"
                      }`}
                  >
                    <Footprints className="w-6 h-6 drop-shadow-md" />
                  </motion.div>
                ))}
              </div>

              {roadmapSteps.filter((s) => !s.isFullWidth).map((step, idx) => {
                const StepIcon = step.icon;
                const isLeftImage = step.imagePos === "left";

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 45, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-90px" }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className="relative grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-28 lg:gap-40 items-center"
                  >

                    {/* Left Column */}
                    <div className={`${isLeftImage ? "order-1" : "order-2 md:order-1"} md:pr-6 lg:pr-10`}>
                      {isLeftImage ? (
                        step.lottieUrl ? (
                          <div className="w-full min-h-[300px] flex items-center justify-center">
                            <div className="w-full h-[280px] sm:h-[360px] flex items-center justify-center">
                              <LottiePlayer src={step.lottieUrl} recolorToBrandOrange={step.recolorLottie || false} className="w-full h-full object-contain" />
                            </div>
                          </div>
                        ) : (
                          /* Image Placeholder Card (Left) */
                          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4 hover:border-orange-500/50 transition-all group min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                            <div className="w-16 h-16 rounded-2xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Image Placeholder</span>
                              <h4 className="text-sm font-extrabold text-slate-800">{step.imagePlaceholderText}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 max-w-xs font-medium">
                              Image asset will be uploaded here to display the interactive UI mockup.
                            </p>
                          </div>
                        )
                      ) : (
                        /* Content Card (Left) */
                        <div className="bg-slate-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs text-left">
                          <div className="flex items-center justify-between">
                            <span className="px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
                              {step.badge}
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold">
                              <StepIcon className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                              {step.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                              {step.desc}
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-slate-200">
                            {step.points.map((pt, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className={`${isLeftImage ? "order-2" : "order-1 md:order-2"} md:pl-6 lg:pl-10`}>
                      {!isLeftImage ? (
                        step.lottieUrl ? (
                          <div className="w-full min-h-[300px] flex items-center justify-center">
                            <div className="w-full h-[280px] sm:h-[360px] flex items-center justify-center">
                              <LottiePlayer src={step.lottieUrl} recolorToBrandOrange={step.recolorLottie || false} className="w-full h-full object-contain" />
                            </div>
                          </div>
                        ) : (
                          /* Image Placeholder Card (Right) */
                          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4 hover:border-orange-500/50 transition-all group min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                            <div className="w-16 h-16 rounded-2xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Image Placeholder</span>
                              <h4 className="text-sm font-extrabold text-slate-800">{step.imagePlaceholderText}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 max-w-xs font-medium">
                              Image asset will be uploaded here to display the interactive UI mockup.
                            </p>
                          </div>
                        )
                      ) : (
                        /* Content Card (Right) */
                        <div className="bg-slate-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs text-left">
                          <div className="flex items-center justify-between">
                            <span className="px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
                              {step.badge}
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold">
                              <StepIcon className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                              {step.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                              {step.desc}
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-slate-200">
                            {step.points.map((pt, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* Step 5 (Full Width Grand Finale Card - Clean Hero State) */}
            <div className="mt-36 md:mt-56 w-full relative z-10">
              {roadmapSteps.filter((s) => s.isFullWidth).map((step, idx) => {
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.86, y: 60 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative w-full max-w-7xl mx-auto"
                  >
                    {/* Glowing pulse energy aura behind card when revealed */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 rounded-[40px] blur-2xl opacity-75 animate-pulse pointer-events-none" />

                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-orange-500/40 rounded-3xl p-10 sm:p-14 lg:p-16 space-y-10 shadow-2xl text-left text-white relative overflow-hidden group">
                      {/* Glowing orange accent background */}
                      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF6B00]/25 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/40 text-[#FF6B00] text-xs sm:text-sm font-black uppercase tracking-widest">
                          {step.badge}
                        </span>

                        {/* Revolving Outline "Future Planned" Badge */}
                        <div className="relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden shadow-xl shrink-0">
                          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FF6B00_0%,#FFB800_35%,transparent_65%,#FF6B00_100%)] opacity-100" />
                          <div className="relative inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-950 text-[#FF6B00] text-xs sm:text-sm font-black uppercase tracking-widest backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-[#FF6B00] animate-pulse" />
                            <span>Future Planned</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3
                          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight"
                          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                        >
                          {step.title}
                        </h3>
                        <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-medium leading-relaxed max-w-5xl">
                          {step.desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
                        {step.points.map((pt, pIdx) => (
                          <div key={pIdx} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-3 flex items-start gap-4 hover:border-orange-500/40 transition-all">
                            <CheckCircle2 className="w-6 h-6 text-[#FF6B00] shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-slate-200 font-bold leading-relaxed">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: PROPERTY TYPES SPECIFIC SOLUTIONS */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* GSAP Timeline Visual Cascade Header (Bigger & Grand Scale) */}
          <div ref={timelineSectionRef} className="max-w-6xl mx-auto py-8 px-4 relative">

            {/* Cascading Large GSAP Timeline Blocks */}
            <div className="flex flex-col space-y-6 sm:space-y-8 relative z-10 max-w-4xl mx-auto">

              {/* Block 1: One */}
              <div
                ref={block1Ref}
                className="self-start ml-[2%] sm:ml-[8%] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black text-3xl sm:text-5xl lg:text-6xl px-8 sm:px-14 py-4 sm:py-6 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-emerald-300/50 transform -translate-x-20 opacity-0"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-slate-950/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-slate-950" />
                </div>
                <span>One</span>
              </div>

              {/* Block 2: Stop */}
              <div
                ref={block2Ref}
                className="self-center bg-gradient-to-r from-[#FF6B00] via-orange-500 to-amber-500 text-slate-950 font-black text-3xl sm:text-5xl lg:text-6xl px-8 sm:px-14 py-4 sm:py-6 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-orange-300/50 transform -translate-x-20 opacity-0"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-slate-950/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 sm:w-7 sm:h-7 text-slate-950" />
                </div>
                <span>Stop</span>
              </div>

              {/* Block 3: Solution */}
              <div
                ref={block3Ref}
                className="self-end mr-[2%] sm:mr-[8%] bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-3xl sm:text-5xl lg:text-6xl px-8 sm:px-14 py-4 sm:py-6 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-cyan-300/50 transform -translate-x-20 opacity-0"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-slate-950/20 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-slate-950" />
                </div>
                <span>Solution</span>
              </div>

              {/* Timeline Ruler & Playhead Track */}
              <div className="w-full pt-12 relative">
                <div className="w-full flex items-center justify-between text-slate-600 px-2 text-xs font-mono select-none">
                  {Array.from({ length: 28 }).map((_, rIdx) => (
                    <span key={rIdx} className="h-4 w-1 bg-slate-700/80 rounded-full" />
                  ))}
                </div>

                {/* Scrub Playhead Line */}
                <div
                  ref={playheadRef}
                  className="absolute top-6 left-0 bottom-0 w-1 bg-[#FF6B00] shadow-[0_0_16px_#FF6B00] pointer-events-none z-20"
                >
                  <div className="w-5 h-7 bg-[#FF6B00] -translate-x-2 -top-4 rounded-b-lg shadow-lg flex items-center justify-center">
                    <div className="w-1.5 h-3 bg-slate-950 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: REGISTER INTEREST FOR FUTURE ONBOARDING */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 p-10 sm:p-14 rounded-3xl shadow-2xl">

          <div className="w-16 h-16 rounded-3xl bg-orange-500/20 border border-orange-500/40 text-[#FF6B00] flex items-center justify-center font-bold mx-auto shadow-lg">
            <Rocket className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Join Our Long-Term Vision for Full Property Operations
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
              Full end to end property &amp; hostel management is our ambitious long-term roadmap. Register your interest today to stay updated as our future vision unfolds step-by-step over time.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEarlyAccessOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-orange-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Register Interest For Future Roadmap Updates →</span>
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
