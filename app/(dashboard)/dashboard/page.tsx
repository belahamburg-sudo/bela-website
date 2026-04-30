import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Gift, Lock, Pickaxe, TrendingUp } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { MemberProgressMap } from "@/components/member-progress-map";
import { getMemberLevel, getNextReward } from "@/lib/avatar-system";
import { getCourse, courses as allStaticCourses } from "@/lib/content";
import type { Course } from "@/lib/content";
import { hasSupabasePublicEnv } from "@/lib/env";
import { syncMemberState } from "@/lib/member-state";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatEuro } from "@/lib/utils";

type CourseWithProgress = Course & {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  status: "Neu" | "In Bearbeitung" | "Abgeschlossen";
};

async function fetchDashboardData(): Promise<{
  user: { name: string | null; email: string; avatarId: string | null } | null;
  purchasedCourses: CourseWithProgress[];
  availableCourses: Course[];
  totalLessonsCompleted: number;
  completedCourses: number;
  points: number;
  rewardCount: number;
  redirectToOnboarding: boolean;
}> {
  const empty = {
    user: null,
    purchasedCourses: [],
    availableCourses: allStaticCourses,
    totalLessonsCompleted: 0,
    completedCourses: 0,
    points: 0,
    rewardCount: 0,
    redirectToOnboarding: false,
  };

  if (!hasSupabasePublicEnv()) return empty;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return empty;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const [profileResult, purchasesResult, progressResult, coursesResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, onboarding_complete")
        .eq("id", user.id)
        .single(),
      supabase
        .from("purchases")
        .select("course_slug")
        .eq("user_id", user.id)
        .eq("status", "paid"),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id),
      supabase
        .from("courses")
        .select("slug")
        .eq("is_active", true),
    ]);

  if (!profileResult.data?.onboarding_complete) {
    return { ...empty, redirectToOnboarding: true };
  }

  const purchasedSlugs = new Set(
    (purchasesResult.data ?? []).map((p: { course_slug: string }) => p.course_slug)
  );
  const completedLessonIds = new Set(
    (progressResult.data ?? []).map((p: { lesson_id: string }) => p.lesson_id)
  );
  const allActiveDbSlugs = (coursesResult.data ?? []).map(
    (c: { slug: string }) => c.slug
  );

  const purchasedCourses: CourseWithProgress[] = Array.from(purchasedSlugs)
    .map((slug) => getCourse(slug))
    .filter((c): c is Course => c !== undefined)
    .map((course) => {
      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const completed = lessonIds.filter((id) => completedLessonIds.has(id)).length;
      const progress =
        lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
      const status: CourseWithProgress["status"] =
        progress === 100 ? "Abgeschlossen" : progress > 0 ? "In Bearbeitung" : "Neu";
      return { ...course, progress, completedLessons: completed, totalLessons: lessonIds.length, status };
    });

  const completedCourses = purchasedCourses.filter((course) => course.status === "Abgeschlossen").length;

  const availableCourses = allActiveDbSlugs
    .filter((slug: string) => !purchasedSlugs.has(slug))
    .map((slug: string) => getCourse(slug))
    .filter((c): c is Course => c !== undefined);

  const memberState = await syncMemberState({
    supabase,
    userId: user.id,
    onboardingComplete: Boolean(profileResult.data?.onboarding_complete),
    purchasedCourses: purchasedSlugs.size,
    completedLessons: completedLessonIds.size,
    completedCourses,
    fallbackAvatarId:
      typeof user.user_metadata?.avatar_id === "string" ? user.user_metadata.avatar_id : null,
  });

  return {
    user: {
      name: profileResult.data?.full_name ?? null,
      email: user.email ?? "",
      avatarId: memberState.selectedAvatarId,
    },
    purchasedCourses,
    availableCourses,
    totalLessonsCompleted: completedLessonIds.size,
    completedCourses,
    points: memberState.points,
    rewardCount: memberState.rewardCount,
    redirectToOnboarding: false,
  };
}

