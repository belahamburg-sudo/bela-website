"use client";

import { useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { hasSupabasePublicEnv } from "@/lib/env";

type Provider = "google" | "apple";

/** Official multi-colour Google "G". */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/** Apple logo (monochrome). */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.642 0 2.95.06 4.461 2.22-.122.075-2.52 1.48-2.52 4.41 0 3.39 2.989 4.6 3.096 4.66z" />
    </svg>
  );
}

const btnClass =
  "focus-ring flex min-h-12 w-full items-center justify-center gap-3 border border-gold-300/15 bg-black/40 px-4 text-[12px] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:border-gold-300/40 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-50";

// Apple Sign-In is not configured in Supabase yet — show it as "coming soon".
// Flip to `true` once the Apple provider is enabled to re-activate the button.
const APPLE_ENABLED = false;

/**
 * Google + Apple sign-in (Supabase OAuth). Optionally a phone button that calls
 * `onPhone` so the parent can swap in the SMS flow. Works for both login and
 * signup — the first OAuth sign-in creates the account.
 */
export function SocialAuthButtons({
  redirect = "/dashboard",
  onPhone,
}: {
  /** Where to land after the OAuth round-trip (passed to /auth/callback). */
  redirect?: string;
  /** When provided, renders a "Weiter mit Telefonnummer" button. */
  onPhone?: () => void;
}) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  async function signIn(provider: Provider) {
    setError("");
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) {
      setError("Login ist noch nicht konfiguriert.");
      return;
    }
    setPending(provider);
    const next = encodeURIComponent(redirect);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    // On success the browser navigates away; we only get here on failure.
    if (oauthError) {
      setPending(null);
      setError(
        provider === "google"
          ? "Google-Login fehlgeschlagen. Bitte erneut versuchen."
          : "Apple-Login fehlgeschlagen. Bitte erneut versuchen."
      );
    }
  }

  return (
    <div className="grid gap-2.5">
      <button
        type="button"
        onClick={() => signIn("google")}
        disabled={pending !== null}
        className={btnClass}
      >
        {pending === "google" ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        Weiter mit Google
      </button>

      {APPLE_ENABLED ? (
        <button
          type="button"
          onClick={() => signIn("apple")}
          disabled={pending !== null}
          className={btnClass}
        >
          {pending === "apple" ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <AppleIcon className="h-[18px] w-[18px] text-cream" />
          )}
          Weiter mit Apple
        </button>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled
          title="Apple-Login kommt bald"
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 border border-gold-300/10 bg-black/20 px-4 text-[12px] font-bold uppercase tracking-[0.14em] text-cream/30"
        >
          <AppleIcon className="h-[18px] w-[18px] text-cream/30" />
          Apple
          <span className="rounded-sm border border-gold-300/20 bg-gold-300/[0.06] px-1.5 py-0.5 text-[8px] tracking-[0.16em] text-gold-300/60">
            Bald
          </span>
        </button>
      )}

      {onPhone ? (
        <button type="button" onClick={onPhone} disabled={pending !== null} className={btnClass}>
          <Phone aria-hidden className="h-4 w-4 text-gold-300" />
          Weiter mit Telefonnummer
        </button>
      ) : null}

      {error ? (
        <div className="border border-red-400/20 bg-red-400/5 px-4 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
