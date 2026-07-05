"use client";

import { useParams } from "next/navigation";
import { QuoteDetailView } from "@/components/cotizacion/QuoteDetailView";
import { Header } from "@/components/layout/Header";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useResumePurchaseOrder } from "@/lib/hooks/useResumePending";
import { useDeletePendingPurchaseOrder } from "@/lib/hooks/useDeletePending";
import { getBusiness, getPurchase, getSuppliers } from "@/lib/mock/db";
import { mockEmployees } from "@/lib/mock/seed";
import { useEmployeeStore } from "@/lib/store/employee";
import { isQuotePurchase } from "@/lib/utils/pendingOrder";
import { purchaseToQuoteDocument } from "@/lib/utils/quoteDocument";

export default function CotizacionCompraPage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const { resume } = useResumePurchaseOrder();
  const { remove: deletePending } = useDeletePendingPurchaseOrder();
  const purchase = getPurchase(id);
  const currentEmployee = useEmployeeStore((s) => s.current);

  if (!purchase) {
    return (
      <>
        <Header title="Cotización" showBack backHref="/ordenes?tab=purchase" />
        <p className="py-12 text-center text-muted-foreground">
          Cotización no encontrada
        </p>
      </>
    );
  }

  if (!isQuotePurchase(purchase) || purchase.status !== "pending") {
    return (
      <>
        <Header
          title="Cotización"
          showBack
          backHref={`/compras/ordenes/${purchase.id}`}
        />
        <p className="py-12 text-center text-muted-foreground">
          Esta compra no es una cotización pendiente.
        </p>
      </>
    );
  }

  const supplier = getSuppliers().find((s) => s.id === purchase.supplier_id);
  const employee =
    mockEmployees.find((e) => e.id === purchase.employee_id) ??
    (currentEmployee?.id === purchase.employee_id ? currentEmployee : null);

  const quote = purchaseToQuoteDocument(
    purchase,
    getBusiness().name,
    supplier,
    employee?.name,
  );

  return (
    <QuoteDetailView
      quote={quote}
      backHref="/ordenes?tab=purchase&pending=1"
      detailHref={`/compras/ordenes/${purchase.id}`}
      onResume={() => resume(purchase)}
      onDelete={() => deletePending(purchase.id)}
      pendingLabel="cotización"
      deleteKind="purchase"
    />
  );
}
