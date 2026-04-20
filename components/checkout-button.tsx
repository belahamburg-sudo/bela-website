"use client";

import { ShoppingCart, Loader2 } from "lucide-react";
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
  const router = useRouter();

  async function startCheckout() {
    let userEmail: string | null = null;

    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!data.user) {
        router.push(`/login?redirect=/kurse/${courseSlug}`);
        return;
      }
      userEmail = data.user.email ?? null;
    } else {
      const raw = typeof window !== "undefined" ? localStorage.getItem("ai-goldmining-demo-user") : null;
      if (!raw) {
        router.push(`/login?redirect=/kurse/${courseSlug}`);
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
      if (!response.ok) throw new Error(result.message || "Checkout konnte nicht gestartet werden.");
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      router.push(`/checkout/cancel?course=${courseSlug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={startCheckout} disabled={loading} className="w-full sm:w-auto">
      {loading ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart aria-hidden className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
