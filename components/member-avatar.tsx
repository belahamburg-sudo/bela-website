import { getAvatarById } from "@/lib/avatar-system";

type Props = {
  avatarId?: string | null;
  points?: number;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-14 w-14 text-sm",
  md: "h-20 w-20 text-lg",
  lg: "h-28 w-28 text-2xl",
};

export function MemberAvatar({ avatarId, points = 0, size = "md" }: Props) {
  const avatar = getAvatarById(avatarId);

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      <div
        className={`relative flex items-center justify-center rounded-[24px] border border-gold-300/20 bg-gradient-to-br ${avatar.accent} ${sizeClasses[size]} font-heading tracking-gta text-obsidian shadow-[0_18px_50px_rgba(240,180,41,0.18)]`}
      >
        <span>{avatar.badge}</span>
        <div className="absolute inset-[2px] rounded-[22px] border border-white/15" />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300/80">
          {avatar.name}
        </p>
        <p className="text-[11px] text-cream/35">{points} Punkte</p>
      </div>
    </div>
  );
}
