"use client";

import { useState, useEffect, useRef } from "react";
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
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Home Service Booking Coming Soon!");
  const [activeDomainId, setActiveDomainId] = useState("ac");
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const cardStoriesData = [
    {
      id: "rentawas-advantage",
      badge: "THE RENTAWAS ADVANTAGE",
      title: "Why RentAwas Experts?",
      subtitle: "Connecting you directly with background-checked local maintenance specialists. Built for absolute transparency, instant availability, and complete peace of mind.",
      accent: "text-[#FF6B00]",
      badgeBg: "bg-orange-500/10 border-orange-500/30 text-[#FF6B00]",
      quote: "Why worry about unverified technicians? Every RentAwas expert is Aadhaar & identity background checked, offers fixed upfront rates, and guarantees work with a service warranty.",
      authorName: "The RentAwas Standard",
      authorRole: "100% Aadhaar & Identity Verified Network",
      authorInitials: "VS",
      cardTag: "Trust & Safety",
      imageSrc: "/1st section.png",
      highlights: [
        {
          title: "100% Aadhaar & Government ID Verified",
          desc: "Every technician is identity-checked and Aadhaar-verified before taking any booking.",
          icon: ShieldCheck,
          iconColor: "text-emerald-600",
        },
        {
          title: "Fixed Transparent Rates & Escrow Security",
          desc: "No hidden fees or post-job price inflation. Funds remain locked until work completion.",
          icon: BadgeCheck,
          iconColor: "text-[#FF6B00]",
        },
        {
          title: "6-Digit OTP Security & Re-service Guarantee",
          desc: "Verify work using a one-time OTP and enjoy hassle-free service warranty.",
          icon: Clock,
          iconColor: "text-purple-600",
        },
      ],
      chips: [" Verified Identity", " Upfront Pricing", " Service Cover"],
    },
    {
      id: "tenant-story",
      badge: "TENANT SUCCESS STORY",
      title: "Meet Abhya — A tenant who gets all her home solutions in one place.",
      subtitle: "From sudden late-night plumbing leaks to annual AC servicing, Abhya manages her entire rental apartment maintenance with 1-tap RentAwas expert booking and 6-digit OTP safety.",
      accent: "text-blue-600",
      badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-600",
      quote: "“When my bathroom pipeline burst at 10 PM, I booked on RentAwas. A local verified plumber arrived, fixed the leak, and I verified completion with my 6-digit OTP.”",
      authorName: "Abhya Sharma",
      authorRole: "Tenant • Resident in Gurgaon",
      authorInitials: "AS",
      cardTag: "Tenant Verified Review",
      imageSrc: "/section 2.png",
      highlights: [
        {
          title: "1-Tap Instant Service Dispatch",
          desc: "Request certified plumbers, electricians, or househelp right from your smartphone.",
          icon: Zap,
          iconColor: "text-blue-600",
        },
        {
          title: "6-Digit OTP Work Security",
          desc: "Share your OTP code only when the technician completes the job to your satisfaction.",
          icon: ShieldCheck,
          iconColor: "text-emerald-600",
        },
        {
          title: "Fixed Escrow Payment Protection",
          desc: "Upfront pricing with zero hidden charges. Funds locked until work completion.",
          icon: BadgeCheck,
          iconColor: "text-[#FF6B00]",
        },
      ],
      chips: [" Instant Booking", " 6-Digit OTP", " Fixed Rates"],
    },
    {
      id: "locality-experts",
      badge: "NEIGHBORHOOD EXPERTS",
      title: "Experts From Your Own Locality",
      subtitle: "Connect directly with independent, Aadhaar & identity-verified electricians, plumbers, carpenters, and househelp operating right within your city neighborhood.",
      accent: "text-emerald-600",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
      quote: "“RentAwas connects me directly to jobs in my neighborhood. I earn fair wages without paying middleman commissions, and customers trust me because I am background-verified.”",
      authorName: "Manoj Kumar",
      authorRole: "Master Electrician • Delhi NCR",
      authorInitials: "MK",
      cardTag: "Expert Spotlight",
      imageSrc: "/section 3.png",
      highlights: [
        {
          title: "Rapid Local Arrival",
          desc: "Local neighborhood technicians arrive quickly with professional equipment.",
          icon: Clock,
          iconColor: "text-emerald-600",
        },
        {
          title: "100% Aadhaar & Government ID Verified",
          desc: "Complete identity checks and background verification for tenant safety.",
          icon: UserCheck,
          iconColor: "text-[#FF6B00]",
        },
        {
          title: "Transparent & Fair Local Rates",
          desc: "Direct earnings for independent specialists with 100% transparent pricing.",
          icon: BadgeCheck,
          iconColor: "text-purple-600",
        },
      ],
      chips: [" Direct Local Work", " Zero Middlemen", " Verified Badge"],
    },
    {
      id: "landlords-managers",
      badge: "LANDLORD & MANAGER BENEFIT",
      title: "Effortless Maintenance for Landlords & Property Managers",
      subtitle: "Ensure your rental units remain pristine without endless phone calls. RentAwas coordinates doorstep work completion, digital invoice logs, and service warranty automatically.",
      accent: "text-purple-600",
      badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-600",
      quote: "“Managing 15 rental flats used to take 20 calls a day for repairs. Now my tenants book on RentAwas, jobs are tracked digitally, and I get automated expense logs without lifting a finger.”",
      authorName: "Sunil Verma",
      authorRole: "Property Owner • Bhopal",
      authorInitials: "SV",
      cardTag: "Landlord Feedback",
      imageSrc: "/landign 3.png",
      highlights: [
        {
          title: "Zero Phone Call Coordination",
          desc: "Tenants book verified experts directly with digital audit logs for property owners.",
          icon: ShieldCheck,
          iconColor: "text-purple-600",
        },
        {
          title: "Digital Work Verification Log",
          desc: "Track completed maintenance visits with photo proof and verified digital logs.",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
        },
        {
          title: "Automated Maintenance Expense Invoices",
          desc: "Keep property repair costs logged and exported in one central dashboard.",
          icon: BadgeCheck,
          iconColor: "text-[#FF6B00]",
        },
      ],
      chips: [" Automated Logs", " Zero Phone Calls", " Digital Audit"],
    },
  ];

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
    "Delhi NCR",
    "Bhopal",
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

  const testimonialsRow1 = [
    {
      stars: 5,
      quote: "Great work, my home was left spotless and fresh. The AC jet wash was thorough, and I really appreciated the technician's attention to detail. I'll definitely recommend it. 👍",
      name: "Pradnyesh",
      locality: "Suncity, Gurgaon",
      initial: "P",
      color: "bg-orange-50 text-[#FF6B00] border-orange-200",
    },
    {
      stars: 5,
      quote: "The services have definitely improved compared to local unverified mechanics. Preferences and safety guidelines are kept as top priority. Thank you for making our lives easier!",
      name: "Ridhi Saluja",
      locality: "Sector 56, Gurgaon",
      initial: "R",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      stars: 5,
      quote: "I'd say it was great value for money. The pipe leak urgency was handled within 20 minutes, without compromising quality. Really satisfied with the experience.",
      name: "Kirti",
      locality: "Sector 56, Gurgaon",
      initial: "K",
      color: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30",
    },
    {
      stars: 5,
      quote: "The service was simple and effective. It met my expectations without any hassle or extra hidden fees. Good overall experience.",
      name: "Neha",
      locality: "Sector 57, Gurgaon",
      initial: "N",
      color: "bg-orange-100 text-orange-900 border-orange-200",
    },
    {
      stars: 5,
      quote: "Booked a modular kitchen carpenter. The specialist arrived with modern woodworking tools, aligned all hinges perfectly, and left zero mess.",
      name: "Aakash Verma",
      locality: "DLF Phase 5, Gurgaon",
      initial: "A",
      color: "bg-amber-100 text-amber-900 border-amber-200",
    },
  ];

  const testimonialsRow2 = [
    {
      stars: 5,
      quote: "Really impressive compared to other platforms. The service was reliable, background-checked, and communication was clear and fast — very pleased!",
      name: "Rabia",
      locality: "Suncity, Gurgaon",
      initial: "R",
      color: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30",
    },
    {
      stars: 5,
      quote: "Seamless experience from booking to completion. The househelp staff was courteous, police-verified, punctual, and did a fantastic job.",
      name: "Ritika",
      locality: "Sector 57, Gurgaon",
      initial: "R",
      color: "bg-orange-50 text-[#FF6B00] border-orange-200",
    },
    {
      stars: 5,
      quote: "Really liked your service, it was smooth, efficient, and just what I needed for MCB tripping issues. Would definitely recommend to others. ☀️",
      name: "Sameer",
      locality: "Sector 57, Gurgaon",
      initial: "S",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      stars: 5,
      quote: "Absolutely excellent service! The deep sanitization team was prompt and professional throughout. Would love to use it again.",
      name: "Karishma",
      locality: "Suncity, Gurgaon",
      initial: "K",
      color: "bg-orange-100 text-orange-900 border-orange-200",
    },
    {
      stars: 5,
      quote: "As a tenant living alone in Noida, having background-verified experts with 6-digit OTP verification gives complete peace of mind. Excellent work!",
      name: "Meera Deshmukh",
      locality: "Sector 62, Noida",
      initial: "M",
      color: "bg-amber-100 text-amber-900 border-amber-200",
    },
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

              {/* App Store Download Badges (Google Play & Indus Appstore) */}
              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => triggerComingSoon("Google Play Store App")}
                  className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                  title="Get it on Google Play"
                >
                  <Image
                    src="/googlePlayButton.png"
                    alt="Get it on Google Play"
                    width={160}
                    height={52}
                    className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => triggerComingSoon("Indus Appstore App")}
                  className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                  title="Download on Indus Appstore"
                >
                  <Image
                    src="/indusAppstore.jpg"
                    alt="Download on Indus Appstore"
                    width={160}
                    height={52}
                    className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                  />
                </button>
              </div>

              {/* Become a RentAwas Expert CTA Link Button */}
              <div className="pt-3">
                <a
                  href="https://forms.anshapps.com/rentawas-s-workspace/rentawas-experts-form"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] border border-orange-400/30"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Become a RentAwas Expert</span>
                </a>
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

      {/* SECTION 3: REAL STORIES & PROVEN TRUST (Interactive Showcase) */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] font-sans border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Header Banner */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>REAL STORIES FROM RENTAWAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              RentAwas is transforming how tenants, verified locality experts, and property owners connect
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium max-w-2xl mx-auto">
              Turning rental maintenance headaches into 1-tap peace of mind.
            </p>
          </div>

          {/* Story Selection Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto pb-2">
            {cardStoriesData.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => setActiveStoryIndex(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${activeStoryIndex === idx
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                  }`}
              >
                <span>{story.title.split(" — ")[0].split("?")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Story Card Display */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStoryIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Side: Story Details & Highlights */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${cardStoriesData[activeStoryIndex].badgeBg}`}>
                    <Sparkles className="w-4 h-4" />
                    <span>{cardStoriesData[activeStoryIndex].badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {cardStoriesData[activeStoryIndex].title}
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed italic border-l-2 border-[#FF6B00] pl-4 py-0.5">
                    {cardStoriesData[activeStoryIndex].subtitle}
                  </p>

                  {/* Highlights List */}
                  {cardStoriesData[activeStoryIndex].highlights.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {cardStoriesData[activeStoryIndex].highlights.map((h, hIdx) => {
                        const IconComp = h.icon;
                        return (
                          <div key={hIdx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs space-y-1">
                            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm sm:text-base">
                              <IconComp className={`w-4 h-4 ${h.iconColor}`} />
                              <span>{h.title}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium pl-6 leading-relaxed">
                              {h.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Feature Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {cardStoriesData[activeStoryIndex].chips.map((chip, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side: Showcase Image or Quote Card */}
                <div className={`lg:col-span-6 flex items-center justify-center h-[380px] sm:h-[440px] relative rounded-3xl overflow-hidden ${cardStoriesData[activeStoryIndex].imageSrc
                  ? "bg-transparent border-none shadow-none"
                  : "bg-slate-50 border border-slate-100"
                  }`}>
                  {cardStoriesData[activeStoryIndex].imageSrc ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <Image
                        src={cardStoriesData[activeStoryIndex].imageSrc}
                        alt={cardStoriesData[activeStoryIndex].title}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full p-6 sm:p-8 space-y-4 flex flex-col justify-between text-left">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cardStoriesData[activeStoryIndex].badgeBg}`}>
                          0{activeStoryIndex + 1} / 04 — {cardStoriesData[activeStoryIndex].badge}
                        </span>
                        <span className="text-xs font-extrabold text-[#FF6B00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-[#FF6B00]" />
                          {cardStoriesData[activeStoryIndex].cardTag}
                        </span>
                      </div>

                      <div className="space-y-3 my-auto">
                        <div className="text-[#FF6B00] font-serif text-4xl leading-none select-none">“</div>
                        <p className="text-slate-900 text-base sm:text-lg font-bold leading-relaxed tracking-tight -mt-2">
                          {cardStoriesData[activeStoryIndex].quote}
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5 pt-3.5 border-t border-slate-200">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                          {cardStoriesData[activeStoryIndex].authorInitials}
                        </div>
                        <div className="leading-tight">
                          <div className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                            <span>{cardStoriesData[activeStoryIndex].authorName}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {cardStoriesData[activeStoryIndex].authorRole}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
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
                  Coming Soon To Google Play &amp; Indus Appstore:
                </span>

                <div className="flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => triggerComingSoon("Google Play Store App")}
                    className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                    title="Get it on Google Play"
                  >
                    <Image
                      src="/googlePlayButton.png"
                      alt="Get it on Google Play"
                      width={160}
                      height={52}
                      className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerComingSoon("Indus Appstore App")}
                    className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                    title="Download on Indus Appstore"
                  >
                    <Image
                      src="/indusAppstore.jpg"
                      alt="Download on Indus Appstore"
                      width={160}
                      height={52}
                      className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                    />
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

                {/* Inner Screen Canvas — RentAwas Mobile App Screenshot */}
                <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden relative border border-slate-800 font-sans">
                  <Image
                    src="/mobilerentawas.jpeg"
                    alt="RentAwas Mobile App Preview"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION (SLOWLY MOVING INFINITE MARQUEE) */}
      <section className="py-20 bg-[#F8FAFC] border-t border-b border-slate-200 overflow-hidden font-sans relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-left mb-12">
          <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest block">
            COMMUNITY TRUST &amp; STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Trusted By RentAwas Families.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real experiences from property managers, landlords, and residents relying on RentAwas maintenance experts.
          </p>
        </div>

        {/* Marquee Row 1 (Moving Slowly Left) */}
        <div className="relative w-full overflow-hidden mb-6">
          {/* Edge Blur Gradients */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 w-max animate-marquee-left">
            {[...testimonialsRow1, ...testimonialsRow1, ...testimonialsRow1].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[350px] p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 shrink-0 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                {/* 5 Orange Stars */}
                <div className="flex items-center gap-1 text-[#FF6B00]">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FF6B00] text-[#FF6B00]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center border shrink-0 ${item.color}`}>
                    {item.initial}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 block">{item.locality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Moving Slowly Right) */}
        <div className="relative w-full overflow-hidden">
          {/* Edge Blur Gradients */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 w-max animate-marquee-right">
            {[...testimonialsRow2, ...testimonialsRow2, ...testimonialsRow2].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[350px] p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 shrink-0 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                {/* 5 Orange Stars */}
                <div className="flex items-center gap-1 text-[#FF6B00]">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FF6B00] text-[#FF6B00]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center border shrink-0 ${item.color}`}>
                    {item.initial}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 block">{item.locality}</span>
                  </div>
                </div>
              </div>
            ))}
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
