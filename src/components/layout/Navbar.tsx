"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, MessageSquareHeart, Sparkles, User, Heart } from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import FeedbackModal from "@/components/ui/FeedbackModal";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  onOpenEarlyAccess?: () => void;
  variant?: "light" | "dark";
}

export default function Navbar({ onOpenEarlyAccess, variant = "dark" }: NavbarProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Log In Portal Coming Soon!");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isInternalEarlyAccessOpen, setIsInternalEarlyAccessOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  const isFindProperty = pathname === "/find-property";
  const isServices = pathname === "/services";
  const isHome = pathname === "/";

  useEffect(() => {
    if (!supabase?.auth) return;

    let subscription: any = null;

    try {
      supabase.auth
        .getSession()
        .then((res) => {
          if (res?.data?.session) {
            setUserSession(res.data.session);
          }
        })
        .catch(() => {});

      const authRes = supabase.auth.onAuthStateChange((_event, session) => {
        setUserSession(session);
      });
      subscription = authRes?.data?.subscription;
    } catch (e) {
      // Safe fallback for uninitialized supabase
    }

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenEarlyAccess = () => {
    setMobileMenuOpen(false);
    if (onOpenEarlyAccess) {
      onOpenEarlyAccess();
    } else {
      setIsInternalEarlyAccessOpen(true);
    }
  };

  const triggerModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openFeedback = () => {
    setIsFeedbackOpen(true);
    setMobileMenuOpen(false);
  };

  const isDark = variant === "dark" && !scrolled;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        <header
          className={`w-full h-16 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs text-slate-900"
            : variant === "dark"
            ? "bg-[#0B132B]/85 backdrop-blur-md border-b border-slate-800/80 text-white"
            : "bg-white/80 backdrop-blur-md border-b border-slate-200/60 text-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-full">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group h-full py-1">
            <Image
              src="/logo.png"
              alt="RentAwas Logo"
              width={72}
              height={72}
              priority
              className="h-11 sm:h-12 w-auto max-h-full object-contain group-hover:opacity-90 transition-opacity shrink-0"
            />
            <span 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight group-hover:opacity-90 transition-opacity font-cormorant"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              <span 
                className={isDark ? "text-white" : "text-[#0B132B]"} 
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Rent
              </span>
              <span className="text-[#FF6B00]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                Awas
              </span>
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-sans">
            <Link
              href="/#platform"
              className={`text-xs font-bold transition-colors uppercase tracking-wider ${
                isHome
                  ? "text-[#FF6B00] font-extrabold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Platform
            </Link>
            <Link
              href="/find-property"
              className={`text-xs font-bold transition-colors uppercase tracking-wider ${
                isFindProperty
                  ? "text-[#FF6B00] font-extrabold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Find Property
            </Link>
            <Link
              href="/services"
              className={`text-xs font-bold transition-colors uppercase tracking-wider ${
                isServices
                  ? "text-[#FF6B00] font-extrabold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Services
            </Link>
            <Link
              href="/vision"
              className={`text-xs font-bold transition-colors uppercase tracking-wider ${
                pathname === "/vision"
                  ? "text-[#FF6B00] font-extrabold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Vision
            </Link>
            <Link
              href="/#pricing"
              className={`text-xs font-bold transition-colors uppercase tracking-wider ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3 font-sans">
            {/* Feedback Button */}
            <button
              type="button"
              onClick={openFeedback}
              className={`flex items-center gap-1.5 text-xs font-bold active:scale-[0.97] transition-all px-3.5 py-2 rounded-xl cursor-pointer uppercase tracking-wider ${
                isDark
                  ? "text-slate-200 border border-slate-700/80 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:text-[#FF6B00] border border-slate-200 hover:border-[#FF6B00]/40 hover:bg-orange-50"
              }`}
            >
              <MessageSquareHeart size={14} />
              Feedback
            </button>

            {/* Wishlist — logged-in tenants */}
            {userSession?.user?.user_metadata?.role === "tenant" && (
              <Link
                href="/tenant/wishlist"
                className={`flex items-center gap-1.5 text-xs font-bold active:scale-[0.97] transition-all px-3.5 py-2 rounded-xl cursor-pointer uppercase tracking-wider ${
                  isDark
                    ? "text-red-300 border border-red-500/40 hover:bg-red-950/40 hover:text-white"
                    : "text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <Heart size={14} className={pathname === "/tenant/wishlist" ? "fill-current" : ""} />
                Wishlist
              </Link>
            )}

            {/* Log In or Profile Icon */}
            {userSession ? (
              <Link
                href={userSession.user?.user_metadata?.role === "tenant" ? "/tenant/dashboard" : "/dashboard"}
                className={`flex items-center gap-1.5 text-xs font-extrabold transition-all px-3.5 py-2 rounded-xl cursor-pointer uppercase tracking-wider ${
                  isDark
                    ? "text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 shadow-xs"
                    : "text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-xs"
                }`}
              >
                <User className="w-4 h-4 text-purple-600 fill-purple-600" />
                <span>My Portal</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`text-xs font-bold transition-all px-4 py-2 rounded-xl uppercase tracking-wider cursor-pointer ${
                  isDark
                    ? "text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-xs"
                    : "text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-xs"
                }`}
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors cursor-pointer md:hidden ${
              isDark ? "text-white hover:bg-slate-800" : "text-slate-800 hover:bg-slate-100"
            }`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 text-white px-6 py-5 space-y-4 shadow-2xl absolute top-16 left-0 right-0 font-sans">
            <nav className="flex flex-col gap-3">
              <Link
                href="/#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Platform
              </Link>
              <Link
                href="/find-property"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold uppercase tracking-wider ${isFindProperty ? "text-[#FF6B00]" : "text-slate-200"}`}
              >
                Find Property
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold uppercase tracking-wider ${isServices ? "text-[#FF6B00]" : "text-slate-200"}`}
              >
                Services
              </Link>
              <Link
                href="/vision"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold uppercase tracking-wider ${pathname === "/vision" ? "text-[#FF6B00]" : "text-slate-200"}`}
              >
                Vision
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Pricing
              </Link>
            </nav>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={openFeedback}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 border border-slate-700 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                <MessageSquareHeart size={14} />
                Feedback
              </button>
              {userSession?.user?.user_metadata?.role === "tenant" && (
                <Link
                  href="/tenant/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-300 border border-red-500/40 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider hover:bg-red-950/40 transition-all text-center"
                >
                  <Heart size={14} />
                  My Wishlist
                </Link>
              )}
              {userSession ? (
                <Link
                  href={userSession.user?.user_metadata?.role === "tenant" ? "/tenant/dashboard" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider hover:bg-purple-900 transition-all text-center"
                >
                  <User className="w-4 h-4 text-purple-400 fill-purple-400" />
                  <span>My Portal</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-slate-800 border border-slate-700 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider hover:bg-slate-700 transition-all text-center"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        )}
        </header>
      </div>

      {/* Modal Trigger Component */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Fallback Early Access Modal */}
      <EarlyAccessModal
        isOpen={isInternalEarlyAccessOpen}
        onClose={() => setIsInternalEarlyAccessOpen(false)}
      />
    </>
  );
}
