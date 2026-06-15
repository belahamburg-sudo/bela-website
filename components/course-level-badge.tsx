import { Sprout, TrendingUp, Layers, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/content";

type Level = Course["level"];

const LEVEL_STYLES: Record<
  Level,
  { ring: string; bg: string; text: string; dot: string; icon: typeof Sprout }
> = {
  Start: {
    ring: "border-emerald-300/30",
    bg: "bg-emerald-300/[0.07]",
    text: "text-emerald-100",
    dot: "bg-emerald-300",
    icon: Sprout,
  },
  Aufbau: {
    ring: "border-sky-300/30",
    bg: "bg-sky-300/[0.07]",
    text: "text-sky-100",
    dot: "bg-sky-300",
    icon: TrendingUp,
  },
  System: {
    ring: "border-gold-300/35",
    bg: "bg-gold-300/[0.09]",
    text: "text-gold-100",
    dot: "bg-gold-300",
    icon: Layers,
  },
  Bundle: {
    ring: "border-fuchsia-300/30",
    bg: "bg-fuchsia-300/[0.07]",
    text: "text-fuchsia-100",
    dot: "bg-fuchsia-300",
    icon: Package,
  },
};

/**
 * Polished, on-brand level pill for course cards/detail pages. Each level gets a
 * subtle, distinct accent while staying within the dark/gold visual language.
 */
export function CourseLevelBadge({
  level,
  className,
  withIcon = true,
}: {
  level: Level;
  className?: string;
  withIcon?: boolean;
}) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.Start;
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-[0_2px_12px_-6px_rgba(0,0,0,0.6)]",
        style.ring,
        style.bg,
        style.text,
        className
      )}
    >
      {withIcon ? (
        <Icon aria-hidden className="h-3.5 w-3.5 opacity-80" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      )}
      {level}
    </span>
  );
}
