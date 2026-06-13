"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-gold-400 to-gold-500 text-obsidian hover:brightness-110 border border-gold-300/50 shadow-[0_8px_30px_-12px_rgba(201, 169, 97,0.6)]",
  secondary:
    "border border-gold-300/25 bg-panel/60 text-cream hover:border-gold-300/60 hover:bg-gold-300/[0.06]",
  ghost: "text-cream/60 hover:bg-white/[0.04] hover:text-cream",
  danger:
    "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:border-red-500/50",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px] gap-1.5",
  md: "h-10 px-4 text-xs gap-2",
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export function AdminButton({
  children,
  variant = "secondary",
  size = "md",
  type = "button",
  onClick,
  disabled,
  loading,
  className,
  icon: Icon,
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-lg font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={classes}>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        Icon && <Icon className="h-3.5 w-3.5" />
      )}
      {children}
    </button>
  );
}
