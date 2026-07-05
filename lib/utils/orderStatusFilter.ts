import type { OrderStatus, PurchaseStatus } from "@/lib/types/database";

export interface StatusFilterOption {
  value: string;
  label: string;
}

export const SALE_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "confirmed", label: "Confirmada" },
  { value: "pending", label: "Pendiente" },
  { value: "cancelled", label: "Anulada" },
  { value: "returned", label: "Devuelta" },
];

export const PURCHASE_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "confirmed", label: "Confirmada" },
  { value: "pending", label: "Pendiente" },
  { value: "cancelled", label: "Anulada" },
];

export type OrderListTab = "sale" | "purchase";

export function getStatusFilterOptions(tab: OrderListTab): StatusFilterOption[] {
  return tab === "sale" ? SALE_STATUS_FILTER_OPTIONS : PURCHASE_STATUS_FILTER_OPTIONS;
}

export function parseStatusFilterFromSearchParams(
  searchParams: URLSearchParams,
): Set<string> {
  if (searchParams.get("pending") === "1") {
    return new Set(["pending"]);
  }

  const raw = searchParams.get("status");
  if (!raw) return new Set();

  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function serializeStatusFilter(statuses: Set<string>): string | null {
  if (statuses.size === 0) return null;
  return Array.from(statuses).sort().join(",");
}

export function matchesStatusFilter(
  status: OrderStatus | PurchaseStatus,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true;
  return selected.has(status);
}

export function getStatusFilterLabel(
  value: string,
  tab: OrderListTab,
): string {
  return (
    getStatusFilterOptions(tab).find((option) => option.value === value)?.label ??
    value
  );
}
