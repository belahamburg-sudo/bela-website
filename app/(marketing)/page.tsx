import { VideoHeroSection } from "@/components/sections/video-hero-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { CommunitySection } from "@/components/sections/community-section";
import { LifestyleStripSection } from "@/components/sections/lifestyle-strip-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { ProductsSection } from "@/components/sections/products-section";
import { MethodSection } from "@/components/sections/method-section";
import { IsThisYouSection } from "@/components/sections/is-this-you-section";
import { AntihypeSection } from "@/components/sections/antihype-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaFooterSection } from "@/components/sections/cta-footer-section";

export default function HomePage() {
  return (
    <>
      <style>{`body > footer { display: none; }`}</style>
      <VideoHeroSection />
      <HowItWorksSection />
      <StatsSection />
      <ProblemSection />
      <CommunitySection />
      <LifestyleStripSection />
      <ProductsSection />
      <MethodSection />
      <IsThisYouSection />
      <AntihypeSection />
      <FaqSection />
      <CtaFooterSection />
    </>
  );
}
