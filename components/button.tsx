import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  target?: string;
  rel?: string;
};

const variants = {
  primary:
    "btn-shimmer bg-gradient-to-b from-gold-700 via-gold-100 to-gold-700 text-obsidian hover:from-gold-600 hover:via-gold-50 hover:to-gold-600 shadow-[0_10px_50px_-10px_rgba(160,107,0,0.5)] border border-gold-300/60",
  secondary:
    "btn-shimmer border border-gold-300/25 bg-panel/60 text-cream hover:border-gold-300/60 hover:bg-gold-300/[0.06] backdrop-blur-md",
  outline:
    "btn-shimmer border border-gold-300/35 bg-transparent text-cream hover:border-gold-300 hover:bg-gold-300/[0.05]",
  ghost: "btn-shimmer text-cream hover:bg-cream/[0.04]"
};

const sizes = {
  sm: "min-h-9 px-5 py-2 text-[0.78rem]",
  md: "min-h-11 px-6 py-3 text-sm",
  lg: "min-h-[52px] px-8 py-4 text-[0.9rem]"
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  disabled,
  onClick,
  target,
  rel
}: ButtonProps) {
  const classes = cn(
    "focus-ring relative inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-[0.12em] transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} target={target} rel={rel}>
        <span className="relative z-[2] inline-flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      <span className="relative z-[2] inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
