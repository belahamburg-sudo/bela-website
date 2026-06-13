import { VideoHeroSection } from "@/components/sections/video-hero-section";
import { AiJobsSection } from "@/components/sections/ai-jobs-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { IsThisYouSection } from "@/components/sections/is-this-you-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { AiChangesSection } from "@/components/sections/ai-changes-section";
import { MethodSection } from "@/components/sections/method-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ProductsSection } from "@/components/sections/products-section";
import { SolutionBannerSection } from "@/components/sections/solution-banner-section";
import { TrustSection } from "@/components/sections/trust-section";
import { AntihypeSection } from "@/components/sections/antihype-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaFooterSection } from "@/components/sections/cta-footer-section";
import { getFeaturedCourses } from "@/lib/courses";

export default async function HomePage() {
  const featured = await getFeaturedCourses();
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
      <ProductsSection courses={featured} />
      <SolutionBannerSection />
      <TrustSection />
      <AntihypeSection />
      <FaqSection />
      <CtaFooterSection />
    </>
  );
}
