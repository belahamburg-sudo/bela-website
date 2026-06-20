"use client";

import { useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { hasSupabasePublicEnv } from "@/lib/env";

type Provider = "google" | "apple" | "github";

const PROVIDER_LABEL: Record<Provider, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
};

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

/** GitHub mark (monochrome). */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
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

// Compact "widget" tile (icon + label) instead of a full-width stacked bar.
const tileClass =
  "group focus-ring relative flex flex-col items-center justify-center gap-2.5 rounded-xl border border-gold-300/15 bg-black/40 px-3 py-5 text-cream/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300/50 hover:bg-black/60 hover:text-cream hover:shadow-[0_12px_34px_-16px_rgba(201,169,97,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-gold-300/15 disabled:hover:bg-black/40 disabled:hover:shadow-none";

const tileLabel = "text-[9px] font-bold uppercase tracking-[0.16em]";

// Apple Sign-In is not configured in Supabase yet — show it as "coming soon".
// Flip to `true` once the Apple provider is enabled to re-activate the tile.
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
      setError(`${PROVIDER_LABEL[provider]}-Login fehlgeschlagen. Bitte erneut versuchen.`);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button type="button" onClick={() => signIn("google")} disabled={pending !== null} className={tileClass}>
        {pending === "google" ? (
          <Loader2 aria-hidden className="h-6 w-6 animate-spin text-gold-300" />
        ) : (
          <GoogleIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
        )}
        <span className={tileLabel}>Google</span>
      </button>

      <button type="button" onClick={() => signIn("github")} disabled={pending !== null} className={tileClass}>
        {pending === "github" ? (
          <Loader2 aria-hidden className="h-6 w-6 animate-spin text-gold-300" />
        ) : (
          <GitHubIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
        )}
        <span className={tileLabel}>GitHub</span>
      </button>

      {onPhone ? (
        <button type="button" onClick={onPhone} disabled={pending !== null} className={tileClass}>
          <Phone aria-hidden className="h-6 w-6 text-gold-300 transition-transform duration-200 group-hover:scale-110" />
          <span className={tileLabel}>Telefon</span>
        </button>
      ) : null}

      {APPLE_ENABLED ? (
        <button type="button" onClick={() => signIn("apple")} disabled={pending !== null} className={tileClass}>
          {pending === "apple" ? (
            <Loader2 aria-hidden className="h-6 w-6 animate-spin text-gold-300" />
          ) : (
            <AppleIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
          )}
          <span className={tileLabel}>Apple</span>
        </button>
      ) : (
        <div
          aria-disabled
          title="Apple-Login kommt bald"
          className="relative flex cursor-not-allowed flex-col items-center justify-center gap-2.5 rounded-xl border border-gold-300/10 bg-black/20 px-3 py-5 text-cream/25"
        >
          <AppleIcon className="h-6 w-6" />
          <span className={tileLabel}>Apple</span>
          <span className="absolute right-1.5 top-1.5 rounded-sm border border-gold-300/20 bg-gold-300/[0.06] px-1 py-0.5 text-[7px] font-bold tracking-[0.12em] text-gold-300/60">
            Bald
          </span>
        </div>
      )}

      {error ? (
        <div className="col-span-2 border border-red-400/20 bg-red-400/5 px-4 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
