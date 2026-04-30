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
  x: number; // Percentage
  y: number; // Percentage
};

// Winding map coordinates (X, Y in percentages)
const MILESTONES: Milestone[] = [
  {
    key: "start",
    title: "Start Camp",
    description: "Profil erstellt.",
    threshold: 0,
    icon: Flag,
    x: 8,
    y: 75,
  },
  {
    key: "lesson",
    title: "Lesson Ridge",
    description: "Erste Lektionen.",
    threshold: 120,
    icon: CheckCircle2,
    x: 22,
    y: 35,
  },
  {
    key: "first-course",
    title: "Course Gate",
    description: "Der erste Kurs.",
    threshold: 280,
    icon: BookOpen,
    x: 38,
    y: 65,
  },
  {
    key: "avatar-pack",
    title: "Avatar Forge",
    description: "Neue Charaktere.",
    threshold: 520,
    icon: Sparkles,
    x: 54,
    y: 25,
  },
  {
    key: "reward",
    title: "Reward Cavern",
    description: "Erste Rewards.",
    threshold: 900,
    icon: Gift,
    x: 68,
    y: 70,
  },
  {
    key: "free-course",
    title: "Free Course Peak",
    description: "Gratis Kurs.",
    threshold: FREE_COURSE_REWARD_POINTS,
    icon: Star,
    x: 84,
    y: 30,
  },
  {
    key: "goldmaster",
    title: "Goldmaster Summit",
    description: "Der Gipfel.",
    threshold: 1700,
    icon: Crown,
    x: 95,
    y: 15,
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

  // Generate SVG Path
  const pathData = MILESTONES.map((m, i) => {
    if (i === 0) return `M ${m.x} ${m.y}`;
    const prev = MILESTONES[i - 1];
    // Smooth bezier curve
    const controlPointX = (prev.x + m.x) / 2;
    return `C ${controlPointX} ${prev.y}, ${controlPointX} ${m.y}, ${m.x} ${m.y}`;
  }).join(" ");

  return (
    <div className="rounded-[32px] border border-gold-300/14 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.14),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow mb-2">Member Journey</p>
          <h2 className="font-heading text-3xl text-cream sm:text-4xl">
            Dein Pfad durch die Goldmine.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream/40">
            Folge dem Pfad, sammle XP und schalte an jedem Meilenstein neue Rewards, Avatare oder Kurse frei.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/70">Level</p>
            <p className="mt-1 font-heading text-xl text-cream">
              {memberLevel.current.level} · {memberLevel.current.title}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/70">XP</p>
            <p className="mt-1 font-heading text-xl text-gold-300">{points}</p>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${compact ? "xl:grid-cols-[1.4fr_320px]" : "xl:grid-cols-[1.55fr_320px]"}`}>
        
        {/* THE GAME MAP */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#120d08] shadow-[inset_0_4px_40px_rgba(0,0,0,0.8)]">
          {/* Map Textures & Glows */}
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[url('/assets/mine-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(240,180,41,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(240,180,41,0.1),transparent_50%)]" />
          
          <div className="relative z-10 w-full overflow-x-auto overflow-y-hidden hide-scrollbar">
            <div className="relative h-[450px] w-[1000px] md:w-full min-w-[800px]">
              
              {/* SVG Map Path */}
              <svg 
                className="absolute inset-0 h-full w-full pointer-events-none drop-shadow-[0_0_10px_rgba(240,180,41,0.3)]"
                preserveAspectRatio="none"
              >
                {/* Background dashed line (uncompleted path) */}
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="4" 
                  strokeDasharray="8 8"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Foreground glowing line (completed path) */}
                <path 
                  d={MILESTONES.slice(0, currentIndex + 1).map((m, i) => {
                    if (i === 0) return `M ${m.x}% ${m.y}%`;
                    const prev = MILESTONES[i - 1];
                    const controlPointX = (prev.x + m.x) / 2;
                    return `C ${controlPointX}% ${prev.y}%, ${controlPointX}% ${m.y}%, ${m.x}% ${m.y}%`;
                  }).join(" ")}
                  fill="none" 
                  stroke="#F0B429" 
                  strokeWidth="4" 
                  vectorEffect="non-scaling-stroke"
                  className="filter drop-shadow-[0_0_8px_rgba(240,180,41,0.8)]"
                />
              </svg>

              {/* Map Nodes / Waypoints */}
              {MILESTONES.map((milestone, index) => {
                const isComplete = points >= milestone.threshold;
                const isCurrent = index === currentIndex;
                const Icon = milestone.icon;

                return (
                  <div
                    key={milestone.key}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${milestone.x}%`, top: `${milestone.y}%` }}
                  >
                    {/* Tooltip on hover/focus */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 z-30">
                      <div className="w-[180px] rounded-xl border border-white/10 bg-obsidian/95 backdrop-blur-md p-3 text-center shadow-xl">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-gold-300 mb-1">{milestone.threshold} XP</p>
                        <p className="font-heading text-sm text-cream leading-tight">{milestone.title}</p>
                        <p className="mt-1 text-[10px] text-cream/40 leading-relaxed">{milestone.description}</p>
                      </div>
                      <div className="mx-auto h-2 w-2 rotate-45 border-b border-r border-white/10 bg-obsidian/95 -mt-[5px]" />
                    </div>

                    {/* The Node */}
                    <div 
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all cursor-crosshair ${
                        isCurrent 
                          ? "border-gold-300 bg-gold-300/20 shadow-[0_0_30px_rgba(240,180,41,0.5)] z-20 scale-110" 
                          : isComplete
                          ? "border-gold-300/50 bg-gold-300/10 shadow-[0_0_15px_rgba(240,180,41,0.2)] z-10"
                          : "border-white/10 bg-obsidian text-white/30 z-0 hover:border-white/30"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isComplete ? "text-gold-300" : "text-white/20"}`} />
                      
                      {/* Pulse ring for current node */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full border border-gold-300 animate-ping opacity-20" />
                      )}
                    </div>

                    {/* User Avatar positioned at current node */}
                    {isCurrent && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                        <div className="relative">
                          <MemberAvatar avatarId={currentAvatar.id} points={0} size="sm" hidePoints={true} />
                          {/* Map Pin Tail */}
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-transparent border-t-gold-300/50" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300/70">
              Aktueller Checkpoint
            </p>
            <p className="mt-2 font-heading text-2xl text-cream">
              {MILESTONES[currentIndex]?.title}
            </p>
            <p className="mt-1 text-sm text-cream/40">
              {memberLevel.next
                ? `${memberLevel.next.minPoints - points} XP bis zum nächsten Level.`
                : "Du hast den Gipfel erreicht."}
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.06] border border-white/[0.02]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-300 to-[#fff1b0] shadow-[0_0_10px_rgba(240,180,41,0.5)]"
                style={{ width: `${memberLevel.progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2 text-gold-300">
              <Gift className="h-4 w-4" />
              <p className="text-[11px] uppercase tracking-[0.14em]">Nächster Reward</p>
            </div>
            <p className="mt-2 font-heading text-xl text-cream">
              {nextReward ? nextReward.title : "Alle Rewards gesammelt"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-cream/40">
              {nextReward
                ? `${nextReward.points - points} XP fehlen noch.`
                : "Aktuell gibt es auf dieser Map keine weitere Belohnung."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <Pickaxe className="h-5 w-5 text-gold-300 mx-auto mb-2 opacity-80" />
              <p className="font-heading text-3xl text-cream leading-none">{completedLessons}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-cream/30 mt-1">Lektionen</p>
            </div>
            <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <BookOpen className="h-5 w-5 text-gold-300 mx-auto mb-2 opacity-80" />
              <p className="font-heading text-3xl text-cream leading-none">{purchasedCourses}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-cream/30 mt-1">Kurse</p>
            </div>
            <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <Crown className="h-5 w-5 text-gold-300 mx-auto mb-2 opacity-80" />
              <p className="font-heading text-3xl text-cream leading-none">{completedCourses}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-cream/30 mt-1">Finished</p>
            </div>
            <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <Gift className="h-5 w-5 text-gold-300 mx-auto mb-2 opacity-80" />
              <p className="font-heading text-3xl text-cream leading-none">{rewardCount}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-cream/30 mt-1">Rewards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
