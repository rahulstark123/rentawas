"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Log In Portal Coming Soon!");

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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs"
            : "bg-white/60 backdrop-blur-xs border-b border-slate-200/50"
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
            <span className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight group-hover:opacity-90 transition-opacity">
              Rent<span className="text-[#FF6B00]">Awas</span>
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#platform"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors uppercase tracking-wider"
            >
              Platform
            </Link>
            <Link
              href="#solutions"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors uppercase tracking-wider"
            >
              Solutions
            </Link>
            <Link
              href="#pricing"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors uppercase tracking-wider"
            >
              Pricing
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => triggerModal("User & Owner Log In")}
              className="text-xs font-bold text-slate-800 hover:text-black transition-colors px-3 py-2 cursor-pointer uppercase tracking-wider"
            >
              Log In
            </button>
            <button
              onClick={() => triggerModal("Add New Property Portal")}
              className="text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all px-4.5 py-2 rounded-md shadow-2xs cursor-pointer uppercase tracking-wider"
            >
              Add Property
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-lg absolute top-16 left-0 right-0">
            <nav className="flex flex-col gap-3">
              <Link
                href="#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                Platform
              </Link>
              <Link
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                Solutions
              </Link>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                Pricing
              </Link>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => triggerModal("User & Owner Log In")}
                className="w-full text-center text-xs font-bold text-slate-800 py-2 rounded-md hover:bg-slate-50 cursor-pointer uppercase tracking-wider"
              >
                Log In
              </button>
              <button
                onClick={() => triggerModal("Add New Property Portal")}
                className="w-full text-center text-xs font-bold text-white bg-[#FF6B00] py-2.5 rounded-md shadow-xs cursor-pointer uppercase tracking-wider"
              >
                Add Property
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
    </>
  );
}
