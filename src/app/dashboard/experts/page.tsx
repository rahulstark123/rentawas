"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  Zap,
  Hammer,
  ShieldCheck,
  UserCheck,
  Sparkles,
  BadgeCheck,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";

const EXPERT_DOMAINS = [
  {
    id: "ac",
    title: "AC & Climate Servicing",
    badge: "15–30 min arrival",
    icon: Wrench,
    accent: "text-[#FF6B00] bg-orange-50 border-orange-200",
    desc: "Jet wash cleaning, gas charging, filter sanitization & cooling diagnostics.",
  },
  {
    id: "plumbing",
    title: "Plumbing & Water Systems",
    badge: "Certified plumbers",
    icon: Wrench,
    accent: "text-cyan-700 bg-cyan-50 border-cyan-200",
    desc: "Tap leaks, pipe fitting, geyser install & overhead tank cleaning.",
  },
  {
    id: "electrical",
    title: "Electrical & Smart Wiring",
    badge: "Safety certified",
    icon: Zap,
    accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
    desc: "MCB upgrades, fan installs, CCTV wiring & inverter connections.",
  },
  {
    id: "carpentry",
    title: "Carpentry & Furniture",
    badge: "Precision tooling",
    icon: Hammer,
    accent: "text-amber-700 bg-amber-50 border-amber-200",
    desc: "Lock fitting, modular kitchen repair & custom wood adjustments.",
  },
  {
    id: "househelp",
    title: "Househelp & Domestic Staff",
    badge: "Aadhaar verified",
    icon: UserCheck,
    accent: "text-purple-700 bg-purple-50 border-purple-200",
    desc: "Maids, cooks, laundry staff, nannies & elderly care companions.",
  },
  {
    id: "cleaning",
    title: "Deep Cleaning & Pest Control",
    badge: "Eco-friendly",
    icon: ShieldCheck,
    accent: "text-pink-700 bg-pink-50 border-pink-200",
    desc: "Home sanitization, cockroach gel, termite treatment & sofa shampooing.",
  },
];

const FEATURED_SERVICES = [
  {
    id: "ac-repair",
    title: "AC Deep Servicing & Gas Charging",
    image: "/rentawas experts/ac.jpg",
    eta: "15–30 mins",
    price: "₹499",
  },
  {
    id: "plumber-pipe",
    title: "Plumbing Leakage & Sanitary Fitting",
    image: "/rentawas experts/plumber.jpg",
    eta: "20–30 mins",
    price: "₹199",
  },
  {
    id: "househelp-daily",
    title: "Full-Time & Daily Househelp / Maid",
    image: "/rentawas experts/Househelp.jpg",
    eta: "Same day",
    price: "₹2,499/mo",
  },
  {
    id: "pest-control-home",
    title: "Complete Home Pest Control",
    image: "/rentawas experts/pest control.jpg",
    eta: "60 mins",
    price: "₹799",
  },
  {
    id: "packers-movers-shift",
    title: "Home Shifting & Packers & Movers",
    image: "/rentawas experts/packers movers.jpg",
    eta: "Scheduled",
    price: "₹3,999",
  },
  {
    id: "locksmith-emergency",
    title: "Emergency Locksmith & Key Duplicate",
    image: "/rentawas experts/locksmith.jpg",
    eta: "15 mins",
    price: "₹349",
  },
];

const LAUNCH_CITIES = ["Bengaluru", "Delhi NCR", "Noida", "Gurgaon"];

export default function RentAwasExpertsDashboardPage() {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("RentAwas Experts — Coming Soon!");

  const openComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-[10px] font-extrabold uppercase tracking-wider">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            RentAwas Experts
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Book verified local specialists for your properties and tenants — AC servicing, plumbing,
            electrical, carpentry, househelp, pest control, and more. Same trusted network from our{" "}
            <Link href="/services" className="text-[#FF6B00] font-bold hover:underline inline-flex items-center gap-1">
              public Services page
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            , launching inside your workspace soon.
          </p>
        </div>

        <div className="relative w-full lg:w-72 h-44 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
          <Image
            src="/rentawas experts/experts.png"
            alt="RentAwas verified home experts"
            fill
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* Launch cities */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
          <MapPin className="w-4 h-4 text-[#FF6B00]" />
          <span>Launching soon in</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LAUNCH_CITIES.map((city) => (
            <span
              key={city}
              className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              {city}
            </span>
          ))}
        </div>
      </div>

      {/* Expert domains */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Expert categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Background-verified technicians for property maintenance and tenant home services.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {EXPERT_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => openComingSoon(`${domain.title} — Coming Soon!`)}
                className="text-left p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-xl border ${domain.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    Soon
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                  {domain.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{domain.desc}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-emerald-700">
                  <Clock className="w-3 h-3" />
                  {domain.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured services grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Popular home services</h2>
            <p className="text-xs text-slate-500 mt-0.5">Preview of what you&apos;ll book from the dashboard.</p>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
            {FEATURED_SERVICES.length} services
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex flex-col"
            >
              <div className="relative h-44 bg-slate-100">
                <Image src={service.image} alt={service.title} fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-slate-900/80 px-2 py-1 rounded-lg">
                  From {service.price}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{service.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ETA: {service.eta}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openComingSoon(`${service.title} — Coming Soon!`)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Book — Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-extrabold text-[#FF6B00] uppercase tracking-widest">
            Simple &amp; guaranteed
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">How RentAwas Experts will work</h2>
          <p className="text-xs text-slate-400">
            Three steps to dispatch verified experts to your property or tenant&apos;s unit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Select service & property",
              desc: "Pick AC, plumbing, electrical, or househelp and choose the property or unit.",
            },
            {
              step: "2",
              title: "Matched with verified expert",
              desc: "Get paired with background-checked local specialists at fixed transparent pricing.",
            },
            {
              step: "3",
              title: "Doorstep expert visit",
              desc: "Your assigned specialist arrives on schedule and resolves the issue professionally.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white font-black flex items-center justify-center mx-auto">
                {item.step}
              </div>
              <h3 className="text-sm font-extrabold">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openComingSoon("RentAwas Experts Booking — Coming Soon!")}
            className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Notify me at launch
          </button>
          <Link
            href="/services"
            className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-2"
          >
            View public Services page
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bottom note */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-extrabold">Coming soon to your workspace.</strong> RentAwas Experts will let
          landlords book verified technicians for maintenance, turnovers, and tenant support — directly from
          the same dashboard you use to manage rent and properties.
        </p>
      </div>

      <ComingSoonModal
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        title={comingSoonTitle}
        description="RentAwas Experts is in pre-launch. Enter your email to get notified when booking opens inside your landlord dashboard."
      />
    </div>
  );
}
