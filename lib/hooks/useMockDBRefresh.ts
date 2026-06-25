"use client";

import { useEffect, useState } from "react";

export function useMockDBRefresh() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("pos-db-updated", handler);
    return () => window.removeEventListener("pos-db-updated", handler);
  }, []);
}
