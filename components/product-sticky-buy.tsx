"use client";

import { useEffect, useState } from "react";
import { formatEuro } from "@/lib/utils";

/**
 * Mobile-only sticky buy bar for a course product page. It replaces the generic
 * webinar CTA there and follows the board rule that every CTA leads to the buy
 * section: it is a scroll link to `#kaufen`, never a direct checkout.
 *
 * It hides itself again once the real buy section is on screen, so the sticky
 * bar never covers the buttons it points at. Shown/hidden with a plain CSS
 * transition — no animation library for a two-state bar.
 */
export function ProductStickyBuy({
  priceCents,
  label,
  href,
}: {
  /** Price shown next to the button; omitted for owners. */
  priceCents?: number;
  label: string;
  href: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      // Past the hero…
      const pastHero = window.scrollY > 600;
      // …but not once the real buy section has scrolled into view, so the bar
      // never sits on top of the buttons it points at.
      const buySection = document.getElementById("kaufen");
      const buyInView = buySection
        ? buySection.getBoundingClientRect().top < window.innerHeight - 80
        : false;
      setVisible(pastHero && !buyInView);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-4 z-40 px-4 transition-all duration-300 lg:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-24 opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-full border border-gold-300/30 bg-obsidian/95 p-2 pl-5 shadow-[0_16px_50px_rgba(0,0,0,0.65)] backdrop-blur">
        {typeof priceCents === "number" && (
          <span className="flex-none font-heading text-xl text-gold-300">
            {formatEuro(priceCents)}
          </span>
        )}
        <a
          href={href}
          tabIndex={visible ? 0 : -1}
          className="btn-shimmer focus-ring relative inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-gold-300/60 bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-5 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-obsidian transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
        >
          <span className="relative z-[2]">{label}</span>
        </a>
      </div>
    </div>
  );
}
