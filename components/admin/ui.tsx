import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page header: eyebrow label + title + optional description and right-side actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <span className="tac-label">{eyebrow}</span>}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-cream sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-cream/40">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A surface panel with a subtle border and optional title/header row. */
export function Panel({
  title,
  description,
  actions,
  className,
  children,
  noPadding,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/10 bg-panel/40 backdrop-blur-sm",
        className
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-bold uppercase tracking-wider text-cream/80">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-xs text-cream/40">{description}</p>}
          </div>
          {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </section>
  );
}

/** KPI tile for the cockpit. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  href,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  href?: string;
}) {
  const inner = (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-panel/40 p-5 transition-colors hover:border-gold-300/30">
      <div className="flex items-start justify-between">
        <span className="tac-label">{label}</span>
        {Icon && (
          <Icon className="h-4 w-4 text-gold-300/40 transition-colors group-hover:text-gold-300/70" />
        )}
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight text-cream">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "text-xs font-bold",
              trend.positive === false ? "text-red-400" : "text-emerald-400"
            )}
          >
            {trend.value}
          </span>
        )}
        {hint && <span className="text-xs text-cream/30">{hint}</span>}
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-300/[0.03] blur-2xl transition-opacity group-hover:bg-gold-300/[0.06]" />
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

type BadgeTone = "gold" | "green" | "red" | "blue" | "neutral" | "amber";

const BADGE_TONES: Record<BadgeTone, string> = {
  gold: "bg-gold-300/10 text-gold-200 border-gold-300/20",
  green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  red: "bg-red-500/10 text-red-300 border-red-500/20",
  blue: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  neutral: "bg-white/5 text-cream/50 border-white/10",
};

export function AdminBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Empty-state placeholder for tables / lists with no rows. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-cream/30">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="text-sm font-bold text-cream/70">{title}</p>
        {description && <p className="mt-1 text-xs text-cream/40">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** A small labelled value used in detail panels. */
export function KeyValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="tac-label">{label}</span>
      <span className="text-sm text-cream/80">{children}</span>
    </div>
  );
}
