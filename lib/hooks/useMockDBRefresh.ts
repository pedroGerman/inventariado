"use client";

import { useEffect, useState } from "react";
import { hydrateDataStore } from "@/lib/data/store";

export function useMockDBRefresh() {
  const [, setTick] = useState(0);

  useEffect(() => {
    void hydrateDataStore().then(() => setTick((t) => t + 1));

    const handler = () => setTick((t) => t + 1);
    window.addEventListener("pos-db-updated", handler);
    return () => window.removeEventListener("pos-db-updated", handler);
  }, []);
}
