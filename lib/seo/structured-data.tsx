import { socialLinks, trustpilotUrl } from "@/lib/env";
import { contactEmail } from "@/lib/email-addresses";
import { SITE_LOGO_PATH } from "@/lib/brand";
import type { Course } from "@/lib/content";

/** Canonical absolute site origin, no trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com"
).replace(/\/$/, "");

/** Stable @id anchors so schemas can reference each other across the page. */
const ORG_ID = `${SITE_URL}/#organization`;
const PERSON_ID = `${SITE_URL}/#bela`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Every public brand profile; empty (unconfigured) entries are dropped. */
function sameAs(): string[] {
  return [
    socialLinks.instagram,
    socialLinks.youtube,
    socialLinks.tiktok,
    socialLinks.telegram,
    socialLinks.x,
    socialLinks.linkedin,
    socialLinks.facebook,
    trustpilotUrl,
  ].filter(Boolean) as string[];
}

/** Identity schema — tells Google & LLMs who runs this site. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "AI Goldmining",
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_LOGO_PATH}`,
    email: contactEmail,
    description:
      "Lerne, mit AI digitale Produkte zu bauen und automatisiert zu verkaufen. Kurse, Webinar und Community – Klarheit statt Hype.",
    founder: { "@id": PERSON_ID },
    sameAs: sameAs(),
  };
}

/** Person schema for Bela — the brand's public identity entity. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Bela Goldmann",
    url: `${SITE_URL}/about`,
    jobTitle: "Gründer & AI-Mentor",
    worksFor: { "@id": ORG_ID },
    sameAs: sameAs(),
  };
}

/** WebSite schema with a search action (eligible for a sitelinks searchbox). */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "AI Goldmining",
    inLanguage: "de-DE",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/kurse?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** FAQ schema from on-page Q&A — can earn an expandable FAQ rich result. */
export function faqPageSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/** Product + Offer schema for a single course (price/availability snippet). */
export function courseProductSchema(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: course.title,
    description: course.description || course.tagline,
    image: course.image,
    brand: { "@type": "Brand", name: "AI Goldmining" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/kurse/${course.slug}`,
      priceCurrency: "EUR",
      price: (course.priceCents / 100).toFixed(2),
      availability: course.comingSoon
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
    },
  };
}

/** Breadcrumb trail schema for deeper pages. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Renders one or more schema objects as JSON-LD <script> tags. */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
