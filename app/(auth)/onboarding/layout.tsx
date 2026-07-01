"use client";

import { useEffect } from "react";
import { clearStaleLocalData } from "@/lib/client/clearStaleLocalData";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    clearStaleLocalData();
  }, []);

  return children;
}
