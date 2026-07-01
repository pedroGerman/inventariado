"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { getCustomers, getSuppliers, getDebts } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { ContactRow } from "@/components/clientes/ContactRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";

function SummaryMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums text-card-foreground",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function ClientesPage() {
  useMockDBRefresh();
  const router = useRouter();
  const [tab, setTab] = useState<"customers" | "suppliers">("customers");
  const customers = getCustomers();
  const suppliers = getSuppliers();
  const debts = getDebts();

  const porCobrar = debts.reduce((s, d) => s + d.remaining, 0);
  const deudores = debts.filter((d) => d.remaining > 0).length;
  const isCustomers = tab === "customers";
  const list = isCustomers ? customers : suppliers;

  return (
    <>
      <Header title="Clientes / Proveedores" showBack backHref="/opciones" />

      <div className="flex flex-col gap-7 px-4 py-4 pb-28">
        <SegmentedControl
          aria-label="Tipo de contacto"
          value={tab}
          onChange={setTab}
          options={[
            { value: "customers", label: "Clientes" },
            { value: "suppliers", label: "Proveedores" },
          ]}
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">Resumen</h2>
          <Card className="gap-0 !py-0">
            <CardContent className="!px-5 !py-4">
              {isCustomers ? (
                <div className="grid grid-cols-3 gap-3">
                  <SummaryMetric
                    label="Total clientes"
                    value={customers.length}
                  />
                  <SummaryMetric
                    label="Por cobrar"
                    value={formatCurrency(porCobrar)}
                    tone="warning"
                  />
                  <SummaryMetric label="Deudores" value={deudores} />
                </div>
              ) : (
                <SummaryMetric
                  label="Total proveedores"
                  value={suppliers.length}
                />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">
            {isCustomers ? "Directorio de clientes" : "Directorio de proveedores"}
          </h2>
            <div className="px-1">
              {list.length === 0 ? (
                <EmptyState
                  title={
                    isCustomers
                      ? "No hay clientes registrados"
                      : "No hay proveedores registrados"
                  }
                  description={
                    isCustomers
                      ? "Usa el botón + para agregar un cliente."
                      : "Usa el botón + para agregar un proveedor."
                  }
                />
              ) : (
                <div className="divide-y divide-border/50">
                  {list.map((item) => (
                    <ContactRow
                      key={item.id}
                      name={item.name}
                      phone={item.phone}
                      tone={isCustomers ? "success" : "danger"}
                    />
                  ))}
                </div>
              )}
            </div>
        </section>
      </div>

      <Button
        type="button"
        variant="success"
        size="icon"
        className="fixed bottom-24 right-4 z-10 size-10 rounded-full shadow-button-tone-green-rest"
        aria-label={isCustomers ? "Nuevo cliente" : "Nuevo proveedor"}
        onClick={() =>
          router.push(
            isCustomers
              ? "/opciones/clientes/nuevo"
              : "/opciones/clientes/nuevo-proveedor",
          )
        }
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}
