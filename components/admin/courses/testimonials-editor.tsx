"use client";

import { useEffect, useState, useTransition } from "react";
import { Star, Plus, Trash2, Pencil, BadgeCheck, ImageIcon } from "lucide-react";
import { Panel, EmptyState } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { FileUpload } from "@/components/admin/file-upload";
import { useToast } from "@/components/admin/toast";
import {
  listCourseTestimonials,
  upsertCourseTestimonial,
  deleteCourseTestimonial,
  type AdminTestimonial,
} from "@/app/admin/kurse/actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

/** storage://media/… → public preview URL (testimonials live in the public bucket). */
function toPreview(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("storage://")) return value;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${value.slice("storage://".length)}`;
}

type Draft = {
  id: string | null;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  photoUrl: string | null;
  isVerified: boolean;
};

const EMPTY_DRAFT: Draft = {
  id: null,
  authorName: "",
  rating: 5,
  title: "",
  body: "",
  photoUrl: null,
  isVerified: true,
};

/**
 * Admin-managed in-house testimonials for a course (stars, title, text, optional
 * photo). These render alongside real buyer reviews on the product page; the
 * whole block stays hidden until at least one exists.
 */
export function CourseTestimonialsEditor({ courseSlug }: { courseSlug: string }) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);

  async function load() {
    const res = await listCourseTestimonials(courseSlug);
    if (res.ok && res.testimonials) setItems(res.testimonials);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  function startEdit(t: AdminTestimonial) {
    setDraft({
      id: t.id,
      authorName: t.authorName ?? "",
      rating: t.rating,
      title: t.title ?? "",
      body: t.body ?? "",
      photoUrl: t.photoUrl,
      isVerified: t.isVerified,
    });
  }

  function save() {
    if (!draft) return;
    if (!draft.authorName.trim()) {
      error("Name ist erforderlich.");
      return;
    }
    startTransition(async () => {
      const res = await upsertCourseTestimonial({
        id: draft.id,
        courseSlug,
        authorName: draft.authorName,
        rating: draft.rating,
        title: draft.title,
        body: draft.body,
        photoUrl: draft.photoUrl,
        isVerified: draft.isVerified,
        isPublished: true,
      });
      if (res.ok) {
        success(draft.id ? "Testimonial gespeichert." : "Testimonial hinzugefügt.");
        setDraft(null);
        await load();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteCourseTestimonial({ id, courseSlug });
      if (res.ok) {
        success("Testimonial gelöscht.");
        await load();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  return (
    <Panel
      title="Testimonials (In-House-Bewertungen)"
      description="Sterne, Überschrift, Text & optional Foto. Erscheinen zusammen mit echten Käufer-Bewertungen — der Block bleibt versteckt, bis mindestens eines existiert."
      actions={
        !draft ? (
          <AdminButton
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setDraft({ ...EMPTY_DRAFT })}
          >
            Testimonial
          </AdminButton>
        ) : undefined
      }
    >
      {draft && (
        <div className="mb-5 space-y-3 rounded-xl border border-gold-300/25 bg-gold-300/[0.03] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="tac-label mb-1.5 block">Name *</span>
              <input
                value={draft.authorName}
                onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                placeholder="z. B. Lukas M."
                className={inputClass}
              />
            </label>
            <div className="block">
              <span className="tac-label mb-1.5 block">Sterne</span>
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDraft({ ...draft, rating: n })}
                    aria-label={`${n} Sterne`}
                    className="p-0.5"
                  >
                    <Star
                      className="h-6 w-6 transition-colors"
                      style={{ color: n <= draft.rating ? "#C9A961" : "rgba(232,230,220,0.25)" }}
                      fill={n <= draft.rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="tac-label mb-1.5 block">Überschrift</span>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="z. B. Hat mein Business verändert"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="tac-label mb-1.5 block">Text</span>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              rows={3}
              placeholder="Was die Person geschrieben hat …"
              className={`${inputClass} resize-y`}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <div>
              <span className="tac-label mb-1.5 block">Foto</span>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-obsidian/60">
                {toPreview(draft.photoUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={toPreview(draft.photoUrl)!} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-cream/25">
                    <ImageIcon className="h-7 w-7" />
                  </div>
                )}
              </div>
              {draft.photoUrl && (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, photoUrl: null })}
                  className="mt-1.5 text-[11px] text-cream/40 transition-colors hover:text-red-300"
                >
                  Foto entfernen
                </button>
              )}
            </div>
            <div className="space-y-3">
              <FileUpload
                bucket="media"
                prefix="testimonials"
                kind="image"
                accept="image/*"
                hint="Optionales Foto (JPG/PNG)"
                onUploaded={(f) => setDraft({ ...draft, photoUrl: f.ref })}
              />
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-obsidian/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={draft.isVerified}
                  onChange={(e) => setDraft({ ...draft, isVerified: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300"
                />
                <span className="text-sm text-cream/80">
                  „Verifiziert“-Badge <span className="text-cream/40">anzeigen</span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <AdminButton variant="ghost" size="sm" onClick={() => setDraft(null)} disabled={pending}>
              Abbrechen
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={save} loading={pending}>
              Speichern
            </AdminButton>
          </div>
        </div>
      )}

      {loading ? (
        <p className="px-1 py-4 text-sm text-cream/40">Lädt …</p>
      ) : items.length === 0 && !draft ? (
        <EmptyState
          icon={Star}
          title="Noch keine Testimonials"
          description="Füge In-House-Bewertungen hinzu — sie erscheinen auf der Produktseite."
        />
      ) : (
        <div className="grid gap-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-lg border border-white/8 bg-obsidian/50 px-3 py-2.5"
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/10 bg-obsidian/60">
                {toPreview(t.photoUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={toPreview(t.photoUrl)!} alt={t.authorName ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-cream/25">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className="h-3.5 w-3.5"
                        style={{ color: n <= t.rating ? "#C9A961" : "rgba(232,230,220,0.2)" }}
                        fill={n <= t.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </span>
                  {t.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-gold-300/80" />}
                </div>
                {t.title && <p className="mt-1 truncate text-sm font-bold text-cream/90">{t.title}</p>}
                {t.body && <p className="mt-0.5 line-clamp-2 text-xs text-cream/50">{t.body}</p>}
                <p className="mt-1 text-[11px] uppercase tracking-wider text-cream/30">
                  {t.authorName || "Mitglied"}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  onClick={() => startEdit(t)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-white/5 hover:text-gold-300"
                  aria-label="Bearbeiten"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => remove(t.id)}
                  disabled={pending}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  aria-label="Löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
