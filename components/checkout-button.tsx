"use client";

import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getStoredReferral } from "@/components/referral-capture";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type CheckoutResult = {
  url?: string;
  demo?: boolean;
  message?: string;
};

/** Resolve the current user's email, or null when not logged in. */
async function resolveUserEmail(): Promise<{ loggedIn: boolean; email: string | null }> {
  if (hasSupabasePublicEnv()) {
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (!data.user) return { loggedIn: false, email: null };
    return { loggedIn: true, email: data.user.email ?? null };
  }

  const raw = typeof window !== "undefined" ? localStorage.getItem("ai-goldmining-demo-user") : null;
  if (!raw) return { loggedIn: false, email: null };
  try {
    return { loggedIn: true, email: (JSON.parse(raw) as { email?: string }).email ?? null };
  } catch {
    return { loggedIn: true, email: null };
  }
}

/**
 * Single-item fast checkout. Includes the mandatory AGB checkbox and the order
 * bump (brief section 1). Multi-item purchases go through /warenkorb instead.
 *
 * Session-aware: logged-in users go straight to Stripe. Guests are sent to
 * /login with a redirect back to this course (carrying ?buy=1) so they can
 * complete the purchase in one step after authenticating. When `autoBuy` is set
 * (i.e. the page loaded with ?buy=1) and the visitor is logged in, checkout is
 * triggered automatically on mount.
 */
export function CheckoutButton({
  courseSlug,
  label = "Kurs kaufen",
  className,
  autoBuy = false,
}: {
  courseSlug: string;
  label?: string;
  className?: string;
  autoBuy?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agb, setAgb] = useState(autoBuy);
  const [promoCode, setPromoCode] = useState("");
  const router = useRouter();
  const autoBuyHandled = useRef(false);

  const startCheckout = useCallback(async () => {
    setError(null);
    if (!agb) {
      setError("Bitte akzeptiere die AGB und das Widerrufsrecht.");
      return;
    }

    const { loggedIn, email } = await resolveUserEmail();
    if (!loggedIn) {
      // Send guests to login, then back to this course with ?buy=1 so the
      // purchase auto-resumes once they are authenticated.
      router.push(`/login?redirect=${encodeURIComponent(`/kurse/${courseSlug}?buy=1`)}`);
      return;
    }
    const userEmail = email;

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          userEmail,
          agbAccepted: agb,
          promoCode: promoCode.trim() || undefined,
          referralCode: getStoredReferral() || undefined,
        }),
      });
      const result = (await response.json()) as CheckoutResult;

      if (!response.ok) {
        setError(result.message || "Checkout konnte nicht gestartet werden.");
        return;
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      setError("Kein Checkout-Link erhalten. Bitte versuche es erneut.");
    } catch {
      setError("Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }, [agb, courseSlug, promoCode, router]);

  // Resume the purchase automatically after login (page loaded with ?buy=1).
  useEffect(() => {
    if (!autoBuy || autoBuyHandled.current) return;
    autoBuyHandled.current = true;
    (async () => {
      const { loggedIn } = await resolveUserEmail();
      if (loggedIn) await startCheckout();
    })();
  }, [autoBuy, startCheckout]);

  return (
    <div className="space-y-3">
      {/* Affiliate / discount code (optional) */}
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-cream/40">
          Rabatt- / Affiliate-Code
        </span>
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="z. B. ELMO"
          className="w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm uppercase tracking-wide text-cream placeholder:normal-case placeholder:tracking-normal placeholder:text-cream/25 focus:border-gold-300/50 focus:outline-none"
        />
      </label>

      {/* AGB consent (required) */}
      <label className="flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-cream/60">
        <input
          type="checkbox"
          checked={agb}
          onChange={(e) => setAgb(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none accent-gold-300"
        />
        <span>
          Ich akzeptiere die{" "}
          <Link href="/agb" target="_blank" className="text-gold-300 underline hover:text-gold-200">
            AGB
          </Link>{" "}
          und stimme zu, dass mit der Ausführung sofort begonnen wird (Widerrufsrecht erlischt).
        </span>
      </label>

      <Button onClick={startCheckout} disabled={loading || !agb} className={cn("w-full sm:w-auto", className)}>
        {loading ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard aria-hidden className="h-4 w-4" />
        )}
        {label}
      </Button>
      {error ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-400 font-medium">
          <AlertCircle className="h-4 w-4 flex-none mt-0.5" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
