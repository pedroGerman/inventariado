import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Employee } from "@/lib/types/database";

interface EmployeeStore {
  current: Employee | null;
  setCurrent: (employee: Employee) => void;
  clear: () => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set) => ({
      current: null,
      setCurrent: (employee) => set({ current: employee }),
      clear: () => set({ current: null }),
    }),
    { name: "pos-employee" },
  ),
);

export type { Employee };
