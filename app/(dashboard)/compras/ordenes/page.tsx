"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { getPurchases, getSuppliers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ComprasOrdenesPage() {
  useMockDBRefresh();
  const purchases = getPurchases();
  const suppliers = getSuppliers();
  const [filterDate, setFilterDate] = useState("");

  const filtered = filterDate
    ? purchases.filter((p) => p.date === filterDate)
    : purchases;

  const grouped = filtered.reduce<Record<string, typeof purchases>>((acc, purchase) => {
    if (!acc[purchase.date]) acc[purchase.date] = [];
    acc[purchase.date].push(purchase);
    return acc;
  }, {});

  return (
    <>
      <Header title="Órdenes de Compra" subtitle="Registro histórico" showBack backHref="/compras" />

      <div className="flex flex-col gap-6 px-4 py-3">
        <div className="flex flex-col gap-3">
          <TextField
            type="text"
            leftIcon={<Search className="h-4 w-4" />}
            value={filterDate}
            className="placeholder:text-sm"
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Buscar"
          />

          <div className="flex items-center justify-between gap-3">
            <Link href="/compras" className="w-full">
              <Button className="w-full !rounded-md !text-xs" size="sm">
                Seleccionar fecha
              </Button>
            </Link>
            <Link href="/compras" className="w-full">
              <Button className="w-full !rounded-md !text-xs" size="sm">
                Ir a compras
              </Button>
            </Link>
          </div>
        </div>

        {Object.entries(grouped).map(([date, datePurchases]) => (
          <div key={date} className="mb-6 flex flex-col gap-1">
            <h2 className="mb-2 text-sm font-semibold capitalize text-slate-500">
              {formatDateGroup(date)}
            </h2>
            <div className="flex flex-col divide-y divide-slate-200">
              {datePurchases.map((purchase) => {
                const supplier = suppliers.find((s) => s.id === purchase.supplier_id);
                return (
                  <div key={purchase.id} className="gap-0 py-5">
                    <Link
                      href={`/compras/ordenes/${purchase.id}`}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 shadow-segmented-track">
                        <ShoppingBag className="h-5 w-5 text-danger" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-sm text-card-foreground">
                          {purchase.purchase_number}
                        </p>
                        {supplier && (
                          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{supplier.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-right">
                        <p className="text-xs font-semibold text-slate-900">
                          {formatCurrency(purchase.total)}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {formatTime(purchase.created_at)}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            title="No hay compras registradas"
            description="Las órdenes de compra aparecerán aquí."
          />
        )}
      </div>
    </>
  );
}
