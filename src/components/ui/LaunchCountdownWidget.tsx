"use client";

import { useState, useEffect } from "react";
import { Rocket, X, Sparkles, ChevronDown, Clock } from "lucide-react";

export default function LaunchCountdownWidget() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // Clear old dismiss setting if set
    localStorage.removeItem("rentawas_launch_widget_dismissed");

    // Check localStorage if previously minimized
    const savedMinimized = localStorage.getItem("rentawas_launch_widget_minimized");
    if (savedMinimized === "true") {
      setIsMinimized(true);
    }

    // Target: August 2, 2026 19:00:00 IST (19:00 IST = UTC+5:30)
    const targetDate = new Date("2026-08-02T19:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
    localStorage.setItem("rentawas_launch_widget_minimized", "true");
  };

  const handleExpand = () => {
    setIsMinimized(false);
    localStorage.setItem("rentawas_launch_widget_minimized", "false");
  };

  // Minimized pill view
  if (isMinimized) {
    return (
      <div className="fixed top-28 sm:top-32 right-4 sm:right-6 z-40">
        <button
          onClick={handleExpand}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 border border-orange-500/50 text-white shadow-xl hover:border-orange-500 transition-all cursor-pointer backdrop-blur-md group"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
          <Rocket className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Launch: 2 Aug 7PM IST
          </span>
          <span className="text-[11px] font-mono text-[#FF6B00] bg-orange-500/10 px-2 py-0.5 rounded-md font-bold">
            {timeLeft.days}d {timeLeft.hours}h
          </span>
        </button>
      </div>
    );
  }

  // Full Overlay Sticky Note Box
  return (
    <div className="fixed top-28 sm:top-32 right-4 sm:right-6 z-40 max-w-xs sm:max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Outer Glowing Energy Border */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00]/40 via-amber-500/30 to-[#FF6B00]/40 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        <div className="relative bg-slate-900/95 border-2 border-orange-500/40 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 text-white">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#FF6B00] shrink-0">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest block leading-none">
                  Official Launch
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
                  2 Aug 7PM IST
                </h4>
              </div>
            </div>

            {/* Action: Minimize Only */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                title="Minimize"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Countdown Timer Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#FF6B00] font-mono leading-none block">
                {timeLeft.days}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-wider mt-1">
                Days
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#FF6B00] font-mono leading-none block">
                {timeLeft.hours}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-wider mt-1">
                Hours
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#FF6B00] font-mono leading-none block">
                {timeLeft.minutes}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-wider mt-1">
                Mins
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#FF6B00] font-mono leading-none block">
                {timeLeft.seconds}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-wider mt-1">
                Secs
              </span>
            </div>
          </div>

          {/* Footer status line */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Counting down to launch
            </span>
            <span className="font-extrabold text-[#FF6B00]">RentAwas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
