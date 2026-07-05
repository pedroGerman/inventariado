"use client";

import { useParams } from "next/navigation";
import { QuoteDetailView } from "@/components/cotizacion/QuoteDetailView";
import { Header } from "@/components/layout/Header";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useResumeSaleOrder } from "@/lib/hooks/useResumePending";
import { useDeletePendingSaleOrder } from "@/lib/hooks/useDeletePending";
import { getBusiness, getCustomers, getOrder } from "@/lib/mock/db";
import { mockEmployees } from "@/lib/mock/seed";
import { isQuoteOrder } from "@/lib/utils/pendingOrder";
import { orderToQuoteDocument } from "@/lib/utils/quoteDocument";

export default function CotizacionVentaPage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const { resume } = useResumeSaleOrder();
  const { remove: deletePending } = useDeletePendingSaleOrder();
  const order = getOrder(id);

  if (!order) {
    return (
      <>
        <Header title="Cotización" showBack backHref="/ordenes" />
        <p className="py-12 text-center text-muted-foreground">
          Cotización no encontrada
        </p>
      </>
    );
  }

  if (!isQuoteOrder(order) || order.status !== "pending") {
    return (
      <>
        <Header title="Cotización" showBack backHref={`/ordenes/${order.id}`} />
        <p className="py-12 text-center text-muted-foreground">
          Esta orden no es una cotización pendiente.
        </p>
      </>
    );
  }

  const customer = getCustomers().find((c) => c.id === order.customer_id);
  const employee = mockEmployees.find((e) => e.id === order.employee_id);
  const quote = orderToQuoteDocument(
    order,
    getBusiness().name,
    customer,
    employee?.name,
  );

  return (
    <QuoteDetailView
      quote={quote}
      backHref="/ordenes?pending=1"
      detailHref={`/ordenes/${order.id}`}
      onResume={() => resume(order)}
      onDelete={() => deletePending(order.id)}
      pendingLabel="cotización"
      deleteKind="sale"
    />
  );
}
