import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/button";
import { SpatialBackground } from "@/components/spatial-background";
import { OtoOffer } from "@/components/oto-offer";
import { getPublicCourse } from "@/lib/courses";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { OTO, otoPriceCents } from "@/lib/offers";

type OtoData = {
  sessionId: string;
  slug: string;
  title: string;
  tagline: string;
  image: string;
  fullPriceCents: number;
  otoPriceCents: number;
  discountPercent: number;
};

/**
 * Decide whether to show the post-purchase 1-Click OTO. Only when the feature is
 * on, the flagship is live, it wasn't already in this order, and the buyer
 * doesn't already own it.
 */
async function resolveOto(sessionId: string | undefined): Promise<OtoData | null> {
  if (!OTO.enabled || !sessionId) return null;
  const stripe = getStripeClient();
  if (!stripe) return null;
  try {
    const course = await getPublicCourse(OTO.courseSlug);
    if (!course || course.comingSoon) return null;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;

    const purchased = (session.metadata?.course_slugs ?? session.metadata?.course_slug ?? "")
      .split(",")
      .map((s) => s.trim());
    if (purchased.includes(OTO.courseSlug)) return null;

    // Skip if the buyer already owns the flagship.
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: owned } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_slug", OTO.courseSlug)
          .eq("status", "paid")
          .maybeSingle();
        if (owned) return null;
      }
    }

    return {
      sessionId,
      slug: course.slug,
      title: course.title,
      tagline: course.tagline,
      image: course.image,
      fullPriceCents: course.priceCents,
      otoPriceCents: otoPriceCents(course.priceCents),
      discountPercent: OTO.discountPercent,
    };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; course?: string; demo?: string }>;
}) {
  const { session_id: sessionId, course: courseSlug, demo } = await searchParams;
  const course = courseSlug ? await getPublicCourse(courseSlug) : undefined;
  const isDemo = demo === "1";
  const oto = isDemo ? null : await resolveOto(sessionId);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian py-16 sm:py-24">
      <SpatialBackground />

      <div className="container-shell relative z-10">
        {oto && <OtoOffer {...oto} />}
        <div className="mx-auto max-w-2xl">
          <div className="tac-panel tac-corners tac-scanline px-6 py-12 text-center sm:px-12 sm:py-16">
            {/* Status badge */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-gold-300/60">
                Zahlung bestätigt
              </span>
              <div className="h-px w-8 bg-gold-300/30" />
            </div>

            {/* Icon */}
            <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gold-300/15 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/[0.07]">
                <CheckCircle2 className="h-10 w-10 text-gold-300" aria-hidden />
              </div>
            </div>

            <h1 className="font-heading text-4xl uppercase leading-none tracking-gta text-cream sm:text-5xl">
              <span className="gold-text">Willkommen</span> an Bord.
            </h1>

            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/55">
              {course ? (
                <>
                  Dein Kauf von{" "}
                  <span className="font-semibold text-cream">{course.title}</span> war
                  erfolgreich. Du hast jetzt dauerhaften Zugriff.
                </>
              ) : (
                <>Deine Zahlung war erfolgreich. Dein Zugang wird jetzt freigeschaltet.</>
              )}
            </p>

            {/* Reassurance: webhook may take a moment */}
            <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2.5 border border-gold-300/15 bg-ink/40 px-4 py-3 text-[11px] font-mono uppercase tracking-[0.12em] text-cream/45 backdrop-blur-md">
              <Loader2 className="h-3.5 w-3.5 flex-none animate-spin text-gold-300/60" aria-hidden />
              Freischaltung läuft — das kann ein paar Sekunden dauern.
            </div>

            {isDemo ? (
              <p className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-gold-300/45">
                <Sparkles className="h-3 w-3 flex-none" aria-hidden />
                Demo-Freischaltung (kein echter Zahlungsvorgang)
              </p>
            ) : null}

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/bibliothek" size="md">
                Zu meinen Kursen
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              {course ? (
                <Button href={`/bibliothek/${course.slug}`} variant="secondary" size="md">
                  Kurs öffnen
                </Button>
              ) : null}
            </div>

            <div className="mt-8">
              <Link
                href="/dashboard"
                className="focus-ring text-[10px] font-mono uppercase tracking-[0.2em] text-cream/35 transition-colors hover:text-gold-300/70"
              >
                Zur Übersicht
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
