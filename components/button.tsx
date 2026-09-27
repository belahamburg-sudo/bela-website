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
    "bg-gold-300 text-obsidian border border-gold-300 hover:bg-gold-200 hover:border-gold-200",
  secondary:
    "border border-cream/20 bg-cream/[0.03] text-cream hover:border-cream/40 hover:bg-cream/[0.06]",
  outline:
    "border border-cream/25 bg-transparent text-cream hover:border-cream/50",
  ghost: "text-cream/80 hover:text-cream hover:bg-cream/[0.04]"
};

const sizes = {
  sm: "min-h-9 px-4 py-2 text-[0.85rem]",
  md: "min-h-11 px-5 py-2.5 text-[0.95rem]",
  lg: "min-h-[52px] px-7 py-3.5 text-base"
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
    "focus-ring relative inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
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
