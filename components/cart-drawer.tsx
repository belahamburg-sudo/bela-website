"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/utils";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getStoredReferral } from "@/components/referral-capture";
import { featuredCourses } from "@/lib/content";

const PROMO_KEY = "ai-goldmining-promo";

export function CartDrawer() {
  const { items, isOpen, close, remove, subtotalCents, count, add, has, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promo code entered here is carried over to the cart/checkout page.
  const [promo, setPromo] = useState("");
  useEffect(() => {
    if (!isOpen) return;
    try {
      setPromo(localStorage.getItem(PROMO_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, [isOpen]);
  function onPromoChange(value: string) {
    const up = value.toUpperCase();
    setPromo(up);
    try {
      localStorage.setItem(PROMO_KEY, up);
    } catch {
      /* ignore */
    }
  }

  // Upsell suggestions: featured courses the customer hasn't added yet.
  const upsells = featuredCourses.filter((c) => !has(c.slug)).slice(0, 2);

  /**
   * "Zur Kasse" führt direkt zu Stripe. Die frühere Zwischenseite /warenkorb
   * hat nur nochmal dasselbe gezeigt und einen zusätzlichen Klick gekostet.
   * Die Seite bleibt erreichbar (Lesezeichen, Direktlinks), sie ist nur nicht
   * mehr Teil des Kaufwegs.
   */
  async function checkout() {
    if (items.length === 0 || loading) return;
    setError(null);

    // Kauf muss an ein Konto gebunden werden, sonst kann der Kurs später
    // niemandem freigeschaltet werden.
    let userEmail: string | null = null;
    if (hasSupabasePublicEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!data.user) {
        // Nach dem Login dorthin zurück, wo der Warenkorb geöffnet wurde.
        const back = `${window.location.pathname}${window.location.search}`;
        close();
        router.push(`/login?redirect=${encodeURIComponent(back)}`);
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
          items: items.map((i) => ({ slug: i.slug, qty: 1 })),
          userEmail,
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.25, 0.46, 0.45, 0.94], duration: 0.35 }}
            className="fixed right-0 top-0 z-[71] flex h-full w-full max-w-md flex-col overflow-x-hidden border-l border-gold-300/20 bg-obsidian/95 backdrop-blur-xl"
            role="dialog"
            aria-label="Warenkorb"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold-300/10 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-gold-300" />
                <span className="font-heading tracking-gta text-lg text-cream">
                  Warenkorb <span className="text-cream/40">({count})</span>
                </span>
              </div>
              <button
                onClick={close}
                aria-label="Warenkorb schließen"
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-gold-300/20 text-cream/60 transition-colors hover:border-gold-300/50 hover:text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/20 bg-gold-300/[0.04]">
                    <ShoppingBag className="h-6 w-6 text-gold-300/50" />
                  </span>
                  <p className="text-cream/50">Dein Warenkorb ist leer.</p>
                  <Link
                    href="/kurse"
                    onClick={close}
                    className="text-sm font-bold uppercase tracking-[0.12em] text-gold-300 hover:text-gold-200"
                  >
                    Kurse entdecken →
                  </Link>
                </div>
              ) : (
                <ul className="grid gap-4">
                  {items.map((item) => (
                    <li
                      key={item.slug}
                      className="flex gap-4 border border-white/8 bg-white/[0.02] p-3"
                    >
                      <div className="relative h-16 w-16 flex-none overflow-hidden rounded-sm border border-white/10 bg-ink">
                        {item.image && !item.image.startsWith("storage://") ? (
                          <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 break-words font-heading text-sm text-cream">{item.title}</p>
                        <p className="mt-0.5 gold-text font-heading text-base leading-none">
                          {formatEuro(item.priceCents)}
                        </p>
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            onClick={() => remove(item.slug)}
                            aria-label="Entfernen"
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-cream/40 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Entfernen
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gold-300/10 px-6 py-5">
                {/* Upsells: add more before checkout */}
                {upsells.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
                      Das wird oft dazu gekauft
                    </p>
                    <ul className="grid gap-2">
                      {upsells.map((c) => (
                        <li
                          key={c.slug}
                          className="flex items-center gap-3 rounded-lg border border-gold-300/15 bg-white/[0.02] p-2.5"
                        >
                          <div className="relative h-11 w-11 flex-none overflow-hidden rounded-md border border-white/10 bg-ink">
                            {c.image && !c.image.startsWith("storage://") ? (
                              <Image src={c.image} alt={c.title} fill sizes="44px" className="object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-cream">{c.title}</p>
                            <p className="gold-text font-heading text-sm leading-none">
                              {formatEuro(c.priceCents)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              add({
                                slug: c.slug,
                                title: c.title,
                                priceCents: c.priceCents,
                                image: c.image,
                                format: c.format,
                              })
                            }
                            aria-label={`${c.title} hinzufügen`}
                            className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-gold-300/30 bg-gold-300/[0.08] text-gold-300 transition-colors hover:border-gold-300/60 hover:bg-gold-300/15"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Promo code — carried over to the checkout page */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
                    Rabattcode
                  </label>
                  <div className="flex items-center gap-2 border border-white/10 bg-obsidian/60 px-3">
                    <Tag className="h-3.5 w-3.5 flex-none text-gold-300/60" />
                    <input
                      value={promo}
                      onChange={(e) => onPromoChange(e.target.value)}
                      placeholder="Code eingeben"
                      className="w-full bg-transparent py-2.5 text-sm text-cream placeholder:text-cream/25 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-cream/30">Wird an der Kasse automatisch übernommen.</p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.14em] text-cream/50">Zwischensumme</span>
                  <span className="gold-text font-heading text-2xl leading-none">
                    {formatEuro(subtotalCents)}
                  </span>
                </div>
                {error && (
                  <p className="mb-3 flex items-start gap-2 border border-red-400/25 bg-red-400/[0.07] px-3 py-2.5 text-xs leading-5 text-red-200">
                    <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 flex-none" />
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={checkout}
                  disabled={loading}
                  aria-busy={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-[6px] bg-gold-300 px-6 py-3.5 text-sm font-semibold text-obsidian transition-all hover:bg-gold-200 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                        Weiterleitung zu Stripe …
                      </>
                    ) : (
                      <>
                        Zur Kasse
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </span>
                </button>
                <p className="mt-3 text-center text-[11px] text-cream/30">
                  Sichere Zahlung über Stripe · SSL-verschlüsselt
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
