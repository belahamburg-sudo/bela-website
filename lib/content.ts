export type Lesson = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  videoUrl: string;
  resources: Array<{
    label: string;
    type: "PDF" | "Template" | "Prompt";
    href: string;
  }>;
};

/**
 * Editable sales-page sections for the product page. Every field is optional:
 * an empty / missing field simply hides its section on the page, so Bela controls
 * each product page from the dashboard without touching code.
 */
export type ProductPage = {
  /** H1 outcome headline (one sentence). */
  outcomeHeadline?: string;
  /** Subline that hints at the "how" / method. */
  subline?: string;
  /** Problem / status-quo diagnosis (max ~3 sentences). */
  problem?: string;
  /** Vision: how everyday life looks after the course (3 concrete points). */
  vision?: string[];
  /** What you really need — debunks what is NOT required (4 points). */
  needs?: string[];
  /** 3-step mechanic of how the course works (headline + one sentence each). */
  mechanism?: Array<{ title: string; copy: string }>;
  /** Personas this course is for (3-5). */
  whoFor?: string[];
  /** Disqualifiers — who it is NOT for (2-4). */
  whoNotFor?: string[];
  /** What you can do afterwards (4-6 outcome bullets, verb first). */
  afterOutcomes?: string[];
  /** Optional bonus line (e.g. included courses / community month). */
  bonus?: string;
  /** CTA-block transition headline (one sentence). */
  ctaHeadline?: string;
  /** Optional proof screenshots (storage refs / URLs) shown right before the CTA. */
  proofImages?: string[];
};

export type Course = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  priceCents: number;
  /** Strikethrough anchor price; a "-X% OFF" badge shows when priceCents is lower. */
  compareAtPriceCents?: number;
  image: string;
  /** Promo video shown on the product page, separate from the cover. */
  promoVideoUrl?: string;
  level: "Start" | "Aufbau" | "System" | "Bundle";
  format: "video" | "pdf";
  audience: string;
  outcome: string;
  featured?: boolean;
  /** Inactive catalog row — visible in member store, not purchasable yet. */
  comingSoon?: boolean;
  /** Hidden lead magnet: only visible after claiming via /freebie/[slug]. */
  isUnlisted?: boolean;
  sortOrder?: number;
  includes: string[];
  /** Slugs of other courses unlocked when this course is purchased (bundle / cross-grant). */
  bundledCourses?: string[];
  /** Hand-picked cross-sell course slugs shown under the lesson videos. */
  crossSellSlugs?: string[];
  /** Per-course affiliate / tools text shown under the lesson videos. */
  affiliateText?: string;
  /** Editable product-page sections (empty fields hide their section). */
  productPage?: ProductPage;
  modules: Array<{
    id: string;
    title: string;
    /** 3–5 sales bullets shown for this module on the product page. */
    highlights?: string[];
    lessons: Lesson[];
  }>;
};

/**
 * Static catalog. This is ONLY a safety FALLBACK: the live site reads courses
 * DB-first via lib/courses.ts and only falls back here if Supabase is entirely
 * unreachable. It mirrors the real, active catalog (metadata only — modules and
 * lessons live in the DB) so a DB outage never surfaces stale or removed
 * products. Keep it in sync with the active courses in Supabase.
 */
