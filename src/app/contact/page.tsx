"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Mail,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Clock,
  MapPin,
  Globe,
  HelpCircle,
  Loader2,
  AlertCircle,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    category: "🏢 Landlord & Property Management",
    subject: "",
    message: "",
  });

  const categories = [
    "🏢 Landlord & Property Management",
    "🏠 Tenant Support & Rent Payments",
    "🤝 Business Partnership & Enterprise",
    "🛠️ Doorstep Expert & Service Partner",
    "❓ General Inquiry / Feedback",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast("Please enter your full name", "error");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast("Please enter a valid email address", "error");
      return;
    }

    if (!formData.message.trim()) {
      toast("Please enter your message", "error");
      return;
    }

    setLoading(true);

    try {
      const fullPhone = formData.phoneNumber.trim()
        ? `${selectedCountry.dialCode} ${formData.phoneNumber.trim()}`
        : null;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: fullPhone,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message.");
      }

      setSubmitted(true);
      toast("Message sent successfully!", "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar variant="dark" />

      {/* HERO BANNER */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 bg-[#0B132B] text-white border-b border-slate-800 overflow-hidden">
        {/* Glow backdrop accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/3 w-[600px] h-[600px] bg-[#FF6B00]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
            <MessageSquare className="w-4 h-4" />
            <span>Get In Touch with RentAwas</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              We&apos;re Here to <span className="text-[#FF6B00]">Help You</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Have a question about managing properties, rent automation, digital lease agreements, or doorstep expert dispatches? Send us a message below.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT INFO CARDS & FORM SECTION */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Direct Channels</span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Reach Out to Us Directly
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Whether you&apos;re a landlord onboarding multi-unit properties or a tenant with a payment query, our team is ready to assist.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Card */}
              <a
                href="mailto:hello.rentawas@anshapps.com"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#FF6B00]/50 hover:shadow-md transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Official Email</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono block group-hover:text-[#FF6B00] transition-colors">
                    hello.rentawas@anshapps.com
                  </span>
                  <span className="text-xs text-slate-500 block font-medium">Fast response within 2-4 business hours</span>
                </div>
              </a>

              {/* Phone Card */}
              <a
                href="tel:+919625727372"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#FF6B00]/50 hover:shadow-md transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone &amp; WhatsApp Desk</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono block group-hover:text-emerald-600 transition-colors">
                    +91 96257 27372
                  </span>
                  <span className="text-xs text-slate-500 block font-medium">Mon - Sat from 9:00 AM to 7:00 PM IST</span>
                </div>
              </a>

              {/* Parent Company Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Parent Studio</span>
                  <h4 className="text-base font-extrabold text-white">ANSH Apps</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Engineering high-performance software, real estate SaaS platforms, and modern web applications.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Website: anshapps.com</span>
                  <a href="https://anshapps.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:underline font-bold">
                    Visit ANSH Apps →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500" />

              {submitted ? (
                <div className="py-12 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Thank You for Reaching Out!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      We have received your message. Our support team at <span className="font-bold text-slate-900">ANSH Apps</span> will get back to you at <span className="font-mono font-bold text-[#FF6B00]">{formData.email}</span> shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        phoneNumber: "",
                        category: "🏢 Landlord & Property Management",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Send Us a Direct Message
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Fill in the details below and we&apos;ll store your request securely in our system.
                    </p>
                  </div>

                  {/* Form Rows */}
                  <div className="space-y-4 text-xs">
                    
                    {/* Row 1: Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. rahul@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <div>
                        <label className="block font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Phone Number (Optional)
                        </label>
                        <CountryPhoneInput
                          value={formData.phoneNumber}
                          onChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                          selectedCountry={selectedCountry}
                          onCountryChange={(c: Country) => setSelectedCountry(c)}
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Inquiry Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:bg-white cursor-pointer"
                        >
                          {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Subject (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Onboarding 15 unit apartment complex..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:bg-white"
                      />
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <label className="block font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please detail your question, property type, or support request..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:bg-white resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.99] disabled:opacity-70 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message Now</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    Your contact information is encrypted and protected under our <Link href="/privacy" className="text-[#FF6B00] underline">Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
