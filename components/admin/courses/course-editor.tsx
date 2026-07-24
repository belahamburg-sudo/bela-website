"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ImageIcon,
  Save,
  Trash2,
  Boxes,
  Film,
  ChevronUp,
  ChevronDown,
  CreditCard,
  Plus,
} from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { FileUpload } from "@/components/admin/file-upload";
import { useToast } from "@/components/admin/toast";
import { updateCourse, syncCourseToStripe } from "@/app/admin/kurse/actions";
import { CurriculumEditor } from "./curriculum-editor";
import { CourseTestimonialsEditor } from "./testimonials-editor";

export type ResourceItem = {
  label: string;
  type: "PDF" | "Template" | "Prompt" | "XLSX" | "TXT" | "HTML";
  href: string;
};

export type EditorLesson = {
  id: string;
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
  resources: ResourceItem[];
};

export type ModuleRecommendationInput = { slug: string; note: string };

/** One value-stacked bonus row in the product-page editor. */
export type BonusRow = { title: string; value: string; desc: string; image: string };

/** One curated "Selbst wenn…" testimonial row in the product-page editor. */
export type TestimonialRow = { text: string; author: string; image: string };

export type EditorModule = {
  id: string;
  title: string;
  /** Courses recommended to members after this module (empty = none). */
  recommendations: ModuleRecommendationInput[];
  /** 3–5 sales bullets shown for this module on the product page. */
  highlights: string[];
  /** Public preview/teaser video shown for this module on the product page ("" = none). */
  previewVideoUrl: string;
  lessons: EditorLesson[];
};

export type EditorCourse = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  priceCents: number;
  /** Strikethrough anchor price in cents (optional). */
  compareAtPriceCents: number | null;
  image: string | null;
  /** Promo video ref/URL shown on the product page (optional). */
  promoVideoUrl: string | null;
  level: string;
  format: "video" | "pdf";
  audience: string;
  outcome: string;
  featured: boolean;
  isActive: boolean;
  isUnlisted: boolean;
  sortOrder: number;
  includes: string[];
  /** Slugs of other courses unlocked when THIS course is bought (bundle / bonus). */
  bundledCourses: string[];
  /** Hand-picked cross-sell course slugs shown under the lesson videos. */
  crossSellSlugs: string[];
  /** Per-course affiliate / tools text shown under the lesson videos. */
  affiliateText: string;
  /** Editable product-page sections (empty fields hide their section). */
  productPage: Record<string, unknown>;
  /** Linked Stripe product/price (set via the sync button). */
  stripeProductId: string | null;
  stripePriceId: string | null;
  modules: EditorModule[];
};

export type CoursePickOption = { slug: string; title: string };

const LEVELS = ["Start", "Aufbau", "System", "Bundle"];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

