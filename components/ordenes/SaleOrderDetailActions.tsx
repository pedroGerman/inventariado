"use client";

import { useState } from "react";
import { Ban, MoreHorizontal, Share2, Trash2 } from "lucide-react";
import { CancelConfirmedModal } from "@/components/ordenes/CancelConfirmedModal";
import { Card, CardContent } from "@/components/ui/Card";
import { DeletePendingModal } from "@/components/ordenes/DeletePendingModal";
import {
  OrderMoreDrawer,
  orderMoreIcons,
} from "@/components/ordenes/OrderMoreDrawer";
import { useCancelConfirmedSaleOrder } from "@/lib/hooks/useCancelConfirmed";
import { useDeletePendingSaleOrder } from "@/lib/hooks/useDeletePending";
import { useDuplicateSaleOrder } from "@/lib/hooks/useDuplicateOrder";
import { useResumeSaleOrder } from "@/lib/hooks/useResumePending";
import { getBusiness } from "@/lib/mock/db";
import { isQuoteOrder } from "@/lib/utils/pendingOrder";
import { orderToQuoteDocument } from "@/lib/utils/quoteDocument";
import { downloadQuotePdf } from "@/lib/utils/quotePdf";
import { orderToReceiptDocument } from "@/lib/utils/receiptDocument";
import { downloadReceiptPdf, shareReceiptPdf } from "@/lib/utils/receiptPdf";
import { cn } from "@/lib/utils/cn";
import type { Customer, Debt, Order } from "@/lib/types/database";

