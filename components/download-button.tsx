"use client";

import { useState } from "react";
import { FileText, Download, Loader2, ShieldCheck, Presentation } from "lucide-react";

type Resource = { label: string; type: string; href: string };

/** Self-contained HTML resources (slide decks) render inline via /api/view. */
function isInlineViewable(href: string): boolean {
  return /\.html?(?:$|\?)/i.test(href);
}

/**
 * Requests a watermarked, buyer-specific copy of a course resource from
 * /api/download and opens the returned 7-day signed URL.
 *
 * Slide decks (`.html`) are instead opened in a new tab through /api/view, which
 * serves them with the correct `text/html` type from our own origin — Supabase
 * Storage forces `text/plain` on HTML, which would otherwise show raw source.
 */
export function DownloadButton({
  courseSlug,
  resource,
}: {
  courseSlug: string;
  resource: Resource;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewable = isInlineViewable(resource.href);

  function openViewer() {
    const url = `/api/view?courseSlug=${encodeURIComponent(courseSlug)}&ref=${encodeURIComponent(
      resource.href
    )}`;
    // Anchor click reliably opens a real new tab (window.open with a features
    // string can be treated as a popup) while still dropping the opener.
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  }

  async function handle() {
    if (viewable) {
      openViewer();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, ref: resource.href, label: resource.label }),
      });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) {
        setError(data.message || "Download fehlgeschlagen.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="focus-ring panel-surface flex min-h-24 w-full items-center gap-4 rounded-[1.35rem] p-5 text-left transition hover:border-gold-300/50 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 aria-hidden className="h-6 w-6 animate-spin text-gold-300" />
      ) : viewable ? (
        <Presentation aria-hidden className="h-6 w-6 text-gold-300" />
      ) : resource.type === "PDF" ? (
        <FileText aria-hidden className="h-6 w-6 text-gold-300" />
      ) : (
        <Download aria-hidden className="h-6 w-6 text-gold-300" />
      )}
      <span className="min-w-0">
        <span className="block font-bold text-cream">{resource.label}</span>
        <span className="flex items-center gap-1.5 text-sm text-muted">
          {viewable ? "Präsentation öffnen" : resource.type}
          {viewable ? null : (
            <span className="inline-flex items-center gap-1 text-gold-300/60">
              <ShieldCheck className="h-3 w-3" /> personalisiert
            </span>
          )}
        </span>
        {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
      </span>
    </button>
  );
}
