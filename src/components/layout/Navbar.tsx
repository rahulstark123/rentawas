"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, MessageSquareHeart, Sparkles } from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import FeedbackModal from "@/components/ui/FeedbackModal";

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

  const isFindProperty = pathname === "/find-property";
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
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
              href="/#solutions"
              className={`text-xs font-bold transition-colors uppercase tracking-wider ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Solutions
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
            {/* Log In Link */}
            <Link
              href="/login"
              className={`text-xs font-bold transition-all px-3.5 py-2 rounded-xl uppercase tracking-wider ${
                isDark
                  ? "text-slate-200 hover:text-white hover:bg-white/10 border border-slate-700/80"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Log In
            </Link>
            {/* Feedback Button */}
            <button
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
            {/* Early Access Button */}
            <button
              onClick={() => {
                if (onOpenEarlyAccess) onOpenEarlyAccess();
                else triggerModal("Early Access Lead");
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Early Access</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
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
                className="text-sm font-bold text-[#FF6B00] uppercase tracking-wider"
              >
                Find Property
              </Link>
              <Link
                href="/#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Solutions
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
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 border border-slate-700 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider hover:bg-white/10 transition-all text-center"
              >
                Log In
              </Link>
              <button
                onClick={openFeedback}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 border border-slate-700 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                <MessageSquareHeart size={14} />
                Feedback
              </button>
              <button
                onClick={() => {
                  if (onOpenEarlyAccess) onOpenEarlyAccess();
                  else triggerModal("Early Access Lead");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#FF6B00] py-2.5 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Early Access</span>
              </button>
            </div>
          </div>
        )}
      </header>

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
    </>
  );
}
