import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Gift, Mail } from "lucide-react";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { FreebieFunnel } from "@/components/freebie-funnel";
import {
  claimFreebieForUser,
  freebieFunnelStep,
  getFreebieCourse,
  userOwnsFreebie,
} from "@/lib/freebies";
import type { ProductPage } from "@/lib/content";
import { getNewsletterStatus, subscribeNewsletter } from "@/lib/newsletter";
import { resolveMediaUrl } from "@/lib/storage";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gratis-Download | AI Goldmining",
  description: "Sichere dir dein kostenloses Material von AI Goldmining.",
  robots: { index: false, follow: false },
};

async function claimFreebie(formData: FormData) {
  "use server";

  const slug = String(formData.get("slug") ?? "").trim();
  const consent = formData.get("newsletter") === "on";
  const resend = formData.get("resend") === "on";
  if (!slug) redirect("/kurse");

  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) redirect(`/freebie/${slug}?start=1&error=config`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    redirect(`/login?redirect=${encodeURIComponent(`/freebie/${slug}?start=1`)}`);
  }

  const course = await getFreebieCourse(slug);
  if (!course) notFound();

  if (resend) {
    const newsletterStatus = await getNewsletterStatus(user.email);
    if (newsletterStatus === "confirmed") {
      redirect(`/freebie/${slug}?start=1`);
    }
    await subscribeNewsletter(user.email, {
      userId: user.id,
      source: `freebie:${slug.trim()}`,
      name: user.user_metadata?.full_name,
      resend: true,
    });
    // Eigener Status, damit die Seite danach sichtbar bestätigt, dass gerade
    // verschickt wurde. Mit `check_email` sah die Seite nach dem Klick exakt
    // gleich aus und der Knopf wirkte kaputt.
    redirect(`/freebie/${slug}?start=1&status=resent`);
  }

  const newsletterStatus = await getNewsletterStatus(user.email);
  if (newsletterStatus !== "confirmed" && !consent) {
    redirect(`/freebie/${slug}?start=1&error=newsletter`);
  }

  const result = await claimFreebieForUser(user.id, user.email, slug, {
    name: user.user_metadata?.full_name,
    // Bestätigte Konto-Mail = Adressnachweis liegt vor = keine zweite
    // Bestätigungsmail nötig (siehe confirmNewsletterWithVerifiedAccount).
    accountEmailVerified: Boolean(user.email_confirmed_at),
  });

  switch (result.status) {
    case "granted":
    case "already_owned":
      redirect(`/bibliothek/${slug}?freebie=claimed`);
    case "pending_newsletter":
      redirect(`/freebie/${slug}?start=1&status=check_email`);
    case "invalid_course":
      notFound();
    default:
      redirect(`/freebie/${slug}?start=1&error=grant`);
  }
}

