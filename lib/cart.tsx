"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  title: string;
  priceCents: number;
  image?: string;
  format?: "video" | "pdf";
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ai-goldmining-cart";
const MAX_COURSE_QTY = 1;

function normalizeCartItems(raw: CartItem[]): CartItem[] {
  const bySlug = new Map<string, CartItem>();
  for (const item of raw) {
    if (!item?.slug) continue;
    bySlug.set(item.slug, { ...item, qty: MAX_COURSE_QTY });
  }
  return [...bySlug.values()];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(normalizeCartItems(parsed));
      }
    } catch {
      // ignore malformed cart
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration so we don't clobber stored state).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full / unavailable — ignore
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) return prev;
      return [...prev, { ...item, qty: MAX_COURSE_QTY }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.slug !== slug);
      return prev.map((i) => (i.slug === slug ? { ...i, qty: MAX_COURSE_QTY } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.length;
    const subtotalCents = items.reduce((n, i) => n + i.priceCents, 0);
    return {
      items,
      count,
      subtotalCents,
      isOpen,
      add,
      remove,
      setQty,
      clear,
      has,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((o) => !o),
    };
  }, [items, isOpen, add, remove, setQty, clear, has]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
