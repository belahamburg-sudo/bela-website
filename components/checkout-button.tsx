"use client";

import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "./button";

type CheckoutResult = {
  url?: string;
  demo?: boolean;
  message?: string;
};

export function CheckoutButton({
  courseSlug,
  label = "Kurs kaufen"
}: {
  courseSlug: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function startCheckout() {
    setError(null);
    let userEmail: string | null = null;

    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!data.user) {
        router.push(`/login?redirect=/dashboard/kurse/${courseSlug}`);
        return;
      }
      userEmail = data.user.email ?? null;
    } else {
      const raw = typeof window !== "undefined" ? localStorage.getItem("ai-goldmining-demo-user") : null;
      if (!raw) {
        router.push(`/login?redirect=/dashboard/kurse/${courseSlug}`);
        return;
      }
      try {
        userEmail = (JSON.parse(raw) as { email?: string }).email ?? null;
      } catch {
        // malformed demo entry — proceed without email
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, userEmail })
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

      // Should never reach here but guard anyway
      setError("Kein Checkout-Link erhalten. Bitte versuche es erneut.");
    } catch {
      setError("Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={startCheckout} disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart aria-hidden className="h-4 w-4" />
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
