"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_MAX_AGE_SECONDS,
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referral";

function persistReferralCode(code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return;

  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  } catch {
    // ignore
  }

  try {
    document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(normalized)}; path=/; max-age=${REFERRAL_MAX_AGE_SECONDS}; samesite=lax`;
  } catch {
    // ignore
  }
}

function ReferralCaptureInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("ref") || searchParams.get("via");
    if (code) persistReferralCode(code);
  }, [searchParams]);

  return null;
}

/**
 * Captures affiliate codes from ?ref= / ?via= on every client navigation and
 * stores them in localStorage + cookie for checkout attribution.
 */
export function ReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralCaptureInner />
    </Suspense>
  );
}

/** Read the stored referral code (client-side). Cookie first, then localStorage. */
export function getStoredReferral(): string | null {
  try {
    if (typeof document !== "undefined") {
      const match = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${REFERRAL_COOKIE_NAME}=`));
      if (match) {
        const value = decodeURIComponent(match.slice(REFERRAL_COOKIE_NAME.length + 1));
        const normalized = normalizeReferralCode(value);
        if (normalized) return normalized;
      }
    }
    return normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
  } catch {
    return null;
  }
}
