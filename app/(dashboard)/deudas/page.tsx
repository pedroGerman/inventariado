"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { getDebts, getOrders, getCustomers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { ffElevatedWarningSurfaceClass } from "@/lib/utils/ff-surfaces";

type DebtTab = "collect" | "pay";

export default function DeudasPage() {
  useMockDBRefresh();
  const [tab, setTab] = useState<DebtTab>("collect");
  const [hideCollect, setHideCollect] = useState(true);
  const [hidePay, setHidePay] = useState(true);
  const debts = getDebts();
  const orders = getOrders();
  const customers = getCustomers();

  const pendingCollect = debts.reduce((s, d) => s + d.remaining, 0);
  const pendingPay = 0;

  const displayDebts =
    tab === "collect"
      ? debts.filter((d) => d.remaining > 0)
      : [];

  const grouped = displayDebts.reduce<Record<string, typeof debts>>((acc, debt) => {
    const date = debt.created_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(debt);
    return acc;
  }, {});

  return (
    <>
      <Header title="Deudas" />

      <div className="flex flex-col gap-6 px-4 py-3">
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "w-full px-4 py-4",
              ffElevatedWarningSurfaceClass,
              tab === "collect"
                ? "bg-[var(--button-warning-border-hover)] text-white shadow-button-tone-orange-hover"
                : "text-[var(--button-warning-foreground)]",
            )}
          >
            <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={() => setTab("collect")}
                aria-pressed={tab === "collect"}
                className="col-start-1 row-span-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-white/25 shadow-segmented-track"
              >
                <Wallet
                  className={cn(
                    "h-6 w-6",
                    tab === "collect" ? "text-white" : "text-warning",
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => setTab("collect")}
                aria-pressed={tab === "collect"}
                className={cn(
                  "col-start-2 row-start-1 text-left text-sm font-medium",
                  tab === "collect"
                    ? "text-white/90"
                    : "text-[var(--button-warning-foreground)]",
                )}
              >
                Pendiente por cobrar
              </button>
              <button
                type="button"
                onClick={() => setTab("collect")}
                aria-pressed={tab === "collect"}
                className={cn(
                  "col-start-2 row-start-2 text-left text-lg font-bold tabular-nums",
                  tab === "collect" ? "text-white" : "text-warning",
                )}
              >
                {hideCollect ? "•••••" : formatCurrency(pendingCollect)}
              </button>
              <button
                type="button"
                aria-label={
                  hideCollect ? "Mostrar monto por cobrar" : "Ocultar monto por cobrar"
                }
                onClick={() => setHideCollect((v) => !v)}
                className={cn(
                  "col-start-3 row-start-2 rounded-full p-1",
                  tab === "collect"
                    ? "text-white/80 hover:bg-white/20 hover:text-white"
                    : "text-[var(--button-warning-foreground)]/80 hover:bg-white/20 hover:opacity-100",
                )}
              >
                {hideCollect ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div
            className={cn(
              "w-full rounded-xl border-0 bg-surface-2 px-4 py-4 shadow-card-edge transition-[box-shadow]",
              tab === "pay"
                ? "shadow-overview-metric ring-2 ring-primary/20"
                : "hover:shadow-overview-metric",
            )}
          >
            <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={() => setTab("pay")}
                aria-pressed={tab === "pay"}
                className="col-start-1 row-span-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-3"
              >
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => setTab("pay")}
                aria-pressed={tab === "pay"}
                className="col-start-2 row-start-1 text-left text-sm text-muted-foreground"
              >
                Pendiente por pagar
              </button>
              <button
                type="button"
                onClick={() => setTab("pay")}
                aria-pressed={tab === "pay"}
                className="col-start-2 row-start-2 text-left text-lg font-bold tabular-nums text-card-foreground"
              >
                {hidePay ? "•••••" : formatCurrency(pendingPay)}
              </button>
              <button
                type="button"
                aria-label={
                  hidePay ? "Mostrar monto por pagar" : "Ocultar monto por pagar"
                }
                onClick={() => setHidePay((v) => !v)}
                className="col-start-3 row-start-2 rounded-full p-1 text-muted-foreground hover:bg-surface-3"
              >
                {hidePay ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {Object.entries(grouped).map(([date, dateDebts]) => (
          <div key={date} className="flex flex-col gap-1">
            <h2 className="mb-2 text-sm font-semibold capitalize text-slate-500">
              {formatDateGroup(date)}
            </h2>
            <div className="flex flex-col divide-y divide-slate-200">
              {dateDebts.map((debt) => {
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
          <p className="py-12 text-center text-muted-foreground">
            {tab === "pay"
              ? "No hay deudas por pagar"
              : "No hay deudas pendientes por cobrar"}
          </p>
        )}
      </div>
    </>
  );
}
