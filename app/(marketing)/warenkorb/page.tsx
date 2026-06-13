"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Lock,
  Tag,
  Gift,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/utils";
import { ORDER_BUMP, formatBumpPrice } from "@/lib/offers";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getStoredReferral } from "@/components/referral-capture";

export default function CartPage() {
  const { items, setQty, remove, subtotalCents, clear } = useCart();
  const router = useRouter();

  const [bump, setBump] = useState(false);
  const [promo, setPromo] = useState("");
  const [agb, setAgb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = subtotalCents + (bump ? ORDER_BUMP.priceCents : 0);

  async function checkout() {
    setError(null);
    if (!agb) {
      setError("Bitte akzeptiere die AGB und das Widerrufsrecht.");
      return;
    }
    if (items.length === 0) return;

    // Resolve the buyer (login required to bind the purchase to the account).
    let userEmail: string | null = null;
    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!data.user) {
        router.push("/login?redirect=/warenkorb");
        return;
      }
      userEmail = data.user.email ?? null;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
          userEmail,
          agbAccepted: agb,
          orderBump: bump,
          promoCode: promo.trim() || undefined,
          referralCode: getStoredReferral() || undefined,
        }),
      });
      const result = (await response.json()) as { url?: string; message?: string };
      if (!response.ok) {
        setError(result.message || "Checkout konnte nicht gestartet werden.");
        return;
      }
      if (result.url) {
        clear();
        window.location.href = result.url;
        return;
      }
      setError("Kein Checkout-Link erhalten. Bitte versuche es erneut.");
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-cones pt-28 pb-24 sm:pt-32">
      <div className="dust-overlay" aria-hidden />
      <div className="container-shell relative z-10 mx-auto max-w-5xl">
        <div className="mb-10 flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-gold-300" />
          <h1 className="font-heading tracking-gta text-4xl text-cream sm:text-5xl">Warenkorb</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-gold-300/15 bg-white/[0.02] p-12 text-center">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/20 bg-gold-300/[0.04]">
              <ShoppingBag className="h-6 w-6 text-gold-300/50" />
            </span>
            <p className="text-lg text-cream/60">Dein Warenkorb ist leer.</p>
            <Link
              href="/kurse"
              className="mt-6 inline-block text-sm font-bold uppercase tracking-[0.12em] text-gold-300 hover:text-gold-200"
            >
              Kurse entdecken →
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Items */}
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex gap-4 rounded-sm border border-white/8 bg-white/[0.02] p-4"
                >
                  <div className="relative h-20 w-20 flex-none overflow-hidden rounded-sm border border-white/10 bg-ink">
                    {item.image && !item.image.startsWith("storage://") ? (
                      <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-lg text-cream">{item.title}</p>
                    <p className="mt-0.5 gold-text font-heading text-xl leading-none">
                      {formatEuro(item.priceCents)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-white/10">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          aria-label="Weniger"
                          className="flex h-8 w-8 items-center justify-center text-cream/60 hover:text-gold-300"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm text-cream">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          aria-label="Mehr"
                          className="flex h-8 w-8 items-center justify-center text-cream/60 hover:text-gold-300"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.slug)}
                        aria-label="Entfernen"
                        className="flex items-center gap-1.5 text-xs text-cream/40 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order bump */}
              <label
                className={`group flex cursor-pointer gap-4 rounded-sm border p-4 transition-colors ${
                  bump ? "border-gold-300/60 bg-gold-300/[0.06]" : "border-dashed border-gold-300/30 bg-gold-300/[0.02] hover:border-gold-300/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={bump}
                  onChange={(e) => setBump(e.target.checked)}
                  className="mt-1 h-5 w-5 flex-none accent-gold-300"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-gold-300" />
                    <span className="font-heading text-base text-cream">{ORDER_BUMP.label}</span>
                    <span className="gold-text font-heading text-base">{formatBumpPrice()}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-cream/50">{ORDER_BUMP.description}</p>
                </div>
              </label>
            </div>

            {/* Summary */}
            <div className="h-fit rounded-md border border-gold-300/20 bg-white/[0.02] p-6 lg:sticky lg:top-28">
              <p className="gta-label mb-5 text-cream/50">Zusammenfassung</p>

              {/* Promo code */}
              <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-cream/40">
                Rabattcode
              </label>
              <div className="mb-5 flex items-center gap-2 border border-white/10 bg-obsidian/60 px-3">
                <Tag className="h-3.5 w-3.5 text-gold-300/60" />
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  placeholder="z. B. GOLDMININGX10"
                  className="w-full bg-transparent py-2.5 text-sm text-cream placeholder:text-cream/25 focus:outline-none"
                />
              </div>

              <div className="space-y-2 border-t border-white/8 pt-4 text-sm">
                <div className="flex justify-between text-cream/60">
                  <span>Zwischensumme</span>
                  <span>{formatEuro(subtotalCents)}</span>
                </div>
                {bump && (
                  <div className="flex justify-between text-cream/60">
                    <span>{ORDER_BUMP.label}</span>
                    <span>{formatEuro(ORDER_BUMP.priceCents)}</span>
                  </div>
                )}
                <div className="flex items-end justify-between pt-2">
                  <span className="font-heading text-base text-cream">Gesamt</span>
                  <span className="gold-text font-heading text-3xl leading-none">{formatEuro(totalCents)}</span>
                </div>
                <p className="text-[11px] text-cream/30">inkl. ggf. anfallender USt. · Rabatte werden im Zahlungsfenster verrechnet</p>
              </div>

              {/* AGB consent */}
              <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-cream/60">
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
                  und stimme zu, dass mit der Ausführung sofort begonnen wird. Mir ist bekannt,
                  dass mein{" "}
                  <Link href="/agb" target="_blank" className="text-gold-300 underline hover:text-gold-200">
                    Widerrufsrecht
                  </Link>{" "}
                  damit erlischt.
                </span>
              </label>

              <button
                onClick={checkout}
                disabled={loading || !agb}
                className="btn-shimmer group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Zahlungspflichtig bestellen
                </span>
              </button>

              {error && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  {error}
                </p>
              )}

              <p className="mt-4 text-center text-[11px] text-cream/30">
                Sichere Zahlung über Stripe · SSL-verschlüsselt
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
