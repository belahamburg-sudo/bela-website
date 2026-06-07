import { VideoHeroSection } from "@/components/sections/video-hero-section";
import { AiJobsSection } from "@/components/sections/ai-jobs-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { IsThisYouSection } from "@/components/sections/is-this-you-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { AiChangesSection } from "@/components/sections/ai-changes-section";
import { MethodSection } from "@/components/sections/method-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ProductsSection } from "@/components/sections/products-section";
import { TrustSection } from "@/components/sections/trust-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaFooterSection } from "@/components/sections/cta-footer-section";

export default function HomePage() {
  return (
    <>
      <style>{`body > footer { display: none; }`}</style>
      <VideoHeroSection />
      <AiJobsSection />
      <ProblemSection />
      <IsThisYouSection />
      <HowItWorksSection />
      <AiChangesSection />
      <MethodSection />
      <StatsSection />
      <ProductsSection />
      <TrustSection />
      <FaqSection />
      <CtaFooterSection />
    </>
  );
}
