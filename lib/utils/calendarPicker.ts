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

/**
 * Date filter selection:
 * - `null` → no filter (all time)
 * - `{ kind: "day" }` → a single day
 * - `{ kind: "range" }` → an inclusive range of days
 */
export type DateFilterValue =
  | null
  | { kind: "day"; date: string }
  | { kind: "range"; start: string; end: string };

export function normalizeRange(start: string, end: string) {
  return start <= end ? { start, end } : { start: end, end: start };
}

function formatRangeLabel(startRaw: string, endRaw: string): string {
  const { start, end } = normalizeRange(startRaw, endRaw);
  if (start === end) return formatDateGroup(start);

  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay} - ${endDay} ${MONTHS_FULL_ES[startMonth - 1]}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${MONTHS_FULL_ES[startMonth - 1].slice(0, 3)} - ${endDay} ${MONTHS_FULL_ES[endMonth - 1].slice(0, 3)} ${startYear}`;
  }

  return `${startDay} ${MONTHS_FULL_ES[startMonth - 1].slice(0, 3)} ${startYear} - ${endDay} ${MONTHS_FULL_ES[endMonth - 1].slice(0, 3)} ${endYear}`;
}

export function getDateFilterLabel(value: DateFilterValue): string {
  if (!value) return "Todo el tiempo";
  if (value.kind === "day") return formatDateGroup(value.date);
  return formatRangeLabel(value.start, value.end);
}

/** Anchor ISO date used to position the calendar when a filter is active. */
export function getDateFilterAnchor(value: DateFilterValue): string | null {
  if (!value) return null;
  return value.kind === "day" ? value.date : value.start;
}

/** Whether a given YYYY-MM-DD date passes the filter. */
export function matchesDateFilter(
  dateISO: string,
  value: DateFilterValue,
): boolean {
  if (!value) return true;
  if (value.kind === "day") return dateISO === value.date;
  const { start, end } = normalizeRange(value.start, value.end);
  return dateISO >= start && dateISO <= end;
}

export type DraftRangePosition = "start" | "end" | "middle" | false;

/** Position of a date within an in-progress range draft (for highlighting). */
export function getDraftRangePosition(
  date: string,
  start: string | null,
  end: string | null,
): DraftRangePosition {
  if (!start) return false;

  const effectiveEnd = end ?? start;
  const { start: rangeStart, end: rangeEnd } = normalizeRange(
    start,
    effectiveEnd,
  );

  if (date === rangeStart) return "start";
  if (date === rangeEnd) return "end";
  if (date > rangeStart && date < rangeEnd) return "middle";
  return false;
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
