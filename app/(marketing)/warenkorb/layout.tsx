import type { Metadata } from "next";

// Cart is a client component and has no SEO value — title set, indexing off.
export const metadata: Metadata = {
  title: "Warenkorb | AI Goldmining",
  description: "Dein Warenkorb bei AI Goldmining.",
  robots: { index: false, follow: false },
};

export default function WarenkorbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
