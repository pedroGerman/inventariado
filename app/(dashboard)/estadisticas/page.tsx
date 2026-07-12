"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { DashboardPeriodPicker } from "@/components/dashboard/DashboardPeriodPicker";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { getBusinessStats } from "@/lib/utils/stats";
import {
  DEFAULT_DASHBOARD_PERIOD,
  getConsolidatedStatsForDashboardFilter,
  getDashboardPeriodLabel,
  getLeastSoldProductsForDashboardFilter,
  getOrdersForDashboardFilter,
  getPurchasesForDashboardFilter,
  getTopProductsForDashboardFilter,
  type DashboardPeriodFilter,
} from "@/lib/utils/dashboardPeriod";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/lib/types/database";

const PERIOD_LIST_PREVIEW = 5;

function SummaryCard({
  title,
  titleClass,
  rows,
}: {
  title: string;
  titleClass?: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-3 py-1">
      <div className="border- border-slate-100 px-0.5">
        <h3 className={cn("text-sm font-semibold", titleClass)}>{title}</h3>
      </div>
      <div className="divide- flex flex-col gap-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-0.5"
          >
            <span className="text-sm text-slate-600">{row.label}</span>
            <span className="text-sm shrink-0 font-medium tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-primary",
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
  href?: string;
}) {
  const card = (
    <Card
      className={cn(
        "flex !flex-row items-center !py-3 !gap-2.5 px-3.5",
        href &&
        "transition-[box-shadow,transform] hover:shadow-ff-surface-4 active:scale-[0.99]",
      )}
    >
      <div className={cn("rounded-xl w-min p-1.5", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

function ProductSalesList({
  title,
  periodLabel,
  items,
  emptyMessage,
}: {
  title: string;
  periodLabel: string;
  items: { product: Product; sold: number; revenue: number }[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <Card className="px-3.5">
        <div className="mb-1 flex flex-col gap-0.5">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-slate-500">{periodLabel}</p>
        </div>
        <p className="py-4 text-center text-sm text-slate-400">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        <p className="text-xs text-slate-500">{periodLabel}</p>
      </div>
      <div className="divide-y divide-border/40">
        {items.map(({ product, sold, revenue }) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <span className="text-card-foreground">
              {product.name}{" "}
              <span className="text-muted-foreground">×{sold}</span>
            </span>
            <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
              {formatCurrency(revenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeriodTransactionList({
  title,
  periodLabel,
  viewAllHref,
  items,
  emptyMessage,
}: {
  title: string;
  periodLabel: string;
  viewAllHref: string;
  items: {
    id: string;
    href: string;
    label: string;
    total: number;
    createdAt: string;
  }[];
  emptyMessage: string;
}) {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const preview = sorted.slice(0, PERIOD_LIST_PREVIEW);
  const remaining = Math.max(sorted.length - preview.length, 0);

  if (sorted.length === 0) {
    return (
      <Card className="px-3.5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-slate-500">{periodLabel}</p>
          </div>
          <Link
            href={viewAllHref}
            className="shrink-0 text-sm font-medium text-primary"
          >
            Ver todas
          </Link>
        </div>
        <p className="py-4 text-center text-sm text-slate-400">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-card-foreground">
            {title}
          </h2>
          <p className="text-xs text-slate-500">{periodLabel}</p>
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 pt-0.5 text-sm font-medium text-primary"
        >
          Ver todas
        </Link>
      </div>
      <div className="divide-y divide-border/40">
        {preview.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <span className="font-medium text-card-foreground">{item.label}</span>
            <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
              {formatCurrency(item.total)} · {formatTime(item.createdAt)}
            </span>
          </Link>
        ))}
      </div>
      {remaining > 0 ? (
        <p className="pt-1 text-center text-xs text-slate-500">
          {remaining} más
        </p>
      ) : null}
    </div>
  );
}

export default function EstadisticasPage() {
  useMockDBRefresh();
  const [periodFilter, setPeriodFilter] = useState<DashboardPeriodFilter>(
    DEFAULT_DASHBOARD_PERIOD,
  );

  const periodLabel = getDashboardPeriodLabel(periodFilter);
  const stats = getConsolidatedStatsForDashboardFilter(periodFilter);
  const businessStats = getBusinessStats();
  const topProducts = getTopProductsForDashboardFilter(periodFilter, 4);
  const leastSoldProducts = getLeastSoldProductsForDashboardFilter(
    periodFilter,
    4,
  );
  const ordersInPeriod = getOrdersForDashboardFilter(periodFilter);
  const purchasesInPeriod = getPurchasesForDashboardFilter(periodFilter);

  return (
    <>
      <Header title="Estadísticas" showBack backHref="/" />

      <div className="flex flex-col gap-3 px-4 py-4 pb-8">
        <div>
          <h2 className="mb-3 text-base font-bold text-slate-900">
            Consolidado
          </h2>

          <DashboardPeriodPicker
            value={periodFilter}
            onChange={setPeriodFilter}
            className="mb-4"
          />
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-10">
            <SummaryCard
              title="Ventas"
              rows={[
                { label: "Total", value: formatCurrency(stats.salesTotal) },
                {
                  label: "Por cobrar",
                  value: formatCurrency(stats.pendingCollect),
                },
              ]}
            />

            <SummaryCard
              title="Gastos/Compras"
              rows={[
                {
                  label: "Total",
                  value: formatCurrency(stats.purchasesTotal),
                },
                {
                  label: "Por pagar",
                  value: formatCurrency(stats.pendingPay),
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-7">
            <div className="bg-gradient-to-r h-[15vh] rounded-xl flex flex-col justify-center from-primary to-green-600 px-3.5 text-white">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <p className="font-semibold">Resumen del negocio</p>
              </div>
              <p className="mt-2 text-sm opacity-90">
                Datos actualizados en tiempo real
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-slate-500">
                Inventario y clientes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Package}
                  label="Productos"
                  value={String(businessStats.totalProducts)}
                  href="/productos"
                />
                <StatCard
                  icon={Users}
                  label="Clientes"
                  value={String(businessStats.totalCustomers)}
                  href="/opciones/clientes"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Agotados"
                  value={String(businessStats.outOfStock)}
                  color="text-danger"
                  href="/productos?stock=out"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Stock bajo"
                  value={String(businessStats.lowStock)}
                  color="text-warning"
                  href="/productos?stock=low"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card className="px-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Deudas</h3>
                  <Link href="/deudas" className="block text-sm text-primary">
                    Ver deudas
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Por cobrar</p>
                    <p className="font-bold text-warning">
                      {formatCurrency(stats.pendingCollect)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Por pagar</p>
                    <p className="font-bold text-slate-600">
                      {formatCurrency(stats.pendingPay)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <section className="flex flex-col gap-10">
              <ProductSalesList
                title="Productos más vendidos"
                periodLabel={periodLabel}
                items={topProducts}
                emptyMessage={`Sin ventas en ${periodLabel.toLowerCase()}`}
              />

              <ProductSalesList
                title="Productos menos vendidos"
                periodLabel={periodLabel}
                items={leastSoldProducts}
                emptyMessage="No hay productos para mostrar"
              />

              <PeriodTransactionList
                title="Ventas del periodo"
                periodLabel={periodLabel}
                viewAllHref="/ordenes"
                emptyMessage={`Sin ventas en ${periodLabel.toLowerCase()}`}
                items={ordersInPeriod.map((order) => ({
                  id: order.id,
                  href: `/ordenes/${order.id}`,
                  label: order.order_number,
                  total: order.total,
                  createdAt: order.created_at,
                }))}
              />

              <PeriodTransactionList
                title="Compras del periodo"
                periodLabel={periodLabel}
                viewAllHref="/ordenes?tab=purchase"
                emptyMessage={`Sin compras en ${periodLabel.toLowerCase()}`}
                items={purchasesInPeriod.map((purchase) => ({
                  id: purchase.id,
                  href: `/compras/ordenes/${purchase.id}`,
                  label: purchase.purchase_number,
                  total: purchase.total,
                  createdAt: purchase.created_at,
                }))}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
