import type { Metadata } from "next";
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
import { getActiveWebinar } from "@/lib/webinar";
import { getEffectiveSocials } from "@/lib/settings";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "AI Goldmining: Digitale Produkte mit AI bauen & verkaufen",
  description:
    "Lerne, mit AI digitale Produkte zu bauen und zu verkaufen. Kurse, Webinar und Community für deinen Start ortsunabhängig. Klarheit statt Hype, mit Bela.",
  openGraph: {
    title: "AI Goldmining: Digitale Produkte mit AI bauen & verkaufen",
    description:
      "Lerne, mit AI digitale Produkte zu bauen und zu verkaufen. Kurse, Webinar und Community für deinen Start ortsunabhängig. Klarheit statt Hype, mit Bela.",
    url: BASE_URL,
    type: "website",
  },
  alternates: { canonical: BASE_URL },
};

// Re-read featured courses from the DB at most every 60s so catalog changes
// (new/edited courses, hidden demos) show up without a redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const featured = await getFeaturedCourses();
  const webinar = await getActiveWebinar();
  return (
    <>
      <style>{`body > footer { display: none; }`}</style>
      <VideoHeroSection webinar={webinar} />
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
      <CtaFooterSection socials={await getEffectiveSocials()} />
    </>
  );
}
