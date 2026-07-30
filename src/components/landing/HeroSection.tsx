"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Search,
  Bell
} from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";

interface HeroSectionProps {
  onOpenEarlyAccess?: () => void;
}

export default function HeroSection({ onOpenEarlyAccess }: HeroSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<"preview" | "interactive">("preview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Feature Coming Soon!");
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false);

  const openComingSoon = (title = "Feature Coming Soon!") => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const handleOpenEarlyAccess = () => {
    if (onOpenEarlyAccess) {
      onOpenEarlyAccess();
    } else {
      setIsEarlyAccessModalOpen(true);
    }
  };

  return (
    <section id="platform" className="relative pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#141E38] to-[#F8FAFC]">
      {/* Radial Glow Accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
        {/* 100% Free Property Listing Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleOpenEarlyAccess}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider mb-5 shadow-xs cursor-pointer hover:bg-[#FF6B00]/30 transition-all"
        >
          <Building2 className="w-4 h-4 text-[#FF6B00]" />
          <span>100% Free Property Listing • Zero Broker Fees</span>
        </motion.div>

        {/* Main Headline (List. Manage. Grow. in Cormorant Garamond font) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.05] max-w-5xl mx-auto"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          List. Manage.{" "}
          <span className="block sm:inline text-[#FF6B00]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Grow.
          </span>
        </motion.h1>

        {/* Subheadline (Clean Inter font) */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="text-slate-300 font-normal text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 mb-10 leading-relaxed"
        >
          The complete property management & free property listing platform. List vacant properties for free, find tenants, collect rent, track expenses, manage maintenance, and run your rentals—all in one place.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          <button
            type="button"
            onClick={handleOpenEarlyAccess}
            className="w-full sm:w-auto text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all px-5 py-3.5 rounded-xl shadow-md shadow-orange-500/20 text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>List Property Free</span>
          </button>
          <Link
            href="/find-property"
            className="w-full sm:w-auto text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 active:scale-[0.98] transition-all px-5 py-3.5 rounded-xl shadow-xs text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap backdrop-blur-md"
          >
            <Search className="w-4 h-4 shrink-0 text-[#FF6B00]" />
            <span>Find Property</span>
          </Link>
          <a
            href="https://anshapps.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-white active:scale-[0.98] transition-all px-5 py-3.5 rounded-xl shadow-md text-center cursor-pointer uppercase tracking-wider inline-flex items-center justify-center whitespace-nowrap"
          >
            ANSH Apps
          </a>
        </motion.div>

        {/* Dashboard Mockup Frame */}
        <motion.div 
          id="demo" 
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="max-w-5xl mx-auto mt-14 md:mt-16 bg-white rounded-xl md:rounded-2xl p-2.5 sm:p-3 window-shadow relative group"
        >
          {/* Top Window Dots Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2.5 bg-slate-50/80 rounded-t-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
            </div>
            
            {/* View Switcher Toggle */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-md text-xs font-medium">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-0.5 rounded-md text-[11px] transition-all ${
                  activeTab === "preview"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mockup View
              </button>
              <button
                onClick={() => setActiveTab("interactive")}
                className={`px-3 py-0.5 rounded-md text-[11px] transition-all ${
                  activeTab === "interactive"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live Interactive UI
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="relative rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
            {activeTab === "preview" ? (
              /* Photo Mockup matching reference image */
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-slate-100 flex items-center justify-center">
                <Image
                  src="/hero-dashboard.png"
                  alt="RentAwas Dashboard Laptop Mockup"
                  fill
                  priority
                  className="object-cover object-center transform group-hover:scale-[1.005] transition-transform duration-500"
                />
              </div>
            ) : (
              /* Interactive Rendered UI Dashboard */
              <div className="w-full text-left p-4 sm:p-6 bg-white min-h-[420px] font-sans">
                {/* Top Nav inside dashboard */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#FF6B00] text-white font-bold flex items-center justify-center text-xs">
                      RA
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Good Morning, Sarah!</h3>
                      <p className="text-[11px] text-slate-500">Here is your property overview</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search properties..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-md border-0 focus:ring-1 focus:ring-slate-300 w-44"
                        readOnly
                      />
                    </div>
                    <button className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => openComingSoon("Dashboard Analytics Detail")}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-[#0B132B] text-white uppercase tracking-wider"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Grid Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-lg font-extrabold text-slate-900">$45,800</p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +5.2%
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Units Occupied</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-lg font-extrabold text-slate-900">96.4%</p>
                      <span className="text-[11px] text-slate-500 font-medium">217 / 225</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Maintenance</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-lg font-extrabold text-slate-900">14</p>
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                        Action Needed
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rent Arrears</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-lg font-extrabold text-slate-900">2.1%</p>
                      <span className="text-[11px] text-slate-500 font-medium">$3,400</span>
                    </div>
                  </div>
                </div>

                {/* Table Snippet */}
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Active Maintenance Tickets
                    </h4>
                    <span 
                      onClick={() => openComingSoon("Maintenance Tickets Control")}
                      className="text-[11px] text-[#FF6B00] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      View All
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">AM-0789</span>
                        <span className="text-slate-600">45 Riverdale Apt.</span>
                        <span className="text-slate-500 hidden sm:inline">Roof Leak</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600">High Priority</span>
                        <span className="text-slate-400 text-[11px]">May 15</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">AM-0756</span>
                        <span className="text-slate-600">12 Oak St</span>
                        <span className="text-slate-500 hidden sm:inline">HVAC Repair</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600">Medium</span>
                        <span className="text-slate-400 text-[11px]">May 14</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />

      {/* Early Access Lead Capture Modal */}
      <EarlyAccessModal
        isOpen={isEarlyAccessModalOpen}
        onClose={() => setIsEarlyAccessModalOpen(false)}
      />
    </section>
  );
}
