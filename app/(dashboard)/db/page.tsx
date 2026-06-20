import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { SpatialBackground } from "@/components/spatial-background";
import { Reveal } from "@/components/dashboard/reveal";
import { ReferAFriend } from "@/components/refer-a-friend";
import { StoreProductCard, type StoreCardCourse } from "@/components/store-product-card";
import { getUnifiedMemberData } from "@/lib/member-data";
import { getMemberLevel } from "@/lib/avatar-system";
import type { Course } from "@/lib/content";

/** Map a catalog course (+ optional progress) to the shared store-card shape. */
function toStoreCard(
  course: Course,
  progress?: { totalLessons: number; completedLessons: number; progress: number }
): StoreCardCourse {
  const totalLessons =
    progress?.totalLessons ??
    course.modules.reduce((n, m) => n + m.lessons.length, 0);
  return {
    slug: course.slug,
    title: course.title,
    tagline: course.tagline,
    image: course.image,
    price_cents: course.priceCents,
    compare_at_price_cents: course.compareAtPriceCents ?? null,
    level: course.level,
    format: course.format,
    totalLessons,
    completedLessons: progress?.completedLessons ?? 0,
    progress: progress?.progress ?? 0,
    isBundle: course.level === "Bundle",
    comingSoon: Boolean(course.comingSoon),
    isFlagship: course.slug === "ai-goldmining-method",
    sortOrder: course.sortOrder ?? 999,
  };
}

export default async function DashboardPage() {
  const {
    user,
    purchasedCourses: rawPurchasedCourses,
    availableCourses,
    totalLessonsCompleted,
    completedCourses,
    points,
  } = await getUnifiedMemberData();

  // getUnifiedMemberData builds this list with `.filter(Boolean)`, which TS does
  // not narrow — re-filter with a type guard so the element type is non-null.
  const purchasedCourses = rawPurchasedCourses.filter(
    (course): course is NonNullable<typeof course> => course != null,
  );

  const displayName = user.name ?? user.email?.split("@")[0] ?? "Miner";
  const level = getMemberLevel(points);
  const remainingXp = level.next ? Math.max(0, level.next.minPoints - points) : 0;

  const stats = [
    {
      label: "Freigeschaltete Kurse",
      value: purchasedCourses.length,
      icon: BookOpen,
    },
    {
      label: "Abgeschlossene Lektionen",
      value: totalLessonsCompleted,
      icon: CheckCircle2,
    },
    {
      label: "Abgeschlossene Kurse",
      value: completedCourses,
      icon: Trophy,
    },
    {
      label: "XP",
      value: points,
      icon: Zap,
    },
  ];

  const storeTeaser = availableCourses.slice(0, 3);

  return (
    <AuthGate>
      <section className="relative min-h-screen overflow-hidden bg-obsidian py-14 sm:py-20">
        <SpatialBackground />

        <div className="container-shell relative z-10 space-y-12">
          {/* ─── WELCOME HEADER ─── */}
          <Reveal>
            <header className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold-300/30" />
                <span className="tac-label text-gold-300/60 uppercase tracking-widest text-[9px]">
                  Mitglieder-Übersicht
                </span>
              </div>

              <h1 className="font-heading tracking-gta uppercase leading-[0.95] text-cream text-4xl sm:text-5xl md:text-6xl">
                WILLKOMMEN,{" "}
                <span className="gold-text">{displayName.toUpperCase()}.</span>
              </h1>

              {/* compact level + XP summary line */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">
                <span className="text-gold-300">Level {level.current.level}</span>
                <Dot />
                <span>{level.current.title}</span>
                <Dot />
                <span>{points} XP</span>
                <Dot />
                <span>{level.progress}%</span>
                {level.next ? (
                  <>
                    <Dot />
                    <span className="text-cream/30">noch {remainingXp} XP</span>
                  </>
                ) : (
                  <>
                    <Dot />
                    <span className="text-gold-300/70">Max-Level erreicht</span>
                  </>
                )}
              </div>

              {/* level progress bar */}
              <div className="max-w-md space-y-2">
                <div className="h-1.5 w-full overflow-hidden bg-white/[0.06]">
                  <div
                    className="h-full bg-gold-gradient transition-all duration-1000"
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream/30">
                  {level.next
                    ? `Fortschritt zu Level ${level.next.level}`
                    : "Höchste Stufe erreicht"}
                </p>
              </div>
            </header>
          </Reveal>

          {/* ─── STAT ROW ─── */}
          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="tac-panel tac-corners group p-5 transition-colors duration-300 hover:border-gold-300/30"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Icon className="h-4 w-4 text-gold-300/60" />
                    <span className="h-1.5 w-1.5 bg-gold-300/30 transition-colors group-hover:bg-gold-300/70" />
                  </div>
                  <p className="font-heading text-3xl leading-none text-cream">
                    {value}
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cream/40">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* ─── REFER A FRIEND ─── */}
          <Reveal delay={0.1}>
            <ReferAFriend />
          </Reveal>

          {/* ─── DEINE KURSE / WEITERLERNEN ─── */}
          <Reveal delay={0.12}>
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Deine Kurse"
                title="WEITERLERNEN"
                icon={GraduationCap}
              />

              {purchasedCourses.length > 0 ? (
                <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {purchasedCourses.map((course) => (
                    <StoreProductCard
                      key={course.slug}
                      course={toStoreCard(course, {
                        totalLessons: course.totalLessons,
                        completedLessons: course.completedLessons,
                        progress: course.progress,
                      })}
                      isPurchased
                    />
                  ))}
                </div>
              ) : (
                <div className="tac-panel tac-corners flex flex-col items-center gap-5 p-12 text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center border border-gold-300/20 bg-gold-300/[0.04]">
                    <BookOpen className="h-5 w-5 text-gold-300/60" />
                  </span>
                  <div className="space-y-2">
                    <p className="font-heading text-2xl uppercase tracking-tight text-cream">
                      Noch keine Kurse freigeschaltet
                    </p>
                    <p className="mx-auto max-w-md font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
                      Entdecke den Store und starte deine erste Operation.
                    </p>
                  </div>
                  <Button href="/bibliothek" variant="primary" size="md">
                    Zum Store
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Reveal>

          {/* ─── AUS DEM STORE (teaser) ─── */}
          {storeTeaser.length > 0 && (
            <Reveal delay={0.16}>
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <SectionHeading
                    eyebrow="Aus dem Store"
                    title="NEUE OPERATIONEN"
                    icon={Sparkles}
                  />
                  <Button
                    href="/bibliothek"
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                  >
                    Zum Store
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {storeTeaser.map((course) => (
                    <StoreProductCard
                      key={course.slug}
                      course={toStoreCard(course)}
                      isPurchased={false}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </AuthGate>
  );
}

function Dot() {
  return <span className="text-gold-300/30">·</span>;
}

function SectionHeading({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gold-300/60">
        <Icon className="h-3.5 w-3.5" />
        <span className="tac-label uppercase tracking-widest">{eyebrow}</span>
      </div>
      <h2 className="font-heading text-2xl uppercase tracking-tight text-cream sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
