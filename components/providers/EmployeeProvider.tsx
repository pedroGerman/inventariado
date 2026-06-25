"use client";

import { useEffect } from "react";
import { mockEmployees } from "@/lib/mock/seed";
import { useEmployeeStore } from "@/lib/store/employee";

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const { current, setCurrent } = useEmployeeStore();

  useEffect(() => {
    if (!current) {
      setCurrent(mockEmployees[0]);
    }
  }, [current, setCurrent]);

  return <>{children}</>;
}
