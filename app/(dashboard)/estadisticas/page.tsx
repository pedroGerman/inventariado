"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import {
  getConsolidatedStats,
  getPeriodLabels,
  getBusinessStats,
  getTopProducts,
  getOrdersInPeriod,
  getPurchasesInPeriod,
  getActivePeriodLabel,
  type StatsPeriod,
} from "@/lib/utils/stats";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const PERIOD_TABS: { id: StatsPeriod; label: string }[] = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
];

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
    // <Card className="overflow-hidden px-3.5 !gap-3">
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
            <span className="text-sm shrink-0 font-medium tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
    // </Card>
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

export default function EstadisticasPage() {
  useMockDBRefresh();
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [rangeOffset, setRangeOffset] = useState(0);

  const stats = getConsolidatedStats(period, rangeOffset);
  const businessStats = getBusinessStats();
  const topProducts = getTopProducts(period, rangeOffset);
  const ordersInPeriod = getOrdersInPeriod(period, rangeOffset);
  const purchasesInPeriod = getPurchasesInPeriod(period, rangeOffset);
  const [currentLabel, previousLabel] = getPeriodLabels(period);
  const activePeriodLabel = getActivePeriodLabel(period, rangeOffset);

  function handlePeriodChange(next: StatsPeriod) {
    setPeriod(next);
    setRangeOffset(0);
  }

  return (
    <>
      <Header title="Estadísticas" showBack backHref="/" />

      <div className="flex flex-col gap-3 px-4 py-4 pb-8">
        {/* Punto de venta */}
        {/* <Card>
          <p className="text-sm font-semibold text-slate-800">Punto de venta</p>
          <p className="mt-0.5 text-xl font-bold text-slate-900">Principal</p>
        </Card> */}

        {/* Consolidado — diseño del cliente */}
        <div>
          <h2 className="mb-3 text-base font-bold text-slate-900">Consolidado</h2>

          <SegmentedControl
            aria-label="Periodo"
            className="mb-3"
            value={period}
            onChange={handlePeriodChange}
            options={PERIOD_TABS.map((tab) => ({
              value: tab.id,
              label: tab.label,
            }))}
          />

          <div className="mb-4 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full"
              disabled={rangeOffset >= 1}
              onClick={() => setRangeOffset((o) => Math.min(o + 1, 1))}
              aria-label="Periodo anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <SegmentedControl
              aria-label="Rango del periodo"
              className="flex-1"
              size="sm"
              value={rangeOffset}
              onChange={setRangeOffset}
              options={[
                { value: 0, label: currentLabel },
                { value: 1, label: previousLabel },
              ]}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full"
              disabled={rangeOffset <= 0}
              onClick={() => setRangeOffset((o) => Math.max(o - 1, 0))}
              aria-label="Periodo siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-10">
            <SummaryCard
              title="Ventas"
              // titleClass="text-primary"
              rows={[
                { label: "Total", value: formatCurrency(stats.salesTotal) },
                { label: "Por cobrar", value: formatCurrency(stats.pendingCollect) },
              ]}
            />

            <SummaryCard
              title="Gastos/Compras"
              // titleClass="text-danger"
              rows={[
                { label: "Total", value: formatCurrency(stats.purchasesTotal) },
                { label: "Por pagar", value: formatCurrency(stats.pendingPay) },
              ]}
            />
          </div>

          {/* Secciones adicionales (contenido previo) */}
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
              <h2 className="text-sm font-semibold text-slate-500">Inventario y clientes</h2>
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
                  href="/productos"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Stock bajo"
                  value={String(businessStats.lowStock)}
                  color="text-warning"
                  href="/productos"
                />
              </div>
            </div>


            <div className="flex flex-col gap-3">
              {/* <div>
          <h2 className="text-sm font-semibold text-slate-500">
            Deudas
          </h2>
          <Link href="/deudas" className="block text-sm text-primary">
            Ver deudas
          </Link>
          </div> */}
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

            {topProducts.length > 0 ? (
              <div className="flex flex-col gap-2 px-1">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-semibold text-card-foreground">
                    Productos más vendidos
                  </h2>
                  <p className="text-xs text-slate-500">{activePeriodLabel}</p>
                </div>
                <div className="divide-y divide-border/40">
                  {topProducts.map(({ product, sold, revenue }) => (
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
            ) : (
              <Card className="px-3.5">
                <div className="mb-1 flex flex-col gap-0.5">
                  <h3 className="font-semibold text-sm">Productos más vendidos</h3>
                  <p className="text-xs text-slate-500">{activePeriodLabel}</p>
                </div>
                <p className="py-4 text-center text-sm text-slate-400">
                  Sin ventas en {activePeriodLabel.toLowerCase()}
                </p>
              </Card>
            )}

            {ordersInPeriod.length > 0 ? (
              <div className="flex flex-col gap-2 px-1">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-semibold text-card-foreground">
                    Ventas del periodo
                  </h2>
                  <p className="text-xs text-slate-500">{activePeriodLabel}</p>
                </div>
                <div className="divide-y divide-border/40">
                  {ordersInPeriod.map((o) => (
                    <Link
                      key={o.id}
                      href={`/ordenes/${o.id}`}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <span className="font-medium text-card-foreground">
                        {o.order_number}
                      </span>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                        {formatCurrency(o.total)} · {formatTime(o.created_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="px-3.5">
                <div className="mb-1 flex flex-col gap-0.5">
                  <h3 className="font-semibold text-sm">Ventas del periodo</h3>
                  <p className="text-xs text-slate-500">{activePeriodLabel}</p>
                </div>
                <p className="py-4 text-center text-sm text-slate-400">
                  Sin ventas en {activePeriodLabel.toLowerCase()}
                </p>
              </Card>
            )}

            {purchasesInPeriod.length > 0 && (
              <Card className="px-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-danger" />
                  <h3 className="font-semibold">Compras del periodo</h3>
                  <p className="text-xs text-slate-500">{activePeriodLabel}</p>
                </div>
                {purchasesInPeriod.map((p) => (
                  <Link
                    key={p.id}
                    href={`/compras/ordenes/${p.id}`}
                    className="flex justify-between border-b border-slate-50 py-2 text-sm last:border-0 hover:text-danger"
                  >
                    <span>{p.purchase_number}</span>
                    <span>
                      {formatCurrency(p.total)} · {formatTime(p.created_at)}
                    </span>
                  </Link>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
