import { isMockMode } from "@/lib/config";
import { MOCK_EMPLOYEE_CASHIER_ID, MOCK_EMPLOYEE_ID } from "@/lib/mock/seed";
import { useEmployeeStore } from "@/lib/store/employee";

const DEMO_EMPLOYEE_IDS = new Set([MOCK_EMPLOYEE_ID, MOCK_EMPLOYEE_CASHIER_ID]);

export function isDemoEmployeeId(id: string | undefined): boolean {
  return !!id && DEMO_EMPLOYEE_IDS.has(id);
}

/** Borra restos del modo demo en el navegador (localStorage + empleado persistido). */
export function clearStaleLocalData(): void {
  if (typeof window === "undefined" || isMockMode()) return;

  localStorage.removeItem("pos-mock-db");
  localStorage.removeItem("pos-app-db");
  localStorage.removeItem("pos-cart");

  const persisted = useEmployeeStore.getState().current;
  if (!persisted || isDemoEmployeeId(persisted.id)) {
    localStorage.removeItem("pos-employee");
    useEmployeeStore.getState().clear();
  }
}
