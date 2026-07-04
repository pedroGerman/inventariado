"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DollarSign, Search, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField } from "@/components/ui/Input";
import { DateFilterPicker } from "@/components/ui/DateFilterPicker";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getCustomers,
  getOrders,
  getPurchases,
  getSuppliers,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { sortDateKeysDesc, type DateFilterValue } from "@/lib/utils/calendarPicker";

type OrderTab = "sale" | "purchase";

export default function OrdenesPage() {
  return (
    <Suspense fallback={null}>
      <OrdenesPageContent />
    </Suspense>
  );
}

function OrdenesPageContent() {
  useMockDBRefresh();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<OrderTab>("sale");
  const [filterDate, setFilterDate] = useState<DateFilterValue>(null);
  const [search, setSearch] = useState("");

  const orders = getOrders();
  const purchases = getPurchases();
  const customers = getCustomers();
  const suppliers = getSuppliers();

  useEffect(() => {
    if (searchParams.get("tab") === "purchase") {
      setTab("purchase");
    }
  }, [searchParams]);

  const isSale = tab === "sale";
  const query = search.trim().toLowerCase();

  const saleFiltered = useMemo(() => {
    return orders.filter((order) => {
      if (filterDate && order.date !== filterDate) return false;
      if (!query) return true;
      const customer = customers.find((c) => c.id === order.customer_id);
      return (
        order.order_number.toLowerCase().includes(query) ||
        (customer?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [orders, filterDate, query, customers]);

  const purchaseFiltered = useMemo(() => {
    return purchases.filter((purchase) => {
      if (filterDate && purchase.date !== filterDate) return false;
      if (!query) return true;
      const supplier = suppliers.find((s) => s.id === purchase.supplier_id);
      return (
        purchase.purchase_number.toLowerCase().includes(query) ||
        (supplier?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [purchases, filterDate, query, suppliers]);

  const filtered = isSale ? saleFiltered : purchaseFiltered;

  const groupedEntries = useMemo(() => {
    if (isSale) {
      const grouped = saleFiltered.reduce<Record<string, typeof saleFiltered>>(
        (acc, order) => {
          if (!acc[order.date]) acc[order.date] = [];
          acc[order.date].push(order);
          return acc;
        },
        {},
      );

      return sortDateKeysDesc(Object.keys(grouped)).map(
        (date) =>
          [
            date,
            grouped[date].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ),
          ] as const,
      );
    }

    const grouped = purchaseFiltered.reduce<
      Record<string, typeof purchaseFiltered>
    >((acc, purchase) => {
      if (!acc[purchase.date]) acc[purchase.date] = [];
      acc[purchase.date].push(purchase);
      return acc;
    }, {});

    return sortDateKeysDesc(Object.keys(grouped)).map(
      (date) =>
        [
          date,
          grouped[date].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        ] as const,
    );
  }, [isSale, saleFiltered, purchaseFiltered]);

  return (
    <>
      <Header title={isSale ? "Órdenes de Venta" : "Órdenes de Compra"} />

      <div className="flex flex-col gap-6 px-3 py-3">
        <SegmentedControl
          aria-label="Tipo de orden"
          value={tab}
          onChange={setTab}
          options={[
            { value: "sale", label: "Ventas" },
            { value: "purchase", label: "Compras" },
          ]}
        />

        <div className="flex flex-col gap-3">

          <TextField
            type="text"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            className="placeholder:text-sm"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar"
          />
          <DateFilterPicker value={filterDate} onChange={setFilterDate} />
        </div>

        {groupedEntries.map(([date, dateItems]) => (
          <div key={date} className="flex flex-col gap-1">
            <h2 className="mb-2 text-sm font-semibold capitalize text-slate-500">
              {formatDateGroup(date)}
            </h2>
            <div className="flex flex-col divide-y divide-slate-200">
              {isSale
                ? (dateItems as typeof saleFiltered).map((order) => {
                  const customer = customers.find(
                    (c) => c.id === order.customer_id,
                  );
                  return (
                    <div key={order.id} className="gap-0 py-4">
                      <Link
                        href={`/ordenes/${order.id}`}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 shadow-segmented-track">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm text-card-foreground">
                            {order.order_number}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{customer?.name ?? "Sin cliente"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-right">
                          <p className="text-xs font-semibold text-slate-900">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {formatTime(order.created_at)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })
                : (dateItems as typeof purchaseFiltered).map((purchase) => {
                  const supplier = suppliers.find(
                    (s) => s.id === purchase.supplier_id,
                  );
                  return (
                    <div key={purchase.id} className="gap-0 py-4">
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
                          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{supplier?.name ?? "Sin proveedor"}</span>
                          </div>
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
            title={isSale ? "No hay órdenes" : "No hay compras registradas"}
            description={
              isSale
                ? "Las ventas completadas aparecerán aquí."
                : "Las órdenes de compra aparecerán aquí."
            }
          />
        )}
      </div>
    </>
  );
}
