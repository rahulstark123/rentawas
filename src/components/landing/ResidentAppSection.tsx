"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Wrench, User, CreditCard, Megaphone } from "lucide-react";
import { IconOneTapPayments, IconSmartAnnouncements } from "@/components/ui/CustomIcons";

export default function ResidentAppSection() {
  const [useLiveUI, setUseLiveUI] = useState(false);

  return (
    <section id="solutions" className="py-20 md:py-28 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Phone Mockup Frame (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative"
          >
            {/* Static Phone Outer Bezel Container */}
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-[9/18.5] bg-[#0B132B] rounded-[48px] p-3 shadow-2xl border-4 border-slate-900 group">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></span>
              </div>

              {/* Phone Screen Area */}
              <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-white text-left font-sans">
                {useLiveUI ? (
                  /* Rendered Interactive Mobile Interface */
                  <div className="w-full h-full pt-10 pb-4 px-4 bg-slate-50 flex flex-col justify-between overflow-y-auto">
                    {/* App Header */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-extrabold text-[#0B132B]">RentAwas</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Welcome,</p>
                          <p className="text-xs font-bold text-slate-800">Sarah Chen</p>
                        </div>
                      </div>

                      {/* Rent Due Balance Card */}
                      <div className="bg-[#181E2A] text-white rounded-2xl p-4 mb-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-400">Rent Due</p>
                          <p className="text-[10px] text-slate-400 font-medium">Due: Oct 05, 2024</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-extrabold text-white">₹18,500</p>
                          <button className="px-3.5 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000]">
                            Pay Now
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions 3 Grid */}
                      <p className="text-xs font-bold text-slate-800 mb-2">Quick Actions</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <button className="bg-[#0B132B] text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center hover:opacity-90">
                          <CreditCard className="w-4 h-4 text-sky-400" />
                          <span className="text-[10px] font-semibold leading-tight">Pay Rent</span>
                        </button>
                        <button className="bg-[#0B132B] text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center hover:opacity-90">
                          <Wrench className="w-4 h-4 text-orange-400" />
                          <span className="text-[10px] font-semibold leading-tight">Raise Ticket</span>
                        </button>
                        <button className="bg-[#0B132B] text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center hover:opacity-90">
                          <Megaphone className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-semibold leading-tight">Announcements</span>
                        </button>
                      </div>

                      {/* Announcements Card */}
                      <div className="bg-white border border-slate-200/80 rounded-xl p-3 mb-3 shadow-2xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Announcements
                        </p>
                        <p className="text-xs font-semibold text-slate-800">
                          Water Shutdown Maintenance - Oct 10, 9AM-1PM
                        </p>
                      </div>

                      {/* Maintenance Request Card */}
                      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Maintenance Requests
                        </p>
                        <p className="text-xs font-semibold text-slate-800">
                          Ticket #1645 - AC Repair | <span className="text-amber-600">In Progress</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Nav Bar */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-around text-slate-400">
                      <div className="flex flex-col items-center text-[#0B132B]">
                        <Home className="w-4 h-4" />
                        <span className="text-[9px] font-bold mt-0.5">Home</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[9px] mt-0.5">Payments</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Wrench className="w-4 h-4" />
                        <span className="text-[9px] mt-0.5">Maintenance</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <User className="w-4 h-4" />
                        <span className="text-[9px] mt-0.5">Profile</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Photo Mockup Image matching reference */
                  <div className="relative w-full h-full">
                    <Image
                      src="/resident-app.png"
                      alt="RentAwas Resident Mobile App Screen"
                      fill
                      priority
                      className="object-cover object-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Toggle Pill under phone */}
            <button
              onClick={() => setUseLiveUI(!useLiveUI)}
              className="mt-4 text-xs font-semibold text-slate-600 hover:text-slate-900 underline transition-colors cursor-pointer font-sans"
            >
              {useLiveUI ? "Switch to Photo View" : "Switch to Interactive Mobile Screen"}
            </button>
          </motion.div>

          {/* Right Column: Text & Features (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            {/* Category Tag */}
            <span className="text-xs sm:text-sm font-bold text-[#FF6B00] uppercase tracking-wider block mb-3 font-sans">
              RESIDENT APP
            </span>

            {/* Cormorant Garamond Headline */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight leading-[1.15] mb-6"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Delight your tenants with the platform they deserve.
            </h2>

            {/* Inter Subheadline */}
            <p className="text-slate-600 font-normal text-base sm:text-lg max-w-xl leading-relaxed mb-10 font-sans">
              Give residents a premium mobile experience. Rent payments, maintenance reporting, and community updates, all in their pocket.
            </p>

            {/* Feature Item 1 */}
            <div className="flex items-start gap-4 mb-8 font-sans">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1 shadow-2xs font-bold">
                <IconOneTapPayments className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-xl sm:text-2xl font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  One-Tap Payments
                </h3>
                <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed font-sans">
                  Support for Apple Pay, Google Pay, and automatic bank transfers.
                </p>
              </div>
            </div>

            {/* Feature Item 2 */}
            <div className="flex items-start gap-4 font-sans">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1 shadow-2xs font-bold">
                <IconSmartAnnouncements className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-xl sm:text-2xl font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Smart Announcements
                </h3>
                <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed font-sans">
                  Geo-targeted push notifications for building maintenance or events.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
