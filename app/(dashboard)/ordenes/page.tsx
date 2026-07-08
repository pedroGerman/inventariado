"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { OrderListIcon } from "@/components/ordenes/OrderListIcon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField } from "@/components/ui/Input";
import { DateFilterPicker } from "@/components/ui/DateFilterPicker";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  OrderStatusFilterButton,
  OrderStatusFilterPills,
} from "@/components/ordenes/OrderStatusFilter";
import {
  getCustomers,
  getOrders,
  getPurchases,
  getSuppliers,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { isQuoteOrder, isQuotePurchase } from "@/lib/utils/pendingOrder";
import {
  getStatusFilterLabel,
  matchesStatusFilter,
  parseStatusFilterFromSearchParams,
  serializeStatusFilter,
  type OrderListTab,
} from "@/lib/utils/orderStatusFilter";
import {
  matchesDateFilter,
  sortDateKeysDesc,
  type DateFilterValue,
} from "@/lib/utils/calendarPicker";

export default function OrdenesPage() {
  return (
    <Suspense fallback={null}>
      <OrdenesPageContent />
    </Suspense>
  );
}

function OrdenesPageContent() {
  useMockDBRefresh();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<OrderListTab>("sale");
  const [filterDate, setFilterDate] = useState<DateFilterValue>(null);
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(() =>
    parseStatusFilterFromSearchParams(searchParams),
  );

  const orders = getOrders();
  const purchases = getPurchases();
  const customers = getCustomers();
  const suppliers = getSuppliers();

  useEffect(() => {
    if (searchParams.get("tab") === "purchase") {
      setTab("purchase");
    }
    setStatusFilters(parseStatusFilterFromSearchParams(searchParams));
  }, [searchParams]);

  function updateStatusFilters(next: Set<string>) {
    setStatusFilters(next);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("pending");

    const serialized = serializeStatusFilter(next);
    if (serialized) {
      params.set("status", serialized);
    } else {
      params.delete("status");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const isSale = tab === "sale";
  const query = search.trim().toLowerCase();

  const saleFiltered = useMemo(() => {
    return orders.filter((order) => {
      if (!matchesStatusFilter(order.status, statusFilters)) return false;
      if (!matchesDateFilter(order.date, filterDate)) return false;
      if (!query) return true;
      const customer = customers.find((c) => c.id === order.customer_id);
      return (
        order.order_number.toLowerCase().includes(query) ||
        (customer?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [orders, filterDate, query, customers, statusFilters]);

  const purchaseFiltered = useMemo(() => {
    return purchases.filter((purchase) => {
      if (!matchesStatusFilter(purchase.status, statusFilters)) return false;
      if (!matchesDateFilter(purchase.date, filterDate)) return false;
      if (!query) return true;
      const supplier = suppliers.find((s) => s.id === purchase.supplier_id);
      return (
        purchase.purchase_number.toLowerCase().includes(query) ||
        (supplier?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [purchases, filterDate, query, suppliers, statusFilters]);

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

  const emptyTitle = useMemo(() => {
    if (statusFilters.size > 0) {
      if (statusFilters.size === 1) {
        const label = getStatusFilterLabel(Array.from(statusFilters)[0], tab);
        return isSale
          ? `No hay órdenes ${label.toLowerCase()}s`
          : `No hay compras ${label.toLowerCase()}s`;
      }
      return isSale ? "No hay órdenes con esos filtros" : "No hay compras con esos filtros";
    }

    return isSale ? "No hay órdenes" : "No hay compras registradas";
  }, [isSale, statusFilters, tab]);

  const emptyDescription = useMemo(() => {
    if (statusFilters.size > 0) {
      return "Prueba con otro estado o limpia los filtros para ver todo el historial.";
    }

    return isSale
      ? "Las ventas completadas aparecerán aquí."
      : "Las órdenes de compra aparecerán aquí.";
  }, [isSale, statusFilters.size]);

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

          <OrderStatusFilterPills
            tab={tab}
            selected={statusFilters}
            onChange={updateStatusFilters}
          />

          <div className="flex items-stretch gap-2">
            <DateFilterPicker
              value={filterDate}
              onChange={setFilterDate}
              className="min-w-0 flex-1"
            />
            <OrderStatusFilterButton
              tab={tab}
              selected={statusFilters}
              onChange={updateStatusFilters}
            />
          </div>
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
                        href={
                          order.status === "pending" && isQuoteOrder(order)
                            ? `/ordenes/${order.id}/cotizacion`
                            : `/ordenes/${order.id}`
                        }
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <OrderListIcon
                          kind="sale"
                          status={order.status}
                          paymentMethod={order.payment_method}
                        />

                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm text-card-foreground">
                            {order.order_number}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {customer?.name ?? "Sin cliente"}
                          </p>
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
                        href={
                          purchase.status === "pending" && isQuotePurchase(purchase)
                            ? `/compras/ordenes/${purchase.id}/cotizacion`
                            : `/compras/ordenes/${purchase.id}`
                        }
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <OrderListIcon
                          kind="purchase"
                          status={purchase.status}
                          paymentMethod={purchase.payment_method}
                        />

                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm text-card-foreground">
                            {purchase.purchase_number}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {supplier?.name ?? "Sin proveedor"}
                          </p>
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
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>
    </>
  );
}
