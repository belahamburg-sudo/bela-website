import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { AuthHashHandler } from "@/components/auth-hash-handler";

const heading = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["600", "700", "800", "900"],
});

const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Bela Goldmann | AI Goldmining",
  description:
    "Baue mit AI digitale Produkte und verkaufe sie automatisiert. Templates, Guides, Mini-Kurse. Einmal erstellt, dauerhaft vermarktet.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Bela Goldmann | AI Goldmining",
    description:
      "Digitale Produkte mit AI bauen, verpacken und automatisiert verkaufen.",
    images: ["/assets/ai-goldmining-banner.jpeg"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0806",
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`dark ${heading.variable} ${body.variable}`}>
      <body>
        <a
          href="#main"
          className="focus-ring fixed left-4 top-4 z-[100] -translate-y-20 rounded-sm bg-gold-300 px-4 py-3 text-sm font-bold text-obsidian transition focus:translate-y-0"
        >
          Zum Inhalt springen
        </a>
        <AuthHashHandler />
        {children}
      </body>
    </html>
  );
}
