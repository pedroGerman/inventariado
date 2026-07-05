"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import { DebtDetailActions } from "@/components/deudas/DebtDetailActions";
import { usePurchaseOrderDownloadPdf } from "@/components/ordenes/PurchaseOrderDetailActions";
import { useSaleOrderDownloadPdf } from "@/components/ordenes/SaleOrderDetailActions";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { PaymentModal } from "@/components/deudas/PaymentModal";
import {
  getDebt,
  getOrder,
  getPurchase,
  getCustomers,
  getSuppliers,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useEmployeeStore } from "@/lib/store/employee";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatTime } from "@/lib/utils/date";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";
import { mockEmployees } from "@/lib/mock/seed";
import { cn } from "@/lib/utils/cn";

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

export default function DeudaDetallePage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const debt = getDebt(id);
  const [payModal, setPayModal] = useState<"full" | "partial" | null>(null);
  const [, setTick] = useState(0);
  const currentEmployee = useEmployeeStore((s) => s.current);
  const order = debt?.order_id ? getOrder(debt.order_id) : undefined;
  const purchase = debt?.purchase_id ? getPurchase(debt.purchase_id) : undefined;
  const customer = debt?.customer_id
    ? getCustomers().find((c) => c.id === debt.customer_id)
    : undefined;
  const supplier = debt?.supplier_id
    ? getSuppliers().find((s) => s.id === debt.supplier_id)
    : undefined;
  const employee =
    mockEmployees.find(
      (e) => e.id === (order?.employee_id ?? purchase?.employee_id),
    ) ??
    (currentEmployee?.id === (order?.employee_id ?? purchase?.employee_id)
      ? currentEmployee
      : null);
  const saleDownload = useSaleOrderDownloadPdf({
    order,
    customer,
    employeeName: employee?.name,
    debt,
  });
  const purchaseDownload = usePurchaseOrderDownloadPdf({
    purchase,
    supplier,
    employeeName: employee?.name,
    debt,
  });
  const downloadPdf = order ? saleDownload.downloadPdf : purchaseDownload.downloadPdf;
  const downloadingPdf = order
    ? saleDownload.downloading
    : purchaseDownload.downloading;

  if (!debt) {
    return (
      <>
        <Header title="Deuda" showBack backHref="/deudas" />
        <p className="py-12 text-center text-muted-foreground">Deuda no encontrada</p>
      </>
    );
  }

  const isPayable = debt.kind === "pay";
  const reference = order ?? purchase;
  const title =
    order?.order_number ?? purchase?.purchase_number ?? "Deuda";
  const paymentLabel =
    reference?.payment_method != null
      ? getPaymentMethodLabel(reference.payment_method)
      : "—";

  const items = order?.items ?? purchase?.items ?? [];
  const subtotal = reference?.subtotal ?? 0;
  const tax = reference?.tax ?? 0;
  const service = order?.service ?? 0;
  const discount = reference?.discount ?? 0;
  const total = reference?.total ?? debt.total;

  return (
    <>
      <Header
        title={title}
        showBack
        backHref="/deudas"
        right={
          reference && reference.status !== "cancelled" ? (
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
        <div className="flex gap-3">
          <Button
            size="sm"
            className="!rounded-lg !py-5"
            fullWidth
            onClick={() => setPayModal("full")}
          >
            {isPayable ? "Pagar todo" : "Cobrar todo"}
          </Button>
          <Button
            size="sm"
            className="!rounded-lg !py-5"
            fullWidth
            variant="dark"
            onClick={() => setPayModal("partial")}
          >
            Abonar
          </Button>
        </div>

        {(customer || supplier) && (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-1 py-1 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {(customer?.name ?? supplier?.name ?? "?").charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{customer?.name ?? supplier?.name}</p>
              {(customer?.phone ?? supplier?.phone) && (
                <p className="text-sm text-slate-500">
                  {formatPhoneDisplay(customer?.phone ?? supplier?.phone ?? "")}
                </p>
              )}
            </div>
          </div>
        )}

        {reference && (
          <>
            <div className="divide-y divide-border/50 px-1 py-1">
              <DetailRow
                label="Fecha"
                value={`${reference.date} ${formatTime(reference.created_at)}`}
              />
              <DetailRow label="Método de pago" value={paymentLabel} />
              <DetailRow label="Estado">
                <Badge variant="warning">
                  {isPayable ? "Por Pagar" : "Por Cobrar"}
                </Badge>
              </DetailRow>
              {employee && <DetailRow label="Cajero" value={employee.name} />}
            </div>

            <div className="flex flex-col gap-2 px-1">
              <h2 className="text-base font-semibold text-card-foreground">
                Productos
              </h2>
              <div className="divide-y divide-border/40">
                {items.map((item) => (
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
                subtotal={subtotal}
                tax={tax}
                service={service}
                discount={discount}
                total={total}
              />
              <div className="flex flex-col gap-2 border-t border-border/50 pt-3 text-sm">
                <div className="flex justify-between text-primary">
                  <span>{isPayable ? "Pagado" : "Abonado"}</span>
                  <span className="shrink-0 text-xs font-medium tabular-nums">
                    {formatCurrency(debt.paid)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-warning">
                  <span>Total Deuda</span>
                  <span className="shrink-0 text-xs tabular-nums">
                    {formatCurrency(debt.remaining)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {reference && (
          <DebtDetailActions
            debt={debt}
            order={order}
            purchase={purchase}
            customer={customer}
            supplier={supplier}
            employeeName={employee?.name}
          />
        )}
      </div>

      <PaymentModal
        open={payModal !== null}
        onClose={() => setPayModal(null)}
        debtId={debt.id}
        amount={debt.remaining}
        mode={payModal ?? "partial"}
        flow={debt.kind}
        onSuccess={() => setTick((t) => t + 1)}
      />
    </>
  );
}
