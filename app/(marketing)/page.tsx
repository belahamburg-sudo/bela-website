import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { VideoHeroSection } from "@/components/sections/video-hero-section";
import { AiJobsSection } from "@/components/sections/ai-jobs-section";

// Below-fold sections: split into separate JS chunks, loaded after initial paint
const ProblemSection = dynamic(() => import("@/components/sections/problem-section").then(m => ({ default: m.ProblemSection })));
const IsThisYouSection = dynamic(() => import("@/components/sections/is-this-you-section").then(m => ({ default: m.IsThisYouSection })));
const HowItWorksSection = dynamic(() => import("@/components/sections/how-it-works-section").then(m => ({ default: m.HowItWorksSection })));
const AiChangesSection = dynamic(() => import("@/components/sections/ai-changes-section").then(m => ({ default: m.AiChangesSection })));
const MethodSection = dynamic(() => import("@/components/sections/method-section").then(m => ({ default: m.MethodSection })));
const StatsSection = dynamic(() => import("@/components/sections/stats-section").then(m => ({ default: m.StatsSection })));
const ProductsSection = dynamic(() => import("@/components/sections/products-section").then(m => ({ default: m.ProductsSection })));
const SolutionBannerSection = dynamic(() => import("@/components/sections/solution-banner-section").then(m => ({ default: m.SolutionBannerSection })));
const TrustSection = dynamic(() => import("@/components/sections/trust-section").then(m => ({ default: m.TrustSection })));
const AntihypeSection = dynamic(() => import("@/components/sections/antihype-section").then(m => ({ default: m.AntihypeSection })));
const FaqSection = dynamic(() => import("@/components/sections/faq-section").then(m => ({ default: m.FaqSection })));
const CtaFooterSection = dynamic(() => import("@/components/sections/cta-footer-section").then(m => ({ default: m.CtaFooterSection })));
import { getFeaturedCourses } from "@/lib/courses";
import { getActiveWebinar } from "@/lib/webinar";
import { getEffectiveSocials } from "@/lib/settings";
import { faqItems } from "@/lib/content";
import { JsonLd, faqPageSchema } from "@/lib/seo/structured-data";

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
      <JsonLd data={faqPageSchema(faqItems)} />
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
