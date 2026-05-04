export const DEFAULT_AVATAR_ID = "miner-01";
export const FREE_COURSE_REWARD_POINTS = 1200;

export type MemberAvatar = {
  id: string;
  name: string;
  badge: string;
  accent: string;
  unlockPoints: number;
};

export type MemberLevel = {
  level: number;
  title: string;
  minPoints: number;
};

export const MEMBER_AVATARS: MemberAvatar[] = [
  { id: "miner-01", name: "Starter Miner", badge: "SM", accent: "from-[#f4c95d] to-[#c98722]", unlockPoints: 0 },
  { id: "miner-02", name: "Night Digger", badge: "ND", accent: "from-[#f0b94d] to-[#875c18]", unlockPoints: 40 },
  { id: "miner-03", name: "Prompt Scout", badge: "PS", accent: "from-[#efcf72] to-[#8d6823]", unlockPoints: 80 },
  { id: "miner-04", name: "Signal Hunter", badge: "SH", accent: "from-[#d8a744] to-[#6c4812]", unlockPoints: 120 },
  { id: "miner-05", name: "Cave Runner", badge: "CR", accent: "from-[#f0cf92] to-[#946223]", unlockPoints: 180 },
  { id: "miner-06", name: "Gold Mapper", badge: "GM", accent: "from-[#f7d56a] to-[#bc7f1d]", unlockPoints: 240 },
  { id: "miner-07", name: "Market Prospector", badge: "MP", accent: "from-[#eabd59] to-[#805013]", unlockPoints: 320 },
  { id: "miner-08", name: "Offer Crafter", badge: "OC", accent: "from-[#f9dd8f] to-[#b67925]", unlockPoints: 420 },
  { id: "miner-09", name: "Launch Builder", badge: "LB", accent: "from-[#f3cd65] to-[#9c6415]", unlockPoints: 520 },
  { id: "miner-10", name: "Automation Smith", badge: "AS", accent: "from-[#f7d974] to-[#99610a]", unlockPoints: 640 },
  { id: "miner-11", name: "Revenue Tracker", badge: "RT", accent: "from-[#f4ce61] to-[#794d10]", unlockPoints: 760 },
  { id: "miner-12", name: "Funnel Captain", badge: "FC", accent: "from-[#eecf83] to-[#9a6a1c]", unlockPoints: 900 },
  { id: "miner-13", name: "Creator Chief", badge: "CC", accent: "from-[#f3d28c] to-[#8f5712]", unlockPoints: 1040 },
  { id: "miner-14", name: "Cashflow Ranger", badge: "CR", accent: "from-[#f2ca55] to-[#6a4208]", unlockPoints: 1200 },
  { id: "miner-15", name: "System Pilot", badge: "SP", accent: "from-[#f5dc8b] to-[#9c6718]", unlockPoints: 1360 },
  { id: "miner-16", name: "AI Merchant", badge: "AM", accent: "from-[#edc655] to-[#8f5b13]", unlockPoints: 1520 },
  { id: "miner-17", name: "Scale Explorer", badge: "SE", accent: "from-[#f7d875] to-[#b37116]", unlockPoints: 1700 },
  { id: "miner-18", name: "Vault Architect", badge: "VA", accent: "from-[#f9df96] to-[#85540d]", unlockPoints: 1880 },
  { id: "miner-19", name: "Empire Miner", badge: "EM", accent: "from-[#efc14c] to-[#6e4207]", unlockPoints: 2060 },
  { id: "miner-20", name: "Goldmaster", badge: "GM", accent: "from-[#ffea9b] to-[#b4730d]", unlockPoints: 2240 },
];

export const MEMBER_LEVELS: MemberLevel[] = [
  { level: 1, title: "Rookie", minPoints: 0 },
  { level: 2, title: "Operator", minPoints: 120 },
  { level: 3, title: "Builder", minPoints: 320 },
  { level: 4, title: "Closer", minPoints: 640 },
  { level: 5, title: "Goldrunner", minPoints: 1040 },
  { level: 6, title: "System Owner", minPoints: 1520 },
  { level: 7, title: "Scale Miner", minPoints: 2060 },
];

export const MEMBER_REWARDS = [
  { key: "avatar-pack-2", points: 180, title: "Avatar Pack II", description: "Vier weitere Charaktere werden freigeschaltet." },
  { key: "creator-vault", points: 520, title: "Creator Vault", description: "Exklusive Reward-Stufe mit weiteren Avataren." },
  { key: "gold-sprint", points: 900, title: "Gold Sprint", description: "Neue Statusstufe und höherer Avatar-Tier." },
  { key: "free-course", points: FREE_COURSE_REWARD_POINTS, title: "Gratis Kurs", description: "Ab 1.200 Punkten wartet ein freier Kurs-Reveal." },
  { key: "scale-tier", points: 1700, title: "Scale Tier", description: "Fast alle Avatare und das höchste Statusband." },
];

export function getAvatarById(avatarId?: string | null) {
  return MEMBER_AVATARS.find((avatar) => avatar.id === avatarId) ?? MEMBER_AVATARS[0];
}

export function getUnlockedAvatarIds(points: number) {
  return MEMBER_AVATARS.filter((avatar) => points >= avatar.unlockPoints).map((avatar) => avatar.id);
}

export function getMemberLevel(points: number) {
  let current = MEMBER_LEVELS[0];
  let next: MemberLevel | null = null;

  for (const level of MEMBER_LEVELS) {
    if (points >= level.minPoints) {
      current = level;
      continue;
    }
    next = level;
    break;
  }

  const progress = next
    ? Math.min(
        100,
        Math.round(((points: current.minPoints) / (next.minPoints: current.minPoints)) * 100)
      )
    : 100;

  return {
    current,
    next,
    progress: Number.isFinite(progress) ? Math.max(0, progress) : 0,
  };
}

export function getNextReward(points: number) {
  return MEMBER_REWARDS.find((reward) => reward.points > points) ?? null;
}

export function calculateMemberPoints(input: {
  onboardingComplete: boolean;
  purchasedCourses: number;
  completedLessons: number;
  completedCourses: number;
}) {
  const onboardingPoints = input.onboardingComplete ? 60 : 0;
  const purchasePoints = input.purchasedCourses * 140;
  const lessonPoints = input.completedLessons * 35;
  const coursePoints = input.completedCourses * 180;

  return onboardingPoints + purchasePoints + lessonPoints + coursePoints;
}
