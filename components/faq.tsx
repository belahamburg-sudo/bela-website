"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  q: string;
  a: string;
};

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="panel-surface overflow-hidden rounded-[1.5rem]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              "border-b border-gold-500/10 last:border-b-0",
              isOpen && "bg-gradient-to-b from-gold-500/[0.04] to-transparent"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="focus-ring group flex w-full items-center justify-between gap-6 px-6 py-6 text-left sm:px-8"
            >
              <span className="font-heading text-[1.02rem] font-bold text-cream sm:text-[1.15rem]">
                {item.q}
              </span>
              <span
                className={cn(
                  "relative flex h-9 w-9 flex-none items-center justify-center rounded-full border transition-all duration-300",
                  isOpen
                    ? "rotate-45 border-gold-300/50 bg-gold-500/10 text-gold-200"
                    : "border-gold-500/20 bg-obsidian/60 text-muted group-hover:border-gold-300/40 group-hover:text-gold-200"
                )}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </span>
            </button>
            <div
              className="grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0">
                <p className="px-6 pb-7 text-[0.98rem] leading-[1.8] text-muted sm:px-8">
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