export default async function FreebiePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; status?: string; start?: string }>;
}) {
  const { slug } = await params;
  const { error, status, start } = await searchParams;
  const course = await getFreebieCourse(slug);
  if (!course) notFound();

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let newsletterStatus = "none" as Awaited<ReturnType<typeof getNewsletterStatus>>;
  let owned = false;

  if (user?.id) {
    owned = await userOwnsFreebie(user.id, slug);
    if (owned) {
      redirect(`/bibliothek/${slug}`);
    }
    if (user.email) {
      newsletterStatus = await getNewsletterStatus(user.email);
    }
  }

  // Inhalte der Landingpage. Alles kommt aus dem Dashboard, leere Felder
  // blenden ihren Block einfach aus.
  const productPage = (course.product_page ?? {}) as ProductPage;
  const headline = productPage.outcomeHeadline?.trim() || course.title;
  const ctaLabel = productPage.heroCtaLabel?.trim() || "Jetzt GRATIS sichern";
  const learnPoints = (productPage.vision ?? []).map((p) => p.trim()).filter(Boolean);
  const coverUrl = (await resolveMediaUrl(course.image_url)) ?? undefined;
  const proofImageUrls = (
    await Promise.all((productPage.proofImages ?? []).map((ref) => resolveMediaUrl(ref)))
  ).filter((url): url is string => Boolean(url));

  const started = start === "1" || Boolean(error) || Boolean(status);
  const activeStep = freebieFunnelStep(user, owned);

  return (
    <section className="relative min-h-screen overflow-hidden bg-obsidian pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-300/10 blur-[140px]" />
      </div>

      {!started ? (
        <div className="relative mx-auto max-w-5xl px-6 pb-24">
          {/* Kopf: mobil Headline → Cover → CTA. Ab lg Cover links, Headline
              rechts, CTA darunter — ein einziger Button im Code, zwei Layouts
              über die Rasterplatzierung. */}
          <div
            className={`flex flex-col gap-8 ${
              coverUrl
                ? "lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-12"
                : ""
            }`}
          >
            <div className="lg:col-start-2 lg:row-start-1">
              <div className="mb-5 inline-flex items-center gap-2 border border-gold-300/30 bg-gold-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">
                <Gift aria-hidden className="h-3.5 w-3.5" />
                Gratis-Produkt
              </div>
              <h1 className="font-heading text-4xl leading-tight text-cream sm:text-5xl">
                {headline}
              </h1>
            </div>

            {coverUrl && (
              <div className="overflow-hidden rounded-2xl border border-white/10 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="" className="w-full object-cover" />
              </div>
            )}

            <div className="flex flex-col items-stretch gap-4 sm:items-start lg:col-start-2 lg:row-start-2">
              <Link
                href={`/freebie/${slug}?start=1`}
                className="focus-ring relative inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[6px] border border-gold-300/60 bg-gold-300 px-8 py-4 text-[0.9rem] font-semibold text-obsidian transition-all duration-300 hover:bg-gold-200"
              >
                <span className="relative z-[2]">{ctaLabel}</span>
                <ArrowRight aria-hidden className="relative z-[2] h-5 w-5" />
              </Link>
            </div>
          </div>

          {learnPoints.length > 0 && (
            <div className="mt-20">
              <h2 className="text-center font-heading text-3xl text-cream sm:text-4xl">
                Das lernst du:
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {learnPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                  >
                    <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold-300" />
                    <span className="text-base leading-8 text-cream/75">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {proofImageUrls.length > 0 && (
            <div className="mt-20">
              <h2 className="text-center font-heading text-3xl text-cream sm:text-4xl">
                {productPage.proofHeadline?.trim() || "Das sagen andere:"}
              </h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {proofImageUrls.map((src) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring group block overflow-hidden rounded-xl border border-white/10 transition-colors hover:border-gold-300/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt="Ergebnis-Screenshot"
                      loading="lazy"
                      className="h-[380px] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] sm:h-[460px]"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <Link
              href={`/freebie/${slug}?start=1`}
              className="focus-ring relative inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[6px] border border-gold-300/60 bg-gold-300 px-8 py-4 text-[0.9rem] font-semibold text-obsidian transition-all duration-300 hover:bg-gold-200"
            >
              <span className="relative z-[2]">{ctaLabel}</span>
              <ArrowRight aria-hidden className="relative z-[2] h-5 w-5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border border-gold-300/30 bg-gold-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">
              <Gift aria-hidden className="h-3.5 w-3.5" />
              Gratis-Produkt
            </div>

            <CourseLevelBadge
              level={(course.level as "Start" | "Aufbau" | "System" | "Bundle") ?? "Start"}
            />

            <h1 className="mt-5 font-heading text-4xl leading-tight text-cream sm:text-5xl">
              {course.title}
            </h1>
            {course.tagline && (
              <p className="mt-4 text-lg font-semibold text-gold-100">{course.tagline}</p>
            )}
            {course.description && (
              <p className="mt-5 max-w-2xl text-base leading-8 text-cream/55">{course.description}</p>
            )}

            <div className="mt-8 grid gap-3 text-sm leading-7 text-cream/65">
              <div className="flex items-start gap-3">
                <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                <span>Nach der Freischaltung findest du das Produkt nur unter „Meine Kurse“.</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                <span>Newsletter-Anmeldung ist Voraussetzung für den Gratis-Zugang.</span>
              </div>
            </div>
          </div>

          <FreebieFunnel
            slug={slug}
            courseTitle={course.title}
            courseImage={course.image_url}
            user={user}
            accountVerified={Boolean(user?.email_confirmed_at)}
            newsletterStatus={newsletterStatus}
            activeStep={activeStep}
            error={error}
            status={status}
            claimAction={claimFreebie}
          />
        </div>
      )}
    </section>
  );
}
