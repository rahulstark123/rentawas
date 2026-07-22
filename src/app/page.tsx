import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesBento from "@/components/landing/FeaturesBento";
import OperationsAndAICommand from "@/components/landing/OperationsAndAICommand";
import ResidentAppSection from "@/components/landing/ResidentAppSection";
import PricingAndFAQ from "@/components/landing/PricingAndFAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <HeroSection />
      <FeaturesBento />
      <OperationsAndAICommand />
      <ResidentAppSection />
      <PricingAndFAQ />
      <Footer />
    </main>
  );
}
