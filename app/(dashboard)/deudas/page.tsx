"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  getDebts,
  getOrders,
  getPurchases,
  getCustomers,
  getSuppliers,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { ffElevatedMetricSurfaceClass } from "@/lib/utils/ff-surfaces";
import type { Debt } from "@/lib/types/database";

type DebtTab = "collect" | "pay";

export default function DeudasPage() {
  return (
    <Suspense fallback={null}>
      <DeudasPageContent />
    </Suspense>
  );
}

function DeudasPageContent() {
  useMockDBRefresh();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<DebtTab>("collect");
  const [concealed, setConcealed] = useState(true);

  const debts = getDebts();
  const orders = getOrders();
  const purchases = getPurchases();
  const customers = getCustomers();
  const suppliers = getSuppliers();

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested === "pay" || requested === "purchase") {
      setTab("pay");
    } else if (requested === "collect" || requested === "sale") {
      setTab("collect");
    }
  }, [searchParams]);

  const isCollect = tab === "collect";
  const collectDebts = debts.filter((d) => d.kind === "collect" && d.remaining > 0);
  const payDebts = debts.filter((d) => d.kind === "pay" && d.remaining > 0);
  const displayDebts = isCollect ? collectDebts : payDebts;

  const pendingCollect = collectDebts.reduce((s, d) => s + d.remaining, 0);
  const pendingPay = payDebts.reduce((s, d) => s + d.remaining, 0);
  const pendingTotal = isCollect ? pendingCollect : pendingPay;

  const grouped = displayDebts.reduce<Record<string, Debt[]>>((acc, debt) => {
    const date = debt.created_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(debt);
    return acc;
  }, {});

  return (
    <>
      <Header title={isCollect ? "Deudas por cobrar" : "Deudas por pagar"} />

      <div className="flex flex-col gap-6 px-3 py-3">
        <SegmentedControl
          aria-label="Tipo de deuda"
          value={tab}
          onChange={setTab}
          options={[
            { value: "collect", label: "Por cobrar" },
            { value: "pay", label: "Por pagar" },
          ]}
        />

        <div
          className={cn(
            "w-full rounded-xl px-3.5 py-4",
            isCollect
              ? "border-0 bg-[var(--button-warning-border-hover)] text-white shadow-button-tone-orange-hover"
              : cn(
                  ffElevatedMetricSurfaceClass,
                  "bg-surface-2 text-card-foreground shadow-card-edge",
                ),
          )}
        >
          <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1">
            <div
              className={cn(
                "col-start-1 row-span-2 flex size-12 shrink-0 items-center justify-center rounded-full shadow-segmented-track",
                isCollect ? "bg-white/25" : "bg-surface-3",
              )}
            >
              <Wallet
                className={cn(
                  "h-6 w-6",
                  isCollect ? "text-white" : "text-muted-foreground",
                )}
              />
            </div>
            <p
              className={cn(
                "col-start-2 row-start-1 text-sm font-medium",
                isCollect ? "text-white/90" : "text-muted-foreground",
              )}
            >
              {isCollect ? "Pendiente por cobrar" : "Pendiente por pagar"}
            </p>
            <p
              className={cn(
                "col-start-2 row-start-2 text-lg font-bold tabular-nums",
                isCollect ? "text-white" : "text-card-foreground",
              )}
            >
              {concealed ? "•••••" : formatCurrency(pendingTotal)}
            </p>
            <button
              type="button"
              aria-label={
                concealed ? "Mostrar monto pendiente" : "Ocultar monto pendiente"
              }
              onClick={() => setConcealed((v) => !v)}
              className={cn(
                "col-start-3 row-start-2 rounded-full p-1",
                isCollect
                  ? "text-white/80 hover:bg-white/20 hover:text-white"
                  : "text-muted-foreground hover:bg-surface-3",
              )}
            >
              {concealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {Object.entries(grouped).map(([date, dateDebts]) => (
          <div key={date} className="flex flex-col gap-1">
            <h2 className="mb-2 text-sm font-semibold capitalize text-slate-500">
              {formatDateGroup(date)}
            </h2>
            <div className="flex flex-col divide-y divide-slate-200">
              {dateDebts.map((debt) => {
                if (debt.kind === "pay") {
                  const purchase = purchases.find((p) => p.id === debt.purchase_id);
                  const supplier = suppliers.find((s) => s.id === debt.supplier_id);
                  return (
                    <div key={debt.id} className="py-5">
                      <Link
                        href={`/deudas/${debt.id}`}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 shadow-segmented-track">
                          <Wallet className="h-5 w-5 text-danger" />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm text-card-foreground">
                            {purchase?.purchase_number ?? "—"}
                          </p>
                          <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                            <span>{supplier?.name ?? "Sin proveedor"}</span>
                            <span className="font-medium text-danger">
                              Por pagar: {formatCurrency(debt.remaining)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-right">
                          <p className="text-xs font-semibold tabular-nums text-slate-900">
                            {formatCurrency(debt.total)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatTime(debt.created_at)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                }

                const order = orders.find((o) => o.id === debt.order_id);
                const customer = customers.find((c) => c.id === debt.customer_id);
                return (
                  <div key={debt.id} className="py-5">
                    <Link
                      href={`/deudas/${debt.id}`}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 shadow-segmented-track">
                        <Wallet className="h-5 w-5 text-warning" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-sm text-card-foreground">
                          {order?.order_number ?? "—"}
                        </p>
                        <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>{customer?.name ?? "Sin cliente"}</span>
                          <span className="font-medium text-warning">
                            Por cobrar: {formatCurrency(debt.remaining)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-right">
                        <p className="text-xs font-semibold tabular-nums text-slate-900">
                          {formatCurrency(debt.total)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTime(debt.created_at)}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {displayDebts.length === 0 && (
          <EmptyState
            title={
              isCollect
                ? "No hay deudas pendientes por cobrar"
                : "No hay deudas por pagar"
            }
          />
        )}
      </div>
    </>
  );
}
