"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import EarlyAccessBanner from "@/components/landing/EarlyAccessBanner";
import WhyRentAwas from "@/components/landing/WhyRentAwas";
import FeaturesBento from "@/components/landing/FeaturesBento";
import HowRentAwasHelps from "@/components/landing/HowRentAwasHelps";
import ResidentAppSection from "@/components/landing/ResidentAppSection";
import WallOfLove from "@/components/landing/WallOfLove";
import PricingAndFAQ from "@/components/landing/PricingAndFAQ";
import RentAwasExpertsSection from "@/components/landing/RentAwasExpertsSection";
import Footer from "@/components/layout/Footer";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";

export default function Home() {
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);

  const handleOpenEarlyAccess = () => {
    setIsEarlyAccessOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <Navbar variant="dark" onOpenEarlyAccess={handleOpenEarlyAccess} />
      <HeroSection />
      
      {/* Early Access Banner Section (Right above WhyRentAwas) */}
      <EarlyAccessBanner onOpenEarlyAccess={handleOpenEarlyAccess} />
      
      <WhyRentAwas />
      <FeaturesBento onOpenEarlyAccess={handleOpenEarlyAccess} />
      <HowRentAwasHelps />
      <ResidentAppSection />
      
      {/* Wall of Love Testimonials (Right above Pricing) */}
      <WallOfLove />
      
      <PricingAndFAQ />

      {/* RentAwas Experts & Service Partners Section */}
      <RentAwasExpertsSection />

      <Footer />

      {/* Early Access Lead Capture Modal */}
      <EarlyAccessModal
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
      />
    </main>
  );
}
