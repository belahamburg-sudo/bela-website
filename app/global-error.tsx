"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary. Catches errors that escape every nested
 * boundary — including errors thrown in a layout (e.g. the admin layout's auth
 * gate). Replaces the raw, unbranded "Application error" white screen with a
 * graceful page + reload. Must render its own <html>/<body> because it replaces
 * the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global] uncaught error:", error);
  }, [error]);

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          background: "#0c0805",
          color: "#f5ead6",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Etwas ist schiefgelaufen.
        </div>
        <p style={{ maxWidth: 420, color: "rgba(245,234,214,0.5)", lineHeight: 1.5 }}>
          Ein unerwarteter Fehler ist aufgetreten. Lade die Seite neu — meistens
          ist es danach wieder da.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#c9a961",
            color: "#0c0805",
            border: "none",
            borderRadius: "9999px",
            padding: "0.85rem 1.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Neu laden
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error replaces the root layout; next/link has no router context here */}
        <a href="/" style={{ color: "rgba(201,169,97,0.7)", fontSize: "0.8rem" }}>
          Zur Startseite
        </a>
      </body>
    </html>
  );
}
