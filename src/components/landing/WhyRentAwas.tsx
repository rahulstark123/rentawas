"use client";

import { motion, Variants } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Building,
  ArrowRight
} from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import { useState } from "react";

export default function WhyRentAwas() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pillars = [
    {
      icon: Zap,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      title: "Automated Rent Collection",
      desc: "Instant UPI, Auto-Debit, and automated WhatsApp reminders eliminate payment delays by up to 92%.",
      stat: "98.4%",
      statLabel: "On-Time Payments",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20",
      title: "AI Legal & Lease Architect",
      desc: "Generate legally compliant, state-localized lease agreements in seconds with digital signatures.",
      stat: "< 60s",
      statLabel: "Lease Generation",
    },
    {
      icon: Clock,
      iconBg: "bg-sky-50 text-sky-600 border-sky-100",
      title: "Instant Maintenance Dispatch",
      desc: "AI prioritizes repair urgency and dispatches verified local vendors with live SLA tracking.",
      stat: "4x Faster",
      statLabel: "Ticket Resolution",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "Yield & ROI Optimization",
      desc: "Real-time occupancy analytics, auto bank feeds, and financial forecasting to maximize net yield.",
      stat: "+18%",
      statLabel: "Average Net Yield",
    },
  ];

  const comparisons = [
    {
      feature: "Rent Collection",
      legacy: "Manual bank transfers & awkward WhatsApp follow-ups",
      rentawas: "Automated multi-channel UPI, Auto-Debit & WhatsApp reminders",
    },
    {
      feature: "Lease Agreements",
      legacy: "Outdated Word templates & physical stamp paper hassle",
      rentawas: "AI-generated state-compliant digital leases in 60 seconds",
    },
    {
      feature: "Maintenance & Repairs",
      legacy: "Lost calls, unorganized complaints, delayed contractor dispatch",
      rentawas: "Smart ticket triage, auto vendor dispatch & live SLA tracking",
    },
    {
      feature: "Financial Accounting",
      legacy: "Manual Excel spreadsheets prone to calculation errors",
      rentawas: "Real-time bank feed auto-reconciliation & tax-ready ledgers",
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
          <span className="text-xs sm:text-sm font-extrabold text-[#FF6B00] uppercase tracking-wider block mb-3 font-sans">
            THE RENTAWAS ADVANTAGE
          </span>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Why Rent<span className="text-[#FF6B00]">Awas</span>?
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 leading-relaxed font-sans">
            Traditional property management is broken—riddled with manual spreadsheet errors, delayed rent, and surprise maintenance costs. RentAwas unifies your entire rental ecosystem into one intelligent mission control.
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
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
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform ${pillar.iconBg}`}>
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-[#0B132B] mb-2"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {pillar.title}
                  </h3>
                  
                  <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between font-sans">
                  <span className="text-2xl font-extrabold text-[#0B132B]">
                    {pillar.stat}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {pillar.statLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table Section: Traditional vs RentAwas */}
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
