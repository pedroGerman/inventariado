"use client";

import { useParams } from "next/navigation";
import { Ban, MoreHorizontal, Printer, RotateCcw, Share2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { getPurchase, getSuppliers } from "@/lib/mock/db";
import { mockEmployees } from "@/lib/mock/seed";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Anulada",
  pending: "Pendiente",
};

function DetailRow({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      {children ?? (
        <span className="text-right text-xs font-medium text-card-foreground">
          {value}
        </span>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  tone = "default",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  tone?: "default" | "danger";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors",
        tone === "danger"
          ? "text-destructive hover:bg-red-50"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function CompraDetallePage() {
  const { id } = useParams<{ id: string }>();
  const purchase = getPurchase(id);
  const suppliers = getSuppliers();

  if (!purchase) {
    return (
      <>
        <Header title="Compra" showBack backHref="/compras/ordenes" />
        <p className="py-12 text-center text-muted-foreground">Compra no encontrada</p>
      </>
    );
  }

  const supplier = suppliers.find((s) => s.id === purchase.supplier_id);
  const employee = mockEmployees.find((e) => e.id === purchase.employee_id);

  const statusVariant =
    purchase.status === "confirmed"
      ? "primary"
      : purchase.status === "cancelled"
        ? "danger"
        : "warning";

  const statusLabel = STATUS_LABELS[purchase.status] ?? purchase.status;
  const paymentLabel = getPaymentMethodLabel(purchase.payment_method);

  return (
    <>
      <Header
        title={purchase.purchase_number}
        showBack
        backHref="/compras/ordenes"
        right={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Imprimir recibo"
          >
            <Printer className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-4 py-4 pb-8">
        <div className="divide-y divide-border/50 px-1 py-1">
          <DetailRow
            label="Fecha"
            value={`${purchase.date} ${formatTime(purchase.created_at)}`}
          />
          <DetailRow label="Método de pago" value={paymentLabel} />
          <DetailRow label="Estado">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </DetailRow>
          {employee && <DetailRow label="Cajero" value={employee.name} />}
          {supplier && <DetailRow label="Proveedor" value={supplier.name} />}
        </div>

        <div className="flex flex-col gap-2 px-1">
          <h2 className="text-base font-semibold text-card-foreground">Productos</h2>
          <div className="divide-y divide-border/40">
            {purchase.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="text-card-foreground">
                  {item.name}{" "}
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-1 py-4">
          <CheckoutSummary
            subtotal={purchase.subtotal}
            tax={purchase.tax}
            discount={purchase.discount}
            total={purchase.total}
          />
        </div>

        <Card className="gap-0 !py-0">
          <CardContent className="grid grid-cols-4 !justify-between gap-1 !px-2 !py-1">
            <ActionButton icon={Share2} label="Compartir" />
            <ActionButton icon={RotateCcw} label="Devolución" />
            <ActionButton icon={Ban} label="Anular" tone="danger" />
            <ActionButton icon={MoreHorizontal} label="Más" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
