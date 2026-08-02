"use client";

import { useState } from "react";
import { Zap, X, CreditCard, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AiCreditsExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsUsed?: number;
  creditLimit?: number;
  plan?: string;
  onRecharged?: () => void;
}

export default function AiCreditsExhaustedModal({
  isOpen,
  onClose,
  creditsUsed = 20,
  creditLimit = 20,
  plan = "free",
  onRecharged,
}: AiCreditsExhaustedModalProps) {
  const { toast } = useToast();
  const [selectedPack, setSelectedPack] = useState<"starter" | "pro" | "pro_plus">("pro");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async () => {
    setIsProcessing(true);
    try {
      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        toast("Active workspace not found. Please refresh.", "error");
        setIsProcessing(false);
        return;
      }

      const packDetails = {
        starter: { amount: 199, credits: 100, name: "🚀 Starter Pack (100 AI Credits)" },
        pro: { amount: 499, credits: 300, name: "⭐ Pro Pack (300 AI Credits)" },
        pro_plus: { amount: 999, credits: 700, name: "💎 Pro+ Pack (700 AI Credits)" },
      }[selectedPack] || { amount: 199, credits: 100, name: "Starter Pack" };

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast("Failed to load Razorpay payment SDK. Please check your network.", "error");
        setIsProcessing(false);
        return;
      }

      // Use Live Razorpay Key ID from environment configuration
      let keyToUse = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SdilED7xPbKcdV";
      try {
        const keyRes = await fetch(`/api/workspace/payment-gateways?wid=${activeWid}`);
        if (keyRes.ok) {
          const keyJson = await keyRes.json();
          if (keyJson.data?.razorpayKeyId) {
            keyToUse = keyJson.data.razorpayKeyId;
          }
        }
      } catch {}

      const options = {
        key: keyToUse,
        amount: packDetails.amount * 100, // in paise
        currency: "INR",
        name: "RentAwas Buddy AI",
        description: packDetails.name,
        image: "/logo.png",
        handler: async function (response: any) {
          try {
            const res = await fetch("/api/ai/recharge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workspaceId: activeWid,
                pack: selectedPack,
                addCredits: packDetails.credits,
                paymentId: response.razorpay_payment_id || "rzp_paid",
              }),
            });

            if (!res.ok) {
              const json = await res.json();
              toast(json.error || "Failed to add credits.", "error");
              setIsProcessing(false);
              return;
            }

            toast(`🎉 Payment Successful! +${packDetails.credits} AI Credits added to workspace.`, "success");

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("ai-credits-updated"));
            }

            if (onRecharged) onRecharged();
            onClose();
          } catch {
            toast("Payment processed, but error updating credits. Contact support.", "error");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "Workspace Manager",
          email: "landlord@rentawas.com",
          contact: "+91 98765 43210",
        },
        theme: {
          color: "#7C3AED",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast(`Razorpay Payment Failed: ${response.error?.description || "Transaction declined"}`, "error");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay recharge error:", err);
      toast("Could not launch Razorpay checkout.", "error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-violet-700 p-6 text-white text-center relative overflow-hidden">
          {/* Background Decorative Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Zap className="w-7 h-7 text-amber-300 fill-amber-300/20" />
          </div>

          <h3 className="text-xl font-black tracking-tight leading-snug">
            Your AI Credits are finished!
          </h3>
          <p className="text-xs text-purple-100 font-semibold mt-1 max-w-xs mx-auto">
            You have used all {creditsUsed}/{creditLimit} AI credits. Please recharge now to continue using RentAwas Buddy.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              Select AI Credit Pack to Recharge:
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: "starter",
                  title: "🚀 Starter",
                  credits: "100 Credits",
                  price: "₹199",
                  sub: "Ideal for individual landlords",
                  badge: null,
                },
                {
                  id: "pro",
                  title: "⭐ Pro",
                  credits: "300 Credits",
                  price: "₹499",
                  sub: "Best for growing property portfolios",
                  badge: "POPULAR",
                },
                {
                  id: "pro_plus",
                  title: "💎 Pro+",
                  credits: "700 Credits",
                  price: "₹999",
                  sub: "For property managers & agencies",
                  badge: "BEST VALUE",
                },
              ].map((pack) => {
                const isSelected = selectedPack === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPack(pack.id as any)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-violet-600 bg-violet-50/70 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{pack.title}</span>
                          {pack.badge && (
                            <span className="px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full uppercase tracking-wider">
                              {pack.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{pack.sub}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">{pack.price}</div>
                      <div className="text-[10px] font-extrabold text-violet-700">{pack.credits}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Highlights */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 font-medium space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant AI Activation:</span>
            </div>
            <p className="leading-relaxed">
              Credits are instantly credited to your RentAwas workspace and never expire within your active subscription cycle.
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleRecharge}
              disabled={isProcessing}
              className="flex-1 py-3 px-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Recharge AI Credits Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
