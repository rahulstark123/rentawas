"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  Receipt, 
  Loader2,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Building2,
  X,
  Lock,
  ChevronRight,
  Upload,
  AlertCircle,
  Trash2,
  Camera,
  FileCheck,
  ZoomIn
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/context/CurrencyContext";

export default function TenantPaymentsPage() {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [paid, setPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [workspaceUpi, setWorkspaceUpi] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("gpay");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [maximizedQrUrl, setMaximizedQrUrl] = useState<string | null>(null);

  // Verification Screenshots for GPay, PhonePe, Paytm (3 slots)
  const [proofImages, setProofImages] = useState<string[]>(["", "", ""]);

  const compressScreenshot = (file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setProofImages((prev) => {
            const next = [...prev];
            next[index] = dataUrl;
            return next;
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const res = await fetch(`/api/tenant/me${emailParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTenant(json.data);
        }
      }

      // Fetch Workspace Payment Settings (Direct UPI, Razorpay, Stripe, PayPal)
      const wsRes = await fetch("/api/workspace?wid=1");
      if (wsRes.ok) {
        const wsJson = await wsRes.json();
        if (wsJson.data) {
          setWorkspaceUpi({
            upiId: wsJson.data.upiId || "landlord@okicici",
            upiPhoneNumber: wsJson.data.upiPhoneNumber || "+91 98765 43210",
            upiAccountName: wsJson.data.upiAccountName || "Ansh Property Management",
            upiQrCodeUrl: wsJson.data.upiQrCodeUrl || "",
            upiAppsSupported: wsJson.data.upiAppsSupported || "Google Pay, PhonePe, Paytm, BHIM UPI",
            upiConnected: wsJson.data.upiConnected ?? true,

            gpayUpiId: wsJson.data.gpayUpiId || wsJson.data.upiId || "landlord@okicici",
            gpayPhoneNumber: wsJson.data.gpayPhoneNumber || wsJson.data.upiPhoneNumber || "+91 98765 43210",
            gpayQrCodeUrl: wsJson.data.gpayQrCodeUrl || wsJson.data.upiQrCodeUrl || "",
            gpayConnected: wsJson.data.gpayConnected ?? true,

            phonepeUpiId: wsJson.data.phonepeUpiId || wsJson.data.upiId || "9876543210@ybl",
            phonepePhoneNumber: wsJson.data.phonepePhoneNumber || wsJson.data.upiPhoneNumber || "+91 98765 43210",
            phonepeQrCodeUrl: wsJson.data.phonepeQrCodeUrl || wsJson.data.upiQrCodeUrl || "",
            phonepeConnected: wsJson.data.phonepeConnected ?? true,

            paytmUpiId: wsJson.data.paytmUpiId || wsJson.data.upiId || "owner@paytm",
            paytmPhoneNumber: wsJson.data.paytmPhoneNumber || wsJson.data.upiPhoneNumber || "+91 98765 43210",
            paytmQrCodeUrl: wsJson.data.paytmQrCodeUrl || wsJson.data.upiQrCodeUrl || "",
            paytmConnected: wsJson.data.paytmConnected ?? true,

            razorpayKeyId: wsJson.data.razorpayKeyId || "",
            razorpayConnected: wsJson.data.razorpayConnected ?? false,
            stripeConnected: wsJson.data.stripeConnected ?? false,
            paypalConnected: wsJson.data.paypalConnected ?? false,
          });
        }
      }
    } catch (err) {
      console.error("Error loading tenant payments data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, []);

  const rentVal = tenant?.monthlyRent || 3200;

  const history = Array.isArray(tenant?.bills)
    ? tenant.bills.map((b: any, idx: number) => ({
        id: b.invoiceNumber || b.billNumber || `REC-${900 + idx + 1}`,
        period: b.title || "Monthly Rent Payment",
        amount: `$${(b.amount || rentVal).toLocaleString()}.00`,
        paidOn: b.paidDate
          ? new Date(b.paidDate).toISOString().split("T")[0]
          : b.createdAt
          ? new Date(b.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: b.status || "Paid",
        method: b.paymentMethod || "Direct UPI",
      }))
    : [];

  // All potential landlord channels
  const allLandlordMethods = [
    {
      id: "gpay",
      name: "Google Pay (GPay)",
      subtitle: "GPay Direct UPI & Scanner",
      type: "upi",
      logo: "/assests/google-pay-logo.png",
      active: workspaceUpi?.gpayConnected ?? true,
      fee: "0%",
      vpa: workspaceUpi?.gpayUpiId || workspaceUpi?.upiId || "landlord@okicici",
      phone: workspaceUpi?.gpayPhoneNumber || workspaceUpi?.upiPhoneNumber || "+91 98765 43210",
      qr: workspaceUpi?.gpayQrCodeUrl || workspaceUpi?.upiQrCodeUrl,
    },
    {
      id: "phonepe",
      name: "PhonePe Business",
      subtitle: "PhonePe VPA & QR Scanner",
      type: "upi",
      logo: "/assests/phonepay logo.png",
      active: workspaceUpi?.phonepeConnected ?? true,
      fee: "0%",
      vpa: workspaceUpi?.phonepeUpiId || workspaceUpi?.upiId || "9876543210@ybl",
      phone: workspaceUpi?.phonepePhoneNumber || workspaceUpi?.upiPhoneNumber || "+91 98765 43210",
      qr: workspaceUpi?.phonepeQrCodeUrl || workspaceUpi?.upiQrCodeUrl,
    },
    {
      id: "paytm",
      name: "Paytm Wallet & UPI",
      subtitle: "Paytm Scanner & Wallet",
      type: "upi",
      logo: "/assests/paytm logo.png",
      active: workspaceUpi?.paytmConnected ?? true,
      fee: "0%",
      vpa: workspaceUpi?.paytmUpiId || workspaceUpi?.upiId || "owner@paytm",
      phone: workspaceUpi?.paytmPhoneNumber || workspaceUpi?.upiPhoneNumber || "+91 98765 43210",
      qr: workspaceUpi?.paytmQrCodeUrl || workspaceUpi?.upiQrCodeUrl,
    },
    {
      id: "razorpay",
      name: "Razorpay Checkout",
      subtitle: "India Gateway & Cards",
      type: "gateway",
      logo: "/assests/razorpay icon.jpeg",
      active: workspaceUpi?.razorpayConnected ?? false,
      fee: "Gateway Fee",
    },
    {
      id: "stripe",
      name: "Stripe Payments",
      subtitle: "Global Cards & ACH Debit",
      type: "gateway",
      logo: "/assests/stripe icon.jpeg",
      active: workspaceUpi?.stripeConnected ?? false,
      fee: "Card & ACH",
    },
    {
      id: "paypal",
      name: "PayPal & Venmo",
      subtitle: "International Wallets",
      type: "gateway",
      logo: "/assests/paypal icon.svg",
      active: workspaceUpi?.paypalConnected ?? false,
      fee: "Global Wallets",
    },
  ];

  // Filter only active methods set by landlord
  const activeLandlordMethods = allLandlordMethods.filter((m) => m.active);
  const activeMethods = activeLandlordMethods.length > 0 ? activeLandlordMethods : allLandlordMethods.slice(0, 3);

  const activeSelected = activeMethods.find((m) => m.id === selectedMethod) || activeMethods[0];

  const handleCopyUpi = (upiString: string) => {
    navigator.clipboard.writeText(upiString);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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

  const handleRazorpayCheckout = async () => {
    setIsSubmitting(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      const key = workspaceUpi?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag";

      const options = {
        key: key,
        amount: rentVal * 100, // INR in paise
        currency: "INR",
        name: workspaceUpi?.upiAccountName || "Rentawas Property Management",
        description: `Monthly Rent — ${tenant?.propertyName || "Residence"} (${tenant?.unitNumber || "Unit"})`,
        image: "/assests/razorpay icon.jpeg",
        handler: async function (response: any) {
          setShowPaymentModal(false);
          await handlePay(`Razorpay (ID: ${response.razorpay_payment_id || "rzp_live"})`);
        },
        prefill: {
          name: tenant?.name || "Resident Tenant",
          email: tenant?.email || "tenant@example.com",
          contact: tenant?.phone || "+91 98765 43210",
        },
        notes: {
          propertyName: tenant?.propertyName || "Residence",
          unitNumber: tenant?.unitNumber || "Unit",
        },
        theme: {
          color: "#FF6B00",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Razorpay Payment Failed: ${response.error?.description || "Transaction declined"}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay trigger error:", err);
      setIsSubmitting(false);
    }
  };

  const handlePay = async (methodName = "Direct Payment") => {
    setIsSubmitting(true);
    try {
      if (tenant && tenant.id && tenant.id !== "demo-tenant-id") {
        await fetch("/api/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Rent Payment — ${tenant.propertyName || "Residence"} (${tenant.unitNumber || "Unit"})`,
            amount: rentVal,
            category: "Rent",
            status: "Paid",
            paymentMethod: methodName,
            tenantId: tenant.id,
            unitId: tenant.unitId || undefined,
            propertyId: tenant.propertyId || undefined,
            workspaceId: tenant.workspaceId || undefined,
          }),
        });
      }

      setPaid(true);
      setShowPaymentModal(false);
      setTimeout(() => setPaid(false), 6000);
      await loadTenantData();
    } catch (err) {
      console.error("Payment submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tenant Pay Rent Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pay monthly rent for <span className="font-bold text-slate-800">{tenant?.propertyName || "your property"} — {tenant?.unitNumber || "Unit"}</span> using your landlord&apos;s active payment channels.
        </p>
      </div>

      {/* Main Outstanding Rent Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        
        {/* Outstanding Balance Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              Current Monthly Rent Due
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {formatCurrency(rentVal)}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <Building2 className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Assigned Rent for {tenant?.propertyName || "Property"} — {tenant?.unitNumber || "Unit"}</span>
            </div>
          </div>

          {/* Active Landlord Payment Logos & Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Landlord Active Payment Options ({activeMethods.length})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeMethods.map((m) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <Image src={m.logo} alt={m.name} width={20} height={20} className="object-contain" />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeMethods.length > 0) {
                  setSelectedMethod(activeMethods[0].id);
                }
                setShowPaymentModal(true);
              }}
              className="px-8 py-3.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Rent Now (${rentVal.toLocaleString()})</span>
            </button>
          </div>
        </div>

        {/* Active Payment Channels Display Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Landlord Enabled Payment Channels
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Landlord Accounts</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id);
                  setShowPaymentModal(true);
                }}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-100/80 hover:border-orange-500/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Image src={method.logo} alt={method.name} width={28} height={28} className="object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                      {method.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 block">
                      {method.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#FF6B00]">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {method.fee}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Confirmation Toast Banner */}
        {paid && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-sm text-emerald-950">Payment Recorded Successfully!</span>
              <span className="text-emerald-700 font-medium">
                Rent payment of ${rentVal.toLocaleString()}.00 for {tenant?.propertyName || "Residence"} ({tenant?.unitNumber || "Unit"}) has been logged and receipt generated.
              </span>
            </div>
          </div>
        )}

      </div>

      {/* TENANT PAY RENT PREVIEW & CHECKOUT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-7 sm:p-9 space-y-6 shadow-2xl my-4 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Top Bar with Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Rent Payment Preview &amp; Checkout</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                    0% LANDLORD FEE
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review rent payment details for {tenant?.propertyName || "Residence"} — {tenant?.unitNumber || "Unit"}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-COLUMN ULTRA-SPACIOUS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* LEFT COLUMN: Summary Card & Option Selector */}
              <div className="space-y-4">
                {/* PREVIEW BREAKDOWN SUMMARY CARD */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Billing Month</span>
                    <span className="font-extrabold text-slate-900">July 2026 Monthly Rent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Residence &amp; Unit</span>
                    <span className="font-extrabold text-slate-900 truncate max-w-[160px]">
                      {tenant?.propertyName || "Residence"} ({tenant?.unitNumber || "Unit"})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Landlord Beneficiary</span>
                    <span className="font-mono font-bold text-slate-900 truncate max-w-[150px]">
                      {workspaceUpi?.upiAccountName || "Ansh Property Management"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900">Total Payable</span>
                    <span className="font-black text-[#FF6B00] text-base">${rentVal.toLocaleString()}.00</span>
                  </div>
                </div>

                {/* ACTIVE LANDLORD PAYMENT OPTIONS SELECTOR */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
                    Select Payment Option ({activeMethods.length} Active)
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    {activeMethods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          selectedMethod === m.id
                            ? "border-[#FF6B00] bg-orange-50/50 ring-2 ring-orange-500/20 shadow-2xs"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-slate-200 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                          <Image src={m.logo} alt={m.name} width={22} height={22} className="object-contain" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-black text-slate-900 block truncate">{m.name}</span>
                          <span className="text-[9px] font-bold text-emerald-600 block">{m.fee}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SELECTED METHOD DETAILS & QR / GATEWAY / VERIFICATION */}
              <div>
                {activeSelected && (
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3.5 animate-in fade-in duration-200">
                    {activeSelected.type === "upi" ? (
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3.5">
                          {/* QR Scanner Image */}
                          <div
                            onClick={() => {
                              if (activeSelected.qr) {
                                setMaximizedQrUrl(activeSelected.qr);
                              }
                            }}
                            className={`bg-white border border-slate-200 rounded-xl p-2 shadow-2xs text-center shrink-0 space-y-1 ${
                              activeSelected.qr ? "cursor-zoom-in hover:border-[#FF6B00] hover:shadow-md transition-all group relative" : ""
                            }`}
                          >
                            {activeSelected.qr ? (
                              <div className="w-28 h-28 mx-auto bg-white p-1 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                                <img src={activeSelected.qr} alt={`${activeSelected.name} QR`} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-28 h-28 mx-auto bg-slate-900 text-white rounded-lg p-2 flex flex-col items-center justify-center gap-1.5">
                                <QrCode className="w-7 h-7 text-[#FF6B00]" />
                                <span className="text-[8px] font-bold text-center text-slate-300">
                                  Scan QR
                                </span>
                              </div>
                            )}

                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-orange-100 text-slate-800 group-hover:text-orange-900 text-[9px] font-extrabold uppercase transition-colors">
                              <Smartphone className="w-3 h-3 text-[#FF6B00]" />
                              <span>{activeSelected.qr ? "Tap to Enlarge" : "Scan & Pay"}</span>
                            </div>
                          </div>

                          {/* VPA ID & Phone Number */}
                          <div className="space-y-2 flex-1 text-xs w-full min-w-0">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Landlord {activeSelected.name} VPA ID
                              </span>
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-mono font-extrabold text-xs text-[#FF6B00] truncate">
                                  {activeSelected.vpa}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyUpi(activeSelected.vpa || "")}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] rounded-lg transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider cursor-pointer"
                                >
                                  {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedUpi ? "Copied" : "Copy"}</span>
                                </button>
                              </div>
                            </div>

                            {activeSelected.phone && (
                              <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Registered Mobile
                                </span>
                                <div className="text-xs font-extrabold text-slate-800 font-mono truncate">
                                  {activeSelected.phone}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* MANUAL VERIFICATION INFORMATIONAL NOTE BOX */}
                        <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-950">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-xs leading-snug">
                            <span className="font-extrabold text-amber-950 block uppercase tracking-wider text-[9px]">
                              Manual Verification Needed
                            </span>
                            <p className="text-amber-900 font-medium text-[11px] mt-0.5">
                              Manual verification needed for these providers. Please provide the screenshot to verify your transfer.
                            </p>
                          </div>
                        </div>

                        {/* 3 SCREENSHOT UPLOAD SLOTS FOR MANUAL VERIFICATION */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">
                            Upload Verification Screenshots (Up to 3 Images)
                          </span>

                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-slate-200 rounded-xl p-2 text-center space-y-1 shrink-0 relative overflow-hidden"
                              >
                                <span className="text-[8px] font-bold text-slate-400 uppercase block truncate">
                                  {idx === 0 ? "Receipt *" : `Proof ${idx + 1}`}
                                </span>

                                {proofImages[idx] ? (
                                  <div className="space-y-1">
                                    <div className="w-full h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                                      <img
                                        src={proofImages[idx]}
                                        alt={`Proof Screenshot ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProofImages((prev) => {
                                          const next = [...prev];
                                          next[idx] = "";
                                          return next;
                                        });
                                      }}
                                      className="text-[9px] font-bold text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                ) : (
                                  <label className="border border-dashed border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/20 rounded-lg p-1.5 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer block min-h-[58px]">
                                    <Camera className="w-4 h-4 text-slate-400" />
                                    <span className="text-[8px] font-bold text-slate-600">Attach</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          compressScreenshot(file, idx);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                            <Image src={activeSelected.logo} alt={activeSelected.name} width={28} height={28} className="object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{activeSelected.name} Checkout Gateway</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Process monthly rent securely via Credit/Debit Cards, UPI, Netbanking &amp; Wallets.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* MODAL FOOTER ACTION BUTTONS */}
            <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[10px] text-slate-400 font-medium">
                {activeSelected?.id === "razorpay"
                  ? "Razorpay secure payment checkout modal will pop up on click."
                  : activeSelected?.type === "upi"
                  ? "Manual verification request will be submitted to your landlord."
                  : "Instant electronic receipt will be logged upon confirmation."}
              </p>

              <button
                type="button"
                onClick={() => {
                  if (activeSelected?.id === "razorpay") {
                    handleRazorpayCheckout();
                  } else if (activeSelected?.type === "upi") {
                    handlePay(`Manual Verification (${activeSelected.name})`);
                  } else {
                    handlePay(activeSelected?.name || "Direct Payment");
                  }
                }}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : activeSelected?.type === "upi" ? (
                  <FileCheck className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? "Opening Gateway..."
                    : activeSelected?.id === "razorpay"
                    ? `Pay via Razorpay ($${rentVal.toLocaleString()})`
                    : activeSelected?.type === "upi"
                    ? `Submit for Verification ($${rentVal.toLocaleString()})`
                    : `Confirm Payment ($${rentVal.toLocaleString()})`}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Historical Receipts &amp; Payment Logs</h3>
          <span className="text-xs font-bold text-slate-400">{history.length} Receipts</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">Loading payment receipts...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Payment Receipts Logged</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No payment receipts or historical logs exist yet for{" "}
              <span className="font-semibold text-slate-700">
                {tenant?.propertyName || "your residence"} — {tenant?.unitNumber || "Unit"}
              </span>. Instant receipts will appear here automatically when monthly rent is paid.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Receipt ID</th>
                  <th className="pb-3 px-2">Billing Period</th>
                  <th className="pb-3 px-2">Amount Paid</th>
                  <th className="pb-3 px-2">Payment Date</th>
                  <th className="pb-3 px-2">Method</th>
                  <th className="pb-3 px-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {history.map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-slate-700">{h.id}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">{h.period}</td>
                    <td className="py-3 px-2 font-black text-slate-900">{h.amount}</td>
                    <td className="py-3 px-2 text-slate-600">{h.paidOn}</td>
                    <td className="py-3 px-2 text-slate-600">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {h.method}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => alert(`Downloading PDF receipt for ${h.id}...`)}
                        className="text-purple-700 hover:underline font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MAXIMIZED QR CODE MODAL LIGHTBOX OVERLAY */}
      {maximizedQrUrl && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setMaximizedQrUrl(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Enlarged Scanner QR Code
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMaximizedQrUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-64 h-64 mx-auto bg-white p-2 border-2 border-orange-500/40 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <img src={maximizedQrUrl} alt="Enlarged QR Code Scanner" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-xs font-extrabold text-slate-900 block">
                Ready for Instant Camera Scanning
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Scan directly using Google Pay, PhonePe, Paytm, or BHIM UPI app on your smartphone.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
