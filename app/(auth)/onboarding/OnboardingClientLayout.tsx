"use client";

import { useEffect } from "react";
import { clearStaleLocalData } from "@/lib/client/clearStaleLocalData";

export function OnboardingClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    clearStaleLocalData();
  }, []);

  return children;
}
