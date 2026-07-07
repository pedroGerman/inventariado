import type { Product } from "@/lib/types/database";
import { getDebts, getOrders, getProducts } from "@/lib/mock/db";
import { getDateRange, type StatsPeriod } from "@/lib/utils/stats";

export const DASHBOARD_PERIOD_PRESETS = [
  { id: "all", label: "A lo largo" },
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "week", label: "Esta semana" },
  { id: "last_week", label: "Semana pasada" },
  { id: "month", label: "Este mes" },
  { id: "last_month", label: "Mes pasado" },
] as const;

export type DashboardPeriodPresetId =
  (typeof DASHBOARD_PERIOD_PRESETS)[number]["id"];

export type DashboardPeriodFilter =
  | { kind: "preset"; preset: DashboardPeriodPresetId }
  | { kind: "day"; date: string }
  | { kind: "range"; startDate: string; endDate: string };

function normalizeRangeDates(startDate: string, endDate: string) {
  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate };
}

function formatCalendarDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${MONTHS_FULL_ES[month - 1]} ${year}`;
}

function formatRangeLabel(startDate: string, endDate: string) {
  const { startDate: start, endDate: end } = normalizeRangeDates(
    startDate,
    endDate,
  );

  if (start === end) {
    return formatCalendarDateLabel(start);
  }

  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay} - ${endDay} ${MONTHS_FULL_ES[startMonth - 1]}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${MONTHS_FULL_ES[startMonth - 1].slice(0, 3)} - ${endDay} ${MONTHS_FULL_ES[endMonth - 1].slice(0, 3)} ${startYear}`;
  }

  return `${formatCalendarDateLabel(start)} - ${formatCalendarDateLabel(end)}`;
}

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriodFilter = {
  kind: "preset",
  preset: "week",
};

const MONTHS_FULL_ES = [
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
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const d = new Date(iso);
  return d >= start && d <= end;
}

function inRangeDate(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  return d >= start && d <= end;
}

function presetToRange(
  preset: DashboardPeriodPresetId,
): { start: Date | null; end: Date | null } {
  if (preset === "all") {
    return { start: null, end: null };
  }

  const map: Record<
    Exclude<DashboardPeriodPresetId, "all">,
    [StatsPeriod, number]
  > = {
    week: ["week", 0],
    last_week: ["week", 1],
    today: ["day", 0],
    yesterday: ["day", 1],
    month: ["month", 0],
    last_month: ["month", 1],
  };

  const [period, offset] = map[preset];
  return getDateRange(period, offset);
}

export function resolveDashboardPeriodRange(
  filter: DashboardPeriodFilter,
): { start: Date | null; end: Date | null } {
  if (filter.kind === "preset") {
    return presetToRange(filter.preset);
  }

  if (filter.kind === "range") {
    const { startDate, endDate } = normalizeRangeDates(
      filter.startDate,
      filter.endDate,
    );
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
    return {
      start: startOfDay(new Date(startYear, startMonth - 1, startDay)),
      end: endOfDay(new Date(endYear, endMonth - 1, endDay)),
    };
  }

  const [year, month, day] = filter.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function getDashboardPeriodLabel(filter: DashboardPeriodFilter): string {
  if (filter.kind === "preset") {
    return (
      DASHBOARD_PERIOD_PRESETS.find((p) => p.id === filter.preset)?.label ??
      "Período"
    );
  }

  if (filter.kind === "range") {
    return formatRangeLabel(filter.startDate, filter.endDate);
  }

  const [year, month, day] = filter.date.split("-").map(Number);
  return `${day} ${MONTHS_FULL_ES[month - 1]} ${year}`;
}

export function getDraftRangeFromFilter(
  filter: DashboardPeriodFilter,
): { start: string | null; end: string | null } {
  if (filter.kind === "range") {
    return { start: filter.startDate, end: filter.endDate };
  }

  if (filter.kind === "day") {
    return { start: filter.date, end: filter.date };
  }

  return { start: null, end: null };
}

export type DraftRangePosition = "start" | "end" | "middle" | false;

export function getDraftRangePosition(
  date: string,
  start: string | null,
  end: string | null,
): DraftRangePosition {
  if (!start) return false;

  const effectiveEnd = end ?? start;
  const { startDate, endDate } = normalizeRangeDates(start, effectiveEnd);

  if (date === startDate) return "start";
  if (date === endDate) return "end";
  if (date > startDate && date < endDate) return "middle";
  return false;
}

export function isPresetSelected(
  filter: DashboardPeriodFilter,
  preset: DashboardPeriodPresetId,
): boolean {
  return filter.kind === "preset" && filter.preset === preset;
}

export interface DashboardSalesSummary {
  productsSold: number;
  unitsSold: number;
  salesTotal: number;
  pendingCollect: number;
  pendingPay: number;
}

export function getOrdersForDashboardFilter(filter: DashboardPeriodFilter) {
  const { start, end } = resolveDashboardPeriodRange(filter);
  return getOrders().filter((order) => {
    if (order.status !== "confirmed") return false;
    if (!start || !end) return true;
    return (
      inRange(order.created_at, start, end) ||
      inRangeDate(order.date, start, end)
    );
  });
}

export function getSalesSummaryForDashboardFilter(
  filter: DashboardPeriodFilter,
): DashboardSalesSummary {
  const orders = getOrdersForDashboardFilter(filter);
  const productIds = new Set<string>();
  let unitsSold = 0;
  let salesTotal = 0;

  for (const order of orders) {
    salesTotal += order.total;
    order.items?.forEach((item) => {
      if (item.product_id) {
        productIds.add(item.product_id);
        unitsSold += item.quantity;
      }
    });
  }

  const debts = getDebts();
  const collectDebts = debts.filter((d) => d.kind === "collect");
  const payDebts = debts.filter((d) => d.kind === "pay");

  return {
    productsSold: productIds.size,
    unitsSold,
    salesTotal,
    pendingCollect: collectDebts.reduce((sum, debt) => sum + debt.remaining, 0),
    pendingPay: payDebts.reduce((sum, debt) => sum + debt.remaining, 0),
  };
}

export function getTopProductsForDashboardFilter(
  filter: DashboardPeriodFilter,
  limit = 6,
): { product: Product; sold: number }[] {
  const orders = getOrdersForDashboardFilter(filter);
  const counts = new Map<string, number>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (item.product_id) {
        counts.set(
          item.product_id,
          (counts.get(item.product_id) ?? 0) + item.quantity,
        );
      }
    });
  });

  const products = getProducts();
  return [...counts.entries()]
    .map(([id, sold]) => ({
      product: products.find((p) => p.id === id)!,
      sold,
    }))
    .filter((entry) => entry.product)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export { MONTHS_FULL_ES };
