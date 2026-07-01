"use client";

import { useEffect } from "react";
import { getMyEmployee } from "@/lib/business/actions";
import { getProfile } from "@/lib/profile/actions";
import {
  clearStaleLocalData,
  isDemoEmployeeId,
} from "@/lib/client/clearStaleLocalData";
import { hydrateDataStore } from "@/lib/data/store";
import { useEmployeeStore } from "@/lib/store/employee";
import { isMockMode } from "@/lib/config";
import { mockEmployees } from "@/lib/mock/seed";

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const current = useEmployeeStore((s) => s.current);
  const setCurrent = useEmployeeStore((s) => s.setCurrent);
  const clearEmployee = useEmployeeStore((s) => s.clear);

  useEffect(() => {
    if (isMockMode()) {
      if (!current) setCurrent(mockEmployees[0]);
      void hydrateDataStore();
      return;
    }

    clearStaleLocalData();

    let cancelled = false;

    async function syncSession() {
      try {
        await hydrateDataStore();
        if (cancelled) return;

        const [profile, employee] = await Promise.all([
          getProfile(),
          getMyEmployee(),
        ]);

        if (cancelled) return;

        if (profile) {
          const staleEmployee = isDemoEmployeeId(current?.id);
          if (staleEmployee) clearEmployee();

          const resolvedEmployee = employee ?? {
            id: profile.user_id,
            business_id: "",
            user_id: profile.user_id,
            name: profile.full_name,
            role: "owner" as const,
            active: true,
            created_at: new Date().toISOString(),
          };

          const shouldUpdateEmployee =
            !current ||
            current.id !== resolvedEmployee.id ||
            current.user_id !== profile.user_id ||
            current.name !== resolvedEmployee.name ||
            current.business_id !== resolvedEmployee.business_id;

          if (shouldUpdateEmployee) {
            setCurrent(resolvedEmployee);
          }
        }
      } catch (err) {
        console.error("[AppSessionProvider]", err);
      }
    }

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [clearEmployee, current, setCurrent]);

  return <>{children}</>;
}
