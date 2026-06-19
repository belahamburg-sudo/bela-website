"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
import { useToast } from "@/components/admin/toast";
import { syncAllCoursesToStripe } from "@/app/admin/kurse/actions";

/** Header button: create/update every course as a Stripe product in one go. */
export function SyncAllStripeButton() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  function run() {
    setLoading(true);
    void syncAllCoursesToStripe()
      .then((res) => {
        if (res.ok) {
          success(
            `Stripe-Sync: ${res.synced ?? 0} aktualisiert${res.failed ? `, ${res.failed} fehlgeschlagen` : ""}.`
          );
          router.refresh();
        } else {
          error(res.error ?? "Stripe-Sync fehlgeschlagen.");
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <AdminButton variant="secondary" size="sm" icon={CreditCard} onClick={run} loading={loading}>
      Alle bei Stripe synchronisieren
    </AdminButton>
  );
}
