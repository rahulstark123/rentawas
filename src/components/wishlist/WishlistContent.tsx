"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Bed,
  Maximize2,
  PhoneCall,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Calendar,
  User,
  X,
  Eye,
} from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { useToast } from "@/components/ui/Toast";
import { useWishlist } from "@/hooks/useWishlist";
import type { MarketplacePropertyItem } from "@/lib/marketplace";

interface WishlistContentProps {
  title?: string;
  description?: string;
  accent?: "purple" | "orange";
}

export default function WishlistContent({
  title = "My Property Wishlist",
  description = "Saved rental homes synced to your account across all devices.",
  accent = "purple",
}: WishlistContentProps) {
  const { toast } = useToast();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist(true);

  const [selectedProperty, setSelectedProperty] = useState<MarketplacePropertyItem | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [moveInDate, setMoveInDate] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const accentIcon =
    accent === "orange"
      ? "bg-orange-50 text-[#FF6B00] border-orange-200"
      : "bg-purple-50 text-purple-600 border-purple-200";
  const accentFill = accent === "orange" ? "fill-[#FF6B00]" : "fill-purple-600";

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      toast("Please enter your name and phone number.", "error");
      return;
    }
    setIsSubmittingLead(true);
    try {
      const formattedPhone = `${selectedCountry.dialCode} ${leadPhone.trim()}`;
      await fetch("/api/listings/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: leadName.trim(),
          phone: formattedPhone,
          moveInDate,
          listingId: selectedProperty?.id,
        }),
      });
      setLeadSubmitted(true);
      toast("Contact request sent to property owner!", "success");
    } catch (err) {
      console.error("Inquiry submit error:", err);
      setLeadSubmitted(true);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const closeContactModal = () => {
    setSelectedProperty(null);
    setLeadSubmitted(false);
    setLeadName("");
    setLeadPhone("");
    setMoveInDate("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${accentIcon}`}
            >
              <Heart className={`w-4 h-4 ${accentFill}`} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
        </div>

        <Link
          href="/find-property"
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer"
        >
          <span>Browse Marketplace Homes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 animate-pulse"
            >
              <div className="h-48 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xs my-6">
          <div
            className={`w-16 h-16 border rounded-2xl flex items-center justify-center mx-auto shadow-inner ${accentIcon}`}
          >
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
              You haven&apos;t saved any rental properties yet. Browse verified zero-brokerage
              apartments and beds on RentAwas!
            </p>
          </div>
          <Link
            href="/find-property"
            className="px-5 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl shadow-md uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 transition-all mt-2"
          >
            <span>Explore Properties Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-extrabold text-white uppercase tracking-wider">
                      {p.type}
                    </span>
                  </div>

                  <button
                    onClick={() => void removeFromWishlist(p.id, p.title)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-50 shadow-md transition-colors cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-slate-200">
                    <span className="text-sm font-black text-slate-900">{p.price}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase"> / month</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>
                        {p.location}, {p.city}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug line-clamp-1">
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 py-1 border-y border-slate-100">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      {p.bhk}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      {p.size}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.isArray(p.tags) &&
                      p.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <Link
                  href={`/find-property/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
                <button
                  onClick={() => setSelectedProperty(p)}
                  className="flex-1 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Contact Owner</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="bg-[#0B132B] p-5 text-white relative">
              <button
                onClick={closeContactModal}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Zero Brokerage Direct Lead
              </span>
              <h3 className="text-lg font-bold text-white line-clamp-1">{selectedProperty.title}</h3>
              <p className="text-xs text-slate-300">
                {selectedProperty.ownerName} • {selectedProperty.price}/mo
              </p>
            </div>

            {leadSubmitted ? (
              <div className="p-7 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Owner Contact Shared!</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Thank you <strong>{leadName}</strong>. We have notified{" "}
                    <strong>{selectedProperty.ownerName}</strong> of your interest. You can reach
                    the owner directly at <strong>{selectedProperty.ownerPhone}</strong>!
                  </p>
                </div>
                <button
                  onClick={closeContactModal}
                  className="w-full py-2.5 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Alexander Wright"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number *
                  </label>
                  <CountryPhoneInput
                    value={leadPhone}
                    onChange={setLeadPhone}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Move-In Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-70"
                >
                  {isSubmittingLead ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Get Owner Contact Number</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
