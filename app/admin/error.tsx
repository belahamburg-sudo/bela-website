"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TriangleAlert, ChevronDown } from "lucide-react";

/**
 * Error boundary for the /admin segment. Catches any error thrown while
 * rendering an admin PAGE (the layout's own errors bubble to the global
 * boundary) and shows a graceful, branded fallback with a retry — instead of
 * the raw "Application error" white screen. The technical message is shown
 * behind a toggle so we can actually diagnose what threw.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[admin] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.06]">
        <TriangleAlert className="h-7 w-7 text-amber-300" />
      </div>
      <h1 className="mt-6 font-heading text-2xl text-cream">
        Diese Seite konnte nicht geladen werden
      </h1>
      <p className="mt-2 max-w-md text-sm text-cream/50">
        Ein vorübergehender Fehler ist aufgetreten. Versuch es erneut — der Rest
        des Admin-Bereichs bleibt nutzbar.
      </p>

      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-obsidian transition hover:bg-gold-200"
      >
        <RefreshCw className="h-4 w-4" />
        Erneut versuchen
      </button>

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
