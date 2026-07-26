"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Gift, Clock, Award } from "lucide-react";

interface EarlyAccessBannerProps {
  onOpenEarlyAccess: () => void;
}

export default function EarlyAccessBanner({ onOpenEarlyAccess }: EarlyAccessBannerProps) {
  // Target date: August 5th, 2026 at 23:59:59 IST
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-08-05T23:59:59+05:30").getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-10 bg-slate-900 text-white font-sans relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="bg-gradient-to-r from-[#0B132B] via-[#141E38] to-[#0B132B] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left Text Info */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-[#FF6B00]" />
              <span>Early Access Member Benefits</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Be an Early Adopter — Get Exclusive VIP Privileges
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Join the RentAwas Early Access Program today. Early members receive <strong>15% off lifetime subscription plans for ANSH Apps</strong>, <strong>free 1-on-1 priority onboarding</strong>, custom AI legal document templates, and direct feature request access.
            </p>

            {/* Benefit Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Gift className="w-4 h-4 text-[#FF6B00]" />
                <span>15% Extra Lifetime Discount on ANSH Apps</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>1 Free ANSH App Pro Subscription</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>500 Bonus AI Credits</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Free 1-on-1 VIP Setup</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Priority Support & Roadmap</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] rounded-xl font-extrabold">
                <Sparkles className="w-4 h-4 fill-[#FF6B00]" />
                <span>& Many More Perks!</span>
              </div>
            </div>
          </div>

          {/* Right Action Callout & Countdown Timer */}
          <div className="shrink-0 flex flex-col items-center text-center space-y-4">
            <button
              onClick={onOpenEarlyAccess}
              className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-orange-500/25 transition-all uppercase tracking-wider cursor-pointer group"
            >
              <span>Get Early Access Spot</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Live Countdown Clock (Valid Till 5th August) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2 text-center w-full max-w-xs shadow-inner">
              <div className="text-[11px] font-extrabold text-[#FF6B00] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
                <span>Offer Valid Till 5th August:</span>
              </div>

              <div className="flex items-center justify-center gap-2 font-mono">
                {/* Days */}
                <div className="flex flex-col items-center bg-slate-900/80 border border-white/10 px-2.5 py-1.5 rounded-xl min-w-[48px]">
                  <span className="text-sm sm:text-base font-black text-white">{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
                </div>
                <span className="text-xs font-bold text-slate-400">:</span>

                {/* Hours */}
                <div className="flex flex-col items-center bg-slate-900/80 border border-white/10 px-2.5 py-1.5 rounded-xl min-w-[48px]">
                  <span className="text-sm sm:text-base font-black text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
                </div>
                <span className="text-xs font-bold text-slate-400">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center bg-slate-900/80 border border-white/10 px-2.5 py-1.5 rounded-xl min-w-[48px]">
                  <span className="text-sm sm:text-base font-black text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
                </div>
                <span className="text-xs font-bold text-slate-400">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center bg-[#FF6B00]/20 border border-[#FF6B00]/40 px-2.5 py-1.5 rounded-xl min-w-[48px]">
                  <span className="text-sm sm:text-base font-black text-[#FF6B00] animate-pulse">{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="text-[9px] font-bold text-[#FF6B00] uppercase">Secs</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-semibold">
              ⚡ Limited to first 25 early adopters • No credit card required
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
