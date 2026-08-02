"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Users,
  Target,
  Compass,
  Rocket,
  Award,
  Zap,
  Heart,
  CheckCircle2,
  ArrowRight,
  Globe,
  Laptop,
  Cpu,
  Coins,
  ChevronRight,
  Wrench,
  Lock,
  MessageSquareHeart,
  Layers
} from "lucide-react";

export default function AboutUsPage() {
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar variant="dark" />

      {/* HERO SECTION */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 bg-[#0B132B] text-white border-b border-slate-800 overflow-hidden">
        {/* Glow backdrop accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-[#FF6B00]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Initiative Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 border border-orange-500/40 shadow-lg">
            <Sparkles className="w-4 h-4 text-[#FF6B00] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">
              An Initiative by ANSH Apps
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Reimagining Property Operations <br />
            <span className="text-[#FF6B00]">For Landlords &amp; Residents Worldwide.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 font-medium text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            RentAwas is built to eliminate friction from real estate ecosystems. From 0% landlord fee rent automation to digital lease agreements and doorstep expert dispatches, we empower modern property owners to operate with maximum precision.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEarlyAccessOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-orange-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Early Access / Join RentAwas →</span>
            </button>

            <Link
              href="/vision"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-extrabold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4 text-[#FF6B00]" />
              <span>Explore Our Future Vision</span>
            </Link>
          </div>

          {/* Impact Stats Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-[#FF6B00]">0%</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Landlord Fee Rent Collection</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">100%</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Digital Lease Storage</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">24/7</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Maintenance Ticketing</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-center h-full">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">ANSH Apps</span>
              <span className="text-xs font-bold text-slate-400 block mt-1">Parent Technology Studio</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 1: THE STORY BEHIND RENTAWAS & ANSH APPS */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Content Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Our Genesis &amp; Purpose</span>
              </div>

              <h2
                className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Built to Modernize Property Management from the Ground Up.
              </h2>

              <div className="space-y-4 text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                <p>
                  <strong>RentAwas</strong> was born out of a clear realization: traditional property management across residential flats, PG accommodations, hostels, and commercial units is bogged down by manual record-keeping, delayed rent collections, cash disputes, and fragmented technician calls.
                </p>
                <p>
                  As an initiative proudly crafted by <strong>ANSH Apps</strong>, RentAwas bridges this divide. We combine modern SaaS dashboard engineering with instant payment gateway processing, automated lease documentation, and smart maintenance ticket dispatches.
                </p>
                <p>
                  Whether you are an owner managing a single rental flat or an operator managing multi-unit PG complexes and commercial floors, RentAwas provides the mission control you need to scale effortless passive yield.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>High-Performance SaaS Architecture</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Backed by ANSH Apps Engineering</span>
                </div>
              </div>
            </div>

            {/* Visual Card Right */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF6B00]/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Globe className="w-7 h-7" />
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Parent Company</span>
                  <h3 className="text-2xl font-extrabold text-white">ANSH Apps</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    ANSH Apps is a premier software technology organization dedicated to engineering intuitive, high-performance web applications and SaaS platforms that solve real-world problems.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Website: anshapps.com</span>
                  <a
                    href="https://anshapps.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                  >
                    <span>Visit ANSH Apps</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: OUR 4 CORE PILLARS */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-[#FF6B00] text-xs font-black uppercase tracking-wider mx-auto">
              <Layers className="w-4 h-4" />
              <span>Platform Foundations</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              The 4 Pillars of <span className="text-[#FF6B00]">RentAwas</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Every feature in our platform is engineered around speed, transparency, security, and effortless ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">0% Landlord Fee Rent Automation</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Direct UPI payment integration (GPay, PhonePe, Paytm) with zero platform commissions for landlords, automated bill generation, and instant payment receipts.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-[#FF6B00]">
                Zero Friction Payouts
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Digital Lease &amp; Tenant Verification</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Instant rental agreement generation, digital signature logging, secure Aadhaar/PAN identity document vaults, and automated tenancy notices.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-emerald-600">
                Encrypted Vault Storage
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/70 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Doorstep Expert Maintenance</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  On-demand dispatch of background-checked local technicians for plumbing, electrical, AC servicing, and carpentry work with live status tracking.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-blue-600">
                Verified Technician Network
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100/70 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">AI-Powered Financial Insights</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Automated expense extraction, AI utility invoice scanning, real-time Net Operating Income (NOI) analytics, and multi-currency support.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-purple-600">
                Intelligent Operations
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: ANSH APPS PHILOSOPHY & VALUES */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Excellence in Product Design</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                We believe enterprise property tools should feel clean, intuitive, and fast. ANSH Apps designs software that requires zero complex training.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Privacy &amp; Security First</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Your lease data and payment credentials are sacred. We implement bank-grade AES-256 encryption at rest, TLS 1.3 in transit, and strict multi-tenant isolation.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Human-Centric Ecosystem</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                By serving landlords, property managers, tenants, and maintenance technicians equally, RentAwas builds trust across the entire rental lifespan.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION */}
      <section className="py-20 bg-[#0B132B] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 p-10 sm:p-14 rounded-3xl shadow-2xl">
          
          <div className="w-16 h-16 rounded-3xl bg-orange-500/20 border border-orange-500/40 text-[#FF6B00] flex items-center justify-center font-bold mx-auto shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">An Initiative by ANSH Apps</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Rental Operations?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
              Join property owners, PG operators, and tenants who trust RentAwas for automated rent collection, lease administration, and doorstep expert dispatches.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEarlyAccessOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-orange-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started with RentAwas →</span>
            </button>

            <a
              href="mailto:support.rentawas@anshapps.com"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-extrabold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>Contact ANSH Apps Team</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Early Access Modal */}
      <EarlyAccessModal
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
      />
    </main>
  );
}
