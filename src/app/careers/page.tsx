"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Briefcase,
  Sparkles,
  Mail,
  Building2,
  Users,
  Code2,
  Rocket,
  Heart,
  Globe,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Clock,
  Laptop
} from "lucide-react";

export default function CareersPage() {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [talentEmail, setTalentEmail] = useState("");

  const handleTalentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentEmail.trim()) return;
    setEmailSubmitted(true);
    setTimeout(() => {
      setTalentEmail("");
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar variant="dark" />

      {/* HERO BANNER SECTION */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 bg-[#0B132B] text-white border-b border-slate-800 overflow-hidden">
        {/* Glow backdrop accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-[#FF6B00]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
            <Briefcase className="w-4 h-4" />
            <span>Careers at RentAwas &amp; ANSH Apps</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Build the Future of <span className="text-[#FF6B00]">Real Estate Tech</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              We are on a mission to engineer high-performance property management software for landlords, managers, and tenants worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* NO OPEN ROLES ANNOUNCEMENT CARD */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-8 sm:p-14 shadow-md text-center space-y-8 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-[#FF6B00] to-orange-500" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-3xl bg-orange-100 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold mx-auto shadow-xs">
            <Briefcase className="w-8 h-8" />
          </div>

          {/* Main Status Text */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
              Current Hiring Status
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              As of now, no open roles are available.
            </h2>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              We are currently not actively hiring for any open positions. However, our team at <strong>ANSH Apps</strong> is always growing and looking out for exceptional software engineers, designers, and product leaders.
            </p>
          </div>

          {/* Talent Pool Form */}
          <div className="pt-4 max-w-lg mx-auto bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>Join Our Future Talent Network</span>
              </h3>
              <p className="text-xs text-slate-500">
                Leave your email below or send your resume to get notified first when new roles open up.
              </p>
            </div>

            {emailSubmitted ? (
              <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thank you! We&apos;ve added you to our future talent pool.</span>
              </div>
            ) : (
              <form onSubmit={handleTalentSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={talentEmail}
                  onChange={(e) => setTalentEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#FF6B00] font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Join Pool
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono">
              Or email your CV directly to: <a href="mailto:careers.rentawas@anshapps.com" className="text-[#FF6B00] underline font-bold">careers.rentawas@anshapps.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* WHY WORK WITH ANSH APPS / RENTAWAS */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Engineering Culture</span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Why Engineers &amp; Builders Love <span className="text-[#FF6B00]">ANSH Apps</span>
            </h2>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              While no active roles are open right now, here is what defines our working environment:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Modern Stack &amp; Craftsmanship</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                We work with cutting-edge technologies (Next.js, TypeScript, PostgreSQL, Prisma, TailwindCSS, Supabase) and prioritize clean code and exceptional UI design.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">High Impact &amp; Ownership</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every team member directly shapes core products used daily by landlords, property managers, and tenants across real-world rental ecosystems.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Autonomy &amp; Flexibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                We foster a results-driven environment that values deep focus work, open communication, and continuous personal growth.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B00] hover:underline"
            >
              <span>Learn more about ANSH Apps &amp; RentAwas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
