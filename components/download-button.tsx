"use client";

import { useState } from "react";
import { FileText, Download, Loader2, ShieldCheck } from "lucide-react";

type Resource = { label: string; type: string; href: string };

/**
 * Requests a watermarked, buyer-specific copy of a course resource from
 * /api/download and opens the returned 7-day signed URL.
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

  async function handle() {
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
      ) : resource.type === "PDF" ? (
        <FileText aria-hidden className="h-6 w-6 text-gold-300" />
      ) : (
        <Download aria-hidden className="h-6 w-6 text-gold-300" />
      )}
      <span className="min-w-0">
        <span className="block font-bold text-cream">{resource.label}</span>
        <span className="flex items-center gap-1.5 text-sm text-muted">
          {resource.type}
          <span className="inline-flex items-center gap-1 text-gold-300/60">
            <ShieldCheck className="h-3 w-3" /> personalisiert
          </span>
        </span>
        {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
      </span>
    </button>
  );
}
