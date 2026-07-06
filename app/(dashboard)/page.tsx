"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  DollarSign,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { DashboardPeriodPicker } from "@/components/dashboard/DashboardPeriodPicker";
import { getBusiness, getAccountProfile } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useMounted } from "@/lib/hooks/useMounted";
import { useEmployeeStore } from "@/lib/store/employee";
import { isMockMode } from "@/lib/config";
import { getProfile } from "@/lib/profile/actions";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  DEFAULT_DASHBOARD_PERIOD,
  getDashboardPeriodLabel,
  getSalesSummaryForDashboardFilter,
  getTopProductsForDashboardFilter,
  type DashboardPeriodFilter,
} from "@/lib/utils/dashboardPeriod";
import { ProductCard } from "@/components/ventas/ProductCard";

export default function DashboardPage() {
  useMockDBRefresh();
  const mounted = useMounted();
  const current = useEmployeeStore((s) => s.current);
  const [concealedMetrics, setConcealedMetrics] = useState({
    salesTotal: true,
    pendingCollect: true,
    pendingPay: true,
  });
  const [periodFilter, setPeriodFilter] =
    useState<DashboardPeriodFilter>(DEFAULT_DASHBOARD_PERIOD);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      const remote = isMockMode() ? null : await getProfile();
      const profile = remote ?? getAccountProfile();
      setAvatarUrl(profile.avatar_url);
    }

    void loadAvatar();
    window.addEventListener("pos-db-updated", loadAvatar);
    return () => window.removeEventListener("pos-db-updated", loadAvatar);
  }, []);

  const business = mounted ? getBusiness() : null;
  const businessName = business?.name?.trim() || "Mi tienda";
  const periodLabel = getDashboardPeriodLabel(periodFilter);
  const summary = mounted
    ? getSalesSummaryForDashboardFilter(periodFilter)
    : {
      productsSold: 0,
      unitsSold: 0,
      salesTotal: 0,
      pendingCollect: 0,
      pendingPay: 0,
    };
  const topProducts = mounted
    ? getTopProductsForDashboardFilter(periodFilter, 6)
    : [];

  const formatAmount = (
    amount: number,
    key: keyof typeof concealedMetrics,
  ) => (concealedMetrics[key] ? "•••••" : formatCurrency(amount));

  function toggleConcealed(key: keyof typeof concealedMetrics) {
    setConcealedMetrics((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <>
      <Header
        businessName={businessName}
        employeeName={current?.name ?? "—"}
        employeeRole={current?.role ?? "—"}
        avatarUrl={avatarUrl}
      />

      <div className="flex flex-col gap-6 px-3 py-4">




        <section className="space-y-3">
          <DashboardPeriodPicker
            value={periodFilter}
            onChange={setPeriodFilter}
          />

          <div className="grid grid-cols-2 gap-3">
            <DashboardMetricCard
              icon={ShoppingBag}
              label="Productos vendidos"
              value={String(summary.productsSold)}
              sublabel={periodLabel}
              href="/ordenes"
            />
            <DashboardMetricCard
              icon={Package}
              label="Unidades vendidas"
              value={String(summary.unitsSold)}
              sublabel={periodLabel}
              href="/ordenes"
            />
            <DashboardMetricCard
              icon={DollarSign}
              label="Total ventas"
              value={formatAmount(summary.salesTotal, "salesTotal")}
              className="col-span-2"
              sublabel={periodLabel}
              href="/estadisticas"
              concealable
              concealed={concealedMetrics.salesTotal}
              onToggleConcealed={() => toggleConcealed("salesTotal")}
            />
            <DashboardMetricCard
              icon={Wallet}
              label="Por cobrar"
              value={formatAmount(summary.pendingCollect, "pendingCollect")}
              valueClassName="text-warning"
              sublabel="Pendiente"
              href="/deudas?tab=collect"
              concealable
              concealed={concealedMetrics.pendingCollect}
              onToggleConcealed={() => toggleConcealed("pendingCollect")}
            />
            <DashboardMetricCard
              icon={CalendarCheck}
              label="Por pagar"
              value={formatAmount(summary.pendingPay, "pendingPay")}
              sublabel="Pendiente"
              href="/deudas?tab=pay"
              concealable
              concealed={concealedMetrics.pendingPay}
              onToggleConcealed={() => toggleConcealed("pendingPay")}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <Link href="/estadisticas">
            <Card className="flex !flex-row items-center !py-5 justify-between px-3">
              <div>
                <h3 className="font-semibold text-sm">Ver Estadísticas</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ventas, compras, inventario y deudas
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
            </Card>
          </Link>

          <div className="flex items-center gap-3 justify-between">
            <Link href="/ventas" className="block w-full">
              <Button
                variant="success"
                fullWidth
                className="justify-between px-3 py-5"
                iconRight={<ArrowRight className="h-5 w-5" />}
              >
                Nueva venta
              </Button>
            </Link>

            <Link href="/compras" className="block w-full">
              <Button
                fullWidth
                className="justify-between px-3 py-5"
                iconRight={<ArrowRight className="h-5 w-5" />}
                variant="secondary"
              >
                Nueva Compra
              </Button>
            </Link>
          </div>
        </div>

        <section className="flex flex-col ">
          {topProducts.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center px-1 justify-between gap-3">
                <h3 className="text-sm font-semibold text-card-foreground">
                  Más vendidos
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {topProducts.map(({ product }) => (
                  <ProductCard key={product.id} product={product} readOnly />
                ))}
              </div>
            </div>
          ) : (
            <Card className="px-3">
              <div className="mb-1 flex flex-col gap-0.5">
                <h3 className="font-semibold text-sm">Más vendidos</h3>
                <p className="text-xs text-slate-500">{periodLabel}</p>
              </div>
              <p className="py-4 text-center text-sm text-slate-400">
                Sin ventas en {periodLabel.toLowerCase()}
              </p>
            </Card>
          )}
        </section>

        {/* <Card className="px-4 flex flex-col !gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Caja</h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="text-xs text-muted-foreground">Sin abrir</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Cajero: {current?.name ?? "—"}
          </p>
        </Card> */}
      </div>
    </>
  );
}
