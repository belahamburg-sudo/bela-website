"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotalCents, count } = useCart();

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
            className="fixed right-0 top-0 z-[71] flex h-full w-full max-w-md flex-col border-l border-gold-300/20 bg-obsidian/95 backdrop-blur-xl"
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
                          <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-sm text-cream">{item.title}</p>
                        <p className="mt-0.5 gold-text font-heading text-base leading-none">
                          {formatEuro(item.priceCents)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center border border-white/10">
                            <button
                              onClick={() => setQty(item.slug, item.qty - 1)}
                              aria-label="Weniger"
                              className="flex h-7 w-7 items-center justify-center text-cream/60 hover:text-gold-300"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center font-mono text-xs text-cream">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.slug, item.qty + 1)}
                              aria-label="Mehr"
                              className="flex h-7 w-7 items-center justify-center text-cream/60 hover:text-gold-300"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.slug)}
                            aria-label="Entfernen"
                            className="flex h-7 w-7 items-center justify-center text-cream/40 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.14em] text-cream/50">Zwischensumme</span>
                  <span className="gold-text font-heading text-2xl leading-none">
                    {formatEuro(subtotalCents)}
                  </span>
                </div>
                <Link
                  href="/warenkorb"
                  onClick={close}
                  className="btn-shimmer group flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    Zur Kasse
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <p className="mt-3 text-center text-[11px] text-cream/30">
                  Sichere Zahlung über Stripe · 14 Tage Widerruf
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
