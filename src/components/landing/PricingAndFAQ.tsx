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
  ChevronDown,
  Building2,
  TrendingUp,
  Search,
  MessageSquareHeart,
  Handshake
} from "lucide-react";
import { 
  IconCloudStorage, 
  IconMobileDevice, 
  IconBankSecurity 
} from "@/components/ui/CustomIcons";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import FeedbackModal from "@/components/ui/FeedbackModal";

export default function PricingAndFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Free Trial Registration");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const triggerModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const includedFeatures = [
    { icon: Building2, label: "100% Free Property Listing (Zero Brokerage)" },
    { icon: IconCloudStorage, label: "Cloud Workspace Ledgers" },
    { icon: Building2, label: "Floor & Unit Inventory Matrix" },
    { icon: TrendingUp, label: "Net Operating Income (NOI)" },
    { icon: Users, label: "Tenant Resident Portal" },
    { icon: Wrench, label: "Maintenance Board & Kanban" },
    { icon: FileText, label: "Digital Lease Documents" },
    { icon: Search, label: "Global Command Search (Ctrl+K)" },
  ];

  const faqs = [
    {
      q: "Is property listing really 100% free on RentAwas?",
      a: "Yes! You can list unlimited vacant apartments, flats, PG beds, and commercial properties on RentAwas for 100% free with zero broker commissions and direct tenant inquiry leads.",
    },
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
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹499</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">+18% GST</p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
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
                  <span>Tenant Management & Profiles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Rent Collection & Payment Logs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Maintenance Ticket Tracking</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Digital Lease Management</span>
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
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹999</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">+18% GST</p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Unlimited Properties</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Up to 75 Rental Units</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Floor-by-Floor Unit Matrix</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Dedicated Property Yield Analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Tenant Health Score Tracking</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Expense & Net Operating Income (NOI)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Multi-Period Fiscal Year Filtering</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-purple-700">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>100 AI Credits / month</span>
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
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹1,999</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">+18% GST</p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
                <li className="flex items-center gap-2.5 font-extrabold text-[#FF6B00] bg-orange-50/80 px-2.5 py-1 rounded-lg border border-orange-200/60">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Priority Property Listing (Featured Top Badge)</span>
                </li>
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
                  <span>Tenant Resident Portal Access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Global Command Palette (Ctrl + K)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multiple Workspace Manager Roles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Advanced Portfolio Analytics</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-purple-700">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>500 AI Credits / month</span>
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

        {/* Feedback Section Right Below FAQ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mt-16 bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 rounded-2xl md:rounded-3xl p-8 sm:p-10 text-center text-white shadow-xl border border-slate-800 relative overflow-hidden group"
        >
          {/* Subtle Glow Background Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
              <MessageSquareHeart className="w-6 h-6" />
            </div>

            <h3 
              className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Your Feedback is Important to Us
            </h3>

            <p className="text-slate-300 font-normal text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
              We are constantly striving to make RentAwas better for landlords and tenants. Have a feature request, suggestion, or feedback? We’d love to hear from you.
            </p>

            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Share Your Feedback</span>
            </button>
          </div>
        </motion.div>

        {/* RentAwas Partner Program Section Right Below FAQ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-3xl mx-auto mt-8 bg-gradient-to-r from-orange-950 via-slate-900 to-orange-950 rounded-2xl md:rounded-3xl p-8 sm:p-10 text-center text-white shadow-xl border border-orange-500/20 relative overflow-hidden group"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF6B00]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
              <Handshake className="w-6 h-6" />
            </div>

            <h3 
              className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Want to Become a RentAwas Partner?
            </h3>

            <p className="text-slate-300 font-normal text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
              Expand your real estate agency, channel partner firm, or property technology network. Join the RentAwas Partner Program for referral commissions, co-branded solutions, and priority enrollment.
            </p>

            <button
              onClick={() => triggerModal("RentAwas Partner Program Enrollment")}
              className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Handshake className="w-4 h-4" />
              <span>Partner Program</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal Trigger Component */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />

      {/* Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </section>
  );
}
