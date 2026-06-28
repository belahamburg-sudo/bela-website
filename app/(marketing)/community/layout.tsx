import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Community | AI Goldmining",
  description:
    "Werde Teil der AI Goldmining Community – Austausch, Support und Accountability für deinen Start mit digitalen Produkten.",
  alternates: { canonical: "/community" },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
