"use server";

import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function completeOnboarding(formData: FormData): Promise<void> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const goal = (formData.get("goal") as string | null)?.trim() ?? "";
  const avatarId = (formData.get("avatarId") as string | null)?.trim() ?? null;
  const instagramFollowers = (formData.get("instagramFollowers") as string | null)?.trim() ?? "";
  const tiktokFollowers = (formData.get("tiktokFollowers") as string | null)?.trim() ?? "";
  const monthlySales = (formData.get("monthlySales") as string | null)?.trim() ?? "";
  const businessStage = (formData.get("businessStage") as string | null)?.trim() ?? "";

  if (!name) return;

  if (!hasSupabasePublicEnv()) {
    redirect("/dashboard");
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    redirect("/dashboard");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Update profile
  await supabase
    .from("profiles")
    .update({
      full_name: name,
      goal: goal || null,
      business_snapshot: {
        instagramFollowers,
        tiktokFollowers,
        monthlySales,
        businessStage,
      },
      onboarding_complete: true,
    })
    .eq("id", user.id);

  // Update user metadata with selected avatar if provided
  if (avatarId) {
    await supabase.auth.updateUser({
      data: { avatar_id: avatarId },
    });
  }

  redirect("/dashboard");
}
