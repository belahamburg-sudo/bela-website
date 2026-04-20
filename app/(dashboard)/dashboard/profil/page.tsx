import { redirect } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import type { DbProfile } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { ProfileForm } from "./profile-form";

async function fetchProfile(): Promise<{ profile: DbProfile | null; email: string }> {
  if (!hasSupabasePublicEnv()) return { profile: null, email: "" };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { profile: null, email: "" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, email: "" };

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, goal, onboarding_complete, created_at")
    .eq("id", user.id)
    .single();

  return { profile: data as DbProfile | null, email: user.email ?? "" };
}

export default async function ProfilePage() {
  const { profile, email } = await fetchProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <AuthGate>
      <section className="py-16 sm:py-20">
        <div className="container-shell">
          <p className="eyebrow mb-5">Profil</p>
          <h1 className="font-heading text-4xl text-cream lg:text-5xl mb-2">
            Dein Profil.
          </h1>
          <p className="mt-2 mb-10 max-w-xl text-base leading-relaxed text-white/40">
            Halte deinen Namen und dein Ziel aktuell.
          </p>

          <div className="panel-surface max-w-lg rounded-2xl p-8">
            <ProfileForm
              initialName={profile.full_name ?? ""}
              initialGoal={profile.goal ?? ""}
              email={email}
            />
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
