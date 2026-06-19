"use client";

import { motion, type Variants } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Flag,
  Gift,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";
import { FREE_COURSE_REWARD_POINTS } from "@/lib/avatar-system";

type Milestone = {
  key: string;
  title: string;
  description: string;
  threshold: number;
  icon: React.ComponentType<{ className?: string }>;
};

const MILESTONES: Milestone[] = [
  { key: "start", title: "Start Camp", description: "Profil erstellt.", threshold: 0, icon: Flag },
  { key: "lesson", title: "Lesson Ridge", description: "Erste Lektionen.", threshold: 120, icon: CheckCircle2 },
  { key: "first-course", title: "Course Gate", description: "Der erste Kurs.", threshold: 280, icon: BookOpen },
  { key: "avatar-pack", title: "Avatar Forge", description: "Neue Charaktere.", threshold: 520, icon: Sparkles },
  { key: "reward", title: "Reward Cavern", description: "Erste Rewards.", threshold: 900, icon: Gift },
  { key: "free-course", title: "Free Course Peak", description: "Gratis Kurs.", threshold: FREE_COURSE_REWARD_POINTS, icon: Star },
  { key: "goldmaster", title: "Goldmaster Summit", description: "Der Gipfel.", threshold: 1700, icon: Crown },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const node: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

type Props = {
  points: number;
};

export function ProgressTrack({ points }: Props) {
  const maxThreshold = MILESTONES[MILESTONES.length - 1].threshold;

  // Index of the highest reached milestone (current node).
  const currentIndex = MILESTONES.reduce(
    (acc, m, i) => (points >= m.threshold ? i : acc),
    0
  );

  // Fill ratio of the rail proportional to XP across the whole range (0-100).
  const fillPercent = Math.max(
    0,
    Math.min(100, Math.round((points / maxThreshold) * 100))
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="tac-panel tac-corners relative overflow-hidden p-6 sm:p-8"
    >
      {/* ambient corner glows */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gold-300/[0.06] blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-gold-300/[0.05] blur-[90px]" />

      {/* header strip */}
      <div className="relative z-10 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-gold-300/30" />
          <span className="tac-label tracking-widest text-gold-300/60">
            Progress // Roadmap
          </span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/30">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 bg-gold-gradient shadow-[0_0_8px_rgba(201, 169, 97,0.6)]" />
            {currentIndex + 1}/{MILESTONES.length} erreicht
          </span>
          <span className="text-gold-300/70">{fillPercent}%</span>
        </div>
      </div>

      {/* ─── Vertical track: top-to-bottom, the "runter zum Gold" descent ─── */}
      <div className="relative z-10 mx-auto max-w-xl">
        {/* base rail */}
        <div className="absolute bottom-0 left-7 top-0 w-[3px] -translate-x-1/2 bg-white/[0.06]" />
        {/* filled rail */}
        <motion.div
          className="absolute left-7 top-0 w-[3px] -translate-x-1/2 bg-gradient-to-b from-gold-600 via-gold-200 to-gold-50 shadow-[0_0_14px_rgba(201, 169, 97,0.5)]"
          initial={{ height: 0 }}
          whileInView={{ height: `${fillPercent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        />

        <div className="flex flex-col gap-7">
          {MILESTONES.map((m, i) => {
            const reached = points >= m.threshold;
            const isCurrent = i === currentIndex;
            return (
              <motion.div key={m.key} variants={node} className="flex items-center gap-4">
                <MilestoneNode milestone={m} reached={reached} isCurrent={isCurrent} />
                <div className="flex flex-col">
                  <MilestoneLabel milestone={m} reached={reached} isCurrent={isCurrent} align="left" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function MilestoneNode({
  milestone,
  reached,
  isCurrent,
}: {
  milestone: Milestone;
  reached: boolean;
  isCurrent: boolean;
}) {
  const Icon = milestone.icon;
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      {/* pulse ring on current node */}
      {isCurrent && (
        <motion.span
          className="absolute inset-0 rounded-full border border-gold-300/60"
          animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div
        className={`relative flex h-12 w-12 items-center justify-center border transition-colors duration-500 ${
          reached
            ? "border-gold-300/60 bg-gold-gradient text-obsidian shadow-[0_0_22px_rgba(201, 169, 97,0.45)]"
            : "border-white/10 bg-obsidian/80 text-white/25"
        }`}
      >
        {reached ? (
          <Icon className="h-5 w-5" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </div>
    </div>
  );
}

function MilestoneLabel({
  milestone,
  reached,
  isCurrent,
  align = "center",
}: {
  milestone: Milestone;
  reached: boolean;
  isCurrent: boolean;
  align?: "center" | "left";
}) {
  return (
    <div className={`mt-3 ${align === "left" ? "text-left" : "px-1 text-center"}`}>
      <p
        className={`font-heading text-sm leading-tight uppercase tracking-tight transition-colors ${
          reached ? "text-cream" : "text-white/30"
        }`}
      >
        {milestone.title}
      </p>
      <p
        className={`mt-1 font-mono text-[9px] uppercase tracking-[0.16em] ${
          isCurrent ? "text-gold-300" : reached ? "text-gold-300/50" : "text-white/20"
        }`}
      >
        {milestone.threshold} XP
      </p>
      {isCurrent && (
        <span className="mt-1.5 inline-block border border-gold-300/30 bg-gold-300/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-gold-300">
          Hier
        </span>
      )}
    </div>
  );
}
