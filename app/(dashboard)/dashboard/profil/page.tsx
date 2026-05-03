import { AuthGate } from "@/components/auth-gate";
import { ProfileForm } from "./profile-form";
import { SpatialBackground } from "@/components/spatial-background";
import { getUnifiedMemberData } from "@/lib/member-data";

async function fetchProfile() {
  const data = await getUnifiedMemberData();
  return {
    ...data,
    businessSnapshot: (data.profile?.business_snapshot ?? {}) as Record<string, string>,
  };
}

export default async function ProfilePage() {
  const { profile, businessSnapshot, user, purchasedCourses, totalLessonsCompleted, completedCourses, points, rewardCount } =
    await fetchProfile();

  return (
    <AuthGate>
      <section className="py-16 sm:py-24 relative overflow-hidden bg-obsidian min-h-screen">
        <SpatialBackground />
        
        <div className="container-shell relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-300/30" />
              <span className="tac-label text-gold-300/60 uppercase tracking-widest text-[9px]">Mitglieder-Profil</span>
            </div>
            <h1 className="font-heading tracking-gta leading-tight text-cream text-4xl md:text-6xl uppercase mb-4">
              MEIN <span className="text-gold-300">PROFIL.</span>
            </h1>
            <p className="max-w-2xl text-[10px] font-mono text-cream/30 uppercase tracking-[0.2em] leading-relaxed">
              Personalisiere deinen Account, tracke deine Fortschritte und verwalte deine Business-Daten für maßgeschneiderte Strategien.
            </p>
          </div>
          <ProfileForm
            initialName={profile?.full_name ?? ""}
            initialGoal={profile?.goal ?? ""}
            initialBusinessSnapshot={businessSnapshot}
            email={user.email ?? ""}
            initialAvatarId={user.avatarId}
            points={points}
            completedLessons={totalLessonsCompleted}
            purchasedCourses={purchasedCourses.length}
            completedCourses={completedCourses}
            rewardCount={rewardCount}
          />
        </div>
      </section>
    </AuthGate>
  );
}
