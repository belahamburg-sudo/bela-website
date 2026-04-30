import Image from "next/image";
import { getAvatarById } from "@/lib/avatar-system";

type Props = {
  avatarId?: string | null;
  points?: number;
  size?: "sm" | "md" | "lg" | "xl";
  hidePoints?: boolean;
};

const sizeClasses = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28",
  xl: "h-32 w-32",
};

export function MemberAvatar({ avatarId, points = 0, size = "md", hidePoints = false }: Props) {
  const avatar = getAvatarById(avatarId);
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatar.id}&backgroundColor=transparent&scale=110`;

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-[24px] border border-gold-300/20 bg-gradient-to-br ${avatar.accent} ${sizeClasses[size]} shadow-[0_18px_50px_rgba(240,180,41,0.18)]`}
      >
        <Image 
          src={avatarUrl} 
          alt={avatar.name} 
          fill 
          className="object-contain p-1"
          unoptimized
        />
        <div className="absolute inset-[2px] rounded-[22px] border border-white/15" />
      </div>
      {!hidePoints && (
        <div className="text-center mt-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300/80">
            {avatar.name}
          </p>
          <p className="text-[11px] text-cream/35 mt-0.5">{points} Punkte</p>
        </div>
      )}
    </div>
  );
}
