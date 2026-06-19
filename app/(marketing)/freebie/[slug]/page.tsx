import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Gift, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/button";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { grantFreebieCourse } from "@/lib/freebies";
import { getNewsletterStatus } from "@/lib/newsletter";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { subscribeNewsletter } from "@/lib/newsletter";
import { formatEuro } from "@/lib/utils";
import type { DbCourse } from "@/lib/db-types";

export const dynamic = "force-dynamic";

async function getFreebie(slug: string): Promise<DbCourse | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_unlisted", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbCourse;
}

async function claimFreebie(formData: FormData) {
  "use server";

  const slug = String(formData.get("slug") ?? "").trim();
  const consent = formData.get("newsletter") === "on";
  if (!slug) redirect("/kurse");
  if (!consent) redirect(`/freebie/${slug}?error=newsletter`);

  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) redirect(`/freebie/${slug}?error=config`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    redirect(`/login?redirect=${encodeURIComponent(`/freebie/${slug}`)}`);
  }

  const course = await getFreebie(slug);
  if (!course) notFound();

  const newsletterStatus = await getNewsletterStatus(user.email);
  if (newsletterStatus === "confirmed") {
    const granted = await grantFreebieCourse(user.id, slug);
    redirect(granted ? `/bibliothek/${slug}?freebie=claimed` : `/freebie/${slug}?error=grant`);
  }

  await subscribeNewsletter(user.email, {
    userId: user.id,
    source: `freebie:${slug}`,
    name: user.user_metadata?.full_name,
  });

  redirect(`/freebie/${slug}?status=check_email`);
}

export default async function FreebiePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const { slug } = await params;
  const { error, status } = await searchParams;
  const course = await getFreebie(slug);
  if (!course) notFound();

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const redirectTarget = encodeURIComponent(`/freebie/${slug}`);
  const lessonCount = (course.modules ?? []).reduce(
    (sum, mod) => sum + (mod.lessons?.length ?? 0),
    0
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-obsidian pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-300/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 border border-gold-300/30 bg-gold-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">
            <Gift aria-hidden className="h-3.5 w-3.5" />
            Freebie
          </div>

          <CourseLevelBadge level={(course.level as any) ?? "Start"} />

          <h1 className="mt-5 font-heading text-4xl leading-tight text-cream sm:text-6xl">
            {course.title}
          </h1>
          {course.tagline && (
            <p className="mt-4 text-xl font-semibold text-gold-100">{course.tagline}</p>
          )}
          {course.description && (
            <p className="mt-6 max-w-2xl text-lg leading-9 text-cream/55">{course.description}</p>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cream/30">
                Preis
              </p>
              <p className="mt-1 font-heading text-2xl text-gold-300">
                {formatEuro(0)}
              </p>
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
              <span>Du bekommst diesen Kurs kostenlos in deine Bibliothek.</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
              <span>Im Gegenzug meldest du dich transparent zum AI Goldmining Newsletter an.</span>
            </div>
          </div>
        </div>

        <div className="border border-gold-300/20 bg-ink/70 p-5 shadow-gold backdrop-blur-xl sm:p-7">
          {course.image_url && (
            <div className="relative mb-6 aspect-[4/3] overflow-hidden border border-white/10">
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {user ? (
            <form action={claimFreebie} className="grid gap-5">
              <input type="hidden" name="slug" value={slug} />
              <div>
                <p className="font-heading text-2xl text-cream">Freebie freischalten</p>
                <p className="mt-2 text-sm leading-7 text-cream/50">
                  Nach dem Klick schicken wir dir die Bestätigungs-Mail. Erst nach
                  dem Klick auf diesen Link erscheint der Kurs in deiner Bibliothek.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 border border-gold-300/15 bg-gold-300/[0.04] px-4 py-4">
                <input
                  name="newsletter"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 flex-none rounded border-white/20 bg-obsidian accent-gold-300"
                />
                <span className="text-sm leading-6 text-cream/70">
                  Ja, ich möchte den kostenlosen Kurs erhalten und melde mich dafür
                  zum AI Goldmining Newsletter an. Ich kann mich jederzeit über den
                  Abmeldelink in jeder E-Mail wieder austragen.
                </span>
              </label>

              {error === "newsletter" && (
                <p className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-semibold text-red-200">
                  Für dieses Freebie ist die Newsletter-Anmeldung erforderlich.
                </p>
              )}
              {error === "grant" && (
                <p className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-semibold text-red-200">
                  Deine Newsletter-Bestätigung ist angekommen, aber der Kurs konnte nicht automatisch freigeschaltet werden.
                </p>
              )}
              {error === "config" && (
                <p className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-semibold text-red-200">
                  Freebies sind serverseitig noch nicht vollständig konfiguriert.
                </p>
              )}
              {status === "check_email" && (
                <p className="border border-gold-300/20 bg-gold-300/[0.06] px-4 py-3 text-xs font-semibold text-gold-100">
                  Check deine Inbox. Der Kurs wird freigeschaltet, sobald du die Newsletter-Mail bestätigst.
                </p>
              )}

              <button
                type="submit"
                className="btn-shimmer inline-flex min-h-12 items-center justify-center gap-2 bg-gold-gradient px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-obsidian transition hover:brightness-110"
              >
                <Sparkles aria-hidden className="h-4 w-4" />
                Kostenlos freischalten
              </button>
            </form>
          ) : (
            <div className="grid gap-5">
              <div className="flex h-12 w-12 items-center justify-center border border-gold-300/30 bg-gold-300/10">
                <LockKeyhole aria-hidden className="h-5 w-5 text-gold-300" />
              </div>
              <div>
                <p className="font-heading text-2xl text-cream">Erst einloggen</p>
                <p className="mt-2 text-sm leading-7 text-cream/50">
                  Melde dich an oder erstelle einen kostenlosen Account. Danach kommst
                  du automatisch zu diesem Freebie zurück.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button href={`/login?redirect=${redirectTarget}`} size="lg" className="w-full">
                  Einloggen
                </Button>
                <Button
                  href={`/signup?redirect=${redirectTarget}`}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Registrieren
                </Button>
              </div>
              <Link
                href="/kurse"
                className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35 transition-colors hover:text-gold-200"
              >
                Zur Kursübersicht
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
