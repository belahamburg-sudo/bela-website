import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { SITE_LOGO_PATH } from "@/lib/brand";
import "./globals.css";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { PickaxeCursor } from "@/components/pickaxe-cursor";
import { CookieConsent } from "@/components/cookie-consent";
import { GoogleAnalytics } from "@/components/google-analytics";
import { MicrosoftClarity } from "@/components/microsoft-clarity";
import { SupportChatbot } from "@/components/support-chatbot";
import { CartProvider } from "@/lib/cart";
import { ReferralCapture } from "@/components/referral-capture";
import { SwRegister } from "@/components/sw-register";
import {
  JsonLd,
  organizationSchema,
  personSchema,
  websiteSchema,
} from "@/lib/seo/structured-data";

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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Bela Goldmann | AI Goldmining",
    description:
      "Digitale Produkte mit AI bauen, verpacken und automatisiert verkaufen.",
    images: [SITE_LOGO_PATH],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Goldmining",
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
        <JsonLd
          data={[organizationSchema(), personSchema(), websiteSchema()]}
        />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <PickaxeCursor />
        <AuthHashHandler />
        <ReferralCapture />
        <CartProvider>{children}</CartProvider>
        <SupportChatbot />
        <CookieConsent />
        <SwRegister />
      </body>
    </html>
  );
}
