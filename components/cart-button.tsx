"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartButton({ className = "" }: { className?: string }) {
  const { count, toggle } = useCart();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Warenkorb (${count})`}
      className={`relative flex h-9 w-9 items-center justify-center text-cream/60 transition-colors hover:text-gold-300 ${className}`}
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-gradient px-1 text-[10px] font-bold leading-none text-obsidian">
          {count}
        </span>
      )}
    </button>
  );
}
