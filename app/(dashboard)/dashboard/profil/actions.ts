"use server";

import { revalidatePath } from "next/cache";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function updateProfile(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const goal = (formData.get("goal") as string | null)?.trim() ?? "";

  if (!hasSupabasePublicEnv()) return { ok: false, error: "no env" };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "no client" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name || null, goal: goal || null })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/profil");
  return { ok: true };
}
