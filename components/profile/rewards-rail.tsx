"use client";

import { motion, type Variants } from "framer-motion";
import { Check, Gift, Lock } from "lucide-react";
import { MEMBER_REWARDS } from "@/lib/avatar-system";

type Props = {
  points: number;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function RewardsRail({ points }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      {MEMBER_REWARDS.map((reward) => {
        const unlocked = points >= reward.points;
        const eta = reward.points - points;

        return (
          <motion.div
            key={reward.key}
            variants={card}
            className={`group relative flex h-full flex-col overflow-hidden border p-5 transition-all duration-500 ${
              unlocked
                ? "border-gold-300/30 bg-gradient-to-b from-gold-300/[0.05] to-transparent shadow-[0_18px_50px_-30px_rgba(232,192,64,0.5)]"
                : "border-white/8 bg-ink/30"
            }`}
          >
            {/* corner ticks (gold when unlocked) */}
            <span
              className={`pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t transition-colors ${
                unlocked ? "border-gold-300/60" : "border-white/10"
              }`}
            />
            <span
              className={`pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r transition-colors ${
                unlocked ? "border-gold-300/60" : "border-white/10"
              }`}
            />

            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center border ${
                  unlocked
                    ? "border-gold-300/40 bg-gold-gradient text-obsidian"
                    : "border-white/10 bg-obsidian/60 text-white/30"
                }`}
              >
                {unlocked ? <Gift className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/30">
                {reward.points} XP
              </span>
            </div>

            <h4
              className={`font-heading text-lg leading-tight tracking-tight transition-colors ${
                unlocked ? "text-cream" : "text-white/45"
              }`}
            >
              {reward.title}
            </h4>
            <p className="mt-2 flex-1 text-[12px] leading-relaxed text-cream/40">
              {reward.description}
            </p>

            <div className="mt-4 border-t border-white/5 pt-3">
              {unlocked ? (
                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300">
                  <Check className="h-3.5 w-3.5" />
                  Freigeschaltet
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/35">
                  ETA: <span className="text-cream/60">{eta} XP</span>
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
