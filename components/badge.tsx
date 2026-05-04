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
  dotColor = "#F0B429"
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-2 rounded-sm px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]";

  const variants = {
    default:
      "border border-gold-300/30 bg-gold-300/[0.08] text-gold-100 backdrop-blur-md",
    solid: "bg-gold-gradient text-obsidian shadow-[0_4px_16px_-4px_rgba(160,107,0,0.8)]",
    outline: "border border-gold-300/35 bg-transparent text-gold-200",
    dot: "border border-gold-300/20 bg-panel/60 text-cream backdrop-blur-md"
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
            className="relative inline-flex h-2 w-2 rounded-sm"
            style={{ background: dotColor }}
          />
        </span>
      ) : null}
      {children}
    </span>
  );
}
