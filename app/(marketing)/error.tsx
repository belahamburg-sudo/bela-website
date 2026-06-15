"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert, ChevronDown } from "lucide-react";

/**
 * Error boundary for the public marketing pages. Catches a render error and
 * shows a graceful, branded fallback with a retry instead of the raw white
 * "Application error" screen.
 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[marketing] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-obsidian px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.06]">
        <TriangleAlert className="h-7 w-7 text-amber-300" />
      </div>
      <h1 className="mt-6 font-heading text-2xl text-cream">
        Diese Seite konnte nicht geladen werden
      </h1>
      <p className="mt-2 max-w-md text-sm text-cream/50">
        Ein vorübergehender Fehler ist aufgetreten. Versuch es bitte erneut.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-gold-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-obsidian transition hover:bg-gold-200"
        >
          <RefreshCw className="h-4 w-4" />
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-wider text-cream/70 transition hover:text-cream"
        >
          Zur Startseite
        </Link>
      </div>

      <button
        onClick={() => setShowDetails((v) => !v)}
        className="mt-6 inline-flex items-center gap-1 text-xs text-cream/30 transition hover:text-cream/60"
      >
        Technische Details
        <ChevronDown
          className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
        />
      </button>
      {showDetails && (
        <pre className="mt-3 max-w-xl overflow-auto rounded-lg border border-white/10 bg-obsidian/60 p-4 text-left text-[11px] leading-relaxed text-cream/50">
          {error.message || "Unbekannter Fehler"}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
      )}
    </div>
  );
}
