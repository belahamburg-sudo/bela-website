import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

const heading = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: "400",
  style: ["normal", "italic"]
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
  openGraph: {
    title: "Bela Goldmann | AI Goldmining",
    description:
      "Digitale Produkte mit AI bauen, verpacken und automatisiert verkaufen.",
    images: ["/assets/generated/hero-ai-gold.svg"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505"
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
          className="focus-ring fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-gold-300 px-4 py-3 text-sm font-bold text-obsidian transition focus:translate-y-0"
        >
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <SmoothScrollProvider>
          <main id="main">{children}</main>
        </SmoothScrollProvider>
        <Footer />
      </body>
    </html>
  );
}
