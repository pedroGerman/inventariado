import { formatDateGroup } from "@/lib/utils/date";

export const MONTHS_FULL_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

/** ISO date (YYYY-MM-DD) or null for no filter (all time). */
export type DateFilterValue = string | null;

export function getDateFilterLabel(value: DateFilterValue): string {
  if (!value) return "Todo el tiempo";
  return formatDateGroup(value);
}

export function parseDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month: month - 1, day };
}

export function toDateISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function startWeekdayMonday(year: number, month: number) {
  const weekday = new Date(year, month, 1).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

export function buildCalendarDays(year: number, month: number) {
  const totalDays = daysInMonth(year, month);
  const leading = startWeekdayMonday(year, month);
  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function sortDateKeysDesc(keys: string[]) {
  return [...keys].sort((a, b) => b.localeCompare(a));
}
