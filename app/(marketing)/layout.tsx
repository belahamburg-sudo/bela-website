import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";
import { AnnouncementBar } from "@/components/announcement-bar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main">{children}</main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
