"use client";

import { motion, Variants } from "framer-motion";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Wrench, 
  CheckCircle2, 
  XCircle,
  ArrowRight
} from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import { useState } from "react";

export default function WhyRentAwas() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pillars = [
    {
      icon: Building2,
      emoji: "🏠",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      title: "Property & Unit Management",
      desc: "Manage multiple properties, buildings, floors, and rental units from a single dashboard with complete visibility.",
      badge: "Unlimited Properties",
    },
    {
      icon: Users,
      emoji: "👥",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      title: "Tenant Management",
      desc: "Store tenant profiles, lease details, KYC documents, emergency contacts, payment history, and communication in one place.",
      badge: "Complete Tenant Records",
    },
    {
      icon: CreditCard,
      emoji: "💳",
      iconBg: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20",
      title: "Rent Collection",
      desc: "Track rent payments, due dates, overdue invoices, recurring rent, receipts, and payment history with automatic reminders.",
      badge: "Never Miss Rent Due",
    },
    {
      icon: Wrench,
      emoji: "🛠️",
      iconBg: "bg-sky-50 text-sky-600 border-sky-100",
      title: "Maintenance Requests",
      desc: "Tenants can raise maintenance requests, upload photos, and track progress while managers assign and resolve issues efficiently.",
      badge: "Faster Issue Resolution",
    },
  ];

  const comparisons = [
    {
      feature: "PROPERTY & UNIT MANAGEMENT",
      legacy: "Manual spreadsheets, physical notebook logs & fragmented property records",
      rentawas: "Unified dashboard to manage multiple properties, buildings, floors & units with live availability tracking",
    },
    {
      feature: "TENANT MANAGEMENT",
      legacy: "Unorganized paper files, lost KYC documents & manual contact lists",
      rentawas: "Digital tenant profiles, secure KYC document storage, lease details & complete payment history",
    },
    {
      feature: "RENT COLLECTION",
      legacy: "Manual bank transfers, cash tracking & awkward WhatsApp follow-up reminders",
      rentawas: "Automated multi-channel UPI, Auto-Debit, recurring rent receipts & automatic WhatsApp reminders",
    },
    {
      feature: "MAINTENANCE REQUESTS",
      legacy: "Unorganized phone calls, lost complaints & delayed contractor assignment",
      rentawas: "Tenant photo ticket uploads, live status tracking & efficient manager assignment & resolution",
    },
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.5,
      },
    }),
  };

  return (
    <section id="why-rentawas" className="py-20 md:py-28 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <span className="text-xs sm:text-sm font-bold text-[#FF6B00] uppercase tracking-wider block mb-3 font-sans">
            THE RENTAWAS ADVANTAGE
          </span>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Why Rent<span className="text-[#FF6B00]">Awas</span>?
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 leading-relaxed font-sans">
            Everything you need to manage rental properties, tenants, rent collection, maintenance, and documents—all from one modern platform. Built for landlords, property managers, PG owners, and rental businesses.
          </p>
        </motion.div>

        {/* 4 Pillars Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="bg-[#F8FAFC] rounded-xl md:rounded-2xl p-6 sm:p-7 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${pillar.iconBg}`}>
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-2xl">{pillar.emoji}</span>
                  </div>
                  
                  <h3 
                    className="text-xl sm:text-2xl font-bold text-[#0B132B] mb-3 leading-snug"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {pillar.title}
                  </h3>
                  
                  <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between font-sans">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B132B] text-white tracking-wider">
                    {pillar.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table Section: Traditional Methods vs RentAwas */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0B132B] text-white rounded-xl md:rounded-2xl p-7 sm:p-10 border border-slate-800 shadow-xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h3 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Traditional Methods vs RentAwas
              </h3>
              <p className="text-slate-300 font-normal text-sm sm:text-base font-sans">
                See how upgrading to RentAwas transforms your daily operations.
              </p>
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4 font-sans">
              {comparisons.map((row, idx) => (
                <div 
                  key={idx}
                  className="bg-[#141E36] border border-slate-800 rounded-xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:border-slate-700 transition-colors"
                >
                  <div className="md:col-span-3">
                    <span className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-wider block">
                      {row.feature}
                    </span>
                  </div>

                  <div className="md:col-span-4 flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{row.legacy}</span>
                  </div>

                  <div className="md:col-span-5 flex items-start gap-2 text-white font-medium text-xs sm:text-sm bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{row.rentawas}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Call to Action inside comparison */}
            <div className="mt-10 pt-6 border-t border-slate-800 text-center font-sans">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all px-7 py-3.5 rounded-md shadow-xs cursor-pointer uppercase tracking-wider"
              >
                <span>Upgrade Your Portfolio Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modal Trigger Component */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start Managing with RentAwas Free"
      />
    </section>
  );
}
