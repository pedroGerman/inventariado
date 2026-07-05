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
import { useCancelConfirmedPurchaseOrder } from "@/lib/hooks/useCancelConfirmed";
import { useDeletePendingPurchaseOrder } from "@/lib/hooks/useDeletePending";
import { useDuplicatePurchaseOrder } from "@/lib/hooks/useDuplicateOrder";
import { useResumePurchaseOrder } from "@/lib/hooks/useResumePending";
import { getBusiness } from "@/lib/mock/db";
import { isQuotePurchase } from "@/lib/utils/pendingOrder";
import { purchaseToQuoteDocument } from "@/lib/utils/quoteDocument";
import { downloadQuotePdf } from "@/lib/utils/quotePdf";
import { purchaseToReceiptDocument } from "@/lib/utils/receiptDocument";
import { downloadReceiptPdf, shareReceiptPdf } from "@/lib/utils/receiptPdf";
import { cn } from "@/lib/utils/cn";
import type { Debt, Purchase, Supplier } from "@/lib/types/database";

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

interface PurchaseOrderDetailActionsProps {
  purchase: Purchase;
  supplier?: Supplier;
  employeeName?: string | null;
  debt?: Debt;
  onDownloadPdf?: () => Promise<void>;
}

export function PurchaseOrderDetailActions({
  purchase,
  supplier,
  employeeName,
  debt,
  onDownloadPdf,
}: PurchaseOrderDetailActionsProps) {
  const { duplicate } = useDuplicatePurchaseOrder();
  const { resume } = useResumePurchaseOrder();
  const { remove: deletePending } = useDeletePendingPurchaseOrder();
  const { cancel: cancelConfirmed } = useCancelConfirmedPurchaseOrder();

  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isPending = purchase.status === "pending";
  const isConfirmed = purchase.status === "confirmed";
  const isCancelled = purchase.status === "cancelled";
  const isQuote = isQuotePurchase(purchase);
  const canShare = !isCancelled;
  const canDelete = isPending;
  const canCancel = isConfirmed;
  const pendingLabel = isQuote ? "cotización" : "compra guardada";
  const hasDebt = Boolean(debt && debt.remaining > 0);

  async function buildShareDocument() {
    const businessName = getBusiness().name;

    if (isPending && isQuote) {
      await downloadQuotePdf(
        purchaseToQuoteDocument(purchase, businessName, supplier, employeeName),
      );
      return;
    }

    const receipt = purchaseToReceiptDocument(purchase, businessName, {
      party: supplier,
      employeeName,
      debt,
    });
    await shareReceiptPdf(receipt);
  }

  async function buildDownloadDocument() {
    const businessName = getBusiness().name;

    if (isPending && isQuote) {
      await downloadQuotePdf(
        purchaseToQuoteDocument(purchase, businessName, supplier, employeeName),
      );
      return;
    }

    const receipt = purchaseToReceiptDocument(purchase, businessName, {
      party: supplier,
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
      await deletePending(purchase.id);
      setDeleteOpen(false);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo eliminar la compra.",
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelConfirmed(purchase.id);
      setCancelOpen(false);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo anular la compra.",
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
            href: `/compras/ordenes/${purchase.id}/cotizacion`,
            onClick: () => setMoreOpen(false),
          },
        ]
      : []),
    ...(isPending
      ? [
          {
            icon: orderMoreIcons.resume,
            label: "Retomar compra",
            onClick: () => resume(purchase),
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
            label: "Duplicar compra",
            onClick: () => duplicate(purchase),
          },
        ]
      : []),
    ...(hasDebt && debt
      ? [
          {
            icon: orderMoreIcons.debt,
            label: "Registrar pago",
            href: `/deudas/${debt.id}`,
            onClick: () => setMoreOpen(false),
          },
        ]
      : []),
  ];

  if (isCancelled && moreItems.length === 0 && !canShare && !canDelete && !canCancel) {
    return null;
  }

  const actionCount =
    Number(canShare) + Number(canDelete) + Number(canCancel) + Number(moreItems.length > 0);
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
        documentNumber={purchase.purchase_number}
        kind="purchase"
        pendingLabel={pendingLabel}
      />

      <CancelConfirmedModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        documentNumber={purchase.purchase_number}
        kind="purchase"
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

export function usePurchaseOrderDownloadPdf({
  purchase,
  supplier,
  employeeName,
  debt,
}: {
  purchase?: Purchase;
  supplier?: Supplier;
  employeeName?: string | null;
  debt?: Debt;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadPdf() {
    if (!purchase) {
      throw new Error("Compra no encontrada.");
    }

    setDownloading(true);
    setError(null);

    try {
      const businessName = getBusiness().name;
      const isQuote = isQuotePurchase(purchase);

      if (purchase.status === "pending" && isQuote) {
        await downloadQuotePdf(
          purchaseToQuoteDocument(purchase, businessName, supplier, employeeName),
        );
        return;
      }

      if (purchase.status === "cancelled") {
        throw new Error("No se puede descargar una compra anulada.");
      }

      const receipt = purchaseToReceiptDocument(purchase, businessName, {
        party: supplier,
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
