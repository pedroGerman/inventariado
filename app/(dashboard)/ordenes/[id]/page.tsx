"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Play, Printer, Wallet } from "lucide-react";
import { SaleOrderDetailActions, useSaleOrderDownloadPdf } from "@/components/ordenes/SaleOrderDetailActions";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { getOrder, getCustomers, getDebtByOrderId } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";
import { mockEmployees } from "@/lib/mock/seed";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { getPendingKindLabel, isQuoteOrder } from "@/lib/utils/pendingOrder";
import { useResumeSaleOrder } from "@/lib/hooks/useResumePending";
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

export default function OrdenDetallePage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const { resume } = useResumeSaleOrder();
  const order = getOrder(id);
  const customers = getCustomers();
  const debt = order ? getDebtByOrderId(order.id) : undefined;
  const customer = order
    ? customers.find((c) => c.id === order.customer_id)
    : undefined;
  const employee = order
    ? mockEmployees.find((e) => e.id === order.employee_id)
    : undefined;
  const { downloadPdf, downloading: downloadingPdf } = useSaleOrderDownloadPdf({
    order,
    customer,
    employeeName: employee?.name,
    debt,
  });

  if (!order) {
    return (
      <>
        <Header title="Orden" showBack backHref="/ordenes" />
        <p className="py-12 text-center text-muted-foreground">Orden no encontrada</p>
      </>
    );
  }

  const statusVariant =
    order.status === "confirmed"
      ? "primary"
      : order.status === "cancelled"
        ? "danger"
        : "warning";

  const statusLabel =
    order.status === "pending"
      ? getPendingKindLabel(order, "sale")
      : (STATUS_LABELS[order.status] ?? order.status);
  const paymentLabel = getPaymentMethodLabel(order.payment_method);
  const isPending = order.status === "pending";
  const isQuote = isQuoteOrder(order);
  const isCancelled = order.status === "cancelled";

  return (
    <>
      <Header
        title={order.order_number}
        showBack
        backHref="/ordenes"
        right={
          !isCancelled ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Descargar PDF"
              disabled={downloadingPdf}
              onClick={() => void downloadPdf()}
            >
              <Printer className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-6 px-3 py-4 pb-8">
        <div className="divide-y divide-border/50 px-1 py-1">
          <DetailRow
            label="Fecha"
            value={`${order.date} ${formatTime(order.created_at)}`}
          />
          {!isPending && (
            <>
              <DetailRow label="Método de pago" value={paymentLabel} />
              <DetailRow
                label="Modo de pago"
                value={PAYMENT_TYPE_LABELS[order.payment_type] ?? order.payment_type}
              />
            </>
          )}
          <DetailRow label="Estado">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </DetailRow>
          {employee && <DetailRow label="Cajero" value={employee.name} />}
          {customer && (
            <DetailRow
              label={isPending && isQuoteOrder(order) ? "Cotización para" : "Cliente"}
              value={customer.name}
            />
          )}
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
          {order.payment_type !== "pay_later" &&
            order.cash_received != null &&
            order.cash_received > 0 && (
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
          {order.payment_type === "pay_later" && !debt && (
            <div className="flex justify-between border-t border-border/50 pt-3 text-sm text-warning">
              <span>Saldo pendiente</span>
              <span className="shrink-0 text-xs font-bold tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
          )}
          {debt && debt.remaining > 0 && (
            <Link
              href={`/deudas/${debt.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-3 text-sm transition-colors hover:bg-amber-100"
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

        <div className="flex flex-col gap-3">
          {isPending && isQuote && (
            <Button asChild fullWidth variant="default" iconLeft={<FileText className="h-4 w-4" />}>
              <Link href={`/ordenes/${order.id}/cotizacion`}>Ver cotización</Link>
            </Button>
          )}

          {isPending && (
            <Button
              fullWidth
              variant="success"
              iconLeft={<Play className="h-4 w-4" />}
              onClick={() => resume(order)}
            >
              Retomar venta
            </Button>
          )}
        </div>

        <SaleOrderDetailActions
          order={order}
          customer={customer}
          employeeName={employee?.name}
          debt={debt}
        />
      </div>
    </>
  );
}
