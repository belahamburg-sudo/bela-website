import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Play,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { SpatialBackground } from "@/components/spatial-background";
import { Reveal } from "@/components/dashboard/reveal";
import { ReferAFriend } from "@/components/refer-a-friend";
import { getUnifiedMemberData } from "@/lib/member-data";
import { getMemberLevel } from "@/lib/avatar-system";
import { formatEuro } from "@/lib/utils";

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
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {purchasedCourses.map((course) => {
                    const started = course.progress > 0;
                    return (
                      <div
                        key={course.slug}
                        className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-gold-300/30 hover:shadow-[0_24px_60px_-24px_rgba(201, 169, 97,0.35)]"
                      >
                        {/* hover wash */}
                        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-gold-300/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {/* corner ticks */}
                        <CornerTicks />

                        {/* Cover */}
                        <div className="relative h-40 overflow-hidden border-b border-white/5">
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

                          <span
                            className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1 border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${
                              course.progress === 100
                                ? "border-gold-300/40 bg-gold-300/15 text-gold-200"
                                : "border-cream/25 bg-white/10 text-cream/85"
                            }`}
                          >
                            {course.progress === 100 ? "Abgeschlossen" : course.status}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="relative z-10 flex flex-1 flex-col p-5">
                          <h3 className="font-heading text-xl leading-tight text-cream transition-colors duration-300 group-hover:text-gold-300">
                            {course.title}
                          </h3>

                          <div className="mt-auto space-y-3 pt-6">
                            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-cream/40">
                              <span>{course.progress}% abgeschlossen</span>
                              <span>
                                {course.completedLessons}/{course.totalLessons}
                              </span>
                            </div>
                            <div className="h-1 w-full overflow-hidden bg-white/[0.06]">
                              <div
                                className="h-full bg-gold-gradient transition-all duration-700"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <Button
                              href={`/bibliothek/${course.slug}`}
                              variant="secondary"
                              size="sm"
                              className="w-full rounded-none"
                            >
                              {started ? "Weiterlernen" : "Öffnen"}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {storeTeaser.map((course) => {
                    const isVideo = course.format === "video";
                    return (
                      <Link
                        key={course.slug}
                        href={`/bibliothek/${course.slug}`}
                        className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-gold-300/30 hover:shadow-[0_24px_60px_-24px_rgba(201, 169, 97,0.35)]"
                      >
                        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-gold-300/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <CornerTicks />

                        <div className="relative h-36 overflow-hidden border-b border-white/5">
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

                          {/* format badge */}
                          <div
                            className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${
                              isVideo
                                ? "border-gold-300/40 bg-gold-300/15 text-gold-200"
                                : "border-cream/25 bg-white/10 text-cream/85"
                            }`}
                          >
                            {isVideo ? (
                              <Play className="h-3 w-3 fill-current" />
                            ) : (
                              <FileText className="h-3 w-3" />
                            )}
                            {isVideo ? "Video-Kurs" : "PDF-Guide"}
                          </div>
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col p-5">
                          <h3 className="font-heading text-lg leading-tight text-cream transition-colors duration-300 group-hover:text-gold-300">
                            {course.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-cream/45">
                            {course.tagline}
                          </p>

                          <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                            <div>
                              <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-cream/30">
                                Einmalig
                              </span>
                              <span className="gold-text font-heading text-xl leading-none">
                                {formatEuro(course.priceCents)}
                              </span>
                            </div>
                            <span className="inline-flex h-9 w-9 items-center justify-center border border-white/10 transition-all duration-300 group-hover:border-gold-300/40 group-hover:bg-gold-300/[0.08]">
                              <ArrowRight className="h-3.5 w-3.5 -translate-x-0.5 text-cream/40 transition-all group-hover:translate-x-0 group-hover:text-gold-300" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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

function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute left-0 top-0 z-20 h-3 w-3 border-l border-t border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
      <span className="pointer-events-none absolute right-0 top-0 z-20 h-3 w-3 border-r border-t border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
      <span className="pointer-events-none absolute bottom-0 left-0 z-20 h-3 w-3 border-b border-l border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
      <span className="pointer-events-none absolute bottom-0 right-0 z-20 h-3 w-3 border-b border-r border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
    </>
  );
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