/** Build a previewable URL from a storage://media/… ref (public bucket only). */
function toPreview(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("storage://")) return value;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${value.slice("storage://".length)}`;
}

export function CourseEditor({
  course,
  allCourses = [],
}: {
  course: EditorCourse;
  allCourses?: CoursePickOption[];
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [tagline, setTagline] = useState(course.tagline);
  const [description, setDescription] = useState(course.description);
  const [priceEuros, setPriceEuros] = useState(
    course.priceCents ? (course.priceCents / 100).toString() : ""
  );
  const [compareAtEuros, setCompareAtEuros] = useState(
    course.compareAtPriceCents ? (course.compareAtPriceCents / 100).toString() : ""
  );
  const [imageUrl, setImageUrl] = useState<string | null>(course.image);
  const [promoVideoUrl, setPromoVideoUrl] = useState<string | null>(course.promoVideoUrl);
  const [level, setLevel] = useState(course.level || "Start");
  const [format, setFormat] = useState<"video" | "pdf">(course.format);
  const [audience, setAudience] = useState(course.audience);
  const [outcome, setOutcome] = useState(course.outcome);
  const [featured, setFeatured] = useState(course.featured);
  const [isActive, setIsActive] = useState(course.isActive);
  const [isUnlisted, setIsUnlisted] = useState(course.isUnlisted);
  const [sortOrder, setSortOrder] = useState(course.sortOrder);
  const [includesText, setIncludesText] = useState(course.includes.join("\n"));
  const [bundled, setBundled] = useState<string[]>(course.bundledCourses ?? []);

  // Cross-sell pool + affiliate text shown under the lesson videos.
  const [crossSell, setCrossSell] = useState<string[]>(course.crossSellSlugs ?? []);
  const [affiliateText, setAffiliateText] = useState(course.affiliateText ?? "");

  // Stripe product link (set via the sync button).
  const [stripeProductId, setStripeProductId] = useState<string | null>(course.stripeProductId);
  const [stripeSyncing, setStripeSyncing] = useState(false);

  function handleStripeSync() {
    setStripeSyncing(true);
    void syncCourseToStripe({ id: course.id })
      .then((res) => {
        if (res.ok) {
          success(stripeProductId ? "Stripe-Produkt aktualisiert." : "Stripe-Produkt erstellt.");
          if (res.productId) setStripeProductId(res.productId);
          router.refresh();
        } else {
          error(res.error ?? "Stripe-Sync fehlgeschlagen.");
        }
      })
      .finally(() => setStripeSyncing(false));
  }

  // Editable product-page sections (stored as a JSON blob; arrays edited as
  // one-item-per-line text).
  const pp = course.productPage ?? {};
  const ppStr = (k: string) => (typeof pp[k] === "string" ? (pp[k] as string) : "");
  const ppList = (k: string) => (Array.isArray(pp[k]) ? (pp[k] as string[]).join("\n") : "");
  const [ppOutcome, setPpOutcome] = useState(ppStr("outcomeHeadline"));
  const [ppSubline, setPpSubline] = useState(ppStr("subline"));
  const [ppProblemStatement, setPpProblemStatement] = useState(ppStr("problemStatement"));
  const [ppHeroCtaLabel, setPpHeroCtaLabel] = useState(ppStr("heroCtaLabel"));
  const [ppProblem, setPpProblem] = useState(ppStr("problem"));
  const [ppVision, setPpVision] = useState(ppList("vision"));
  const [ppNeeds, setPpNeeds] = useState(ppList("needs"));
  const [ppMechanism, setPpMechanism] = useState(
    Array.isArray(pp.mechanism)
      ? (pp.mechanism as Array<{ title: string; copy: string }>)
          .map((m) => `${m.title} | ${m.copy}`)
          .join("\n")
      : ""
  );
  const [ppWhoFor, setPpWhoFor] = useState(ppList("whoFor"));
  const [ppWhoNotFor, setPpWhoNotFor] = useState(ppList("whoNotFor"));
  const [ppCta, setPpCta] = useState(ppStr("ctaHeadline"));
  // Early social-proof strip shown right under the hero.
  const ppHero = (pp.heroResult ?? {}) as { stat?: string; text?: string };
  const [ppHeroStat, setPpHeroStat] = useState(ppHero.stat ?? "");
  const [ppHeroText, setPpHeroText] = useState(ppHero.text ?? "");
  // Value-stacked bonus list; seeded from the legacy single `bonus` line if set.
  const [ppBonuses, setPpBonuses] = useState<BonusRow[]>(() => {
    const rawBonuses = Array.isArray(pp.bonuses) ? (pp.bonuses as Array<Partial<BonusRow>>) : [];
    if (rawBonuses.length > 0) {
      return rawBonuses.map((b) => ({
        title: b.title ?? "",
        value: b.value ?? "",
        desc: b.desc ?? "",
        image: b.image ?? "",
      }));
    }
    if (typeof pp.bonus === "string" && pp.bonus.trim()) {
      return [{ title: pp.bonus.trim(), value: "", desc: "", image: "" }];
    }
    return [];
  });
  const [ppProof, setPpProof] = useState<string[]>(
    Array.isArray(pp.proofImages) ? (pp.proofImages as string[]) : []
  );

  // "Wie es mir geht" / "Wie es meinen Kunden geht" — story text + photo.
  const ppSelf = (pp.selfStory ?? {}) as { text?: string; image?: string };
  const [ppSelfText, setPpSelfText] = useState(ppSelf.text ?? "");
  const [ppSelfImage, setPpSelfImage] = useState(ppSelf.image ?? "");
  const ppCust = (pp.customerStory ?? {}) as { text?: string; image?: string };
  const [ppCustText, setPpCustText] = useState(ppCust.text ?? "");
  const [ppCustImage, setPpCustImage] = useState(ppCust.image ?? "");

  // "Vom Angenommenen befreien" — headline + ✗ items (Titel | Beschreibung pro Zeile).
  const ppAsm = (pp.assumptions ?? {}) as {
    headline?: string;
    items?: Array<{ title?: string; copy?: string }>;
  };
  const [ppAsmHeadline, setPpAsmHeadline] = useState(ppAsm.headline ?? "");
  const [ppAsmItems, setPpAsmItems] = useState(
    Array.isArray(ppAsm.items)
      ? ppAsm.items.map((m) => `${m.title ?? ""} | ${m.copy ?? ""}`).join("\n")
      : ""
  );

  // Curated "Selbst wenn…" testimonials — text + author + photo.
  const [ppTestimonials, setPpTestimonials] = useState<TestimonialRow[]>(() =>
    Array.isArray(pp.testimonials)
      ? (pp.testimonials as Array<Partial<TestimonialRow>>).map((t) => ({
          text: t.text ?? "",
          author: t.author ?? "",
          image: t.image ?? "",
        }))
      : []
  );

  // "Kurzer Einblick gefällig?" — headline (video reuses the promo video above).
  const ppInsight = (pp.insight ?? {}) as { headline?: string };
  const [ppInsightHeadline, setPpInsightHeadline] = useState(ppInsight.headline ?? "");

  function updateTestimonial(i: number, patch: Partial<TestimonialRow>) {
    setPpTestimonials((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTestimonial() {
    setPpTestimonials((prev) => [...prev, { text: "", author: "", image: "" }]);
  }
  function removeTestimonial(i: number) {
    setPpTestimonials((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateBonus(i: number, patch: Partial<BonusRow>) {
    setPpBonuses((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }
  function addBonus() {
    setPpBonuses((prev) => [...prev, { title: "", value: "", desc: "", image: "" }]);
  }
  function removeBonus(i: number) {
    setPpBonuses((prev) => prev.filter((_, idx) => idx !== i));
  }

  const otherCourses = allCourses.filter((c) => c.slug !== course.slug);
  const bundledTitle = (s: string) => allCourses.find((c) => c.slug === s)?.title ?? s;

  function toggleBundled(slug: string) {
    setBundled((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function moveBundled(index: number, dir: -1 | 1) {
    setBundled((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleCrossSell(slug: string) {
    setCrossSell((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleSave() {
    if (!title.trim()) {
      error("Titel ist erforderlich.");
      return;
    }
    const euros = parseFloat(priceEuros.replace(",", "."));
    const priceCents = Number.isFinite(euros) ? Math.round(euros * 100) : 0;
    const compareEuros = parseFloat(compareAtEuros.replace(",", "."));
    const compareAtPriceCents =
      Number.isFinite(compareEuros) && compareEuros > 0 ? Math.round(compareEuros * 100) : null;

    const lines = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);
    const titleCopy = (t: string) =>
      lines(t).map((l) => {
        const [first, ...rest] = l.split("|");
        return { title: (first ?? "").trim(), copy: rest.join("|").trim() };
      });
    const productPage = {
      outcomeHeadline: ppOutcome,
      subline: ppSubline,
      problemStatement: ppProblemStatement,
      heroCtaLabel: ppHeroCtaLabel,
      problem: ppProblem,
      vision: lines(ppVision),
      needs: lines(ppNeeds),
      mechanism: titleCopy(ppMechanism),
      whoFor: lines(ppWhoFor),
      whoNotFor: lines(ppWhoNotFor),
      heroResult: { stat: ppHeroStat.trim(), text: ppHeroText.trim() },
      selfStory: { text: ppSelfText.trim(), image: ppSelfImage.trim() },
      customerStory: { text: ppCustText.trim(), image: ppCustImage.trim() },
      assumptions: { headline: ppAsmHeadline.trim(), items: titleCopy(ppAsmItems) },
      testimonials: ppTestimonials
        .map((t) => ({ text: t.text.trim(), author: t.author.trim(), image: t.image.trim() }))
        .filter((t) => t.text),
      insight: { headline: ppInsightHeadline.trim() },
      bonuses: ppBonuses
        .map((b) => ({
          title: b.title.trim(),
          value: b.value.trim(),
          desc: b.desc.trim(),
          image: b.image.trim(),
        }))
        .filter((b) => b.title || b.desc),
      ctaHeadline: ppCta,
      proofImages: ppProof,
    };

    startTransition(async () => {
      const res = await updateCourse({
        id: course.id,
        title,
        slug,
        tagline,
        description,
        priceCents,
        compareAtPriceCents,
        imageUrl,
        promoVideoUrl,
        level,
        format,
        audience,
        outcome,
        featured,
        isActive,
        isUnlisted,
        sortOrder,
        includes: includesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        bundledCourses: bundled,
        crossSellSlugs: crossSell,
        affiliateText,
        productPage,
      });
      if (res.ok) {
        success("Kurs gespeichert.");
        router.refresh();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  const preview = toPreview(imageUrl);
  const promoPreview = toPreview(promoVideoUrl);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      {/* Top bar */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/kurse"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cream/40 transition-colors hover:text-gold-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Alle Kurse
          </Link>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-cream sm:text-3xl">
            {title || "Kurs bearbeiten"}
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Link href={`/kurse/${course.slug}`} target="_blank">
            <AdminButton variant="ghost" size="sm" icon={ExternalLink}>
              Ansehen
            </AdminButton>
          </Link>
          <AdminButton variant="primary" size="sm" icon={Save} onClick={handleSave} loading={pending}>
            Speichern
          </AdminButton>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Metadata */}
        <Panel title="Kursdetails">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="tac-label mb-1.5 block">Titel *</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Slug</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="wird aus Titel erzeugt"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className="tac-label mb-1.5 block">Tagline</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Kurzer Slogan"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="tac-label mb-1.5 block">Beschreibung</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="tac-label mb-1.5 block">Preis (€)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceEuros}
                  onChange={(e) => setPriceEuros(e.target.value)}
                  placeholder="29"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Level</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputClass}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Format</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value === "pdf" ? "pdf" : "video")}
                  className={inputClass}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="tac-label mb-1.5 block">Ankerpreis (€) — optional</span>
              <input
                type="text"
                inputMode="decimal"
                value={compareAtEuros}
                onChange={(e) => setCompareAtEuros(e.target.value)}
                placeholder="z.B. 199"
                className={inputClass}
              />
              <span className="mt-1.5 block text-xs text-cream/40">
                Durchgestrichener Vergleichspreis. Liegt der echte Preis darunter, zeigt die Karte
                automatisch ein <span className="font-semibold text-gold-200">„-X% OFF“</span>.
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="tac-label mb-1.5 block">Zielgruppe</span>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Für wen ist der Kurs?"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Reihenfolge</span>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className="tac-label mb-1.5 block">Ergebnis / Outcome</span>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={2}
                placeholder="Was hat die Person nach dem Kurs?"
                className={`${inputClass} resize-y`}
              />
            </label>

            <label className="block">
              <span className="tac-label mb-1.5 block">Enthalten (eine Zeile pro Punkt)</span>
              <textarea
                value={includesText}
                onChange={(e) => setIncludesText(e.target.value)}
                rows={4}
                placeholder={
                  "Produktideen-Framework\nVerkaufsseiten-Checkliste | https://example.com/checkliste\nWeiterführender Kurs -> /kurse/ai-goldmining-system"
                }
                className={`${inputClass} resize-y`}
              />
              <span className="mt-1.5 block text-xs text-cream/40">
                Optional pro Zeile ein Link:{" "}
                <code className="font-mono text-cream/60">Label | https://…</code> oder
                Kurs-Verweis{" "}
                <code className="font-mono text-cream/60">Label -&gt; /kurse/slug</code>.
                Reiner Text funktioniert weiterhin.
              </span>
            </label>

            <div className="flex flex-wrap gap-3 pt-1">
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-obsidian/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300"
                />
                <span className="text-sm text-cream/80">
                  Aktiv <span className="text-cream/40">— im Store sichtbar</span>
                </span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-obsidian/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300"
                />
                <span className="text-sm text-cream/80">
                  Featured <span className="text-cream/40">— auf Startseite</span>
                </span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-obsidian/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isUnlisted}
                  onChange={(e) => setIsUnlisted(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300"
                />
                <span className="text-sm text-cream/80">
                  Freebie <span className="text-cream/40">— nur per Link sichtbar</span>
                </span>
              </label>
            </div>
          </div>
        </Panel>

        {/* Cover image + promo video */}
        <Panel title="Cover & Promo-Video">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-obsidian/60">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-cream/25">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Kein Bild</span>
                </div>
              )}
            </div>

            <FileUpload
              bucket="media"
              prefix="covers"
              kind="image"
              accept="image/*"
              hint="JPG, PNG oder SVG"
              onUploaded={(f) => {
                setImageUrl(f.ref);
                success("Bild hochgeladen — zum Übernehmen speichern.");
              }}
            />

            {imageUrl && (
              <AdminButton
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => setImageUrl(null)}
              >
                Bild entfernen
              </AdminButton>
            )}

            {/* Promo video shown on the public product page (separate from cover). */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <span className="tac-label block">Promo-Video — optional</span>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-obsidian/60">
                {promoPreview ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={promoPreview} controls className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-cream/25">
                    <Film className="h-8 w-8" />
                    <span className="text-xs">Kein Video</span>
                  </div>
                )}
              </div>
              <FileUpload
                bucket="media"
                prefix="promo"
                kind="video"
                accept="video/*"
                hint="Kurzes Erklärvideo für die Produktseite (MP4)"
                onUploaded={(f) => {
                  setPromoVideoUrl(f.ref);
                  success("Video hochgeladen — zum Übernehmen speichern.");
                }}
              />
              {promoVideoUrl && (
                <AdminButton
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setPromoVideoUrl(null)}
                >
                  Video entfernen
                </AdminButton>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Bundle / linked courses */}
      <div className="mt-6">
        <Panel title="Bundle / verknüpfte Kurse">
          <div className="space-y-4">
            <p className="text-sm text-cream/50">
              Wähle Kurse, die beim Kauf <span className="font-semibold text-cream/80">dieses</span>{" "}
              Kurses <span className="font-semibold text-cream/80">automatisch mit freigeschaltet</span>{" "}
              werden. So baust du ein <span className="text-gold-200">Bundle</span> (mehrere Kurse in
              einem) oder gibst einen <span className="text-gold-200">Bonus-Kurs</span> dazu. Das gilt
              einseitig: Käufer dieses Kurses bekommen die ausgewählten — nicht umgekehrt.
            </p>

            {otherCourses.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-obsidian/40 px-3 py-3 text-sm text-cream/40">
                Es gibt noch keine anderen Kurse zum Verknüpfen.
              </p>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {otherCourses.map((c) => {
                    const checked = bundled.includes(c.slug);
                    return (
                      <label
                        key={c.slug}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          checked
                            ? "border-gold-300/40 bg-gold-300/[0.06]"
                            : "border-white/10 bg-obsidian/40 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBundled(c.slug)}
                          className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-cream/90">{c.title}</span>
                          <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-cream/30">
                            {c.slug}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {bundled.length > 1 && (
                  <div className="space-y-1.5 rounded-lg border border-white/10 bg-obsidian/40 p-3">
                    <p className="tac-label mb-1">Reihenfolge der eingebetteten Kurse</p>
                    {bundled.map((s, i) => (
                      <div
                        key={s}
                        className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                      >
                        <span className="font-mono text-[10px] text-cream/30">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-cream/80">
                          {bundledTitle(s)}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveBundled(i, -1)}
                          disabled={i === 0}
                          className="rounded p-1 text-cream/40 transition-colors hover:text-gold-300 disabled:opacity-25"
                          aria-label="Nach oben"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBundled(i, 1)}
                          disabled={i === bundled.length - 1}
                          className="rounded p-1 text-cream/40 transition-colors hover:text-gold-300 disabled:opacity-25"
                          aria-label="Nach unten"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-cream/50">
                  <Boxes className="h-3.5 w-3.5 text-gold-300/60" />
                  {bundled.length === 0
                    ? "Keine Kurse verknüpft."
                    : `${bundled.length} Kurs${bundled.length === 1 ? "" : "e"} werden mit freigeschaltet. Zum Übernehmen oben „Speichern".`}
                </div>
              </>
            )}
          </div>
        </Panel>
      </div>

      {/* Cross-Sell & Affiliate (shown under the lesson videos) */}
      <div className="mt-6">
        <Panel title="Cross-Sell & Affiliate (unter den Videos)">
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm text-cream/50">
                Diese Kurse werden Käufern <span className="text-gold-200">unter den Lektions-Videos</span>{" "}
                als passende Cross-Sells vorgeschlagen. Frei pro Kurs wählbar.
              </p>
              {otherCourses.length === 0 ? (
                <p className="rounded-lg border border-white/10 bg-obsidian/40 px-3 py-3 text-sm text-cream/40">
                  Es gibt noch keine anderen Kurse.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {otherCourses.map((c) => {
                    const checked = crossSell.includes(c.slug);
                    return (
                      <label
                        key={c.slug}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          checked
                            ? "border-gold-300/40 bg-gold-300/[0.06]"
                            : "border-white/10 bg-obsidian/40 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCrossSell(c.slug)}
                          className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300"
                        />
                        <span className="min-w-0 truncate text-sm text-cream/90">{c.title}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <label className="block">
              <span className="tac-label mb-1.5 block">Affiliate-Text (unter den Videos)</span>
              <textarea
                value={affiliateText}
                onChange={(e) => setAffiliateText(e.target.value)}
                rows={3}
                placeholder="z.B. Meine Tools & Empfehlungen für diesen Kurs …"
                className={`${inputClass} resize-y`}
              />
            </label>
          </div>
        </Panel>
      </div>

      {/* Editable product page */}
      <div className="mt-6">
        <Panel title="Produktseite (leere Felder = Sektion ausgeblendet)">
          <div className="grid gap-4">
            <p className="text-sm text-cream/50">
              Alles hier landet auf der öffentlichen Produktseite. Was du leer lässt, wird automatisch
              <span className="text-cream/80"> ausgeblendet</span>. Bei Listen: eine Zeile pro Punkt.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="tac-label mb-1.5 block">Outcome-Headline</span>
                <input
                  value={ppOutcome}
                  onChange={(e) => setPpOutcome(e.target.value)}
                  placeholder="Das Ergebnis in einem Satz"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Subline</span>
                <input
                  value={ppSubline}
                  onChange={(e) => setPpSubline(e.target.value)}
                  placeholder="Deutet die Methode / das Wie an"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className="tac-label mb-1.5 block">Provokativer Problem-Statement-Satz (Hero)</span>
              <textarea
                value={ppProblemStatement}
                onChange={(e) => setPpProblemStatement(e.target.value)}
                rows={2}
                placeholder="Steht unter dem Cover, z.B. „Wenn du nicht lernst … kannst du dein Geld genauso gut aus dem Fenster werfen“"
                className={`${inputClass} resize-y`}
              />
            </label>

            <label className="block">
              <span className="tac-label mb-1.5 block">Hero-CTA-Button-Text</span>
              <input
                value={ppHeroCtaLabel}
                onChange={(e) => setPpHeroCtaLabel(e.target.value)}
                placeholder="Cool! Zeig mir wie's geht!"
                className={inputClass}
              />
              <span className="mt-1.5 block text-xs text-cream/40">
                Alle CTA-Buttons scrollen zur Kauf-Sektion ganz unten. Leer = Standardtext.
              </span>
            </label>

            <label className="block">
              <span className="tac-label mb-1.5 block">Problem / Status-Quo</span>
              <textarea
                value={ppProblem}
                onChange={(e) => setPpProblem(e.target.value)}
                rows={3}
                placeholder="Sachliche Diagnose, max. 3 Sätze"
                className={`${inputClass} resize-y`}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="tac-label mb-1.5 block">Vision (eine Zeile pro Punkt)</span>
                <textarea
                  value={ppVision}
                  onChange={(e) => setPpVision(e.target.value)}
                  rows={4}
                  placeholder={"Wie der Alltag danach aussieht\n3 konkrete Punkte"}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Was du wirklich brauchst (✗ was NICHT nötig ist)</span>
                <textarea
                  value={ppNeeds}
                  onChange={(e) => setPpNeeds(e.target.value)}
                  rows={4}
                  placeholder={"Keine Programmierkenntnisse\nKein großes Startbudget\nKeine Reichweite\nKein jahrelanges Ausprobieren"}
                  className={`${inputClass} resize-y`}
                />
              </label>
            </div>

            <label className="block">
              <span className="tac-label mb-1.5 block">
                So funktioniert der Kurs (pro Zeile: Titel | Beschreibung)
              </span>
              <textarea
                value={ppMechanism}
                onChange={(e) => setPpMechanism(e.target.value)}
                rows={3}
                placeholder={"Schritt 1 | Was passiert\nSchritt 2 | Was passiert"}
                className={`${inputClass} resize-y`}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="tac-label mb-1.5 block">Für wen (eine Zeile pro Persona)</span>
                <textarea
                  value={ppWhoFor}
                  onChange={(e) => setPpWhoFor(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Für wen NICHT</span>
                <textarea
                  value={ppWhoNotFor}
                  onChange={(e) => setPpWhoNotFor(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
              </label>
            </div>

            {/* Wie es mir geht / Wie es meinen Kunden geht (+ Foto) */}
            <div className="grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="tac-label block">Wie es mir geht (+ Foto)</span>
                <textarea
                  value={ppSelfText}
                  onChange={(e) => setPpSelfText(e.target.value)}
                  rows={4}
                  placeholder="Kurze Story: wie es dir geht — mit dem, was im Kurs vorkommt"
                  className={`${inputClass} resize-y`}
                />
                {ppSelfImage ? (
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-24 flex-none overflow-hidden rounded-md border border-white/10 bg-obsidian/60">
                      {toPreview(ppSelfImage) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={toPreview(ppSelfImage)!} alt="Foto" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-cream/25">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPpSelfImage("")}
                      className="text-xs font-semibold text-cream/50 transition-colors hover:text-red-300"
                    >
                      Foto entfernen
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    bucket="media"
                    prefix="story"
                    kind="image"
                    accept="image/*"
                    hint="Dein Foto (optional)"
                    onUploaded={(f) => {
                      setPpSelfImage(f.ref);
                      success("Foto hinzugefügt — zum Übernehmen speichern.");
                    }}
                  />
                )}
              </div>
              <div className="space-y-2">
                <span className="tac-label block">Wie es meinen Kunden geht (+ Foto)</span>
                <textarea
                  value={ppCustText}
                  onChange={(e) => setPpCustText(e.target.value)}
                  rows={4}
                  placeholder="Kurze Story: wie es deinen Kunden geht — mit dem, was im Kurs vorkommt"
                  className={`${inputClass} resize-y`}
                />
                {ppCustImage ? (
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-24 flex-none overflow-hidden rounded-md border border-white/10 bg-obsidian/60">
                      {toPreview(ppCustImage) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={toPreview(ppCustImage)!} alt="Foto" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-cream/25">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPpCustImage("")}
                      className="text-xs font-semibold text-cream/50 transition-colors hover:text-red-300"
                    >
                      Foto entfernen
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    bucket="media"
                    prefix="story"
                    kind="image"
                    accept="image/*"
                    hint="Kunden-Foto (optional)"
                    onUploaded={(f) => {
                      setPpCustImage(f.ref);
                      success("Foto hinzugefügt — zum Übernehmen speichern.");
                    }}
                  />
                )}
              </div>
            </div>

            {/* Vom Angenommenen befreien (✗) */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <span className="tac-label block">Vom Angenommenen befreien (✗) — Mythos-Buster</span>
              <input
                value={ppAsmHeadline}
                onChange={(e) => setPpAsmHeadline(e.target.value)}
                placeholder="Headline, z.B. „Um … braucht es weniger, als du denkst!“"
                className={inputClass}
              />
              <textarea
                value={ppAsmItems}
                onChange={(e) => setPpAsmItems(e.target.value)}
                rows={4}
                placeholder={
                  "Täglich posten | Du musst nicht jeden Tag ein Reel raushauen\nDesigner-Branding | Du brauchst keine Agentur fürs Branding"
                }
                className={`${inputClass} resize-y`}
              />
              <span className="block text-xs text-cream/40">
                Pro Zeile: <code className="font-mono text-cream/60">Fett-Teil | Erklärung</code>. Wird
                mit ✗ angezeigt.
              </span>
            </div>

            {/* Testimonials „Selbst wenn…“ (+ Foto) */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <span className="tac-label block">Testimonials „Selbst wenn…“ (+ Foto)</span>
                <AdminButton variant="ghost" size="sm" icon={Plus} onClick={addTestimonial}>
                  Testimonial
                </AdminButton>
              </div>
              <p className="text-xs text-cream/40">
                Kuratierte Stimmen mit Text, Name & optionalem Foto. Leer = Sektion unsichtbar.
              </p>
              {ppTestimonials.map((t, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-white/10 bg-obsidian/40 p-4">
                  <div className="flex items-start gap-3">
                    <textarea
                      value={t.text}
                      onChange={(e) => updateTestimonial(i, { text: e.target.value })}
                      rows={3}
                      placeholder="Zitat / Erfahrung"
                      className={`${inputClass} resize-y`}
                    />
                    <button
                      type="button"
                      onClick={() => removeTestimonial(i)}
                      className="flex h-9 w-9 flex-none items-center justify-center self-start rounded-md border border-white/10 text-cream/60 transition-colors hover:border-red-400/40 hover:text-red-300"
                      aria-label="Testimonial entfernen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={t.author}
                    onChange={(e) => updateTestimonial(i, { author: e.target.value })}
                    placeholder="Name (optional)"
                    className={inputClass}
                  />
                  {t.image ? (
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 flex-none overflow-hidden rounded-full border border-white/10 bg-obsidian/60">
                        {toPreview(t.image) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={toPreview(t.image)!} alt="Foto" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-cream/25">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateTestimonial(i, { image: "" })}
                        className="text-xs font-semibold text-cream/50 transition-colors hover:text-red-300"
                      >
                        Foto entfernen
                      </button>
                    </div>
                  ) : (
                    <FileUpload
                      bucket="media"
                      prefix="testimonial"
                      kind="image"
                      accept="image/*"
                      hint="Foto (optional)"
                      onUploaded={(f) => {
                        updateTestimonial(i, { image: f.ref });
                        success("Foto hinzugefügt — zum Übernehmen speichern.");
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Kurzer Einblick gefällig? (Video = Promo-Video oben) */}
            <label className="block border-t border-white/5 pt-4">
              <span className="tac-label mb-1.5 block">„Kurzer Einblick gefällig?“ — Überschrift</span>
              <input
                value={ppInsightHeadline}
                onChange={(e) => setPpInsightHeadline(e.target.value)}
                placeholder="Kurzer Einblick gefällig?"
                className={inputClass}
              />
              <span className="mt-1.5 block text-xs text-cream/40">
                Das Video dieser Sektion ist das <span className="text-cream/70">Promo-Video</span> oben
                („Cover &amp; Promo-Video“). Ohne Video &amp; Überschrift bleibt die Sektion unsichtbar.
              </span>
            </label>

            {/* Early social-proof strip (Julia-style) shown right under the hero */}
            <div className="grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-[160px_1fr]">
              <label className="block">
                <span className="tac-label mb-1.5 block">Hero-Ergebnis (Zahl)</span>
                <input
                  value={ppHeroStat}
                  onChange={(e) => setPpHeroStat(e.target.value)}
                  placeholder="z.B. 7.000€"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">Hero-Ergebnis (Text)</span>
                <input
                  value={ppHeroText}
                  onChange={(e) => setPpHeroText(e.target.value)}
                  placeholder="z.B. Umsatz dank Werbeanzeigen, mit niedrigem Budget"
                  className={inputClass}
                />
              </label>
            </div>

            {/* Value-stacked bonus list */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <span className="tac-label block">Boni (mit Wert & Screenshot)</span>
                <AdminButton variant="ghost" size="sm" icon={Plus} onClick={addBonus}>
                  Bonus
                </AdminButton>
              </div>
              <p className="text-xs text-cream/40">
                Jeder Bonus mit Titel, €-Wert (Anker) und optionalem Bild. Leer = Sektion unsichtbar.
              </p>
              {ppBonuses.map((b, i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-lg border border-white/10 bg-obsidian/40 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <input
                      value={b.title}
                      onChange={(e) => updateBonus(i, { title: e.target.value })}
                      placeholder="Bonus-Titel, z.B. +150 Content-Ideen"
                      className={inputClass}
                    />
                    <input
                      value={b.value}
                      onChange={(e) => updateBonus(i, { value: e.target.value })}
                      placeholder="Wert, z.B. 150€"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeBonus(i)}
                      className="flex h-9 w-9 items-center justify-center self-start rounded-md border border-white/10 text-cream/60 transition-colors hover:border-red-400/40 hover:text-red-300"
                      aria-label="Bonus entfernen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={b.desc}
                    onChange={(e) => updateBonus(i, { desc: e.target.value })}
                    rows={2}
                    placeholder="Kurze Beschreibung (optional)"
                    className={`${inputClass} resize-y`}
                  />
                  {b.image ? (
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-24 flex-none overflow-hidden rounded-md border border-white/10 bg-obsidian/60">
                        {toPreview(b.image) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={toPreview(b.image)!}
                            alt="Bonus"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-cream/25">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateBonus(i, { image: "" })}
                        className="text-xs font-semibold text-cream/50 transition-colors hover:text-red-300"
                      >
                        Bild entfernen
                      </button>
                    </div>
                  ) : (
                    <FileUpload
                      bucket="media"
                      prefix="bonus"
                      kind="image"
                      accept="image/*"
                      hint="Bonus-Screenshot (optional)"
                      onUploaded={(f) => {
                        updateBonus(i, { image: f.ref });
                        success("Bild hinzugefügt — zum Übernehmen speichern.");
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <label className="block">
              <span className="tac-label mb-1.5 block">CTA-Headline</span>
              <input
                value={ppCta}
                onChange={(e) => setPpCta(e.target.value)}
                placeholder="Übergangs-Headline vor dem Kauf-Button"
                className={inputClass}
              />
            </label>

            {/* Ergebnis-Proof screenshots — shown right before dem CTA. Leer = ausgeblendet. */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <span className="tac-label block">Ergebnis-Proof (Screenshots) — optional</span>
              <p className="text-xs text-cream/40">
                Echte Screenshots / Chatverläufe von Kunden. Werden direkt vor dem Kauf-Button
                angezeigt. Ohne Bilder bleibt die Sektion unsichtbar.
              </p>
              {ppProof.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ppProof.map((ref) => {
                    const src = toPreview(ref);
                    return (
                      <div
                        key={ref}
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-obsidian/60"
                      >
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt="Proof" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-cream/25">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPpProof((prev) => prev.filter((r) => r !== ref))}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-obsidian/80 text-cream/70 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                          aria-label="Bild entfernen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <FileUpload
                bucket="media"
                prefix="proof"
                kind="image"
                accept="image/*"
                hint="Screenshot hochladen — danach oben „Speichern“"
                onUploaded={(f) => {
                  setPpProof((prev) => (prev.includes(f.ref) ? prev : [...prev, f.ref]));
                  success("Screenshot hinzugefügt — zum Übernehmen speichern.");
                }}
              />
            </div>
          </div>
        </Panel>
      </div>

      {/* Testimonials (In-House-Bewertungen) */}
      <div className="mt-6">
        <CourseTestimonialsEditor courseSlug={course.slug} />
      </div>

      {/* Stripe product */}
      <div className="mt-6">
        <Panel title="Stripe-Produkt">
          <div className="space-y-4">
            <p className="text-sm text-cream/50">
              Legt diesen Kurs als <span className="font-semibold text-cream/80">Produkt in Stripe</span>{" "}
              an (oder aktualisiert ihn) — für den Stripe-Produktkatalog und die Pro-Produkt-Auswertung.
              Der <span className="text-gold-200">Preis bleibt aus dem Feld oben maßgeblich</span>; eine
              Preisänderung hier oben einfach erneut synchronisieren.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <AdminButton
                variant="secondary"
                size="sm"
                icon={CreditCard}
                onClick={handleStripeSync}
                loading={stripeSyncing}
              >
                {stripeProductId ? "Stripe-Produkt aktualisieren" : "Als Stripe-Produkt anlegen"}
              </AdminButton>
              {stripeProductId ? (
                <a
                  href={`https://dashboard.stripe.com/products/${stripeProductId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-gold-300/80 transition-colors hover:text-gold-200"
                >
                  {stripeProductId}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs text-cream/40">Noch nicht mit Stripe verknüpft.</span>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Curriculum */}
      <div className="mt-6">
        <CurriculumEditor
          courseId={course.id}
          courseSlug={course.slug}
          modules={course.modules}
          otherCourses={otherCourses}
        />
      </div>
    </div>
  );
}
