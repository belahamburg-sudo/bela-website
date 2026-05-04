"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Flag,
  Gift,
  Pickaxe,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  FREE_COURSE_REWARD_POINTS,
  getMemberLevel,
  getNextReward,
} from "@/lib/avatar-system";

const GameRoadmap = dynamic(
  () => import("@/components/game-roadmap").then((m) => ({ default: m.GameRoadmap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#050403] text-gold-300 font-mono text-[10px] uppercase tracking-[0.2em]">
        3D-Roadmap wird geladen...
      </div>
    ),
  }
);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="tac-panel tac-corners p-6 sm:p-8 rounded-none border-gold-300/20"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-300/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-300/5 blur-[100px] pointer-events-none" />

      <div className="relative z-20 mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="tac-label text-gold-300/60 uppercase tracking-widest text-[9px]">Mission: Deine Strategie</span>
            </div>
            <h2 className="font-heading tracking-gta leading-tight text-cream text-4xl md:text-5xl uppercase mb-4">
              DEINE <span className="text-gold-300">ROADMAP.</span>
            </h2>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span>Fortschritt wird synchronisiert</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                <span>Ziel: {MILESTONES[currentIndex + 1]?.title.toUpperCase() || "FINALE"}</span>
              </div>
            </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="tac-panel tac-corners px-4 py-2 bg-obsidian/40 border-gold-300/10">
            <p className="tac-label mb-1 opacity-60 uppercase tracking-widest text-[8px]">Mitglieds-Rang</p>
            <p className="font-heading text-2xl text-cream leading-none">
              {memberLevel.current.level} <span className="text-gold-300">/ 07</span>
            </p>
          </div>
          <div className="tac-panel tac-corners px-4 py-2 bg-obsidian/40 border-gold-300/10 min-w-[100px]">
            <p className="tac-label mb-1 opacity-60 uppercase tracking-widest text-[8px]">Gesammelte XP</p>
            <p className="font-heading text-2xl text-gold-300 leading-none">{points}</p>
          </div>
        </div>
      </div>

      <div className={`grid gap-8 ${compact ? "xl:grid-cols-[1fr_340px]" : "xl:grid-cols-[1.2fr_340px]"}`}>
        
        {/* THE GAME MAP */}
        <div className="relative isolate h-[340px] sm:h-[440px] xl:h-[560px] border border-gold-300/10 bg-black/20 overflow-hidden">
          <GameRoadmap currentPoints={points} avatarId={selectedAvatarId ?? "miner-01"} />
        </div>

        {/* Sidebar Status Panels */}
        <div className="flex flex-col gap-4 h-full">
          {/* Main Status */}
          <div className="tac-panel tac-corners p-5 bg-gradient-to-br from-gold-300/[0.03] to-transparent border-gold-300/20 flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="tac-label uppercase tracking-widest text-[9px] text-gold-300/60">Aktueller Status</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
            
            <p className="font-heading text-2xl text-cream tracking-tight">
              {MILESTONES[currentIndex]?.title}
            </p>
            <p className="mt-1 text-xs text-cream/40 leading-relaxed font-mono uppercase tracking-wider">
              {memberLevel.next
                ? `Noch ${memberLevel.next.minPoints - points} XP bis zum nächsten Level.`
                : "Du hast den Gipfel erreicht."}
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-end mb-1">
                <span className="tac-label uppercase tracking-widest text-[9px]">Gesamtfortschritt</span>
                <span className="font-mono text-[10px] text-gold-300">{memberLevel.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 border border-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${memberLevel.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gold-300 shadow-[0_0_10px_rgba(200,146,42,0.5)]"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-start gap-3">
                <Gift className="h-4 w-4 text-gold-300 mt-1" />
                <div>
                  <p className="tac-label opacity-60 uppercase tracking-widest text-[9px]">Nächste Belohnung</p>
                  <p className="font-heading text-lg text-cream mt-0.5">
                    {nextReward ? nextReward.title : "CLEARED"}
                  </p>
                  <p className="text-[10px] font-mono text-cream/30 mt-1">
                    ETA: {nextReward ? `${nextReward.points - points} XP` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Lessons", value: completedLessons, icon: Pickaxe },
              { label: "Courses", value: purchasedCourses, icon: BookOpen },
              { label: "Finished", value: completedCourses, icon: Crown },
              { label: "Rewards", value: rewardCount, icon: Gift },
            ].map((metric) => (
              <div key={metric.label} className="tac-panel tac-corners p-3 bg-obsidian/40 border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="h-3 w-3 text-gold-300/40" />
                  <span className="tac-label opacity-30">{metric.label.substring(0,3)}</span>
                </div>
                <p className="font-heading text-2xl text-cream leading-none">{metric.value}</p>
                <p className="tac-label mt-1 opacity-40 uppercase tracking-widest text-[8px]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
