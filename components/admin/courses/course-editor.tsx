"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ImageIcon, Save, Trash2, Boxes } from "lucide-react";
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
  image: string | null;
  level: string;
  format: "video" | "pdf";
  audience: string;
  outcome: string;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  includes: string[];
  /** Slugs of other courses unlocked when THIS course is bought (bundle / bonus). */
  bundledCourses: string[];
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
  const [imageUrl, setImageUrl] = useState<string | null>(course.image);
  const [level, setLevel] = useState(course.level || "Start");
  const [format, setFormat] = useState<"video" | "pdf">(course.format);
  const [audience, setAudience] = useState(course.audience);
  const [outcome, setOutcome] = useState(course.outcome);
  const [featured, setFeatured] = useState(course.featured);
  const [isActive, setIsActive] = useState(course.isActive);
  const [sortOrder, setSortOrder] = useState(course.sortOrder);
  const [includesText, setIncludesText] = useState(course.includes.join("\n"));
  const [bundled, setBundled] = useState<string[]>(course.bundledCourses ?? []);

  const otherCourses = allCourses.filter((c) => c.slug !== course.slug);

  function toggleBundled(slug: string) {
    setBundled((prev) =>
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

    startTransition(async () => {
      const res = await updateCourse({
        id: course.id,
        title,
        slug,
        tagline,
        description,
        priceCents,
        imageUrl,
        level,
        format,
        audience,
        outcome,
        featured,
        isActive,
        sortOrder,
        includes: includesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        bundledCourses: bundled,
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
            </div>
          </div>
        </Panel>

        {/* Cover image */}
        <Panel title="Cover-Bild">
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
