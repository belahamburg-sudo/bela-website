import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "solid" | "outline" | "dot";
  dotColor?: string;
};

export function Badge({
  children,
  className,
  variant = "default",
  dotColor = "#FFD76A"
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]";

  const variants = {
    default:
      "border border-gold-500/25 bg-gold-500/[0.08] text-gold-100 backdrop-blur-md",
    solid: "bg-gold-300 text-obsidian shadow-[0_6px_20px_-8px_rgba(214,168,79,0.8)]",
    outline: "border border-gold-500/30 bg-transparent text-gold-200",
    dot: "border border-gold-500/20 bg-panel/60 text-cream backdrop-blur-md"
  } as const;

  return (
    <span className={cn(base, variants[variant], className)}>
      {variant === "dot" ? (
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: dotColor }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: dotColor }}
          />
        </span>
      ) : null}
      {children}
    </span>
  );
}
