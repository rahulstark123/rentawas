"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentAwasExpertsSection from "@/components/landing/RentAwasExpertsSection";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import {
  Wrench,
  Zap,
  Hammer,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  UserCheck,
  Bell,
  Send,
  X,
  ChevronRight,
  BadgeCheck,
  SlidersHorizontal,
  ThumbsUp,
  Smartphone,
  Heart
} from "lucide-react";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Home Service Booking Coming Soon!");
  const [activeDomainId, setActiveDomainId] = useState("ac");

  const domainHubs = [
    {
      id: "ac",
      title: "AC & Climate Servicing",
      badge: "Fast 15-30 Min Arrival",
      icon: Wrench,
      accentColor: "from-[#FF6B00] to-amber-500",
      accentText: "text-[#FF6B00]",
      bgGlow: "bg-orange-500/10 border-orange-500/30",
      desc: "Full jet wash cleaning, refrigerant gas charging, filter sanitization & cooling efficiency diagnostics by verified HVAC engineers.",
      stats: [
        { label: "Eta Arrival", val: "15-30 Mins" },
        { label: "Warranty", val: "30-Day Free Cover" },
        { label: "Fix Rate", val: "100% Transparent" },
      ],
      highlights: ["High-Pressure Jet Wash", "R32 / R410a Gas Top-up", "Copper Pipe Leakage Seal", "Compressor Health Audit"],
    },
    {
      id: "plumbing",
      title: "Plumbing & Water Systems",
      badge: "Zero Damage Guarantee",
      icon: Wrench,
      accentColor: "from-cyan-500 to-blue-500",
      accentText: "text-cyan-400",
      bgGlow: "bg-cyan-500/10 border-cyan-500/30",
      desc: "Instant tap leak sealing, pipe fitting, water heater geyser installation, overhead tank cleaning & sanitaryware repair.",
      stats: [
        { label: "Response", val: "Under 20 Mins" },
        { label: "Specialists", val: "Certified Plumbers" },
        { label: "Equipment", val: "Professional Tooling" },
      ],
      highlights: ["Tap & Flush Tank Sealing", "Overhead Water Tank Wash", "Geyser Element Fitting", "Drain Blockage Removal"],
    },
    {
      id: "carpentry",
      title: "Carpentry & Custom Furniture",
      badge: "Precision Wood Tools",
      icon: Hammer,
      accentColor: "from-amber-500 to-orange-500",
      accentText: "text-amber-400",
      bgGlow: "bg-amber-500/10 border-amber-500/30",
      desc: "High-security lock fitting, modular kitchen drawer repair, bed/table fixing & custom wooden furniture adjustments.",
      stats: [
        { label: "Hardware", val: "Genuine Spares" },
        { label: "Placement", val: "Master Artisans" },
        { label: "Mess", val: "Zero Cleanup Left" },
      ],
      highlights: ["Digital Keypad Lock Setup", "Modular Kitchen Hinges", "Door Alignment & Latches", "Bed & Sofa Frame Fix"],
    },
    {
      id: "househelp",
      title: "Domestic Househelp & Staff",
      badge: "Police Verified Background",
      icon: UserCheck,
      accentColor: "from-purple-500 to-indigo-500",
      accentText: "text-purple-400",
      bgGlow: "bg-purple-500/10 border-purple-500/30",
      desc: "Full-time & daily Aadhaar-verified maids, home cooks, laundry staff, infant nannies & elderly care companions.",
      stats: [
        { label: "Verification", val: "100% Aadhaar Checked" },
        { label: "Replacement", val: "Free Guarantee" },
        { label: "Match Time", val: "Same Day Pairing" },
      ],
      highlights: ["Daily Utensil & Floor Clean", "Home Cooked Meals", "Newborn Infant Care", "Trial Period Available"],
    },
    {
      id: "electrical",
      title: "Electrical & Smart Wiring",
      badge: "Safety Certified Work",
      icon: Zap,
      accentColor: "from-emerald-500 to-teal-500",
      accentText: "text-emerald-400",
      bgGlow: "bg-emerald-500/10 border-emerald-500/30",
      desc: "Short circuit troubleshooting, MCB box upgrades, ceiling fan / chandelier installations & smart home CCTV security.",
      stats: [
        { label: "Safety", val: "IS Code Compliant" },
        { label: "Parts", val: "Heavy Duty Wires" },
        { label: "Emergency", val: "24/7 Availability" },
      ],
      highlights: ["MCB Tripping Diagnosis", "Ceiling Fan / Light Setup", "Smart CCTV Camera Wire", "Inverter Battery Connect"],
    },
    {
      id: "cleaning",
      title: "Deep Cleaning & Pest Control",
      badge: "Eco-Friendly Odourless",
      icon: ShieldCheck,
      accentColor: "from-pink-500 to-rose-500",
      accentText: "text-pink-400",
      bgGlow: "bg-pink-500/10 border-pink-500/30",
      desc: "Full house deep sanitization, odourless anti-cockroach gel, termite treatment, bed bug eradication & sofa shampooing.",
      stats: [
        { label: "Chemicals", val: "Child & Pet Safe" },
        { label: "Protection", val: "6-Month Warranty" },
        { label: "Shampooing", val: "High Extraction" },
      ],
      highlights: ["Cockroach Herbal Gel", "Anti-Termite Soil Spray", "Sofa & Mattress Wash", "Kitchen Degreasing"],
    },
  ];

  const cities = [
    "Bengaluru",
    "Delhi NCR",
    "Noida",
    "Gurgaon",
  ];

  const marqueeRow1 = [
    { label: "🚰 Plumbing & Pipe Leak Fix", icon: Wrench },
    { label: "⚡ Electrical & Wiring Work", icon: Zap },
    { label: "🔨 Carpentry & Woodwork", icon: Hammer },
    { label: "🧹 Househelp & Maid Staff", icon: UserCheck },
    { label: "❄️ AC Deep Servicing & Gas Topup", icon: Wrench },
    { label: "🔑 Emergency Locksmith & Keys", icon: ShieldCheck },
  ];

  const marqueeRow2 = [
    { label: "🐜 Pest Control & Cockroach Spray", icon: ShieldCheck },
    { label: "📦 Packers & Movers House Shifting", icon: Clock },
    { label: "🧺 Doorstep Laundry & Steam Press", icon: Sparkles },
    { label: "🚿 Water Heater & Geyser Repair", icon: Wrench },
    { label: "🪑 Sofa & Carpet Deep Washing", icon: Sparkles },
    { label: "👶 Verified Nanny & Childcare Help", icon: UserCheck },
  ];

  const marqueeRow3 = [
    { label: "🍳 Modular Kitchen Repair & Hinge Fix", icon: Hammer },
    { label: "🎨 Home Painting & Wall Waterproofing", icon: Sparkles },
    { label: "🌪️ Kitchen Chimney & Hob Servicing", icon: Wrench },
    { label: "📹 CCTV Camera & Smart Lock Setup", icon: ShieldCheck },
    { label: "☀️ Solar Panel Installation & Repair", icon: Zap },
    { label: "💧 RO Water Purifier Servicing", icon: Wrench },
  ];

  const marqueeRow4 = [
    { label: "✨ Full House Deep Cleaning", icon: Sparkles },
    { label: "🪟 Window Glass & Balcony Washing", icon: Sparkles },
    { label: "🛢️ Overhead Water Tank Sanitization", icon: Wrench },
    { label: "🪴 Garden & Lawn Trimming", icon: Sparkles },
    { label: "🧱 Masonry & Floor Tile Repair", icon: Hammer },
    { label: "🚘 Doorstep Car Wash & Interior Cleaning", icon: Sparkles },
  ];

  const serviceList = [
    {
      id: "ac-repair",
      category: "ac",
      title: "AC Deep Servicing & Gas Charging",
      desc: "Full jet wash cleaning, gas top-up, filter wash & cooling inspection by verified technicians.",
      image: "/rentawas experts/ac.jpg",
      startingPrice: "₹499",
      eta: "15-30 Mins",
      rating: "4.9",
      reviews: "3,820",
      features: ["Jet Pump Wash", "Gas Checkup Included", "30-Day Guarantee"],
    },
    {
      id: "plumber-pipe",
      category: "plumbing",
      title: "Plumbing Leakage & Sanitary Fitting",
      desc: "Instant tap repair, pipe leak sealing, bathroom fitting, flush tank repair & water heater setup.",
      image: "/rentawas experts/plumber.jpg",
      startingPrice: "₹199",
      eta: "20-30 Mins",
      rating: "4.8",
      reviews: "5,140",
      features: ["Certified Plumbers", "No Cleanup Hassle", "Fixed Pricing"],
    },
    {
      id: "carpenter-furniture",
      category: "carpentry",
      title: "Carpentry & Custom Furniture Repair",
      desc: "Door lock installation, modular kitchen drawer fix, bed repair & custom woodwork adjustments.",
      image: "/rentawas experts/Carpentar.jpg",
      startingPrice: "₹249",
      eta: "30-45 Mins",
      rating: "4.9",
      reviews: "2,980",
      features: ["Precision Wood Tooling", "Locks & Hinges", "Spare Parts Help"],
    },
    {
      id: "househelp-daily",
      category: "househelp",
      title: "Full-Time & Daily Househelp / Maid",
      desc: "Background verified domestic staff for utensil washing, floor mopping, dusting & meal cooking.",
      image: "/rentawas experts/Househelp.jpg",
      startingPrice: "₹2,499 / mo",
      eta: "Same Day Placement",
      rating: "4.9",
      reviews: "8,450",
      features: ["Aadhaar Verified Staff", "Replacement Guarantee", "Trial Available"],
    },
    {
      id: "pest-control-home",
      category: "pest",
      title: "Complete Home Pest Control & Spray",
      desc: "Odourless anti-cockroach gel, termite eradication, bed bug treatment & mosquito sanitization.",
      image: "/rentawas experts/pest control.jpg",
      startingPrice: "₹799",
      eta: "60 Mins",
      rating: "4.8",
      reviews: "1,920",
      features: ["Child & Pet Safe Chemicals", "Government Approved", "6-Month Warranty"],
    },
    {
      id: "packers-movers-shift",
      category: "relocation",
      title: "Home Shifting & Packers & Movers",
      desc: "Stress-free local house shifting, bubble wrapping, furniture dismantling, loading & transport.",
      image: "/rentawas experts/packers movers.jpg",
      tag: "Popular Shifting",
      startingPrice: "₹3,999",
      eta: "Scheduled Booking",
      rating: "4.9",
      reviews: "4,110",
      features: ["Transit Insurance Covered", "Dedicated Truck", "Unpacking Support"],
    },
    {
      id: "laundry-dryclean",
      category: "laundry",
      title: "Laundry, Steam Pressing & Dry Cleaning",
      desc: "Doorstep laundry pickup, hygienic detergent wash, steam press & 24-hour return delivery.",
      image: "/rentawas experts/laundry.jpg",
      startingPrice: "₹69 / kg",
      eta: "24-Hour Return",
      rating: "4.7",
      reviews: "2,350",
      features: ["Doorstep Pickup & Drop", "Antibacterial Wash", "Stain Removal"],
    },
    {
      id: "childcare-nanny",
      category: "househelp",
      title: "Verified Childcare & Babysitter Help",
      desc: "Trained infant nannies, after-school babysitting & elderly care companions in your locality.",
      image: "/rentawas experts/child care.jpg",
      startingPrice: "₹3,500 / mo",
      eta: "Same Day Matching",
      rating: "4.9",
      reviews: "1,420",
      features: ["Police Verified Background", "CPR Trained", "Flexible Hours"],
    },
    {
      id: "locksmith-emergency",
      category: "locksmith",
      title: "Emergency Locksmith & Key Duplicate",
      desc: "24/7 emergency door unlock, key cutting, digital keypad lock installation & safe opening.",
      image: "/rentawas experts/locksmith.jpg",
      startingPrice: "₹349",
      eta: "15 Mins Emergency",
      rating: "4.9",
      reviews: "980",
      features: ["24/7 Availability", "Zero Damage Lock Pick", "Digital Lock Setup"],
    },
  ];

  const filteredServices = serviceList.filter((s) => {
    const matchesCat = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifySuccess(true);
    setTimeout(() => {
      setNotifySuccess(false);
      setIsNotifyModalOpen(false);
      setNotifyEmail("");
    }, 2500);
  };

  const triggerComingSoon = (serviceTitle: string) => {
    setModalTitle(`${serviceTitle} — Coming Soon!`);
    setIsComingSoonModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar variant="dark" />

      {/* SECTION 1: HERO SECTION (FULL SCREEN VIEWPORT) */}
      <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-24 bg-slate-950 text-white overflow-hidden border-b border-slate-800 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        {/* Glow Ambient Highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Headline, Proof, Badges & City Pills */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Main Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Connect with House Help &amp;{" "}
                <span className="text-[#FF6B00]">Verified Local Experts</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 font-medium text-base sm:text-lg max-w-2xl leading-relaxed">
                Connect directly with certified local specialists for all your home needs — from AC servicing and plumbing fixes to carpentry, househelp, electrical work, and complete property maintenance.
              </p>

              {/* Status & App Badges */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Pre-Launch Status */}
                  <div className="px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Coming Soon</span>
                  </div>
                </div>

              </div>

              {/* Live in Cities Pills */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Launching Soon In:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {cities.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCity(c)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${selectedCity === c
                          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Hero Graphic Banner Image */}
            <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center">
              <div className="relative w-full max-w-3xl lg:translate-x-20 lg:-mr-10">
                <Image
                  src="/rentawas experts/experts.png"
                  alt="RentAwas Verified Home Experts & Technicians"
                  width={1000}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: 2-ROW SAME-DIRECTION SMOOTH SLOW-MOTION MARQUEE WALL */}
      <section className="py-6 sm:py-8 bg-slate-950 border-y border-slate-800/90 font-sans overflow-hidden">
        <div className="relative w-full overflow-hidden space-y-3">
          {/* Side Fade Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none" />

          {/* Row 1: Leftward Smooth Glide */}
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
          >
            {[...marqueeRow1, ...marqueeRow3, ...marqueeRow1, ...marqueeRow3].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={`r1-${idx}`}
                  className="px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap border flex items-center gap-2.5 bg-slate-900/90 text-slate-200 border-slate-800 shadow-md backdrop-blur-md"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF6B00] shrink-0">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* Row 2: Leftward Smooth Glide (Same Direction) */}
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
          >
            {[...marqueeRow2, ...marqueeRow4, ...marqueeRow2, ...marqueeRow4].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={`r2-${idx}`}
                  className="px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap border flex items-center gap-2.5 bg-slate-900/90 text-slate-200 border-slate-800 shadow-md backdrop-blur-md"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: 3 ROWS OF ALL HOME SERVICES CARDS */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Available Home Services in {selectedCity}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Book verified local independent technicians &amp; home experts.
              </p>
            </div>

            <span className="text-xs font-black bg-orange-100 text-[#FF6B00] px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {serviceList.length} Services Listed
            </span>
          </div>

          {/* Cards Grid — 3 Columns x 3 Rows = 9 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceList.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Top Image */}
                <div className="h-72 sm:h-80 relative overflow-hidden bg-slate-900">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Rating */}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-[11px] font-extrabold text-amber-400 flex items-center gap-1">
                    ★ {service.rating} <span className="text-slate-300 text-[10px]">({service.reviews})</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {service.desc}
                    </p>

                    {/* Features list */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {service.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-700 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Coming Soon Booking Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => triggerComingSoon(service.title)}
                      className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Book Service — Coming Soon</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: BOOK OUR EXPERTS IN ONE CLICK & MOBILE APP SHOWCASE */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-b border-slate-800 font-sans">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-10 w-[550px] h-[550px] bg-[#FF6B00]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Headline, Features, App Badges */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
                  <Smartphone className="w-4 h-4" />
                  <span>RentAwas Mobile App</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                  Book Our Experts In <span className="text-[#FF6B00]">One Click</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                  Get verified technicians, plumbers, electricians &amp; househelp delivered to your home in minutes right from your phone. Zero hassle, fixed pricing, and real-time live tracking.
                </p>
              </div>

              {/* Value Proposition Card */}
              <div className="space-y-3.5">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-start gap-4 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">1-Tap Instant Service Dispatch</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Select your home issue, confirm your address, and dispatch an expert with a single tap.</p>
                  </div>
                </div>
              </div>

              {/* App Store & Play Store Download Badges */}
              <div className="pt-2 space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                  Coming Soon To iOS &amp; Android:
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => triggerComingSoon("RentAwas iOS App")}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group"
                  >
                    <div className="w-7 h-7 flex items-center justify-center text-white">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.64-.78 1.08-1.85.96-2.92-.93.04-2.06.62-2.73 1.4-.6.69-1.12 1.79-.98 2.84 1.04.08 2.11-.53 2.75-1.32z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold leading-none">Download on the</span>
                      <span className="text-sm font-extrabold text-white leading-tight block">App Store</span>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerComingSoon("RentAwas Android App")}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group"
                  >
                    <div className="w-7 h-7 flex items-center justify-center text-emerald-400">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186c-.187.186-.39.294-.61.324V1.49c.22.03.423.138.61.324zM15.207 13.414l2.67-2.67c.39-.39.39-1.02 0-1.414l-2.67-2.67-2.83 2.83 2.83 2.924zm-2.83-4.338L3.25 1.5l10.54 10.54-1.413-2.964zm0 5.848l1.414-2.924L3.25 22.5l9.127-7.576z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold leading-none">GET IT ON</span>
                      <span className="text-sm font-extrabold text-white leading-tight block">Google Play</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Static Smartphone Mockup */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-[320px] aspect-[9/18] bg-slate-900 rounded-[48px] p-3.5 border-4 border-slate-700 shadow-2xl shadow-orange-500/20">
                {/* Speaker Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-10 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen Canvas — Coming Soon Display */}
                <div className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-[38px] overflow-hidden relative flex flex-col items-center justify-center p-6 border border-slate-800 text-center font-sans space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center font-black text-2xl shadow-lg">
                    RA
                  </div>

                  <div className="space-y-1.5">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-[10px] font-black uppercase tracking-widest inline-block">
                      Pre-Launch Phase
                    </span>
                    <h4 className="text-xl font-extrabold text-white tracking-tight">
                      Coming Soon
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      RentAwas Experts App on iOS &amp; Android
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: HOW RENTAWAS EXPERTS WORKS */}
      <section className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              Simple &amp; Guaranteed
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How RentAwas Home Services Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              3 easy steps to getting trusted, background-verified experts at your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Select Service &amp; Locality</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose AC repair, plumbing, carpentry, househelp, or electrical services in your city locality.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Matched with Verified Expert</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get paired with background-checked local independent specialists with fixed transparent pricing.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Doorstep Expert Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your assigned specialist arrives at your scheduled time and resolves your home issue professionally.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: WANT TO BECOME RENTAWAS EXPERTS? */}
      <RentAwasExpertsSection />

      <Footer />

      {/* NOTIFY ME LOCALITY MODAL */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Request Services in Your City</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pre-launch notification alert</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotifyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifySuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white">Notification Saved!</h4>
                <p className="text-xs text-emerald-300">
                  We will notify you on <span className="font-bold text-white">{notifyEmail}</span> as soon as RentAwas Home Services launches in <span className="font-bold text-white">{selectedCity}</span>!
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Selected Locality / City
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedCity}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-orange-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address or Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email or phone..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Notify Me On Launch</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMING SOON MODAL */}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        title={modalTitle}
      />
    </main>
  );
}
