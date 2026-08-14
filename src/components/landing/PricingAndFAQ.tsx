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
  Handshake,
  ShieldCheck,
  CheckCircle2
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
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = {
    starter: { monthly: 499, annual: 399 },
    pro: { monthly: 1299, annual: 999 },
    proPlus: { monthly: 3299, annual: 2499 },
  };

  const formatInr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const starterPrice = isAnnual ? plans.starter.annual : plans.starter.monthly;
  const proPrice = isAnnual ? plans.pro.annual : plans.pro.monthly;
  const proPlusPrice = isAnnual ? plans.proPlus.annual : plans.proPlus.monthly;

  const triggerModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const includedFeatures = [
    { icon: Building2, label: "100% Free Property Listing (Zero Brokerage)" },
    { icon: MessageSquareHeart, label: "In-App Direct & Group Messaging System" },
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
      a: "Yes! Every new account gets a 14-day full-feature free trial. No credit card is required. When the trial ends, your workspace moves to the Free plan automatically.",
    },
    {
      q: "What happens after the trial ends?",
      a: "You stay on the Free plan forever for browsing and property listing. Upgrade anytime to Starter, Pro, or Pro Plus to unlock add operations and higher unit limits.",
    },
    {
      q: "Can I upgrade anytime?",
      a: "Absolutely. You can switch between Free, Starter, Pro, and Pro Plus at any time directly from your workspace billing settings with pro-rated billing.",
    },
    {
      q: "Can I cancel anytime and am I eligible for a refund?",
      a: "Yes, you can cancel your subscription at any time with one click from your billing dashboard. Please note that subscription cancellations are non-refundable — no full or pro-rated refunds will be issued for remaining time or unused quota, but your subscription will remain active until the end of your current billing period.",
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          {/* Category Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 border border-orange-200 text-[#FF6B00] text-xs font-black uppercase tracking-wider mb-3.5 shadow-2xs">
            <Building2 className="w-4 h-4" />
            <span>RentAwas Property Management Tool</span>
          </div>

          {/* Cormorant Garamond Heading */}
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B132B] tracking-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Simple Pricing for Property Management Tool
          </h2>
          {/* Inter Description */}
          <p className="text-slate-600 font-normal text-base sm:text-lg mt-4 leading-relaxed font-sans">
            Start with a 14-day free trial. After it ends, stay on Free forever — or upgrade to Starter, Pro, or Pro Plus.
            <span className="font-bold text-slate-800 block mt-1">
              Property Listing is <span className="text-emerald-600 font-extrabold">100% FREE</span> for all landlords. No credit card required.
            </span>
          </p>

          {/* Monthly vs Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 p-1.5 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isAnnual ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                  isAnnual ? "bg-white/20 text-white" : "bg-orange-100 text-[#FF6B00]"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* 4 Pricing Cards Grid: Free → Starter → Pro → Pro Plus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch mb-24 font-sans">
          {/* Card 1: Free */}
          <motion.div 
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl md:rounded-2xl p-7 sm:p-8 border border-emerald-200/80 card-shadow card-shadow-hover transition-all flex flex-col justify-between"
          >
            <div>
              <h3 
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Free
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                After your 14-day trial ends
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹0</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/forever</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">No credit card required</p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>14-day full-feature trial on signup</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-orange-700">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>20 AI Credits for RentAwas Buddy</span>
                </li>
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Browse & view dashboard forever</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>View properties, tenants & ledgers</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Upgrade anytime to unlock ops</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Start 14-Day Free Trial")}
              className="w-full text-center text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors py-3 rounded-lg cursor-pointer uppercase tracking-wider"
            >
              Start Free Trial
            </button>
          </motion.div>

          {/* Card 2: Starter */}
          <motion.div 
            custom={1}
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
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{formatInr(starterPrice)}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">
                {isAnnual ? `+18% GST · billed annually` : `+18% GST`}
              </p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Free Access to RentAwas Expert Service (Coming Soon)</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-orange-700">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>50 AI Credits / month for RentAwas Buddy</span>
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
                  <span>Tenant Management & Messaging Directory</span>
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
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Starter Plan Free Trial")}
              className="w-full text-center text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors py-3 rounded-lg cursor-pointer uppercase tracking-wider"
            >
              Start Free Trial
            </button>
          </motion.div>

          {/* Card 3: Pro (Most Popular) */}
          <motion.div 
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="bg-white rounded-xl md:rounded-2xl p-7 sm:p-8 border-2 border-[#FF6B00] shadow-lg relative flex flex-col justify-between lg:-translate-y-2"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-xs">
              Most Popular
            </div>
            <div>
              <h3 
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Pro
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Best for PG Owners & Apartment Owners
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{formatInr(proPrice)}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">
                {isAnnual
                  ? `+18% GST · ${formatInr(plans.pro.monthly)}/mo if billed monthly`
                  : `+18% GST · ${formatInr(plans.pro.annual)}/mo billed annually`}
              </p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Free Access to RentAwas Expert Service (Coming Soon)</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Up to 75 Rental Units</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Floor-by-Floor Unit Matrix</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Property Yield Analytics & NOI</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Tenant Health Score Tracking</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-orange-700">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>200 AI Credits / month for RentAwas Buddy</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Pro Plan Free Trial")}
              className="w-full text-center text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all py-3 rounded-lg shadow-xs hover:shadow-sm cursor-pointer uppercase tracking-wider"
            >
              Start Free Trial
            </button>
          </motion.div>

          {/* Card 4: Pro Plus */}
          <motion.div 
            custom={3}
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
                Pro Plus
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Best for Property Managers & Portfolios
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{formatInr(proPlusPrice)}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">/month</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-6">
                {isAnnual
                  ? `+18% GST · ${formatInr(plans.proPlus.monthly)}/mo if billed monthly`
                  : `+18% GST · ${formatInr(plans.proPlus.annual)}/mo billed annually`}
              </p>
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5 font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free Property Listing</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Free Access to RentAwas Expert Service (Coming Soon)</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Rental Units</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tenant Resident Portal Access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multiple Workspace Manager Roles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Advanced Portfolio Analytics</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-orange-700">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>500 AI Credits / month for RentAwas Buddy</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerModal("Pro Plus Plan Free Trial")}
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

        {/* Trust & Compliance / ANSH Apps Section (Right Above FAQ) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto mb-20 bg-[#0B132B] rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden group font-sans"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] font-black uppercase tracking-wider shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Trust &amp; Compliance</span>
              </div>

              <div>
                <h3 
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight flex flex-wrap items-baseline gap-x-3 gap-y-1"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  <span>
                    <span className="text-white">Rent</span>
                    <span className="text-[#FF6B00]">Awas</span>
                  </span>
                  <span className="text-slate-400 font-light text-2xl sm:text-3xl md:text-4xl">—</span>
                  <span className="text-slate-100 font-semibold text-2xl sm:text-3xl md:text-4xl">
                    A product of ANSH Apps
                  </span>
                </h3>
                <p className="text-base sm:text-lg font-bold text-[#FF6B00] mt-1">
                  Software that solves everyday problems.
                </p>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                <strong className="text-white">RentAwas</strong> is a proud product of <strong className="text-white">ANSH Apps</strong> — a Government of India MSME-registered software company building modern products across industries for businesses and people worldwide.
              </p>
            </div>

            {/* Right Cards Column */}
            <div className="lg:col-span-5 space-y-3.5 text-left">
              {/* Card 1: MSME */}
              <div className="p-4 sm:p-4.5 bg-[#141A26] border border-slate-800/90 rounded-2xl flex items-center gap-3.5 hover:border-emerald-500/40 transition-all shadow-md group/card">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover/card:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">MSME Registered Enterprise</h4>
                  <p className="text-xs text-slate-400 font-medium">Government of India Udyam Registered</p>
                </div>
              </div>

              {/* Card 2: Udyam No */}
              <div className="p-4 sm:p-4.5 bg-[#141A26] border border-slate-800/90 rounded-2xl flex items-center gap-3.5 hover:border-blue-500/40 transition-all shadow-md group/card">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover/card:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">UDYAM REGISTRATION NUMBER</span>
                  <span className="text-sm sm:text-base font-extrabold font-mono text-white tracking-wider">UDYAM-BR-23-0127857</span>
                </div>
              </div>

              {/* Card 3: GSTIN */}
              <div className="p-4 sm:p-4.5 bg-[#141A26] border border-slate-800/90 rounded-2xl flex items-center gap-3.5 hover:border-cyan-500/40 transition-all shadow-md group/card">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover/card:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">GSTIN</span>
                  <span className="text-sm sm:text-base font-extrabold font-mono text-white tracking-wider">10DIUPR1358M1ZP</span>
                </div>
              </div>
            </div>
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
