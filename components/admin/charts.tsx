import { cn } from "@/lib/utils";

/** Shared categorical palette (gold-led, with cool accents). */
export const CHART_COLORS = [
  "#C9A961", // gold
  "#E5C97E", // gold light
  "#34D399", // emerald
  "#38BDF8", // sky
  "#A78BFA", // violet
  "#FB7185", // rose
  "#FBBF24", // amber
  "#5EEAD4", // teal
];

export type Segment = { label: string; value: number; color?: string };

/* ───────────────────────────── Donut / Pie ───────────────────────────── */

/**
 * Donut chart (pure SVG, server-rendered) with a centred total and a legend.
 * Uses the stroke-dasharray-on-a-circle technique so no JS/path math is needed.
 */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
  formatValue = (v) => String(v),
  className,
}: {
  data: Segment[];
  centerValue: string;
  centerLabel?: string;
  formatValue?: (v: number) => string;
  className?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const segments = data
    .map((d, i) => ({ ...d, color: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }))
    .filter((d) => d.value > 0);

  // r chosen so the circumference ≈ 100 → dasharray values are percentages.
  const R = 15.915;
  let cumulative = 0;

  return (
    <div className={cn("flex flex-col items-center gap-5 sm:flex-row sm:items-center", className)}>
      <div className="relative h-[150px] w-[150px] flex-shrink-0">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
          <circle
            cx="21"
            cy="21"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4.5"
          />
          {total > 0 &&
            segments.map((seg) => {
              const pct = (seg.value / total) * 100;
              const el = (
                <circle
                  key={seg.label}
                  cx="21"
                  cy="21"
                  r={R}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="4.5"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={-cumulative}
                  strokeLinecap="butt"
                />
              );
              cumulative += pct;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold tracking-tight text-cream">{centerValue}</span>
          {centerLabel && (
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-cream/35">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2 self-stretch">
        {segments.length === 0 ? (
          <li className="text-sm text-cream/35">Noch keine Daten.</li>
        ) : (
          segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <li key={seg.label} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-cream/70">{seg.label}</span>
                <span className="flex-shrink-0 text-sm font-bold text-cream/90">
                  {formatValue(seg.value)}
                </span>
                <span className="w-9 flex-shrink-0 text-right text-[11px] text-cream/35">{pct}%</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

/* ───────────────────────────── Area trend ───────────────────────────── */

/**
 * Filled area + line trend (pure SVG). `data` oldest → newest. Bars-free, smooth
 * gold gradient. Renders flat baseline when everything is zero.
 */
export function AreaTrend({
  data,
  formatDay,
}: {
  data: { date: string; cents: number }[];
  formatDay: (iso: string) => string;
}) {
  const n = data.length;
  if (n === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-cream/30">
        Noch keine Daten.
      </div>
    );
  }
  const max = Math.max(1, ...data.map((d) => d.cents));
  const W = 100;
  const H = 42;
  const pad = 3;

  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (cents: number) => H - pad - (cents / max) * (H - pad * 2);

  const linePoints = data.map((d, i) => `${x(i).toFixed(2)},${y(d.cents).toFixed(2)}`);
  const linePath = `M ${linePoints.join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  const gradientId = "area-gold-grad";

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-40 w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(201,169,97,0.45)" />
            <stop offset="100%" stopColor="rgba(201,169,97,0)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke="#E5C97E"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-cream/30">
        <span>{n > 0 ? formatDay(data[0].date) : ""}</span>
        <span>{n > 0 ? formatDay(data[n - 1].date) : ""}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── Funnel / ranking bars ───────────────────────────── */

/** Horizontal bars (funnel or ranking). Each row scaled to the largest value. */
export function FunnelBars({
  data,
}: {
  data: { label: string; value: number; hint?: string; color?: string }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3.5">
      {data.map((d, i) => {
        const color = d.color ?? CHART_COLORS[i % CHART_COLORS.length];
        const pct = Math.max(2, (d.value / max) * 100);
        return (
          <li key={d.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-cream/70">{d.label}</span>
              <span className="flex-shrink-0 text-sm font-bold text-cream/90">
                {d.value}
                {d.hint && <span className="ml-1.5 text-[11px] font-normal text-cream/35">{d.hint}</span>}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────────────────────── Progress ring ───────────────────────────── */

/**
 * A KPI gauge: percentage ring with the value centred and a caption below.
 * Colour auto-thresholds (green < 70, amber < 90, red ≥ 90) unless overridden —
 * pass an explicit `color` for "higher is better" metrics like cache-hit.
 */
export function Gauge({
  percent,
  value,
  label,
  caption,
  color,
}: {
  percent: number;
  value: string;
  label: string;
  caption?: string;
  color?: string;
}) {
  const R = 15.915;
  const clamped = Math.max(0, Math.min(100, percent));
  const c =
    color ?? (clamped >= 90 ? "#FB7185" : clamped >= 70 ? "#FBBF24" : "#34D399");
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
          <circle cx="21" cy="21" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
          <circle
            cx="21"
            cy="21"
            r={R}
            fill="none"
            stroke={c}
            strokeWidth="3.5"
            strokeDasharray={`${clamped} ${100 - clamped}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold tracking-tight text-cream">{value}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-bold text-cream/85">{label}</p>
      {caption && <p className="mt-0.5 text-[11px] text-cream/35">{caption}</p>}
    </div>
  );
}

/** A single-value progress ring (e.g. onboarding rate, rating out of 5). */
export function ProgressRing({
  percent,
  value,
  label,
  color = "#34D399",
}: {
  percent: number;
  value: string;
  label?: string;
  color?: string;
}) {
  const R = 15.915;
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[88px] w-[88px] flex-shrink-0">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
          <circle cx="21" cy="21" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="21"
            cy="21"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${clamped} ${100 - clamped}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-extrabold text-cream">{value}</span>
        </div>
      </div>
      {label && <p className="text-sm leading-relaxed text-cream/55">{label}</p>}
    </div>
  );
}
