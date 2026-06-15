"use client";

import { CreditCard, Loader2, AlertCircle, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ORDER_BUMP, formatBumpPrice } from "@/lib/offers";
import { getStoredReferral } from "@/components/referral-capture";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type CheckoutResult = {
  url?: string;
  demo?: boolean;
  message?: string;
};

/**
 * Single-item fast checkout. Includes the mandatory AGB checkbox and the order
 * bump (brief section 1). Multi-item purchases go through /warenkorb instead.
 */
export function CheckoutButton({
  courseSlug,
  label = "Kurs kaufen",
  className,
}: {
  courseSlug: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agb, setAgb] = useState(false);
  const [bump, setBump] = useState(false);
  const router = useRouter();

  async function startCheckout() {
    setError(null);
    if (!agb) {
      setError("Bitte akzeptiere die AGB und das Widerrufsrecht.");
      return;
    }

    let userEmail: string | null = null;

    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!data.user) {
        router.push(`/login?redirect=/db/kurse/${courseSlug}`);
        return;
      }
      userEmail = data.user.email ?? null;
    } else {
      const raw = typeof window !== "undefined" ? localStorage.getItem("ai-goldmining-demo-user") : null;
      if (!raw) {
        router.push(`/login?redirect=/db/kurse/${courseSlug}`);
        return;
      }
      try {
        userEmail = (JSON.parse(raw) as { email?: string }).email ?? null;
      } catch {
        // malformed demo entry: proceed without email
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          userEmail,
          agbAccepted: agb,
          orderBump: bump,
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
  }

  return (
    <div className="space-y-3">
      {/* Order bump */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-sm border p-3 text-left transition-colors",
          bump
            ? "border-gold-300/60 bg-gold-300/[0.06]"
            : "border-dashed border-gold-300/30 bg-gold-300/[0.02] hover:border-gold-300/50"
        )}
      >
        <input
          type="checkbox"
          checked={bump}
          onChange={(e) => setBump(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none accent-gold-300"
        />
        <span className="text-sm leading-snug text-cream/70">
          <span className="inline-flex items-center gap-1.5 font-semibold text-cream">
            <Gift className="h-3.5 w-3.5 text-gold-300" />
            {ORDER_BUMP.label}
          </span>{" "}
          <span className="gold-text font-semibold">{formatBumpPrice()}</span>
          <span className="mt-0.5 block text-xs text-cream/45">{ORDER_BUMP.description}</span>
        </span>
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
