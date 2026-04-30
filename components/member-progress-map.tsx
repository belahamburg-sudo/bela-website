import {
  BookOpen,
  CheckCircle2,
  Crown,
  Flag,
  Gift,
  Pickaxe,
  Sparkles,
  Star,
} from "lucide-react";
import { MemberAvatar } from "@/components/member-avatar";
import {
  FREE_COURSE_REWARD_POINTS,
  getAvatarById,
  getMemberLevel,
  getNextReward,
} from "@/lib/avatar-system";

type Props = {
  points: number;
  selectedAvatarId?: string | null;
  completedLessons: number;
  purchasedCourses: number;
  completedCourses: number;
  rewardCount: number;
  compact?: boolean;
};

type Milestone = {
  key: string;
  title: string;
  description: string;
  threshold: number;
  icon: React.ComponentType<{ className?: string }>;
};

const MILESTONES: Milestone[] = [
  {
    key: "start",
    title: "Start Camp",
    description: "Profil erstellt und erster Slot freigeschaltet.",
    threshold: 0,
    icon: Flag,
  },
  {
    key: "lesson",
    title: "Lesson Ridge",
    description: "Erste Lektionen abschließen und Momentum aufbauen.",
    threshold: 120,
    icon: CheckCircle2,
  },
  {
    key: "first-course",
    title: "Course Gate",
    description: "Der erste gekaufte Kurs macht den Pfad breiter.",
    threshold: 280,
    icon: BookOpen,
  },
  {
    key: "avatar-pack",
    title: "Avatar Forge",
    description: "Neue Charaktere und mehr Auswahl im Vault.",
    threshold: 520,
    icon: Sparkles,
  },
  {
    key: "reward",
    title: "Reward Cavern",
    description: "Rewards sammeln und Bonus-Stops freilegen.",
    threshold: 900,
    icon: Gift,
  },
  {
    key: "free-course",
    title: "Free Course Peak",
    description: "Der Free-Course-Meilenstein wartet hier oben.",
    threshold: FREE_COURSE_REWARD_POINTS,
    icon: Star,
  },
  {
    key: "goldmaster",
    title: "Goldmaster Summit",
    description: "Das höchste Plateau mit den stärksten Avataren.",
    threshold: 1700,
    icon: Crown,
  },
];

