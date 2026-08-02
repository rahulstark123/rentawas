"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useEffectEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";

const LANDING_SLIDES = [
  { src: "/landing 1.png", alt: "RentAwas property management dashboard" },
  { src: "/landing 2.png", alt: "RentAwas listings and portfolio view" },
  { src: "/landign 3.png", alt: "RentAwas tenant and operations view" },
  { src: "/landing 5.png", alt: "RentAwas analytics and growth view" },
] as const;

interface HeroSectionProps {
  onOpenEarlyAccess?: () => void;
}

export default function HeroSection({ onOpenEarlyAccess }: HeroSectionProps = {}) {
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goNext = useEffectEvent(() => {
    setSlideIndex((i) => (i + 1) % LANDING_SLIDES.length);
  });

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => goNext(), 3500);
    return () => window.clearInterval(id);
  }, [paused]);

  const handleOpenEarlyAccess = () => {
    if (onOpenEarlyAccess) {
      onOpenEarlyAccess();
    } else {
      setIsEarlyAccessModalOpen(true);
    }
  };

  const currentSlide = LANDING_SLIDES[slideIndex];

  return (
    <section id="platform" className="relative pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#141E38] to-[#F8FAFC]">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleOpenEarlyAccess}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider mb-5 shadow-xs cursor-pointer hover:bg-[#FF6B00]/30 transition-all"
        >
          <Building2 className="w-4 h-4 text-[#FF6B00]" />
          <span>100% Free Property Listing • Zero Broker Fees</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.05] max-w-5xl mx-auto"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          List. Manage.{" "}
          <span className="block sm:inline text-[#FF6B00]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Grow.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="text-slate-300 font-normal text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 mb-10 leading-relaxed"
        >
          The complete property management & free property listing platform. List vacant properties for free, find tenants, collect rent, track expenses, manage maintenance, and run your rentals—all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          <button
            type="button"
            onClick={handleOpenEarlyAccess}
            className="w-full sm:w-auto text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] transition-all px-5 py-3.5 rounded-xl shadow-md shadow-orange-500/20 text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>List Property Free</span>
          </button>
          <Link
            href="/find-property"
            className="w-full sm:w-auto text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 active:scale-[0.98] transition-all px-5 py-3.5 rounded-xl shadow-xs text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap backdrop-blur-md"
          >
            <Search className="w-4 h-4 shrink-0 text-[#FF6B00]" />
            <span>Find Property</span>
          </Link>
        </motion.div>

        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="max-w-5xl mx-auto mt-14 md:mt-16 bg-white rounded-xl md:rounded-2xl p-2.5 sm:p-3 window-shadow relative group"
        >
          <div className="flex items-center px-3 py-2 border-b border-slate-100 mb-2.5 bg-slate-50/80 rounded-t-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
            <div
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-slate-100"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentSlide.src}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentSlide.src}
                    alt={currentSlide.alt}
                    fill
                    priority={slideIndex === 0}
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain object-center bg-slate-100"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                aria-label="Previous screenshot"
                onClick={() =>
                  setSlideIndex((i) => (i - 1 + LANDING_SLIDES.length) % LANDING_SLIDES.length)
                }
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 text-slate-800 shadow-md border border-slate-200/80 hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next screenshot"
                onClick={() => setSlideIndex((i) => (i + 1) % LANDING_SLIDES.length)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 text-slate-800 shadow-md border border-slate-200/80 hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35 backdrop-blur-sm">
                {LANDING_SLIDES.map((slide, i) => (
                  <button
                    key={slide.src}
                    type="button"
                    aria-label={`Show slide ${i + 1}`}
                    onClick={() => setSlideIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === slideIndex ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <EarlyAccessModal
        isOpen={isEarlyAccessModalOpen}
        onClose={() => setIsEarlyAccessModalOpen(false)}
      />
    </section>
  );
}