function ActionButton({
  icon: Icon,
  label,
  tone = "default",
  disabled,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors disabled:opacity-40",
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

interface SaleOrderDetailActionsProps {
  order: Order;
  customer?: Customer;
  employeeName?: string | null;
  debt?: Debt;
  onDownloadPdf?: () => Promise<void>;
}

export function SaleOrderDetailActions({
  order,
  customer,
  employeeName,
  debt,
  onDownloadPdf,
}: SaleOrderDetailActionsProps) {
  const { duplicate } = useDuplicateSaleOrder();
  const { resume } = useResumeSaleOrder();
  const { remove: deletePending } = useDeletePendingSaleOrder();
  const { cancel: cancelConfirmed } = useCancelConfirmedSaleOrder();

  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isPending = order.status === "pending";
  const isConfirmed = order.status === "confirmed";
  const isCancelled = order.status === "cancelled";
  const isQuote = isQuoteOrder(order);
  const canShare = !isCancelled;
  const canDelete = isPending;
  const canCancel = isConfirmed;
  const pendingLabel = isQuote ? "cotización" : "orden guardada";
  const hasDebt = Boolean(debt && debt.remaining > 0);

  async function buildShareDocument() {
    const businessName = getBusiness().name;

    if (isPending && isQuote) {
      return downloadQuotePdf(
        orderToQuoteDocument(order, businessName, customer, employeeName),
      );
    }

    const receipt = orderToReceiptDocument(order, businessName, {
      party: customer,
      employeeName,
      debt,
    });
    await shareReceiptPdf(receipt);
  }

  async function buildDownloadDocument() {
    const businessName = getBusiness().name;

    if (isPending && isQuote) {
      await downloadQuotePdf(
        orderToQuoteDocument(order, businessName, customer, employeeName),
      );
      return;
    }

    const receipt = orderToReceiptDocument(order, businessName, {
      party: customer,
      employeeName,
      debt,
    });
    await downloadReceiptPdf(receipt);
  }

  async function handleShare() {
    setSharing(true);
    setShareError(null);

    try {
      await buildShareDocument();
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo compartir el documento.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setShareError(null);

    try {
      if (onDownloadPdf) {
        await onDownloadPdf();
      } else {
        await buildDownloadDocument();
      }
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo descargar el PDF.",
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePending(order.id);
      setDeleteOpen(false);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo eliminar la orden.",
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelConfirmed(order.id);
      setCancelOpen(false);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo anular la orden.",
      );
      setCancelOpen(false);
    } finally {
      setCancelling(false);
    }
  }

  const moreItems = [
    ...(isPending && isQuote
      ? [
          {
            icon: orderMoreIcons.quote,
            label: "Ver cotización",
            href: `/ordenes/${order.id}/cotizacion`,
            onClick: () => setMoreOpen(false),
          },
        ]
      : []),
    ...(isPending
      ? [
          {
            icon: orderMoreIcons.resume,
            label: "Retomar venta",
            onClick: () => resume(order),
          },
        ]
      : []),
    ...(canShare
      ? [
          {
            icon: orderMoreIcons.download,
            label: downloading ? "Descargando…" : "Descargar PDF",
            onClick: () => void handleDownload(),
          },
        ]
      : []),
    ...(!isPending && !isCancelled
      ? [
          {
            icon: orderMoreIcons.duplicate,
            label: "Duplicar venta",
            onClick: () => duplicate(order),
          },
        ]
      : []),
    ...(hasDebt && debt
      ? [
          {
            icon: orderMoreIcons.debt,
            label: "Registrar abono",
            href: `/deudas/${debt.id}`,
            onClick: () => setMoreOpen(false),
          },
        ]
      : []),
  ];

  if (isCancelled && moreItems.length === 0) {
    return null;
  }

  const dangerActionCount = Number(canDelete) + Number(canCancel);
  const actionCount =
    Number(canShare) + dangerActionCount + Number(moreItems.length > 0);
  const gridCols =
    actionCount >= 3 ? "grid-cols-3" : actionCount === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <>
      <Card className="gap-0 !py-0">
        <CardContent className={cn("grid !justify-between gap-1 !px-2 !py-1", gridCols)}>
          {canShare && (
            <ActionButton
              icon={Share2}
              label={sharing ? "…" : "Compartir"}
              disabled={sharing || downloading}
              onClick={handleShare}
            />
          )}
          {canCancel && (
            <ActionButton
              icon={Ban}
              label="Anular"
              tone="danger"
              disabled={cancelling}
              onClick={() => setCancelOpen(true)}
            />
          )}
          {canDelete && (
            <ActionButton
              icon={Trash2}
              label="Eliminar"
              tone="danger"
              disabled={deleting}
              onClick={() => setDeleteOpen(true)}
            />
          )}
          {moreItems.length > 0 && (
            <ActionButton
              icon={MoreHorizontal}
              label="Más"
              disabled={downloading}
              onClick={() => setMoreOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {shareError && (
        <p className="text-center text-xs text-destructive">{shareError}</p>
      )}

      <DeletePendingModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        documentNumber={order.order_number}
        kind="sale"
        pendingLabel={pendingLabel}
      />

      <CancelConfirmedModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        documentNumber={order.order_number}
        kind="sale"
        hasOpenDebt={hasDebt}
      />

      <OrderMoreDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={moreItems}
      />
    </>
  );
}

export function useSaleOrderDownloadPdf({
  order,
  customer,
  employeeName,
  debt,
}: {
  order?: Order;
  customer?: Customer;
  employeeName?: string | null;
  debt?: Debt;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadPdf() {
    if (!order) {
      throw new Error("Orden no encontrada.");
    }

    setDownloading(true);
    setError(null);

    try {
      const businessName = getBusiness().name;
      const isQuote = isQuoteOrder(order);

      if (order.status === "pending" && isQuote) {
        await downloadQuotePdf(
          orderToQuoteDocument(order, businessName, customer, employeeName),
        );
        return;
      }

      if (order.status === "cancelled") {
        throw new Error("No se puede descargar una orden anulada.");
      }

      const receipt = orderToReceiptDocument(order, businessName, {
        party: customer,
        employeeName,
        debt,
      });
      await downloadReceiptPdf(receipt);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo descargar el PDF.";
      setError(message);
      throw err;
    } finally {
      setDownloading(false);
    }
  }

  return { downloadPdf, downloading, error };
}
