"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronRight, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  deleteCustomer,
  deleteSupplier,
  getCustomers,
  getSuppliers,
  getDebts,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useCheckoutStore } from "@/lib/store/checkout";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatPhoneDisplay } from "@/lib/utils/phone";
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

function ContactRow({
  name,
  phone,
  href,
  tone = "success",
  deleteLabel,
  onDelete,
}: {
  name: string;
  phone?: string | null;
  href: string;
  tone?: "success" | "danger";
  deleteLabel: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-3 py-3.5 transition-colors hover:bg-surface-2/60"
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            tone === "success"
              ? "bg-primary/10 text-[var(--button-success)]"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-card-foreground">
            {name}
          </p>
          {phone ? (
            <p className="text-xs text-muted-foreground">
              {formatPhoneDisplay(phone)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sin teléfono</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
      <button
        type="button"
        aria-label={deleteLabel}
        onClick={onDelete}
        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ClientesPage() {
  useMockDBRefresh();
  const router = useRouter();
  const [tab, setTab] = useState<"customers" | "suppliers">("customers");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const customers = getCustomers();
  const suppliers = getSuppliers();
  const debts = getDebts();

  const porCobrar = debts
    .filter((d) => d.kind === "collect")
    .reduce((s, d) => s + d.remaining, 0);
  const deudores = debts.filter(
    (d) => d.kind === "collect" && d.remaining > 0,
  ).length;
  const isCustomers = tab === "customers";
  const list = isCustomers ? customers : suppliers;
  const kindLabel = isCustomers ? "cliente" : "proveedor";

  async function handleDelete() {
    if (!pendingDelete || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      if (isCustomers) {
        await deleteCustomer(pendingDelete.id);
        const checkout = useCheckoutStore.getState();
        if (checkout.customer?.id === pendingDelete.id) {
          checkout.setCustomer(null);
        }
      } else {
        await deleteSupplier(pendingDelete.id);
        const checkout = useCheckoutStore.getState();
        if (checkout.supplier?.id === pendingDelete.id) {
          checkout.setSupplier(null);
        }
      }
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : `No se pudo eliminar el ${kindLabel}.`,
      );
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Header title="Clientes / Proveedores" showBack backHref="/opciones" />

      <div className="flex flex-col gap-7 px-3 py-4 pb-28">
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
            <CardContent className="!px-3.5 !py-4">
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
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {isCustomers
                    ? "No hay clientes registrados"
                    : "No hay proveedores registrados"}
                </p>
              ) : (
                <div className="divide-y divide-border/50">
                  {list.map((item) => (
                    <ContactRow
                      key={item.id}
                      name={item.name}
                      phone={item.phone}
                      href={
                        isCustomers
                          ? `/opciones/clientes/${item.id}`
                          : `/opciones/clientes/proveedor/${item.id}`
                      }
                      tone={isCustomers ? "success" : "danger"}
                      deleteLabel={`Eliminar ${kindLabel} ${item.name}`}
                      onDelete={() => {
                        setDeleteError(null);
                        setPendingDelete({ id: item.id, name: item.name });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {deleteError ? (
              <p className="text-center text-xs text-destructive">{deleteError}</p>
            ) : null}
        </section>
      </div>

      <ConfirmDeleteModal
        open={pendingDelete != null}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={() => void handleDelete()}
        loading={deleting}
        title={isCustomers ? "Eliminar cliente" : "Eliminar proveedor"}
        confirmLabel={
          isCustomers ? "Sí, eliminar cliente" : "Sí, eliminar proveedor"
        }
        description={
          pendingDelete ? (
            <>
              ¿Eliminar{" "}
              <span className="font-semibold text-card-foreground">
                {pendingDelete.name}
              </span>
              ? Se quitará del directorio y no podrás recuperarlo.
            </>
          ) : null
        }
      />

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
