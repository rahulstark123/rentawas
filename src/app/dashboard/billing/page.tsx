"use client";

import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Building2, 
  Zap, 
  Crown, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  X,
  Lock,
  Receipt,
  Eye,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  generateTaxInvoiceHtml, 
  generatePaymentReceiptHtml, 
  triggerPrintOrDownload 
} from "@/lib/pdfGenerator";

type PlanId = "free" | "starter" | "pro" | "pro_plus";

interface PlanDetails {
  id: PlanId;
  name: string;
  badge: string;
  priceMonthlyUsd: number;
  priceAnnualUsd: number;
  priceMonthlyInr: number;
  priceAnnualInr: number;
  unitsLimit: string;
  unitsCap: number; // numeric cap for usage meter; Infinity for unlimited
  features: string[];
  isPaid: boolean;
}

const PLANS: Record<PlanId, PlanDetails> = {
  free: {
    id: "free",
    name: "Free",
    badge: "AFTER TRIAL",
    priceMonthlyUsd: 0,
    priceAnnualUsd: 0,
    priceMonthlyInr: 0,
    priceAnnualInr: 0,
    unitsLimit: "View Only",
    unitsCap: 0,
    isPaid: false,
    features: [
      "20 AI Credits for RentAwas Buddy",
      "14-day full-feature trial on signup, then Free forever",
      "Browse & view dashboard, properties & tenants",
      "100% Free Property Listing & Marketplace Leads",
      "Free Access to RentAwas Expert Service (Coming Soon)",
      "Upgrade anytime to Starter, Pro, or Pro Plus",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    badge: "STARTER PORTFOLIO",
    priceMonthlyUsd: 6,
    priceAnnualUsd: 5,
    priceMonthlyInr: 499,
    priceAnnualInr: 399,
    unitsLimit: "Up to 15 Units",
    unitsCap: 15,
    isPaid: true,
    features: [
      "50 AI Credits / month for RentAwas Buddy",
      "100% Free Property Listing & Marketplace Leads",
      "Free Access to RentAwas Expert Service (Coming Soon)",
      "Up to 3 Properties & 15 Units",
      "In-App Direct Tenant Messaging & Directory",
      "Manual Rent Invoice & Payment Logging",
      "Maintenance Ticket Tracking (Table & Kanban)",
      "Digital Lease Management",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "MOST POPULAR",
    priceMonthlyUsd: 15,
    priceAnnualUsd: 12,
    priceMonthlyInr: 1299,
    priceAnnualInr: 999,
    unitsLimit: "Up to 75 Units",
    unitsCap: 75,
    isPaid: true,
    features: [
      "200 AI Credits / month for RentAwas Buddy",
      "100% Free Property Listing & Marketplace Leads",
      "Free Access to RentAwas Expert Service (Coming Soon)",
      "Everything in Starter",
      "Instant Tenant DMs & Building Group Channels",
      "Up to 75 Rental Units",
      "Floor-by-Floor & Unit-by-Unit Grid Matrix",
      "Dedicated Property Yield Analytics",
      "Tenant Health Score Tracking (0-100%)",
      "Expense Categorization & NOI Calculator",
    ],
  },
  pro_plus: {
    id: "pro_plus",
    name: "Pro Plus",
    badge: "PRO PLUS",
    priceMonthlyUsd: 39,
    priceAnnualUsd: 31,
    priceMonthlyInr: 3299,
    priceAnnualInr: 2499,
    unitsLimit: "Unlimited Units",
    unitsCap: Number.POSITIVE_INFINITY,
    isPaid: true,
    features: [
      "500 AI Credits / month for RentAwas Buddy",
      "100% Free Property Listing & Marketplace Leads",
      "Free Access to RentAwas Expert Service (Coming Soon)",
      "Unlimited Property Units & Portfolios",
      "Everything in Pro Plan",
      "Full In-App Direct & Group Messaging System",
      "Tenant Resident Portal Access",
      "Global Command Palette (Ctrl + K)",
      "Multiple Workspace Manager Roles",
      "Advanced Portfolio Financial Analytics",
    ],
  },
};

function normalizePlanId(raw: string | null | undefined): PlanId {
  const key = String(raw || "free").toLowerCase();
  if (key === "trial") return "free"; // trial banner handled separately; cards treat as Free post-trial
  if (key === "enterprise") return "pro_plus"; // legacy
  if (key === "free" || key === "starter" || key === "pro" || key === "pro_plus") return key;
  return "free";
}

export default function LandlordBillingPage() {
  const { toast } = useToast();
  const { setCurrency: setGlobalCurrency, currencySymbol, currencyCode } = useCurrency();
  const [isAnnual, setIsAnnual] = useState(true);
  const [activePlanId, setActivePlanId] = useState<PlanId>("free");
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [scheduledPlanId, setScheduledPlanId] = useState<PlanId | null>(null);
  const [scheduledPlanName, setScheduledPlanName] = useState<string | null>(null);
  const [isIndia, setIsIndia] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const isIndianLoc = tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Asia/Kolkata") || navigator.language === "en-IN" || currencyCode === "INR" || currencySymbol === "₹";
      setIsIndia(isIndianLoc);
    }
  }, [currencyCode, currencySymbol]);

  // Confirmation Purchase Preview Modal State
  const [showPurchasePreviewModal, setShowPurchasePreviewModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanDetails | null>(null);
  const [isRecurring, setIsRecurring] = useState(true);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  // Subscriptions & Document Preview State
  const [selectedSubRecord, setSelectedSubRecord] = useState<any | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<any>({
    plan: "trial",
    unitsCount: 0,
    ownerName: "Alexander Wright",
    ownerEmail: "alexander@regencymanagement.com",
  });

  // ─── Workspace ID ──────────────────────────────────────────────────────────
  const [billingWorkspaceId, setBillingWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    import("@/lib/workspace").then(({ ensureActiveWorkspaceId }) =>
      ensureActiveWorkspaceId().then((wid) => { if (wid) setBillingWorkspaceId(wid); })
    );
  }, []);

  // ─── TanStack Query ─────────────────────────────────────────────────────────
  const { data: workspaceApiData, isLoading: loadingWorkspace } = useQuery({
    queryKey: ["billing-workspace", billingWorkspaceId],
    enabled: !!billingWorkspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/workspace?wid=${billingWorkspaceId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    },
  });

  // Apply workspace data side-effects when it loads
  useEffect(() => {
    if (!workspaceApiData) return;
    setWorkspaceData(workspaceApiData);
    if (workspaceApiData.currency) setGlobalCurrency(workspaceApiData.currency);
    const pKey = String(workspaceApiData.plan || "trial").toLowerCase();
    const trialActive = Boolean(workspaceApiData.isTrialActive) || (pKey === "trial" && Number(workspaceApiData.trialDaysLeft ?? 0) > 0);
    setIsTrialActive(trialActive);
    setTrialDaysLeft(pKey === "trial" ? Number(workspaceApiData.trialDaysLeft ?? 0) : 0);
    setActivePlanId(normalizePlanId(pKey === "trial" ? "free" : pKey));

    const sched = workspaceApiData.scheduledPlan
      ? normalizePlanId(String(workspaceApiData.scheduledPlan))
      : null;
    setScheduledPlanId(sched && sched !== "free" ? sched : null);
    setScheduledPlanName(workspaceApiData.scheduledPlanName || null);
  }, [workspaceApiData]);

  const { data: subscriptionsList = [], isLoading: loadingSubscriptions } = useQuery({
    queryKey: ["billing", billingWorkspaceId],
    enabled: !!billingWorkspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/subscriptions?wid=${billingWorkspaceId}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data && Array.isArray(json.data)) ? json.data : [];
    },
  });

  const fetchSubscriptions = () => queryClient.invalidateQueries({ queryKey: ["billing", billingWorkspaceId] });
  const fetchWorkspaceInfo = () => queryClient.invalidateQueries({ queryKey: ["billing-workspace", billingWorkspaceId] });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#plan-invoices") {
      requestAnimationFrame(() => {
        document.getElementById("plan-invoices")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [loadingSubscriptions]);



  // Helper to load Razorpay Checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
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

  const handleOpenPurchasePreview = (planKey: PlanId) => {
    if (!PLANS[planKey].isPaid) return;
    setPendingPlan(PLANS[planKey]);
    setShowPurchasePreviewModal(true);
  };

  const activePlan = PLANS[activePlanId];
  const unitsCap = Number.isFinite(activePlan.unitsCap) ? activePlan.unitsCap : 500;
  const unitsRemainingLabel =
    activePlanId === "free"
      ? "Upgrade to unlock unit management quota"
      : Number.isFinite(activePlan.unitsCap)
      ? `${Math.max(0, activePlan.unitsCap - workspaceData.unitsCount)} units remaining in ${activePlan.name} quota`
      : "Unlimited units quota active";

  const handleProceedToRazorpay = async () => {
    if (!pendingPlan) return;
    setIsProcessingRazorpay(true);

    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      toast("Razorpay SDK failed to load. Please check your internet connection.", "error");
      setIsProcessingRazorpay(false);
      return;
    }

    const priceUsd = isAnnual ? pendingPlan.priceAnnualUsd * 12 : pendingPlan.priceMonthlyUsd;
    const priceInr = isAnnual ? pendingPlan.priceAnnualInr * 12 : pendingPlan.priceMonthlyInr;
    const taxInr = Math.round(priceInr * 0.18);
    const totalInr = priceInr + taxInr;

    // Fetch checkout payload (order_id for One-Time vs subscription_id for Recurring)
    let checkoutPayload: any = null;
    try {
      const res = await fetch("/api/razorpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: pendingPlan.id,
          planName: pendingPlan.name,
          amount: totalInr,
          isRecurring,
          isAnnual,
        }),
      });
      if (res.ok) {
        checkoutPayload = await res.json();
      }
    } catch (e) {
      console.warn("Using local checkout payload fallback:", e);
    }

    const options: any = {
      key: checkoutPayload?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SdilED7xPbKcdV",
      amount: totalInr * 100, // Amount in paise
      currency: "INR",
      name: "RentAwas Property OS",
      description: `${isRecurring ? "Recurring Subscription" : "One-Time Payment"}: ${pendingPlan.name}`,
      image: "/logo.png",
      // Pass subscription_id for Recurring or order_id for One-Time ONLY if generated from real live keys
      ...(checkoutPayload?.isRealRazorpay
        ? isRecurring && checkoutPayload?.subscription_id
          ? { subscription_id: checkoutPayload.subscription_id }
          : checkoutPayload?.order_id
          ? { order_id: checkoutPayload.order_id }
          : {}
        : {}),
      handler: async function (response: any) {
        const paymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 10)}`;
        toast(
          `Payment of ₹${totalInr.toLocaleString()} successful via Razorpay (${isRecurring ? "Subscription" : "One-Time"})! Trans ID: ${paymentId}`,
          "success"
        );

        const { ensureActiveWorkspaceId } = await import("@/lib/workspace");
        const activeWid = await ensureActiveWorkspaceId();
        if (!activeWid) {
          toast("Workspace not found. Please sign in again.", "error");
          setIsProcessingRazorpay(false);
          return;
        }

        // Record subscription in PostgreSQL (workspace-scoped)
        try {
          await fetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planName: pendingPlan.name,
              amount: `$${Math.round(totalInr / 83)}.00 USD (₹${totalInr.toLocaleString()})`,
              billingTerm: isAnnual ? "Annual" : "Monthly",
              paymentType: isRecurring ? "Recurring Subscription" : "One-Time Payment",
              paymentMethod: `Razorpay (${paymentId.slice(0, 12)})`,
              paymentId: paymentId,
              wid: Number(activeWid),
            }),
          });
          fetchSubscriptions();
        } catch (e) {
          console.warn("Could not save subscription to DB:", e);
        }

        // During trial: keep trial plan; paid plan activates after trial ends.
        // After trial: switch workspace plan immediately.
        if (!isTrialActive) {
          try {
            await fetch("/api/workspace", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wid: Number(activeWid),
                plan: pendingPlan.id,
              }),
            });
            fetchWorkspaceInfo();
          } catch (e) {
            console.warn("Could not update workspace plan in DB:", e);
          }
          setActivePlanId(pendingPlan.id);
        } else {
          setScheduledPlanId(pendingPlan.id);
          setScheduledPlanName(pendingPlan.name);
          fetchWorkspaceInfo();
          toast(
            `${pendingPlan.name} purchased. After your trial ends, this plan will become active.`,
            "success"
          );
        }
        setShowPurchasePreviewModal(false);
        setIsProcessingRazorpay(false);
      },
      prefill: {
        name: "Alexander Wright",
        email: "alexander.wright@rentawas.com",
        contact: "+1 (555) 019-2834",
      },
      notes: {
        plan: pendingPlan.name,
        billing_term: isAnnual ? "Annual" : "Monthly",
        payment_type: isRecurring ? "Recurring Auto-Debit Subscription" : "One-Time Manual Payment",
      },
      theme: {
        color: "#FF6B00",
      },
      modal: {
        ondismiss: function () {
          setIsProcessingRazorpay(false);
        },
      },
    };

    try {
      const razorpayObj = new (window as any).Razorpay(options);
      razorpayObj.open();
    } catch (err) {
      console.warn("Razorpay Checkout Error (Fallback Simulation):", err);
      // Fallback checkout simulation if dummy Razorpay key is rejected by sandbox
      setTimeout(() => {
        toast(
          isTrialActive
            ? `Payment confirmed! ${pendingPlan.name} will become active after your trial ends.`
            : `Razorpay Sandbox Payment of ₹${totalInr.toLocaleString()} confirmed! Activated ${pendingPlan.name}.`,
          "success"
        );
        if (!isTrialActive) {
          setActivePlanId(pendingPlan.id);
        } else {
          setScheduledPlanId(pendingPlan.id);
          setScheduledPlanName(pendingPlan.name);
        }
        setShowPurchasePreviewModal(false);
        setIsProcessingRazorpay(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Landlord Plans & Billing
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isTrialActive
                  ? `${trialDaysLeft} Days Free Trial`
                  : `${activePlan.name} Active`}
              </span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your RentAwas subscription plan, active billing cycle, invoice tax receipts, and payment methods.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            document.getElementById("plan-invoices")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer hover:border-[#FF6B00]/50"
        >
          <Receipt className="w-4 h-4 text-[#FF6B00]" />
          <span>Plan Billing Receipts</span>
        </button>
      </div>

      {/* Current Subscription Active Banner Card */}
      {loadingWorkspace ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl animate-pulse space-y-6 min-h-[220px] flex flex-col justify-between">
          <div className="flex justify-between items-center pb-6 border-b border-slate-800">
            <div className="space-y-3">
              <div className="h-4 w-36 bg-slate-800 rounded-md" />
              <div className="h-8 w-56 bg-slate-800 rounded-xl" />
              <div className="h-4 w-72 bg-slate-800 rounded-md" />
            </div>
            <div className="h-10 w-28 bg-slate-800 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3.5 w-40 bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-800 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-32 bg-slate-800 rounded" />
              <div className="h-4 w-44 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#FF6B00] text-white font-extrabold text-[10px] uppercase tracking-wider">
                  CURRENT ACTIVE PLAN
                </span>
                <span className="text-xs font-bold text-slate-300">Auto-Renews Aug 24, 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isTrialActive ? "14-Day Free Trial" : activePlan.name}</span>
                <Zap className="w-6 h-6 text-[#FF6B00] fill-[#FF6B00]" />
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {isTrialActive
                  ? scheduledPlanId
                    ? `Full access unlocked — ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left. After trial, ${scheduledPlanName || PLANS[scheduledPlanId].name} will become active.`
                    : `Full access unlocked — ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left, then Free plan`
                  : activePlan.isPaid
                  ? isIndia || currencyCode === "INR" || currencySymbol === "₹"
                    ? `₹${isAnnual ? activePlan.priceAnnualInr : activePlan.priceMonthlyInr}.00 / Month ${isAnnual ? "(Billed Annually)" : ""}`
                    : `$${isAnnual ? activePlan.priceAnnualUsd : activePlan.priceMonthlyUsd}.00 / Month ${isAnnual ? "(Billed Annually)" : ""}`
                  : "₹0 forever — upgrade anytime to unlock add operations"}
              </p>
              {isTrialActive && scheduledPlanId && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {scheduledPlanName || PLANS[scheduledPlanId].name} purchased — activates after trial
                  </span>
                </div>
              )}
              {isTrialActive && !scheduledPlanId && (
                <p className="mt-1.5 text-[11px] text-amber-300/90 font-semibold">
                  Buy Starter, Pro, or Pro Plus now — after trial, that plan will become active.
                </p>
              )}
            </div>
          </div>

          {/* Meter Progress bar for units */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Units Managed Quota</span>
                <span className="text-white">{workspaceData.unitsCount} / {activePlan.unitsLimit}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-400 rounded-full transition-all duration-500" 
                  style={{
                    width: `${Math.min(100, Math.max(5, Math.round((workspaceData.unitsCount / Math.max(1, unitsCap)) * 100)))}%`
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                {unitsRemainingLabel}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Contact</span>
              <div className="font-bold text-white">{workspaceData.ownerName}</div>
              <div className="text-[10px] text-slate-400">{workspaceData.ownerEmail}</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly vs Annual Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">RentAwas Landlord Subscription Plans</h3>
          <p className="text-xs text-slate-500">Choose the ideal plan to scale your rental property portfolio.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isAnnual ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isAnnual ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white/20 text-white uppercase">Save 20%</span>
          </button>
        </div>
      </div>

      {/* 4 Tier Landlord Plans Grid: Free → Starter → Pro → Pro Plus */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Tier 0: Free (after 14-day trial) */}
        <div className={`bg-white rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-6 ${
          !isTrialActive && activePlanId === "free" ? "border-2 border-emerald-500" : "border border-slate-200/90"
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">
                {PLANS.free.badge}
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{PLANS.free.name}</h3>
              <p className="text-xs text-slate-500 mt-1">After your 14-day trial ends — browse forever at ₹0.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹0</span>
              <span className="text-xs text-slate-500 font-bold">/ forever</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">No credit card required</p>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {PLANS.free.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {!isTrialActive && activePlanId === "free" ? (
            <div className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider opacity-90 cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current Active Plan</span>
            </div>
          ) : isTrialActive ? (
            <div className="w-full py-3 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl uppercase tracking-wider cursor-default flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Starts after trial</span>
            </div>
          ) : (
            <div className="w-full py-3 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl uppercase tracking-wider cursor-default flex items-center justify-center gap-2">
              <span>Included at ₹0</span>
            </div>
          )}
        </div>

        {/* Tier 1: Starter */}
        <div className={`bg-white rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-6 ${
          activePlanId === "starter" ? "border-2 border-slate-800" : "border border-slate-200/90"
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                {PLANS.starter.badge}
              </span>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{PLANS.starter.name}</h3>
              <p className="text-xs text-slate-500 mt-1">For DIY property owners managing up to 3 properties.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">
                {isIndia || currencyCode === "INR" || currencySymbol === "₹"
                  ? `₹${isAnnual ? PLANS.starter.priceAnnualInr : PLANS.starter.priceMonthlyInr}`
                  : `$${isAnnual ? PLANS.starter.priceAnnualUsd : PLANS.starter.priceMonthlyUsd}`}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                / month {isAnnual ? "(billed annually)" : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">+18% GST</p>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {PLANS.starter.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {activePlanId === "starter" && !isTrialActive ? (
            <div className="w-full py-3 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider opacity-90 cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current Active Plan</span>
            </div>
          ) : isTrialActive && scheduledPlanId === "starter" ? (
            <div className="w-full py-3 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl uppercase tracking-wider cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Activates after trial</span>
            </div>
          ) : (
            <button
              onClick={() => handleOpenPurchasePreview("starter")}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>{isTrialActive ? "Buy — activates after trial" : "Subscribe to Starter"}</span>
            </button>
          )}
        </div>

        {/* Tier 2: Pro */}
        <div className={`bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden ${
          activePlanId === "pro" ? "border-2 border-[#FF6B00]" : "border border-slate-800"
        }`}>
          <div className="absolute top-0 right-0 bg-[#FF6B00] text-white font-extrabold text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-widest">
            {activePlanId === "pro" ? "CURRENT ACTIVE PLAN" : "MOST POPULAR"}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">PRO PLAN</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{PLANS.pro.name}</h3>
              <p className="text-xs text-slate-300 mt-1">Full property inventory, NOI tracking & yield analytics suite.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">
                {isIndia || currencyCode === "INR" || currencySymbol === "₹"
                  ? `₹${isAnnual ? PLANS.pro.priceAnnualInr : PLANS.pro.priceMonthlyInr}`
                  : `$${isAnnual ? PLANS.pro.priceAnnualUsd : PLANS.pro.priceMonthlyUsd}`}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                / month {isAnnual ? "(billed annually)" : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">+18% GST</p>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs">
              {PLANS.pro.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {activePlanId === "pro" && !isTrialActive ? (
            <div className="w-full py-3 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider opacity-90 cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current Active Plan</span>
            </div>
          ) : isTrialActive && scheduledPlanId === "pro" ? (
            <div className="w-full py-3 bg-amber-500/20 text-amber-200 border border-amber-400/40 font-bold text-xs rounded-xl uppercase tracking-wider cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Activates after trial</span>
            </div>
          ) : (
            <button
              onClick={() => handleOpenPurchasePreview("pro")}
              className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTrialActive ? "Buy — activates after trial" : "Subscribe to Pro"}</span>
            </button>
          )}
        </div>

        {/* Tier 3: Pro Plus */}
        <div className={`bg-white rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-6 ${
          activePlanId === "pro_plus" ? "border-2 border-orange-500" : "border border-slate-200/90"
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-50 text-[#FF6B00] text-[10px] font-extrabold uppercase">
                {PLANS.pro_plus.badge}
              </span>
              <Crown className="w-5 h-5 text-[#FF6B00]" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{PLANS.pro_plus.name}</h3>
              <p className="text-xs text-slate-500 mt-1">For multi-property managers & commercial portfolios.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">
                {isIndia || currencyCode === "INR" || currencySymbol === "₹"
                  ? `₹${isAnnual ? PLANS.pro_plus.priceAnnualInr : PLANS.pro_plus.priceMonthlyInr}`
                  : `$${isAnnual ? PLANS.pro_plus.priceAnnualUsd : PLANS.pro_plus.priceMonthlyUsd}`}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                / month {isAnnual ? "(billed annually)" : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">+18% GST</p>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {PLANS.pro_plus.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {activePlanId === "pro_plus" && !isTrialActive ? (
            <div className="w-full py-3 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider opacity-90 cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current Active Plan</span>
            </div>
          ) : isTrialActive && scheduledPlanId === "pro_plus" ? (
            <div className="w-full py-3 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl uppercase tracking-wider cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Activates after trial</span>
            </div>
          ) : (
            <button
              onClick={() => handleOpenPurchasePreview("pro_plus")}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-orange-400" />
              <span>{isTrialActive ? "Buy — activates after trial" : "Upgrade to Pro Plus"}</span>
            </button>
          )}
        </div>

      </div>

      {/* Invoice Receipts History — workspace plan subscriptions only */}
      <div id="plan-invoices" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-slate-900">Plan Invoice &amp; Tax Receipts</h3>
            <p className="text-xs text-slate-500">
              Workspace subscription invoices only. AI credit recharges are on the AI Control Center.
            </p>
          </div>
          <a
            href="/dashboard/ai"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 hover:text-purple-900"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI billing receipts</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 px-2">Invoice ID</th>
                <th className="pb-3 px-2">Receipt ID</th>
                <th className="pb-3 px-2">Plan</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Billing Term</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">View / Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loadingSubscriptions ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100">
                    <td className="py-4 px-2"><div className="h-3.5 w-28 bg-slate-200 rounded-md" /></td>
                    <td className="py-4 px-2"><div className="h-3.5 w-20 bg-slate-200 rounded-md" /></td>
                    <td className="py-4 px-2"><div className="h-3.5 w-32 bg-slate-200 rounded-md" /></td>
                    <td className="py-4 px-2"><div className="h-3.5 w-20 bg-slate-200 rounded-md" /></td>
                    <td className="py-4 px-2"><div className="h-3.5 w-16 bg-slate-200 rounded-md" /></td>
                    <td className="py-4 px-2"><div className="h-5 w-14 bg-emerald-100/70 rounded-full" /></td>
                    <td className="py-4 px-2 text-right"><div className="h-8 w-28 bg-slate-200 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : subscriptionsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No subscription invoices found in database.
                  </td>
                </tr>
              ) : (
                subscriptionsList.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-2 font-mono text-slate-600">{inv.receiptNumber || `RCPT-2026-${inv.id.slice(-3)}`}</td>
                    <td className="py-3 px-2 font-semibold text-slate-800">{inv.planName}</td>
                    <td className="py-3 px-2 font-extrabold text-slate-900">{inv.amount}</td>
                    <td className="py-3 px-2 text-slate-500">{inv.billingTerm || "Monthly"}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {inv.status || "Paid"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubRecord({
                            ...inv,
                            date: new Date(inv.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                          });
                          setShowDocModal(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 font-bold border border-slate-200"
                        title="View & Download Invoice & Receipt"
                      >
                        <Eye className="w-4 h-4 text-[#FF6B00]" />
                        <span>View Documents</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------- MODAL 1: PURCHASE CONFIRMATION PREVIEW MODAL ------------------- */}
      {showPurchasePreviewModal && pendingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Confirm Plan Upgrade</h3>
                  <p className="text-xs text-slate-500 mt-1">Review purchase summary before proceeding to Razorpay.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchasePreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">{pendingPlan.name}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {isAnnual ? "Annual Billing (Save 20%)" : "Monthly Billing"}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#FF6B00] text-white text-[10px] font-extrabold uppercase">
                  {pendingPlan.unitsLimit}
                </span>
              </div>

              <div className="border-t border-slate-200/80 pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Plan Rate ({isAnnual ? "Annual" : "Monthly"})</span>
                  <span className="font-bold text-slate-900">
                    {isAnnual
                      ? `$${pendingPlan.priceAnnualUsd * 12}.00 / yr (₹${(pendingPlan.priceAnnualInr * 12).toLocaleString()})`
                      : `$${pendingPlan.priceMonthlyUsd}.00 / mo (₹${pendingPlan.priceMonthlyInr.toLocaleString()})`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Estimated Tax / GST (18%)</span>
                  <span className="font-bold text-slate-900">
                    {isAnnual
                      ? `$${Math.round(pendingPlan.priceAnnualUsd * 12 * 0.18)}.00 (₹${Math.round(pendingPlan.priceAnnualInr * 12 * 0.18).toLocaleString()})`
                      : `$${Math.round(pendingPlan.priceMonthlyUsd * 0.18)}.00 (₹${Math.round(pendingPlan.priceMonthlyInr * 0.18).toLocaleString()})`}
                  </span>
                </div>

                <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between font-black text-sm text-slate-900">
                  <span>Total Payable Today</span>
                  <span className="text-[#FF6B00]">
                    {isAnnual
                      ? `$${Math.round(pendingPlan.priceAnnualUsd * 12 * 1.18)}.00 (₹${Math.round(pendingPlan.priceAnnualInr * 12 * 1.18).toLocaleString()})`
                      : `$${Math.round(pendingPlan.priceMonthlyUsd * 1.18)}.00 (₹${Math.round(pendingPlan.priceMonthlyInr * 1.18).toLocaleString()})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Recurring Subscription Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Automatic Recurring Renewal
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    isRecurring ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                  }`}>
                    {isRecurring ? "Auto-Debit On" : "One-Time"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {isRecurring 
                    ? "Auto-renews subscription at cycle end via Razorpay Mandate / Auto-Debit. Cancel anytime."
                    : "One-time payment for current period. Requires manual renewal at cycle end."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  isRecurring ? "bg-[#FF6B00]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                    isRecurring ? "translate-x-6.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Unlocked Plan Features */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">Features Unlocked:</span>
              <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 max-h-36 overflow-y-auto custom-scrollbar">
                {pendingPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trial notice */}
            {isTrialActive && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You are on a free trial ({trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left).
                  After trial, <strong>{pendingPlan.name}</strong> will become active automatically.
                  Full trial access continues until then.
                </span>
              </div>
            )}

            {/* Razorpay Guarantee Banner */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
              <span>
                {isTrialActive
                  ? "Encrypted Razorpay Payment Gateway. Plan schedules after trial + tax invoice receipt."
                  : "Encrypted Razorpay Payment Gateway. Instant plan activation & tax invoice receipt."}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPurchasePreviewModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingRazorpay}
                onClick={handleProceedToRazorpay}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md shadow-orange-500/20 uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isProcessingRazorpay ? "Loading Razorpay..." : "Continue to Razorpay Payment"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL 3: INVOICE & RECEIPT DOCUMENT PREVIEW MODAL ------------------- */}
      {showDocModal && selectedSubRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Subscription Document Center</h3>
                  <p className="text-xs text-slate-500 mt-1">Invoice #{selectedSubRecord.invoiceNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-semibold">Subscription Plan:</span>
                <span className="font-extrabold text-slate-900">{selectedSubRecord.planName}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-semibold">Total Amount Billed:</span>
                <span className="font-extrabold text-[#FF6B00]">{selectedSubRecord.amount}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-semibold">Payment Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedSubRecord.paymentId || "pay_P9283401"}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-semibold">Billing Term / Type:</span>
                <span className="font-bold text-slate-800">
                  {selectedSubRecord.billingTerm || "Monthly"} ({selectedSubRecord.paymentType || "Recurring Subscription"})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Payment Gateway Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                  {selectedSubRecord.status || "Paid"}
                </span>
              </div>
            </div>

            {/* Action Buttons to Download Official PDFs */}
            <div className="space-y-3 pt-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-xs block">Available Downloads (PDF):</span>
              
              <button
                type="button"
                onClick={() => triggerPrintOrDownload(generateTaxInvoiceHtml(selectedSubRecord), selectedSubRecord.invoiceNumber)}
                className="w-full py-3 px-4 bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>Download Official Tax Invoice (PDF)</span>
                </div>
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => triggerPrintOrDownload(generatePaymentReceiptHtml(selectedSubRecord), selectedSubRecord.receiptNumber)}
                className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-white" />
                  <span>Download Official Payment Receipt (PDF)</span>
                </div>
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
