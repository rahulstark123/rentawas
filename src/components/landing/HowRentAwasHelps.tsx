"use client";

import { motion, Variants } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  CreditCard,
  Wrench,
  FileText,
} from "lucide-react";

const helps = [
  {
    step: "01",
    icon: LayoutDashboard,
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    title: "See every property in one place",
    desc: "Buildings, floors, units, and occupancy live on a single dashboard—so you stop juggling spreadsheets and WhatsApp notes.",
  },
  {
    step: "02",
    icon: MessageSquare,
    iconBg: "bg-sky-50 text-sky-600 border-sky-100",
    title: "Talk to tenants without the chaos",
    desc: "Use in-app 1-on-1 DMs and building group channels for announcements, support, and follow-ups—with a clear history you can trust.",
  },
  {
    step: "03",
    icon: Bot,
    iconBg: "bg-violet-50 text-violet-600 border-violet-100",
    title: "Ask RentAwas Buddy instead of digging",
    desc: "Get plain-English answers about your portfolio, draft lease documents, and pull insights from live data with AI credits.",
  },
  {
    step: "04",
    icon: CreditCard,
    iconBg: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20",
    title: "Collect rent without awkward chasing",
    desc: "Track dues, overdue invoices, and payment history in one ledger—so reminders go out on time and receipts stay organized.",
  },
  {
    step: "05",
    icon: Wrench,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    title: "Close maintenance loops faster",
    desc: "Tenants raise tickets with photos; you assign, track status, and resolve issues without lost phone complaints.",
  },
  {
    step: "06",
    icon: FileText,
    iconBg: "bg-slate-100 text-slate-700 border-slate-200",
    title: "Keep leases and docs ready",
    desc: "Store KYC, agreements, and notices in the cloud so renewals, move-ins, and compliance checks take minutes—not days.",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

export default function HowRentAwasHelps() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-16"
        >
          <span className="text-xs sm:text-sm font-bold text-[#FF6B00] uppercase tracking-wider block mb-3 font-sans">
            Built for real landlords
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            How Rent<span className="text-[#FF6B00]">Awas</span> will help you
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 leading-relaxed font-sans">
            From day-to-day ops to AI answers and in-app messaging—RentAwas cuts the busywork so you can run rentals with clarity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {helps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                className="relative bg-[#F8FAFC] rounded-xl md:rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center ${item.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className="text-2xl sm:text-3xl font-bold text-slate-200 leading-none select-none"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {item.step}
                  </span>
                </div>

                <h3
                  className="text-xl sm:text-2xl font-bold text-[#0B132B] mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-slate-600 font-normal text-xs sm:text-sm leading-relaxed font-sans">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
