"use client";

import { useState, useEffect } from "react";
import { X, Rocket, Sparkles, CheckCircle2, Loader2, Info } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** When set, submits email to /api/experts/launch-notify */
  notifySource?: string;
  interest?: string;
  workspaceId?: number | string | null;
  city?: string;
}

export default function ComingSoonModal({
  isOpen,
  onClose,
  title = "Feature Coming Soon!",
  description = "We are putting the finishing touches on this app and feature. Stay tuned for our official rollout!",
  notifySource,
  interest,
  workspaceId,
  city,
}: ComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setAlreadyRegistered(false);
      setError("");
      setEmail("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");

    try {
      if (notifySource) {
        const res = await fetch("/api/experts/launch-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmed,
            source: notifySource,
            interest: interest || title,
            city: city || undefined,
            workspaceId: workspaceId ? Number(workspaceId) : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Could not save your request.");
        }
        setAlreadyRegistered(Boolean(json.alreadyRegistered));
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        setError("");
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Rocket className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-extrabold text-[#0B132B] mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">{description}</p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-6 text-sm font-extrabold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all rounded-xl shadow-md cursor-pointer"
        >
          Got It
        </button>

        <p className="text-[11px] text-slate-400 mt-4">Powered by ANSH Apps</p>
      </div>
    </div>
  );
}
