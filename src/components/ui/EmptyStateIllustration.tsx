"use client";

import { Receipt, Sparkles, Plus, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export default function EmptyStateIllustration({
  title = "No Rent Payments Logged Yet",
  description = "When tenants pay monthly rent or when you log payment collections, live financial telemetry will automatically appear here.",
  actionText = "Record Rent Payment",
  actionHref = "/dashboard/payments",
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="py-10 px-4 text-center space-y-5 max-w-md mx-auto my-2 font-sans">
      
      {/* Static Crisp Graphic Center */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        
        {/* Soft Static Ambient Glow Ring */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-amber-500/25 rounded-full blur-xl" />

        {/* Static Outer Border Ring */}
        <div className="absolute inset-2 border-2 border-orange-400/25 rounded-full" />

        {/* Center Main Icon Container - Static Solid Badge */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-3xl p-4 text-white shadow-xl shadow-orange-500/20 flex items-center justify-center border border-white/20">
          <Receipt className="w-10 h-10 stroke-[1.8]" />
        </div>

        {/* Static Top-Right Sparkle Badge */}
        <div className="absolute -top-1 -right-1 p-2 bg-white text-purple-600 rounded-2xl shadow-md border border-purple-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 fill-purple-100" />
        </div>

        {/* Static Bottom-Left Dollar Badge */}
        <div className="absolute -bottom-1 -left-1 p-2 bg-emerald-500 text-white rounded-2xl shadow-md border border-emerald-400 flex items-center justify-center">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* Text Hierarchy */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF6B00] border border-orange-200/80 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>No Transactions Yet</span>
        </div>

        <h4 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
          {title}
        </h4>

        <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {/* CTA Button */}
      <div className="pt-2 flex justify-center">
        {onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        ) : (
          <Link
            href={actionHref}
            className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
