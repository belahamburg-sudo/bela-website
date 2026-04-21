import { HeroSection } from "@/components/sections/hero-section";
import { VideoHeroSection } from "@/components/sections/video-hero-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { MethodSection } from "@/components/sections/method-section";
import { ProductsSection } from "@/components/sections/products-section";
import { AntihypeSection } from "@/components/sections/antihype-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaFooterSection } from "@/components/sections/cta-footer-section";

export default function HomePage() {
  return (
    <>
      <style>{`body > footer { display: none; }`}</style>
      <VideoHeroSection />
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <MethodSection />
      <ProductsSection />
      <AntihypeSection />
      <FaqSection />
      <CtaFooterSection />
    </>
  );
}
