"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { getOrders, getCustomers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { TextField } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrdenesPage() {
  useMockDBRefresh();
  const orders = getOrders();
  const customers = getCustomers();
  const [filterDate, setFilterDate] = useState("");

  const filtered = filterDate
    ? orders.filter((o) => o.date === filterDate)
    : orders;

  const grouped = filtered.reduce<Record<string, typeof orders>>((acc, order) => {
    if (!acc[order.date]) acc[order.date] = [];
    acc[order.date].push(order);
    return acc;
  }, {});

  return (
    <>
      <Header title="Órdenes de Venta"/>
      <div className="px-4 py-3 flex flex-col gap-6">

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
            <Link href="/deudas" className="w-full">
              <Button className="!rounded-md w-full !text-xs " size="sm">
                Seleccionar fecha
              </Button>
            </Link>
            <Link href="/deudas" className="w-full">
              <Button className="!rounded-md w-full !text-xs " size="sm">
                Ir a deudas
              </Button>
            </Link>
          </div>
        </div>

        {Object.entries(grouped).map(([date, dateOrders]) => (
          <div key={date} className="flex flex-col gap-1">
            <h2 className="mb-2 text-sm font-semibold capitalize text-slate-500">
              {formatDateGroup(date)}
            </h2>
            <div className=" divide-y divide-slate-200 flex flex-col">
              {dateOrders.map((order) => {
                const customer = customers.find((c) => c.id === order.customer_id);
                return (
                  <div key={order.id} className="gap-0 py-4">
                    <Link
                      href={`/ordenes/${order.id}`}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 shadow-segmented-track">
                        {/* <Package className="h-6 w-6 text-muted-foreground" /> */}
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col">
                        <p className="truncate text-sm text-card-foreground">
                          {order.order_number}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="text-xs">{customer?.name}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col gap-1">
                        <p className="font-semibold text-xs text-slate-900">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {formatTime(order.created_at)}
                        </p>
                      </div>
                      {/* <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /> */}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState title="No hay órdenes" description="Las ventas completadas aparecerán aquí." />
        )}
      </div>
    </>
  );
}
