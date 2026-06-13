import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { PickaxeCursor } from "@/components/pickaxe-cursor";
import { CookieConsent } from "@/components/cookie-consent";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CartProvider } from "@/lib/cart";
import { ReferralCapture } from "@/components/referral-capture";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "Bela Goldmann | AI Goldmining",
  description:
    "Baue mit AI digitale Produkte und verkaufe sie automatisiert. Templates, Guides, Mini-Kurse. Einmal erstellt, dauerhaft vermarktet.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Bela Goldmann | AI Goldmining",
    description:
      "Digitale Produkte mit AI bauen, verpacken und automatisiert verkaufen.",
    images: ["/assets/logo-ai-goldmining-3d.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0805",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`dark scroll-smooth ${hanken.variable}`}>
      <body className="bg-obsidian font-body text-cream antialiased">
        <GoogleAnalytics />
        <a
          href="#main"
          className="focus-ring fixed left-4 top-4 z-[100] -translate-y-20 rounded-sm bg-gold-300 px-4 py-3 text-sm font-bold text-obsidian transition focus:translate-y-0"
        >
          Zum Inhalt springen
        </a>
        <PickaxeCursor />
        <AuthHashHandler />
        <ReferralCapture />
        <CartProvider>{children}</CartProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