export const courses: Course[] = [
  {
    slug: "51-ai-business-ideen",
    title: "51 AI Business Ideen",
    tagline: "Die Karte zum Goldfeld",
    description:
      "Einundfünfzig reale Wege, mit Künstlicher Intelligenz Geld zu verdienen. Jede Idee mit Verdienst-Range, Erfahrungslevel, Kategorie und Zukunftsprognose. Du sollst nicht alles machen, du sollst eine wählen.",
    priceCents: 1900,
    image:
      "https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/51-ai-business-ideen/cover.jpg",
    level: "Start",
    format: "pdf",
    audience: "Einsteiger, die eine konkrete, profitable AI-Idee suchen",
    outcome:
      "51 geprüfte AI-Geschäftsideen mit Verdienst-Range, Level und Zukunftsprognose. Als sofort nutzbarer PDF-Katalog.",
    featured: true,
    sortOrder: 0,
    includes: [
      "51 reale AI-Geschäftsideen",
      "Verdienst-Range pro Idee",
      "Erfahrungslevel & Kategorie-Tag",
      "Zukunftsprognose pro Markt",
    ],
    bundledCourses: ["stan-store-masterclass"],
    modules: [],
  },
  {
    slug: "stan-store-masterclass",
    title: "Stan Store Masterclass",
    tagline: "Dein Stan Store, der verkauft",
    description:
      "Von Setup bis Verkauf: wie du deinen Stan Store sauber aufbaust, Produkte und Checkout einrichtest, das Design auf Conversion trimmst und die Produktübergabe automatisierst.",
    priceCents: 4900,
    image:
      "https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/stan-store-masterclass/cover.png",
    level: "System",
    format: "pdf",
    audience:
      "Creator, die einen Store zum Verkaufen digitaler Produkte aufbauen wollen",
    outcome:
      "Ein fertig eingerichteter, verkaufsoptimierter Stan Store mit Produkten, Checkout und automatischer Auslieferung.",
    featured: true,
    sortOrder: 40,
    includes: [
      "Stan Store Foundations",
      "Produkte & Checkout aufsetzen",
      "Storedesign & Promotion",
      "Produktübergabe & Speicherung",
    ],
    modules: [],
  },
  {
    slug: "rechtliches-digitale-produkte",
    title: "Rechtliches für digitale Produkte",
    tagline: "Rechtssicher verkaufen",
    description:
      "Die rechtlichen Grundlagen für den Verkauf digitaler Produkte: Widerruf, Disclaimer, AGB, Impressum und Datenschutz. Mit fertigen Vorlagen zum Anpassen.",
    priceCents: 2900,
    image:
      "https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/rechtliches-digitale-produkte/cover.png",
    level: "Start",
    format: "pdf",
    audience: "Alle, die digitale Produkte rechtssicher verkaufen wollen",
    outcome:
      "Rechtssicheres Setup mit fertigen Vorlagen für AGB, Impressum und Datenschutz.",
    featured: false,
    sortOrder: 41,
    includes: [
      "Grundlagen Recht & Widerruf",
      "Disclaimer-Vorlagen",
      "AGB-, Impressum- & Datenschutz-Vorlagen",
    ],
    modules: [],
  },
  {
    slug: "stop-care-want-more",
    title: "Stop Care Want More",
    tagline: "Das Content-Playbook",
    description:
      "Das Playbook für Content, der zieht: weniger gefallen wollen, mehr Wirkung. Hooks, Haltung und ein wiederholbarer Prozess für Content, der verkauft.",
    priceCents: 2900,
    image:
      "https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/stop-care-want-more/cover.png",
    level: "Aufbau",
    format: "pdf",
    audience: "Creator, die mit Content sichtbar werden und verkaufen wollen",
    outcome:
      "Ein klares Content-Playbook mit Hooks, Haltung und wiederholbarem Prozess.",
    featured: false,
    sortOrder: 60,
    includes: [
      "Content-Playbook (PDF)",
      "Hooks & Haltung",
      "Wiederholbarer Content-Prozess",
    ],
    modules: [],
  },
];

export const featuredCourses = courses.filter((course) => course.featured);

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export const navItems = [
  { href: "/kurse", label: "Kurse" },
  { href: "/services", label: "Services" },
  { href: "/webinar", label: "Webinar" },
  { href: "/about", label: "Über mich" }
];

export const faqItems = [
  {
    q: "Brauche ich Vorerfahrung in Marketing oder AI?",
    a: "Nein. Die Methode funktioniert ab null. Was du brauchst: Bereitschaft, wirklich umzusetzen. Es gibt Menschen, die scheitern mit 10 Jahren Marketing-Erfahrung, und andere, die in 6 Wochen ihr erstes Produkt launchen ohne Vorwissen. Der Unterschied ist nie das Vorwissen."
  },
  {
    q: "Ist das wieder so ein Reichtums-Versprechen?",
    a: "Nein. Das erste realistische Ziel ist 3.000 € monatlich selbstständig: nicht 20K in 30 Tagen. Kein Zertifikat garantiert dir Umsatz. Was du bekommst, ist ein System, das funktioniert, wenn du es durchziehst. Keine Garantie, aber eine ehrliche Roadmap."
  },
  {
    q: "Wie viel Startkapital brauche ich?",
    a: "Für das erste digitale Produkt: effektiv 0 €. Du brauchst Notion/Canva/Google Docs (alles Gratis-Tier) und einen Store wie Gumroad oder Stripe Payment Links. Werbebudget ist optional und erst ab Produkt-Launch relevant."
  },
  {
    q: "Wie viel Zeit muss ich investieren?",
    a: "Realistisch 5 bis 10 Stunden pro Woche, um in 8 bis 12 Wochen das erste Produkt fertig im Store zu haben. Mehr Zeit = schneller. Weniger als 3 Stunden pro Woche reicht nicht: das ist keine Nebenbei-5-Minuten-Methode."
  },
  {
    q: "Brauche ich Reichweite oder Follower?",
    a: "Nein. Die ersten 3.000 € machst du ohne Publikum, weil du nicht auf Virality angewiesen bist. Mit Newsletter + Direct Outreach + kleinem Ad-Budget reicht das. Reichweite hilft später beim Skalieren, ist aber kein Startbedingung."
  },
  {
    q: "Was unterscheidet AI Goldmining von anderen AI-Kursen?",
    a: "Die meisten AI-Kurse sind Tool-Rundgänge. Hier geht es um den Verkaufsprozess. Das Tool ändert sich alle 3 Monate, die Methode bleibt. Du lernst, wie du aus AI-Output verkaufbare Produkte machst: nicht, welches Tool gerade trending ist."
  },
  {
    q: "Kann ich die Kurse mit Ratenzahlung bezahlen?",
    a: "Ja. Im Checkout kannst du bequem mit Klarna in Raten zahlen oder auch später bezahlen. Keine versteckten Gebühren, keine Abofalle."
  }
];
