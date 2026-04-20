"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const demoUser = localStorage.getItem("ai-goldmining-demo-user");
      if (!hasSupabasePublicEnv()) {
        if (!demoUser) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        setReady(true);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!data.user && !demoUser) {
        router.push("/login?redirect=/dashboard");
        return;
      }
      setReady(true);
    }

    void checkAuth();
  }, [router]);

  if (!ready) {
    return (
      <div className="container-shell flex min-h-[50vh] items-center justify-center py-24">
        <div className="inline-flex items-center gap-3 rounded-full border border-gold-500/20 bg-panel px-5 py-3 text-sm font-semibold text-cream">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin text-gold-300" />
          Kursbereich wird geöffnet
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
