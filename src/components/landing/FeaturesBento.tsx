"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { 
  IconInventory, 
  IconLeaseAI, 
  IconMaintenance, 
  IconTenantHealth, 
  IconAutopilotRent 
} from "@/components/ui/CustomIcons";

export default function FeaturesBento() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Generating compliant terms for Seattle, WA...";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        setTimeout(() => {
          index = 0;
        }, 2000);
      }
    }, 80);

    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="platform" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-18"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B132B] tracking-tight">
            Everything you need, in one interface.
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg mt-3">
            Precision-engineered tools for every stage of the property lifecycle.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6"
        >
          {/* Card 1: Smart Inventory */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="md:col-span-7 bg-white rounded-xl md:rounded-2xl p-7 sm:p-8 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <IconInventory className="w-5 h-5" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Smart Inventory
              </h3>
              <p className="text-slate-600 font-normal text-sm md:text-base leading-relaxed max-w-lg mb-8">
                Manage buildings, floors, and individual rooms with nested hierarchical views and live availability tracking.
              </p>
            </div>

            {/* Inventory Visual Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                The Regent, Wing A
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-orange-100 text-orange-700 tracking-wider uppercase">
                94% OCCUPIED
              </span>
            </div>
          </motion.div>

          {/* Card 2: AI Lease Architect */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="md:col-span-5 bg-[#141A26] text-white rounded-xl md:rounded-2xl p-7 sm:p-8 border border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 text-purple-300 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform backdrop-blur-xs">
                <IconLeaseAI className="w-5 h-5" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                AI Lease Architect
              </h3>
              <p className="text-slate-300 font-normal text-sm md:text-base leading-relaxed mb-8">
                Generate legally compliant, localized lease agreements in seconds using our proprietary LLM trained on property law.
              </p>
            </div>

            {/* Simulated AI Command Bar */}
            <div className="bg-[#0C1019] border border-slate-800 rounded-lg p-3 flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-purple-400 font-semibold">{typedText}</span>
              <span className="w-2 h-4 bg-purple-400 animate-pulse"></span>
            </div>
          </motion.div>

          {/* Card 3: Maintenance */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="md:col-span-3 bg-white rounded-xl md:rounded-2xl p-6 sm:p-7 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <IconMaintenance className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Maintenance
              </h3>
              <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed">
                Real-time ticket tracking with automated vendor dispatch.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Tenant Health */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="md:col-span-3 bg-white rounded-xl md:rounded-2xl p-6 sm:p-7 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <IconTenantHealth className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Tenant Health
              </h3>
              <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed">
                Credit scoring and behavioral history at a glance.
              </p>
            </div>
          </motion.div>

          {/* Card 5: Autopilot Rent */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="md:col-span-6 bg-white rounded-xl md:rounded-2xl p-6 sm:p-7 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
          >
            <div className="max-w-sm">
              <Link href="/login" aria-label="Autopilot Rent Login" className="inline-block cursor-pointer group/icon">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover/icon:bg-emerald-100/80 transition-all">
                  <IconAutopilotRent className="w-5 h-5" />
                </div>
              </Link>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Autopilot Rent
              </h3>
              <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed">
                Collection rates increased by 40% with automated reminders and multi-channel payment gateways.
              </p>
            </div>

            {/* Visual Payment Channel Stack */}
            <div className="w-full sm:w-44 flex flex-col gap-2">
              <div className="bg-purple-50 border border-purple-100/80 rounded-lg p-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="h-1.5 w-16 bg-purple-300 rounded-full"></span>
              </div>
              <div className="bg-slate-100 border border-slate-200/60 rounded-lg p-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="h-1.5 w-20 bg-slate-300 rounded-full"></span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100/80 rounded-lg p-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span className="h-1.5 w-14 bg-indigo-300 rounded-full"></span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
