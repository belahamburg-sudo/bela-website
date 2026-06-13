"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  course,
  className,
  label = "In den Warenkorb",
}: {
  course: Omit<CartItem, "qty">;
  className?: string;
  label?: string;
}) {
  const { add, has, open } = useCart();
  const inCart = has(course.slug);

  return (
    <button
      type="button"
      onClick={() => (inCart ? open() : add(course))}
      className={cn(
        "btn-shimmer focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-gold-300/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-cream transition-all hover:border-gold-300/80 hover:bg-gold-300/[0.06]",
        className
      )}
    >
      {inCart ? <Check className="h-4 w-4 text-gold-300" /> : <ShoppingBag className="h-4 w-4" />}
      {inCart ? "Im Warenkorb" : label}
    </button>
  );
}