export function MemberProgressMap({
  points,
  selectedAvatarId,
  completedLessons,
  purchasedCourses,
  completedCourses,
  rewardCount,
  compact = false,
}: Props) {
  const currentAvatar = getAvatarById(selectedAvatarId);
  const memberLevel = getMemberLevel(points);
  const nextReward = getNextReward(points);
  const currentIndex = Math.max(
    0,
    MILESTONES.reduce((index, milestone, milestoneIndex) => {
      if (points >= milestone.threshold) return milestoneIndex;
      return index;
    }, 0)
  );

  return (
    <div className="rounded-[32px] border border-gold-300/14 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.14),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow mb-2">Member Journey</p>
          <h2 className="font-heading text-3xl text-cream sm:text-4xl">
            Dein Pfad durch die Goldmine.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream/40">
            Nicht einfach Stats sammeln. Du läufst einen klaren Weg ab: Lektionen, Kurse, Rewards und neue Avatare werden als Stationen entlang deiner Route freigeschaltet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/70">Level</p>
            <p className="mt-1 font-heading text-xl text-cream">
              {memberLevel.current.level} · {memberLevel.current.title}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/70">Punkte</p>
            <p className="mt-1 font-heading text-xl text-cream">{points}</p>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${compact ? "xl:grid-cols-[1.4fr_320px]" : "xl:grid-cols-[1.55fr_320px]"}`}>
        {/* Horizontal scroll container for the map */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#16110b]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,180,41,0.18),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(240,180,41,0.12),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] z-0" />
          
          <div className="relative z-10 flex w-full overflow-x-auto overflow-y-hidden pb-6 pt-6 px-4 sm:px-6 hide-scrollbar snap-x snap-mandatory">
            <div className="relative flex w-max min-w-full items-stretch gap-4 md:gap-6 lg:gap-8">
              {/* Horizontal connecting line (Desktop only) */}
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-[3px] -translate-y-1/2 bg-gradient-to-r from-gold-300/20 via-gold-300/55 to-gold-300/15 md:block" />
              
              {MILESTONES.map((milestone, index) => {
                const isComplete = points >= milestone.threshold;
                const isCurrent = index === currentIndex;
                const Icon = milestone.icon;

                return (
                  <div
                    key={milestone.key}
                    className={`relative flex-none w-[140px] md:w-[155px] snap-center flex flex-col ${index % 2 === 0 ? "md:justify-start md:pb-24" : "md:justify-end md:pt-24"}`}
                  >
                    <div
                      className={`relative rounded-[24px] border px-4 py-5 transition-all ${
                        isCurrent
                          ? "border-gold-300/45 bg-gold-300/[0.09] shadow-[0_18px_40px_rgba(240,180,41,0.16)]"
                          : isComplete
                          ? "border-gold-300/20 bg-gold-300/[0.04]"
                          : "border-white/[0.08] bg-white/[0.02]"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border ${
                            isComplete
                              ? "border-gold-300/30 bg-gold-300/15 text-gold-300"
                              : "border-white/10 bg-white/[0.03] text-white/35"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.15em] text-cream/30">
                          {milestone.threshold} XP
                        </span>
                      </div>
                      <p className="font-heading text-base lg:text-lg text-cream leading-tight mb-2">
                        {milestone.title}
                      </p>
                      <p className="text-[11px] leading-relaxed text-cream/40">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Waypoint Dot */}
                    <div className="relative z-10 mx-auto mt-4 hidden h-6 w-6 items-center justify-center rounded-full border border-gold-300/35 bg-[#120d08] md:flex">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isComplete ? "bg-gold-300 shadow-[0_0_14px_rgba(240,180,41,0.85)]" : "bg-white/20"
                        }`}
                      />
                    </div>

                    {/* Current Avatar Marker */}
                    {isCurrent && (
                      <div className="relative z-20 mx-auto mt-4 md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
                        <div className="rounded-full border-2 border-gold-300/50 bg-[#120d08] p-1 shadow-[0_0_40px_rgba(240,180,41,0.4)] transition-transform hover:scale-110 cursor-pointer">
                          <MemberAvatar avatarId={currentAvatar.id} points={points} size="md" hidePoints={true} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/70">
              Aktueller Checkpoint
            </p>
            <p className="mt-2 font-heading text-2xl text-cream">
              {MILESTONES[currentIndex]?.title}
            </p>
            <p className="mt-1 text-sm text-cream/40">
              {memberLevel.next
                ? `${memberLevel.next.minPoints - points} Punkte bis zum nächsten Level.`
                : "Du bist am Ende dieses aktuellen Pfads angekommen."}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-300 to-[#fff1b0]"
                style={{ width: `${memberLevel.progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-gold-300">
              <Gift className="h-4 w-4" />
              <p className="text-[11px] uppercase tracking-[0.14em]">Nächster Reward</p>
            </div>
            <p className="mt-2 font-heading text-xl text-cream">
              {nextReward ? nextReward.title : "Alle Rewards gesammelt"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-cream/40">
              {nextReward
                ? `${nextReward.points - points} Punkte fehlen noch bis zur nächsten Belohnung.`
                : "Aktuell gibt es auf dieser Map keine weitere Belohnung über dir."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-gold-300">
                <Pickaxe className="h-4 w-4" />
                <p className="text-[11px] uppercase tracking-[0.14em]">Lektionen</p>
              </div>
              <p className="mt-2 font-heading text-2xl text-cream">{completedLessons}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-gold-300">
                <BookOpen className="h-4 w-4" />
                <p className="text-[11px] uppercase tracking-[0.14em]">Kurse</p>
              </div>
              <p className="mt-2 font-heading text-2xl text-cream">{purchasedCourses}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-gold-300">
                <Crown className="h-4 w-4" />
                <p className="text-[11px] uppercase tracking-[0.14em]">Finished</p>
              </div>
              <p className="mt-2 font-heading text-2xl text-cream">{completedCourses}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-gold-300">
                <Gift className="h-4 w-4" />
                <p className="text-[11px] uppercase tracking-[0.14em]">Rewards</p>
              </div>
              <p className="mt-2 font-heading text-2xl text-cream">{rewardCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
