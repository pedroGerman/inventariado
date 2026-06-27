"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Ban, MoreHorizontal, Printer, RotateCcw, Share2, Wallet } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { getOrder, getCustomers, getDebtByOrderId } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";
import { mockEmployees } from "@/lib/mock/seed";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Anulada",
  pending: "Pendiente",
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  pay_all: "Pagar todo",
  deposit: "Abonar",
  pay_later: "Pagar después",
  split: "Dividir cuenta",
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

export default function OrdenDetallePage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const order = getOrder(id);
  const customers = getCustomers();
  const debt = order ? getDebtByOrderId(order.id) : undefined;

  if (!order) {
    return (
      <>
        <Header title="Orden" showBack backHref="/ordenes" />
        <p className="py-12 text-center text-muted-foreground">Orden no encontrada</p>
      </>
    );
  }

  const customer = customers.find((c) => c.id === order.customer_id);
  const employee = mockEmployees.find((e) => e.id === order.employee_id);

  const statusVariant =
    order.status === "confirmed"
      ? "primary"
      : order.status === "cancelled"
        ? "danger"
        : "warning";

  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const paymentLabel = getPaymentMethodLabel(order.payment_method);

  return (
    <>
      <Header
        title={order.order_number}
        showBack
        backHref="/ordenes"
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
              value={`${order.date} ${formatTime(order.created_at)}`}
            />
            <DetailRow label="Método de pago" value={paymentLabel} />
            <DetailRow
              label="Modo de pago"
              value={PAYMENT_TYPE_LABELS[order.payment_type] ?? order.payment_type}
            />
            <DetailRow label="Estado">
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </DetailRow>
            {employee && <DetailRow label="Cajero" value={employee.name} />}
            {customer && <DetailRow label="Cliente" value={customer.name} />}
          </div>

        <div className="flex flex-col gap-2 px-1">
          <h2 className="text-base font-semibold text-card-foreground">
            Productos
          </h2>
            <div className="divide-y divide-border/40 ">
              {order.items?.map((item) => (
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
              subtotal={order.subtotal}
              tax={order.tax}
              service={order.service}
              discount={order.discount}
              total={order.total}
            />
            {order.cash_received != null && (
              <div className="flex flex-col gap-2 border-t border-border/50 pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Efectivo recibido</span>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                    {formatCurrency(order.cash_received)}
                  </span>
                </div>
                {(order.change ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cambio</span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                      {formatCurrency(order.change ?? 0)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {debt && debt.remaining > 0 && (
              <Link
                href={`/deudas/${debt.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm transition-colors hover:bg-amber-100"
              >
                <span className="inline-flex items-center gap-2 font-medium text-amber-900">
                  <Wallet className="h-4 w-4 shrink-0" />
                  Saldo pendiente
                </span>
                <span className="font-bold tabular-nums text-warning">
                  {formatCurrency(debt.remaining)}
                </span>
              </Link>
            )}
            {debt && debt.paid > 0 && debt.remaining > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Abonado</span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                  {formatCurrency(debt.paid)}
                </span>
              </div>
            )}
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
