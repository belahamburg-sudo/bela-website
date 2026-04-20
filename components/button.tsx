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
    "btn-shimmer bg-gradient-to-b from-gold-200 to-gold-400 text-obsidian hover:from-gold-100 hover:to-gold-300 shadow-[0_10px_40px_-10px_rgba(214,168,79,0.55)] border border-gold-300/50",
  secondary:
    "border border-gold-500/20 bg-panel/60 text-cream hover:border-gold-300/60 hover:bg-gold-500/[0.07] backdrop-blur-md",
  outline:
    "border border-gold-500/30 bg-transparent text-cream hover:border-gold-300 hover:bg-gold-500/5",
  ghost: "text-cream hover:bg-white/[0.04]"
};

const sizes = {
  sm: "min-h-9 px-4 py-2 text-[0.82rem]",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-[52px] px-7 py-4 text-[0.95rem]"
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
    "focus-ring relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
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
