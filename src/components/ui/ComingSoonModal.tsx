"use client";

import { useState } from "react";
import { X, Rocket, Sparkles, CheckCircle2 } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function ComingSoonModal({
  isOpen,
  onClose,
  title = "Feature Coming Soon!",
  description = "We are putting the finishing touches on the RentAwas platform. Enter your email below to get priority early access and exclusive launch updates.",
}: ComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Rocket className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-extrabold text-[#0B132B] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {/* Form or Submitted Confirmation */}
        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-semibold animate-in zoom-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>You&apos;re on the priority waitlist!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email..."
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/40 focus:border-[#FF6B00] transition-all text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="w-full py-3 px-6 text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Priority Early Access</span>
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-400 mt-4">
          Powered by ANSH Apps • No spam ever.
        </p>
      </div>
    </div>
  );
}
