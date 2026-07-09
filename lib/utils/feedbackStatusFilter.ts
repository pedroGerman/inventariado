import type { FeedbackStatus } from "@/lib/types/database";

export const FEEDBACK_STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "read", label: "Leído" },
  { value: "resolved", label: "Resuelto" },
] as const satisfies ReadonlyArray<{ value: FeedbackStatus; label: string }>;

export function getFeedbackStatusLabel(value: string): string {
  return (
    FEEDBACK_STATUS_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function matchesFeedbackStatusFilter(
  status: FeedbackStatus,
  filters: Set<string>,
): boolean {
  if (filters.size === 0) return true;
  return filters.has(status);
}
