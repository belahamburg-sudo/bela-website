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
import { getNewsletterStatus, subscribeNewsletter } from "@/lib/newsletter";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatEuro } from "@/lib/utils";

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

  const lessonCount = (course.modules ?? []).reduce(
    (sum, mod) => sum + (mod.lessons?.length ?? 0),
    0
  );
  const started = start === "1" || Boolean(error) || Boolean(status);
  const activeStep = freebieFunnelStep(user, owned);

  return (
    <section className="relative min-h-screen overflow-hidden bg-obsidian pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-300/10 blur-[140px]" />
      </div>

      {!started ? (
        <div className="relative mx-auto max-w-3xl px-6 pb-20">
          <div className="mb-6 inline-flex items-center gap-2 border border-gold-300/30 bg-gold-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">
            <Gift aria-hidden className="h-3.5 w-3.5" />
            Gratis-Produkt
          </div>

          <CourseLevelBadge
            level={(course.level as "Start" | "Aufbau" | "System" | "Bundle") ?? "Start"}
          />

          <h1 className="mt-5 font-heading text-4xl leading-tight text-cream sm:text-6xl">
            {course.title}
          </h1>
          {course.tagline && (
            <p className="mt-4 text-xl font-semibold text-gold-100">{course.tagline}</p>
          )}
          {course.description && (
            <p className="mt-6 max-w-2xl text-lg leading-9 text-cream/55">{course.description}</p>
          )}

          {course.image_url && (
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.image_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cream/30">
                Preis
              </p>
              <p className="mt-1 font-heading text-2xl text-gold-300">{formatEuro(0)}</p>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cream/30">
                Format
              </p>
              <p className="mt-1 font-heading text-2xl text-cream">
                {course.format === "pdf" ? "PDF" : "Video"}
              </p>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cream/30">
                Inhalt
              </p>
              <p className="mt-1 font-heading text-2xl text-cream">
                {lessonCount > 0 ? `${lessonCount} Lektionen` : "Sofortzugang"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 text-sm leading-7 text-cream/65">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
              <span>Nach der Freischaltung findest du das Produkt nur unter „Meine Kurse“.</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
              <span>Danach: Account → Newsletter bestätigen → Sofortzugang.</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-stretch gap-4 sm:items-start">
            <Link
              href={`/freebie/${slug}?start=1`}
              className="btn-shimmer focus-ring relative inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border border-gold-300/60 bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-8 py-4 text-[0.9rem] font-bold uppercase tracking-[0.12em] text-obsidian shadow-[0_10px_50px_-10px_rgba(201,169,97,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
            >
              <span className="relative z-[2]">Ja, das will ich gratis!</span>
              <ArrowRight aria-hidden className="relative z-[2] h-5 w-5" />
            </Link>
            <Link
              href="/kurse"
              className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35 transition-colors hover:text-gold-200 sm:text-left"
            >
              Zur Kursübersicht
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
