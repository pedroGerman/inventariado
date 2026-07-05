"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Play, Printer, Wallet } from "lucide-react";
import { PurchaseOrderDetailActions, usePurchaseOrderDownloadPdf } from "@/components/ordenes/PurchaseOrderDetailActions";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { getPurchase, getSuppliers, getDebtByPurchaseId } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useEmployeeStore } from "@/lib/store/employee";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { getPendingKindLabel, isQuotePurchase } from "@/lib/utils/pendingOrder";
import { useResumePurchaseOrder } from "@/lib/hooks/useResumePending";
import { cn } from "@/lib/utils/cn";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Anulada",
  pending: "Pendiente",
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  pay_all: "Pagar todo",
  deposit: "Abonar",
  pay_later: "Pagar después",
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

export default function CompraDetallePage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const { resume } = useResumePurchaseOrder();
  const purchase = getPurchase(id);
  const suppliers = getSuppliers();
  const currentEmployee = useEmployeeStore((s) => s.current);
  const debt = purchase ? getDebtByPurchaseId(purchase.id) : undefined;
  const supplier = purchase
    ? suppliers.find((s) => s.id === purchase.supplier_id)
    : undefined;
  const employee = purchase
    ? currentEmployee?.id === purchase.employee_id
      ? currentEmployee
      : null
    : null;
  const { downloadPdf, downloading: downloadingPdf } = usePurchaseOrderDownloadPdf({
    purchase,
    supplier,
    employeeName: employee?.name,
    debt,
  });

  if (!purchase) {
    return (
      <>
        <Header title="Compra" showBack backHref="/ordenes?tab=purchase" />
        <p className="py-12 text-center text-muted-foreground">Compra no encontrada</p>
      </>
    );
  }

  const statusVariant =
    debt && debt.remaining > 0
      ? "warning"
      : purchase.status === "confirmed"
        ? "primary"
        : purchase.status === "cancelled"
          ? "danger"
          : "warning";

  const statusLabel =
    purchase.status === "pending"
      ? getPendingKindLabel(purchase, "purchase")
      : debt && debt.remaining > 0
        ? "Por pagar"
        : (STATUS_LABELS[purchase.status] ?? purchase.status);
  const paymentLabel = getPaymentMethodLabel(purchase.payment_method);
  const isPending = purchase.status === "pending";
  const isQuote = isQuotePurchase(purchase);
  const isCancelled = purchase.status === "cancelled";

  return (
    <>
      <Header
        title={purchase.purchase_number}
        showBack
        backHref="/ordenes?tab=purchase"
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

      <div className="flex flex-col gap-6 px-4 py-4 pb-8">
        <div className="divide-y divide-border/50 px-1 py-1">
          <DetailRow
            label="Fecha"
            value={`${purchase.date} ${formatTime(purchase.created_at)}`}
          />
          {!isPending && (
            <>
              <DetailRow label="Método de pago" value={paymentLabel} />
              <DetailRow
                label="Modo de pago"
                value={PAYMENT_TYPE_LABELS[purchase.payment_type] ?? purchase.payment_type}
              />
            </>
          )}
          <DetailRow label="Estado">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </DetailRow>
          {employee && <DetailRow label="Cajero" value={employee.name} />}
          {supplier && (
            <DetailRow
              label={isPending && isQuotePurchase(purchase) ? "Cotización con" : "Proveedor"}
              value={supplier.name}
            />
          )}
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
          {purchase.cash_paid != null && (
            <div className="flex flex-col gap-2 border-t border-border/50 pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Efectivo pagado</span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                  {formatCurrency(purchase.cash_paid)}
                </span>
              </div>
              {(purchase.change ?? 0) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Vuelto</span>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                    {formatCurrency(purchase.change ?? 0)}
                  </span>
                </div>
              )}
            </div>
          )}
          {debt && debt.paid > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pagado</span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-primary">
                {formatCurrency(debt.paid)}
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
        </div>

        {isPending && isQuote && (
          <Button asChild fullWidth variant="default" iconLeft={<FileText className="h-4 w-4" />}>
            <Link href={`/compras/ordenes/${purchase.id}/cotizacion`}>
              Ver cotización
            </Link>
          </Button>
        )}

        {isPending && (
          <Button
            fullWidth
            variant="success"
            iconLeft={<Play className="h-4 w-4" />}
            onClick={() => resume(purchase)}
          >
            Retomar compra
          </Button>
        )}

        <PurchaseOrderDetailActions
          purchase={purchase}
          supplier={supplier}
          employeeName={employee?.name}
          debt={debt}
        />
      </div>
    </>
  );
}
