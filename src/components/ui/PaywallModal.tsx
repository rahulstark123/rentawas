"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Zap, CheckCircle2, Lock, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  daysLeftInTrial?: number;
  isTrialExpired?: boolean;
}

export default function PaywallModal({
  isOpen,
  onClose,
  featureName = "Add New Item",
  daysLeftInTrial = 0,
  isTrialExpired = true,
}: PaywallModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push("/dashboard/billing");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 overflow-hidden"
        >
          {/* Top Decorative Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-gradient-to-br from-[#FF6B00] to-amber-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-100/80 text-[#FF6B00] font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-orange-200/80">
                <Sparkles className="w-3 h-3" />
                <span>{isTrialExpired ? "7-Day Free Trial Ended" : "RentAwas Pro Feature"}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Upgrade to RentAwas Pro Plan
              </h3>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 mb-6">
            <p className="leading-relaxed bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-slate-700 font-medium">
              Browsing and viewing your listings and dashboard is <strong className="text-emerald-600 font-bold">100% Free Forever</strong>! 
              {isTrialExpired ? (
                <span> Your 7-Day Free Trial has ended. To <strong>{featureName}</strong>, upgrade to the RentAwas Pro Plan.</span>
              ) : (
                <span> To <strong>{featureName}</strong> and unlock unlimited property operations, upgrade to the RentAwas Pro Plan.</span>
              )}
            </p>

            {/* Pro Plan Feature Checklist */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Included in RentAwas Pro Plan:
              </span>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Unlimited Property &amp; Rental Unit Additions</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Tenant Directory, Lease Agreements &amp; Rent Logs</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Maintenance Ticket Kanban &amp; Work Orders</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Multi-User Workspace Team Invitations</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>100 AI Legal &amp; Inspection Credits / Month</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white mb-6 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Starting at</span>
              <div className="text-xl font-extrabold text-white flex items-baseline gap-1">
                <span>$15</span>
                <span className="text-xs text-slate-300 font-normal">/ month</span>
                <span className="text-[11px] text-amber-400 font-bold ml-1">(or ₹1,249/mo)</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase rounded-lg border border-amber-500/30">
              Cancel Anytime
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleUpgrade}
              className="w-full sm:flex-1 py-3 px-5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Avail Pro Plan Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
