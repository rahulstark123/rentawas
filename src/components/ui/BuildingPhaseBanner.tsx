"use client";

import { Zap } from "lucide-react";

export default function BuildingPhaseBanner() {
  return (
    <div className="w-full bg-[#0F172A] border-b border-orange-500/40 py-1.5 px-4 text-center font-sans text-[11px] sm:text-xs font-semibold text-white flex items-center justify-center gap-2.5 z-40 select-none shadow-md">
      <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs">
        <Zap className="w-2.5 h-2.5 fill-white text-white animate-pulse" />
        <span>Notice</span>
      </span>
      <span className="truncate max-w-full text-slate-200 font-medium tracking-wide">
        Currently the website is in building phase — some features may not work properly. Official launch coming soon!
      </span>
    </div>
  );
}
