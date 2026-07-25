"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Check, 
  Bell, 
  Users, 
  Wrench, 
  FileText, 
  RefreshCw, 
  ChevronDown
} from "lucide-react";
import { 
  IconCloudStorage, 
  IconMobileDevice, 
  IconBankSecurity 
} from "@/components/ui/CustomIcons";
import ComingSoonModal from "@/components/ui/ComingSoonModal";

export default function PricingAndFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Free Trial Registration");

  const triggerModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const includedFeatures = [
    { icon: IconCloudStorage, label: "Secure Cloud Storage" },
    { icon: IconMobileDevice, label: "Mobile Friendly" },
    { icon: Bell, label: "Automatic Rent Reminders" },
    { icon: Users, label: "Tenant Portal" },
    { icon: Wrench, label: "Maintenance Tracking" },
    { icon: FileText, label: "Digital Lease Management" },
    { icon: RefreshCw, label: "Regular Product Updates" },
    { icon: IconBankSecurity, label: "Bank-grade Security" },
  ];

  const faqs = [
    {
      q: "Is there a free trial?",
      a: "Yes! Every plan comes with a 14-day full feature free trial. No credit card is required to sign up and start managing your properties immediately.",
    },
    {
      q: "Can I upgrade anytime?",
      a: "Absolutely. You can switch between Starter, Growth, and Business plans at any time directly from your workspace settings with pro-rated billing.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, there are no lock-in contracts or commitments. You can cancel your subscription whenever you wish with one click.",
    },
    {
      q: "Do you charge per property?",
      a: "No, our plans are structured as flat monthly tiers based on rental unit limits rather than charging per individual property address.",
    },
    {
      q: "Is my data secure?",
      a: "Your data security is our top priority. We use bank-grade 256-bit SSL encryption, isolated database instances, and automated daily backups on enterprise AWS infrastructure.",
    },
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
  };

  return (
    <section id="pricing" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          {/* Cormorant Garamond Heading */}
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Simple Pricing for Every Property Portfolio
          </h2>
          {/* Inter Description */}
          <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 leading-relaxed font-sans">
            Choose the perfect plan for your rental business. Start with a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 items-stretch mb-24 font-sans">
          {/* Card 1: Starter */}
          <motion.div 
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl md:rounded-2xl p-7 sm:p-8 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between"
          >
            <div>
              <h3 
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Starter
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Best for Individual Landlords
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹499</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 3 Properties</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 15 Rental Units</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tenant Management</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Rent Collection</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Maintenance Requests</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Lease Management</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Basic Reports & Ledgers</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Starter Plan Free Trial")}
              className="w-full text-center text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors py-3 rounded-lg cursor-pointer uppercase tracking-wider"
            >
              Start Free Trial
            </button>
          </motion.div>

          {/* Card 2: Growth (Most Popular) */}
          <motion.div 
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="bg-white rounded-xl md:rounded-2xl p-7 sm:p-8 border-2 border-[#FF6B00] shadow-lg relative flex flex-col justify-between lg:-translate-y-2"
          >
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-xs">
              Most Popular
            </div>
            <div>
              <h3 
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Growth
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Best for PG Owners & Apartment Owners
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹999</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Unlimited Properties</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Up to 100 Rental Units</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Advanced Reports & Analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Owner Portal & Statements</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>WhatsApp Reminders</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-purple-700">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>100 AI Credits/month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Up to 5 Team Members</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Growth Plan Free Trial")}
              className="w-full text-center text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all py-3 rounded-lg shadow-xs hover:shadow-sm cursor-pointer uppercase tracking-wider"
            >
              Start Free Trial
            </button>
          </motion.div>

          {/* Card 3: Business */}
          <motion.div 
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl md:rounded-2xl p-7 sm:p-8 border border-slate-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between"
          >
            <div>
              <h3 
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Business
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Best for Property Managers & Rental Companies
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹1,999</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Properties</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Rental Units</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Everything in Growth</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>API Access & Webhooks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Team Members</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-purple-700">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>500 AI Credits/month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Advanced Portfolio Analytics</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Business Plan Free Trial")}
              className="w-full text-center text-xs font-bold text-white bg-[#0B132B] hover:bg-[#162244] transition-colors py-3 rounded-lg cursor-pointer uppercase tracking-wider"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>

        {/* Every Plan Includes Grid Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl md:rounded-2xl p-8 sm:p-10 border border-slate-200/80 card-shadow mb-24 text-center"
        >
          <h3 
            className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-8"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Every Plan Includes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 font-sans">
            {includedFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center gap-2.5 p-3 group">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-[#0B132B] text-center mb-8"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Frequently Asked Questions
          </motion.h3>
          <div className="space-y-3 font-sans">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200/80 rounded-lg overflow-hidden transition-all card-shadow"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#FF6B00]" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-0 text-slate-600 text-xs sm:text-sm font-normal leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Trigger Component */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />
    </section>
  );
}
