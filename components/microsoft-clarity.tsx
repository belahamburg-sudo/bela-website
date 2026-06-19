"use client";

import { useEffect } from "react";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "x9jucr8c0m";
const CONSENT_KEY = "cookie-consent";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

function loadClarity() {
  if (!CLARITY_PROJECT_ID || typeof window === "undefined" || window.clarity) return;

  window.clarity = function clarityQueue(...args: unknown[]) {
    (window.clarity as any).q = (window.clarity as any).q || [];
    (window.clarity as any).q.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

export function MicrosoftClarity() {
  useEffect(() => {
    function maybeLoad() {
      try {
        if (localStorage.getItem(CONSENT_KEY) === "accepted") loadClarity();
      } catch {
        // No localStorage, no analytics.
      }
    }

    maybeLoad();
    window.addEventListener("cookie-consent-updated", maybeLoad);
    return () => window.removeEventListener("cookie-consent-updated", maybeLoad);
  }, []);

  return null;
}