function ProgressRing({ progress, size = 56 }: { progress: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(240,180,41,0.12)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="#F0B429" strokeWidth={4}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

export default async function DashboardPage() {
  const { user, purchasedCourses, availableCourses, totalLessonsCompleted, completedCourses, points, rewardCount, redirectToOnboarding } =
    await fetchDashboardData();

  if (redirectToOnboarding) redirect("/dashboard/onboarding");

  const avgProgress =
    purchasedCourses.length > 0
      ? Math.round(
          purchasedCourses.reduce((sum, c) => sum + c.progress, 0) / purchasedCourses.length
        )
      : 0;

  const inProgressCourses = purchasedCourses.filter((c) => c.status === "In Bearbeitung");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Gold Miner";
  const memberLevel = getMemberLevel(points);
  const nextReward = getNextReward(points);

  return (
    <AuthGate>
      <section className="py-12 sm:py-16 bg-obsidian min-h-screen">
        <div className="mx-auto max-w-7xl px-6">

          {/* Header */}
          <div className="mb-8">
            <div>
              <p className="eyebrow mb-3">Willkommen zurück</p>
              <h1
                className="font-heading tracking-gta leading-none text-cream"
                style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
              >
                HEY, {displayName.toUpperCase()}.{" "}
                <span className="gold-text">WEITER GRABEN.</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-cream/40">
                Deine Lernzentrale — alle Kurse, dein Fortschritt, alles auf einen Blick.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <MemberProgressMap
              points={points}
              selectedAvatarId={user?.avatarId}
              completedLessons={totalLessonsCompleted}
              purchasedCourses={purchasedCourses.length}
              completedCourses={completedCourses}
              rewardCount={rewardCount}
              compact
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: BookOpen,
                value: purchasedCourses.length,
                label: "Kurse",
                sub: "freigeschaltet",
              },
              {
                icon: CheckCircle2,
                value: totalLessonsCompleted,
                label: "Lektionen",
                sub: "abgeschlossen",
              },
              {
                icon: TrendingUp,
                value: `${avgProgress}%`,
                label: "Fortschritt",
                sub: "Ø über alle Kurse",
              },
              {
                icon: Pickaxe,
                value: completedCourses,
                label: "Kurse",
                sub: "fertig gestellt",
              },
            ].map((stat) => (
              <div
                key={stat.label + stat.sub}
                className="panel-surface rounded-sm border border-gold-300/10 px-5 py-5 flex items-center gap-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-gold-300/20 bg-gold-300/[0.06]">
                  <stat.icon className="h-4.5 w-4.5 text-gold-300" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <p className="font-heading tracking-gta text-2xl text-cream leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-cream/35 mt-0.5 leading-tight">
                    {stat.label} <span className="block">{stat.sub}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main column — courses */}
            <div className="lg:col-span-2 space-y-8">

              {/* Continue learning */}
              {inProgressCourses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <p className="eyebrow flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Weitermachen
                    </p>
                  </div>
                  <div className="space-y-3">
                    {inProgressCourses.map((course) => (
                      <Link
                        key={course.slug}
                        href={`/dashboard/kurse/${course.slug}`}
                        className="panel-surface rounded-sm border border-gold-300/10 p-5 flex items-center gap-5 hover:border-gold-300/25 transition-colors group"
                      >
                        <ProgressRing progress={course.progress} size={52} />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading tracking-gta text-base text-cream truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-cream/35 mt-0.5">
                            {course.completedLessons} / {course.totalLessons} Lektionen ·{" "}
                            {course.progress}% abgeschlossen
                          </p>
                          <div className="mt-2 h-[2px] w-full bg-cream/[0.06] rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gold-500 to-gold-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gold-300/40 group-hover:text-gold-300 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* All purchased courses */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="eyebrow">Deine Kurse</p>
                  <Link
                    href="/dashboard/kurse"
                    className="text-xs text-gold-300/60 hover:text-gold-300 transition-colors font-bold uppercase tracking-[0.1em]"
                  >
                    Alle ansehen →
                  </Link>
                </div>

                {purchasedCourses.length === 0 ? (
                  <div className="rounded-sm border border-gold-300/10 bg-cream/[0.02] p-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-gold-300/20 bg-gold-300/[0.06] mx-auto mb-5">
                      <Lock className="h-6 w-6 text-gold-300/40" />
                    </div>
                    <p className="font-heading tracking-gta text-lg text-cream mb-2">
                      Noch keine Kurse
                    </p>
                    <p className="text-cream/35 text-sm mb-6">
                      Starte mit dem AI Goldmining Starter — dem schnellsten Weg zum ersten digitalen Produkt.
                    </p>
                    <Button href="/dashboard/kurse">Kurse entdecken</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchasedCourses.map((course) => (
                      <Link
                        key={course.slug}
                        href={`/dashboard/kurse/${course.slug}`}
                        className="panel-surface rounded-sm border border-gold-300/10 p-5 flex items-center gap-4 hover:border-gold-300/25 transition-colors group"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-gold-300/20 bg-gold-300/[0.06] text-xs font-heading tracking-gta text-gold-300">
                          {course.progress === 100 ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span>{course.progress}%</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading tracking-gta text-base text-cream truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-cream/35 mt-0.5">{course.tagline}</p>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-sm border flex-shrink-0 ${
                            course.status === "Abgeschlossen"
                              ? "border-gold-300/30 text-gold-300 bg-gold-300/[0.08]"
                              : course.status === "In Bearbeitung"
                              ? "border-cream/20 text-cream/50 bg-cream/[0.04]"
                              : "border-cream/10 text-cream/25 bg-cream/[0.02]"
                          }`}
                        >
                          {course.status}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gold-300/40 group-hover:text-gold-300 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — available courses + quick links */}
            <div className="space-y-6">

              {/* Quick actions */}
              <div className="panel-surface rounded-sm border border-gold-300/10 p-5">
                <p className="eyebrow mb-4">Avatar & Rewards</p>
                <div className="rounded-2xl border border-gold-300/16 bg-gold-300/[0.05] p-4">
                  <div className="flex items-center gap-2 text-gold-300">
                    <Gift className="h-4 w-4" />
                    <p className="text-[11px] uppercase tracking-[0.14em]">Nächster Reward</p>
                  </div>
                  <p className="mt-2 font-heading text-lg text-cream">
                    {nextReward ? nextReward.title : "Alles freigeschaltet"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/40">
                    {nextReward
                      ? `${nextReward.points - points} Punkte bis ${nextReward.title}.`
                      : "Du hast aktuell alle Reward-Stufen dieser Version erreicht."}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-gold-300/65">
                    {rewardCount} Rewards gespeichert
                  </p>
                  <Link
                    href="/dashboard/profil"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-gold-300/75 hover:text-gold-300"
                  >
                    Avatar ändern <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="panel-surface rounded-sm border border-gold-300/10 p-5">
                <p className="eyebrow mb-4">Schnellzugriff</p>
                <div className="space-y-2">
                  {[
                    { href: "/dashboard/kurse", label: "Kursbibliothek", icon: BookOpen },
                    { href: "/dashboard/profil", label: "Mein Profil", icon: CheckCircle2 },
                    { href: "/kurse", label: "Alle Kurse", icon: ArrowRight },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-cream/50 hover:bg-cream/[0.04] hover:text-cream/80 transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-gold-300/40 flex-shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Available courses to buy */}
              {availableCourses.length > 0 && (
                <div className="panel-surface rounded-sm border border-gold-300/10 p-5">
                  <p className="eyebrow mb-4">Noch freizuschalten</p>
                  <div className="space-y-3">
                    {availableCourses.slice(0, 3).map((course) => (
                      <div
                        key={course.slug}
                        className="flex items-start gap-3 border-b border-gold-300/[0.07] pb-3 last:border-0 last:pb-0"
                      >
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-white/[0.07] bg-white/[0.02]">
                          <Lock className="h-3 w-3 text-white/25" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-cream/60 truncate">{course.title}</p>
                          <p className="text-xs text-cream/25 mt-0.5">{formatEuro(course.priceCents)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/kurse"
                    className="mt-4 flex items-center justify-center gap-2 rounded-sm border border-gold-300/20 bg-gold-300/[0.05] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-gold-300 hover:bg-gold-300/[0.10] transition-colors"
                  >
                    Alle Kurse ansehen <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Motivation block */}
              <div className="rounded-sm border border-gold-300/15 bg-gradient-to-br from-gold-300/[0.05] to-transparent p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-gold-300/25 bg-gold-300/10 mb-4">
                  <Pickaxe className="h-4 w-4 text-gold-300" />
                </div>
                <p className="font-heading tracking-gta text-base text-cream mb-2">
                  GOLDMINING METHODE
                </p>
                <p className="text-xs text-cream/40 leading-relaxed">
                  Konsistenz schlägt Intensität. 30 Minuten täglich über 90 Tage bringen dich weiter als ein Marathon-Wochenende.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </AuthGate>
  );
}
