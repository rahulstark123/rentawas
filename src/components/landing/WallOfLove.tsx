"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck, Heart, Quote } from "lucide-react";

export default function WallOfLove() {
  const testimonials = [
    {
      name: "Rajesh Sharma",
      role: "Owner, Royal Stays PG",
      location: "Gurgaon • 42 Units",
      initials: "RS",
      avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-400",
      rating: 5,
      quote:
        "Managing rent receipts and tracking overdue tenants used to take me 3 days every month. With RentAwas, rent collection is automated and tenants receive digital receipts instantly!",
    },
    {
      name: "Priya Nair",
      role: "Property Manager, Horizon Heights",
      location: "Mumbai • 18 Flats",
      initials: "PN",
      avatarBg: "bg-gradient-to-tr from-[#0B132B] to-[#1C2541]",
      rating: 5,
      quote:
        "The AI Document Generator saved us thousands in legal drafting. Generating rent agreements in plain English for new tenants takes less than 2 minutes now.",
    },
    {
      name: "Vikramaditya Mehta",
      role: "Landlord, Greenview Residency",
      location: "Pune • 24 Units",
      initials: "VM",
      avatarBg: "bg-gradient-to-tr from-purple-600 to-indigo-500",
      rating: 5,
      quote:
        "The maintenance ticket portal is a game changer. Tenants upload photos of broken plumbing, and I can assign contractors right away without endless phone calls.",
    },
    {
      name: "Ananya Gupta",
      role: "Managing Director, Elite Living Spaces",
      location: "Delhi NCR • 60+ Units",
      initials: "AG",
      avatarBg: "bg-gradient-to-tr from-emerald-600 to-teal-500",
      rating: 5,
      quote:
        "RentAwas gave us complete financial clarity. The analytics telemetry shows our NOI, occupancy rates, and pending collection balances in real time.",
    },
    {
      name: "Siddharth Roy",
      role: "Owner, Urban Comfort Co-Living",
      location: "Hyderabad • 30 Units",
      initials: "SR",
      avatarBg: "bg-gradient-to-tr from-blue-600 to-cyan-500",
      rating: 5,
      quote:
        "Switched from messy Excel spreadsheets to RentAwas. Onboarding tenants, storing KYC documents, and sending automated SMS reminders has simplified everything!",
    },
    {
      name: "Kavita Reddy",
      role: "Property Owner, Prime Housing",
      location: "Chennai • 15 Units",
      initials: "KR",
      avatarBg: "bg-gradient-to-tr from-rose-500 to-pink-500",
      rating: 5,
      quote:
        "Clean design, super fast, and easy for non-tech folks to use. The direct bank settlement feature means rent lands directly in my account without delay.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-900 text-white font-sans relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-[#FF6B00]" />
            <span>Wall of Love</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Loved by <span className="text-[#FF6B00]">500+</span> Landlords & Property Owners
          </h2>

          <p className="text-slate-300 font-normal text-sm sm:text-base leading-relaxed">
            Hear directly from property managers, apartment owners, and PG operators who transformed their rental operations with RentAwas.
          </p>

          {/* Aggregate Rating Badge */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-200">
              4.9 / 5.0 Rating from 500+ Verified Owners
            </span>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -5 }}
              className="bg-[#141E38] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative group hover:border-[#FF6B00]/40 transition-all"
            >
              {/* Quote Mark Icon Watermark */}
              <Quote className="absolute top-5 right-5 w-8 h-8 text-white/5 group-hover:text-[#FF6B00]/10 transition-colors pointer-events-none" />

              <div className="space-y-4">
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info Profile Footer */}
              <div className="pt-5 mt-5 border-t border-white/10 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0 ${t.avatarBg}`}>
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{t.name}</h4>
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{t.role}</p>
                  <p className="text-[10px] text-[#FF6B00] font-semibold">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
