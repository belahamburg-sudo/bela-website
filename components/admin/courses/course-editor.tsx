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
} from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { FileUpload } from "@/components/admin/file-upload";
import { useToast } from "@/components/admin/toast";
import { updateCourse } from "@/app/admin/kurse/actions";
import { CurriculumEditor } from "./curriculum-editor";

export type ResourceItem = { label: string; type: "PDF" | "Template" | "Prompt"; href: string };

export type EditorLesson = {
  id: string;
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
  resources: ResourceItem[];
};

export type EditorModule = {
  id: string;
  title: string;
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

  // Editable product-page sections (stored as a JSON blob; arrays edited as
  // one-item-per-line text).
  const pp = course.productPage ?? {};
  const ppStr = (k: string) => (typeof pp[k] === "string" ? (pp[k] as string) : "");
  const ppList = (k: string) => (Array.isArray(pp[k]) ? (pp[k] as string[]).join("\n") : "");
  const [ppOutcome, setPpOutcome] = useState(ppStr("outcomeHeadline"));
  const [ppSubline, setPpSubline] = useState(ppStr("subline"));
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
  const [ppAfter, setPpAfter] = useState(ppList("afterOutcomes"));
  const [ppBonus, setPpBonus] = useState(ppStr("bonus"));
  const [ppCta, setPpCta] = useState(ppStr("ctaHeadline"));

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
    const productPage = {
      outcomeHeadline: ppOutcome,
      subline: ppSubline,
      problem: ppProblem,
      vision: lines(ppVision),
      needs: lines(ppNeeds),
      mechanism: lines(ppMechanism).map((l) => {
        const [first, ...rest] = l.split("|");
        return { title: (first ?? "").trim(), copy: rest.join("|").trim() };
      }),
      whoFor: lines(ppWhoFor),
      whoNotFor: lines(ppWhoNotFor),
      afterOutcomes: lines(ppAfter),
      bonus: ppBonus,
      ctaHeadline: ppCta,
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
                <span className="tac-label mb-1.5 block">Was du wirklich brauchst</span>
                <textarea
                  value={ppNeeds}
                  onChange={(e) => setPpNeeds(e.target.value)}
                  rows={4}
                  placeholder={"Was NICHT nötig ist\n4 Punkte"}
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

            <label className="block">
              <span className="tac-label mb-1.5 block">Was du danach kannst (eine Zeile pro Bullet)</span>
              <textarea
                value={ppAfter}
                onChange={(e) => setPpAfter(e.target.value)}
                rows={4}
                placeholder={"Verb zuerst, 4-6 Outcome-Bullets"}
                className={`${inputClass} resize-y`}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="tac-label mb-1.5 block">Bonus</span>
                <input
                  value={ppBonus}
                  onChange={(e) => setPpBonus(e.target.value)}
                  placeholder="z.B. 1 Monat Community gratis"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="tac-label mb-1.5 block">CTA-Headline</span>
                <input
                  value={ppCta}
                  onChange={(e) => setPpCta(e.target.value)}
                  placeholder="Übergangs-Headline vor dem Kauf-Button"
                  className={inputClass}
                />
              </label>
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
        />
      </div>
    </div>
  );
}
