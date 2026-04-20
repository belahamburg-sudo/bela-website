"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createLayout, stagger, animate, onScroll } from "animejs";
import { cn } from "@/lib/utils";

export type FaqItem = {
  q: string;
  a: string;
};

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<ReturnType<typeof createLayout> | null>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    layoutRef.current = createLayout(containerRef.current);
    return () => { layoutRef.current?.revert(); };
  }, []);

  useEffect(() => {
    if (!itemsRef.current) return;
    const rows = itemsRef.current.querySelectorAll<HTMLDivElement>(".faq-row");
    const anim = animate(rows, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(80),
      duration: 600,
      ease: "outExpo",
      autoplay: false,
    });
    const obs = onScroll({
      target: itemsRef.current,
      enter: "bottom-=10% top",
      onEnter: () => anim.play(),
    });
    return () => { anim.revert(); obs.revert(); };
  }, []);

  function toggle(i: number) {
    if (!layoutRef.current) {
      setOpen((prev) => (prev === i ? null : i));
      return;
    }
    layoutRef.current.update(
      () => setOpen((prev) => (prev === i ? null : i)),
      { duration: 400, ease: "outExpo" }
    );
  }

  return (
    <div ref={itemsRef} className="divide-y divide-gold-300/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            ref={i === 0 ? containerRef : undefined}
            className={cn("faq-row py-1", isOpen && "pb-2")}
            style={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="focus-ring group flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-heading tracking-gta text-[1.1rem] lg:text-[1.25rem] text-cream">
                {item.q}
              </span>
              <span
                className={cn(
                  "relative flex h-8 w-8 flex-none items-center justify-center rounded-sm border transition-all duration-300",
                  isOpen
                    ? "rotate-45 border-gold-300/60 bg-gold-300/10 text-gold-200"
                    : "border-cream/15 text-cream/35 group-hover:border-gold-300/40 group-hover:text-gold-200"
                )}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
              </span>
            </button>
            <div
              className="grid overflow-hidden transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0">
                <p className="pb-6 text-base leading-[1.85] text-cream/45">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
