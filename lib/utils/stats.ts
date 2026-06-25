import type { Order, Product, Purchase } from "@/lib/types/database";
import { getDebts, getOrders, getProducts, getPurchases, getCustomers } from "@/lib/mock/db";

export type StatsPeriod = "day" | "week" | "month";

export interface ConsolidatedStats {
  salesTotal: number;
  pendingCollect: number;
  purchasesTotal: number;
  pendingPay: number;
}

export interface BusinessStats {
  totalCustomers: number;
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
}

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

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDateRange(
  period: StatsPeriod,
  offset: number,
): { start: Date; end: Date } {
  const now = new Date();

  if (period === "day") {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    return { start: startOfDay(day), end: endOfDay(day) };
  }

  if (period === "week") {
    const weekStart = startOfWeek(now);
    weekStart.setDate(weekStart.getDate() - offset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return { start: startOfDay(weekStart), end: endOfDay(weekEnd) };
  }

  const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return { start: startOfMonth(month), end: endOfMonth(month) };
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const d = new Date(iso);
  return d >= start && d <= end;
}

function inRangeDate(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  return d >= start && d <= end;
}

export function getConsolidatedStats(
  period: StatsPeriod,
  offset: number,
): ConsolidatedStats {
  const { start, end } = getDateRange(period, offset);
  const orders = getOrders().filter(
    (o) =>
      o.status === "confirmed" &&
      (inRange(o.created_at, start, end) || inRangeDate(o.date, start, end)),
  );
  const purchases = getPurchases().filter(
    (p) =>
      p.status === "confirmed" &&
      (inRange(p.created_at, start, end) || inRangeDate(p.date, start, end)),
  );
  const debts = getDebts();

  const salesTotal = orders.reduce((s, o) => s + o.total, 0);
  const purchasesTotal = purchases.reduce((s, p) => s + p.total, 0);

  const orderIds = new Set(orders.map((o) => o.id));
  const pendingCollect = debts
    .filter((d) => orderIds.has(d.order_id) || offset === 0)
    .reduce((s, d) => s + d.remaining, 0);

  return {
    salesTotal,
    pendingCollect: offset === 0 ? debts.reduce((s, d) => s + d.remaining, 0) : pendingCollect,
    purchasesTotal,
    pendingPay: 0,
  };
}

export function getPeriodLabels(period: StatsPeriod): [string, string] {
  switch (period) {
    case "day":
      return ["Hoy", "Ayer"];
    case "week":
      return ["Esta semana", "Semana pasada"];
    case "month":
      return ["Este mes", "Mes pasado"];
  }
}

export function getBusinessStats(): BusinessStats {
  const products = getProducts();
  const customers = getCustomers();

  return {
    totalCustomers: customers.length,
    totalProducts: products.filter((p) => p.type === "product").length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
  };
}

export function getActivePeriodLabel(period: StatsPeriod, offset: number): string {
  const [current, previous] = getPeriodLabels(period);
  return offset === 0 ? current : previous;
}

export function getTopProducts(
  period: StatsPeriod,
  offset: number,
  limit = 5,
): { product: Product; sold: number }[] {
  const orders = getOrdersInPeriod(period, offset);
  const counts = new Map<string, number>();

  orders.forEach((o) => {
    o.items?.forEach((item) => {
      if (item.product_id) {
        counts.set(item.product_id, (counts.get(item.product_id) ?? 0) + item.quantity);
      }
    });
  });

  const products = getProducts();
  return [...counts.entries()]
    .map(([id, sold]) => ({
      product: products.find((p) => p.id === id)!,
      sold,
    }))
    .filter((x) => x.product)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export function getOrdersInPeriod(period: StatsPeriod, offset: number): Order[] {
  const { start, end } = getDateRange(period, offset);
  return getOrders().filter(
    (o) =>
      o.status === "confirmed" &&
      (inRange(o.created_at, start, end) || inRangeDate(o.date, start, end)),
  );
}

export function getPurchasesInPeriod(period: StatsPeriod, offset: number): Purchase[] {
  const { start, end } = getDateRange(period, offset);
  return getPurchases().filter(
    (p) =>
      p.status === "confirmed" &&
      (inRange(p.created_at, start, end) || inRangeDate(p.date, start, end)),
  );
}
