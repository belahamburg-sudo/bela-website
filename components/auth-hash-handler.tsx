"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token") && !hash.includes("error")) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  return null;
}
