import { getPublicCourses } from "@/lib/courses";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com"
).replace(/\/$/, "");

// Re-read the catalog at most hourly so new/edited courses appear without a
// redeploy, while keeping the route cheap for LLM crawlers.
export const revalidate = 3600;

/**
 * llms.txt — a plain-text brief for AI crawlers (ChatGPT, Perplexity, Claude…),
 * following the https://llmstxt.org convention. Gives LLMs a clean, structured
 * map of who we are and what we offer, instead of guessing from rendered HTML.
 */
export async function GET() {
  let courseLines = "";
  try {
    const courses = await getPublicCourses();
    courseLines = courses
      .filter((c) => !c.isUnlisted)
      .map((c) => {
        const price =
          c.priceCents > 0 ? `${(c.priceCents / 100).toFixed(0)} €` : "kostenlos";
        return `- [${c.title}](${BASE_URL}/kurse/${c.slug}): ${c.tagline} (${price})`;
      })
      .join("\n");
  } catch {
    courseLines = "";
  }

  const body = `# AI Goldmining

> AI Goldmining bringt dir bei, mit Künstlicher Intelligenz digitale Produkte zu bauen und automatisiert zu verkaufen. Klarheit statt Hype – gegründet von Bela Goldmann.

AI Goldmining ist eine deutschsprachige Lernplattform für digitale Produkte und AI-gestütztes Online-Business. Angeboten werden Online-Kurse, ein kostenloses Webinar und eine Community. Der realistische Zielrahmen für Einsteiger ist die erste Selbstständigkeit (ca. 3.000 € monatlich) – ohne Reichtumsversprechen, ohne Vorerfahrung in Marketing oder AI.

## Kurse
${courseLines || `- Kurskatalog: ${BASE_URL}/kurse`}

## Wichtige Seiten
- [Kurse](${BASE_URL}/kurse): Vollständiger Kurskatalog
- [Webinar](${BASE_URL}/webinar): Kostenloses Live-Webinar zum Einstieg
- [Über Bela](${BASE_URL}/about): Gründer & Methode
- [Community](${BASE_URL}/community): Austausch & Support
- [Services](${BASE_URL}/services): Weitere Angebote

## Kontakt
- Website: ${BASE_URL}
- E-Mail: contact@aigoldmining.com
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
