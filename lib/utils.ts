import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEuro(cents: number) {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

/**
 * Discount percent of a price vs. its anchor (compare-at) price, rounded.
 * Returns 0 when there is no valid, lower price (so callers can hide the badge).
 */
export function discountPercent(priceCents: number, compareAtCents?: number | null): number {
  if (!compareAtCents || compareAtCents <= priceCents) return 0;
  return Math.round((1 - priceCents / compareAtCents) * 100);
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export function formatDate(date: Date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
