"use server";

import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function completeOnboarding(formData: FormData): Promise<void> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const goal = (formData.get("goal") as string | null)?.trim() ?? "";

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

  await supabase
    .from("profiles")
    .update({ full_name: name, goal: goal || null, onboarding_complete: true })
    .eq("id", user.id);

  redirect("/dashboard");
}
