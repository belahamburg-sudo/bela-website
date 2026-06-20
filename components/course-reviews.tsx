"use client";

import { useEffect, useState } from "react";
import { Star, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Review = {
  id: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  photo_url: string | null;
  is_verified: boolean;
  created_at: string;
};

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4"
          style={{ color: n <= Math.round(value) ? "#C9A961" : "rgba(232,230,220,0.2)" }}
          fill={n <= Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export function CourseReviews({ courseSlug }: { courseSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadReviews() {
    try {
      const res = await fetch(`/api/reviews?course=${encodeURIComponent(courseSlug)}`);
      const data = (await res.json()) as { reviews: Review[]; count: number; average: number };
      setReviews(data.reviews ?? []);
      setCount(data.count ?? 0);
      setAverage(data.average ?? 0);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadReviews();
    (async () => {
      if (!hasSupabasePublicEnv()) return;
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLoggedIn(Boolean(user));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  async function submit() {
    setError(null);
    if (rating < 1) {
      setError("Bitte vergib eine Sternebewertung.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, rating, title, text }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        setError(data.message || "Bewertung konnte nicht gespeichert werden.");
        return;
      }
      setDone(true);
      setTitle("");
      setText("");
      setRating(0);
      await loadReviews();
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  // Spec: the testimonials block stays hidden until at least one review exists.
  // A logged-in buyer still sees the form so they can leave the first one.
  if (loaded && count === 0 && !loggedIn && !done) return null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-4">Bewertungen</p>
          <h2 className="font-heading tracking-gta text-3xl text-cream sm:text-4xl">
            Was Käufer sagen.
          </h2>
        </div>
        {count > 0 && (
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="font-heading text-3xl text-cream">{average.toFixed(1)}</span>
              <Stars value={average} />
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cream/40">
              {count} {count === 1 ? "Bewertung" : "Bewertungen"}
            </p>
          </div>
        )}
      </div>

      {/* Review form (logged-in users; the API enforces buyers-only) */}
      {loggedIn && !done && (
        <div className="mt-8 rounded-md border border-gold-300/20 bg-white/[0.02] p-6">
          <p className="mb-3 text-sm font-semibold text-cream">Deine Bewertung</p>
          <div className="mb-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} Sterne`}
                className="p-0.5"
              >
                <Star
                  className="h-6 w-6 transition-colors"
                  style={{ color: n <= (hover || rating) ? "#C9A961" : "rgba(232,230,220,0.25)" }}
                  fill={n <= (hover || rating) ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel (optional)"
            className="mb-3 w-full border border-white/10 bg-obsidian/60 px-3 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-gold-300/50 focus:outline-none"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wie war der Kurs für dich?"
            rows={3}
            className="mb-4 w-full resize-y border border-white/10 bg-obsidian/60 px-3 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:border-gold-300/50 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:brightness-110 disabled:opacity-50"
          >
            <span className="relative z-[2] inline-flex items-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Bewertung abschicken
            </span>
          </button>
          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              {error}
            </p>
          )}
        </div>
      )}

      {done && (
        <div className="mt-8 rounded-md border border-gold-300/30 bg-gold-300/[0.05] p-5 text-sm text-gold-100">
          Danke für deine Bewertung!
        </div>
      )}

      {/* List */}
      <div className="mt-8 grid gap-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-cream/40">
            Noch keine Bewertungen. {loggedIn ? "Sei der Erste!" : "Käufer können diesen Kurs bewerten."}
          </p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="rounded-sm border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-start gap-4">
                {r.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photo_url}
                    alt={r.author_name || "Mitglied"}
                    className="h-12 w-12 flex-none rounded-full border border-white/10 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <Stars value={r.rating} />
                    {r.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300/80">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verifizierter Kauf
                      </span>
                    )}
                  </div>
                  {r.title && <p className="mt-3 font-heading text-lg text-cream">{r.title}</p>}
                  {r.body && <p className="mt-1.5 text-sm leading-relaxed text-cream/60">{r.body}</p>}
                  <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-cream/30">
                    {r.author_name || "Mitglied"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
