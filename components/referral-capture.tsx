"use client";

import { useEffect } from "react";

export const REFERRAL_STORAGE_KEY = "ai-goldmining-ref";

/**
 * Captures an affiliate / refer-a-friend code from the URL (?ref=CODE or
 * ?via=CODE) and stores it so the checkout can attribute the sale. Runs once
 * on load across the whole app.
 */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = (params.get("ref") || params.get("via") || "").trim();
      if (code) {
        localStorage.setItem(REFERRAL_STORAGE_KEY, code.toUpperCase());
      }
    } catch {
      // ignore — referral attribution is best-effort
    }
  }, []);

  return null;
}

/** Read the stored referral code (client-side). */
export function getStoredReferral(): string | null {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch {
    return null;
  }
}
