"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  Wrench, 
  User, 
  CreditCard, 
  Megaphone, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Zap, 
  FileText, 
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Laptop
} from "lucide-react";
import { IconOneTapPayments, IconSmartAnnouncements } from "@/components/ui/CustomIcons";

export default function ResidentAppSection() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "tenant" | "documents">("dashboard");

  return (
    <section id="solutions" className="py-20 md:py-28 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Sleek Laptop Mockup Frame (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-center justify-center relative font-sans"
          >
            {/* Laptop Screen Body */}
            <div className="relative w-full max-w-[620px] bg-slate-950 rounded-t-2xl p-2.5 sm:p-3 shadow-2xl border-[3px] border-slate-800/90 group">
              
              {/* Web Camera Lens */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rounded-full border border-slate-700/80 z-30 flex items-center justify-center">
                <span className="w-0.5 h-0.5 rounded-full bg-blue-900 animate-pulse"></span>
              </div>

              {/* Laptop Screen Container (Browser Window) */}
              <div className="relative w-full aspect-[16/10] bg-white rounded-t-xl rounded-b-sm overflow-hidden text-left font-sans flex flex-col shadow-inner">
                
                {/* Browser Top Bar */}
                <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 select-none">
                  {/* macOS Window Controls */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/90 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block"></span>
                  </div>

                  {/* Browser Address Bar */}
                  <div className="flex-1 max-w-[280px] mx-auto bg-slate-800/90 border border-slate-700/80 rounded-md px-3 py-0.5 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-400">https://</span>
                    <span className="text-white font-bold">app.rentawas.com</span>
                    <span className="text-slate-400">/dashboard</span>
                  </div>

                  {/* Live Status Badge */}
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                    Live Platform
                  </span>
                </div>

                {/* Dashboard Page Content Mockup inside Laptop Screen */}
                <div className="flex-1 bg-slate-50 p-3 sm:p-4 overflow-hidden space-y-3">
                  
                  {/* Top Dashboard Header inside Screen */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-black text-slate-900">Mission Control Overview</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">Autopilot Active</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Real-time yield telemetry for The Regent Portfolio.</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setActiveTab("dashboard")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          activeTab === "dashboard" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        Overview
                      </button>
                      <button 
                        onClick={() => setActiveTab("tenant")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          activeTab === "tenant" ? "bg-[#FF6B00] text-white" : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        Resident View
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Screen Content based on Active Tab */}
                  {activeTab === "dashboard" ? (
                    <div className="space-y-3">
                      {/* Metric Cards Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Monthly Rent Collected</span>
                          <div className="text-base font-black text-slate-900 mt-0.5">$148,500</div>
                          <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>+11.2% this month</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Collection Rate</span>
                          <div className="text-base font-black text-emerald-600 mt-0.5">98.6%</div>
                          <div className="text-[9px] text-slate-500 font-medium mt-0.5">Auto-Debit ACH</div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Active Properties</span>
                          <div className="text-base font-black text-slate-900 mt-0.5">4 Buildings</div>
                          <div className="text-[9px] text-slate-500 font-medium mt-0.5">62 Total Units</div>
                        </div>
                      </div>

                      {/* Autopilot Recent Transactions Table */}
                      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Live Autopilot Rent Disbursal Feed</span>
                          <span className="text-emerald-600">Updated 2m ago</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[11px]">
                            <div>
                              <span className="font-bold text-slate-900 block">Eleanor Vance — Unit 302</span>
                              <span className="text-[9px] text-slate-500">The Regent • Auto-Debit (ACH)</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 block">$3,200</span>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Disbursed</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[11px]">
                            <div>
                              <span className="font-bold text-slate-900 block">Marcus Sterling — Suite 104</span>
                              <span className="text-[9px] text-slate-500">Downtown Horizon • UPI Gateway</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 block">$2,850</span>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Disbursed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Tenant Resident View inside Laptop Screen */
                    <div className="space-y-3">
                      <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Rent Due</span>
                          <span className="text-lg font-black text-white">$1,250.00</span>
                        </div>
                        <button className="px-3 py-1.5 bg-[#FF6B00] text-white font-bold text-xs rounded-lg shadow-xs">
                          Pay Rent Now
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Maintenance Ticket</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">AC Filter Replacement</span>
                          <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-1">Vendor Dispatched</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Lease Agreement</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">Residential Lease 2026</span>
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">Verified & Signed</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Laptop Metallic Base / Keyboard Deck */}
            <div className="w-full max-w-[700px] h-3.5 sm:h-4 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-b-xl border-t border-slate-600/80 shadow-xl relative flex items-center justify-center">
              {/* Trackpad Opening Notch */}
              <div className="w-20 sm:w-24 h-1.5 bg-slate-950 rounded-b-md border border-slate-700/60 shadow-inner"></div>
            </div>

            {/* Screen View Mode Switcher Pill */}
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600 font-sans">
              <Laptop className="w-4 h-4 text-[#FF6B00]" />
              <span>Interactive Desktop & Laptop Dashboard View</span>
            </div>
          </motion.div>

          {/* Right Column: Text & Features (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            {/* Category Tag */}
            <span className="text-xs sm:text-sm font-bold text-[#FF6B00] uppercase tracking-wider block mb-3 font-sans">
              ENTERPRISE PLATFORM
            </span>

            {/* Cormorant Garamond Headline */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight leading-[1.15] mb-6"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Delight your tenants with the platform they deserve.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 font-sans">
              Give landlords and tenants a state-of-the-art desktop & web experience. Instant rent disbursals, maintenance reporting, and legal documents all in one places.
            </p>

            {/* Feature List 1: One-Tap Payments */}
            <div className="flex items-start gap-4 mb-6 font-sans">
              <div className="p-3 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] shrink-0 mt-0.5">
                <IconOneTapPayments className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold text-[#0B132B] mb-1"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  One-Tap Autopilot Payments
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Support for Apple Pay, Google Pay, Razorpay UPI, and automatic ACH bank transfers.
                </p>
              </div>
            </div>

            {/* Feature List 2: Smart Announcements */}
            <div className="flex items-start gap-4 font-sans">
              <div className="p-3 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] shrink-0 mt-0.5">
                <IconSmartAnnouncements className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold text-[#0B132B] mb-1"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Smart Building Announcements & AI Docs
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Geo-targeted push notifications, maintenance dispatch, and automated legal lease generation.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
