"use client";

import { motion } from "framer-motion";
import { MemberAvatar } from "@/components/member-avatar";

type Props = {
  avatarId: string;
  points: number;
  /** 0-100 percentage to next level */
  progress: number;
  level: number;
};

/**
 * Circular XP progress ring wrapping the member avatar.
 * Pure SVG + framer-motion — replaces the old spinning border rings.
 */
export function XpRing({ avatarId, points, progress, level }: Props) {
  // SVG geometry
  const size = 184;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {/* ambient glow behind the ring */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gold-300/10 blur-2xl" />

      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="xp-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6A5530" />
            <stop offset="35%" stopColor="#C9A961" />
            <stop offset="65%" stopColor="#FFF4C9" />
            <stop offset="100%" stopColor="#8A7340" />
          </linearGradient>
        </defs>

        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(201, 169, 97,0.08)"
          strokeWidth={stroke}
        />

        {/* animated progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#xp-ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          style={{ filter: "drop-shadow(0 0 6px rgba(201, 169, 97,0.5))" }}
        />
      </svg>

      {/* Avatar centered inside the ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative rounded-full bg-obsidian/60 p-1.5 ring-1 ring-gold-300/20 backdrop-blur-md">
          <MemberAvatar avatarId={avatarId} points={points} size="lg" hidePoints />
        </div>
      </div>

      {/* Level chip pinned to the ring */}
      <div className="absolute -bottom-1 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-1.5 border border-obsidian/80 bg-gold-gradient px-3 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.5)]">
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-obsidian/70">
            LVL
          </span>
          <span className="font-heading text-sm leading-none text-obsidian">
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}
