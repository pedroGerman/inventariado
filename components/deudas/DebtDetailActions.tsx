"use client";

import { useState } from "react";
import { MoreHorizontal, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  OrderMoreDrawer,
  orderMoreIcons,
} from "@/components/ordenes/OrderMoreDrawer";
import { useDuplicatePurchaseOrder, useDuplicateSaleOrder } from "@/lib/hooks/useDuplicateOrder";
import { getBusiness } from "@/lib/mock/db";
import { orderToReceiptDocument, purchaseToReceiptDocument } from "@/lib/utils/receiptDocument";
import { downloadReceiptPdf, shareReceiptPdf } from "@/lib/utils/receiptPdf";
import { cn } from "@/lib/utils/cn";
import type {
  Customer,
  Debt,
  Order,
  Purchase,
  Supplier,
} from "@/lib/types/database";

function ActionButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
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
        "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

interface DebtDetailActionsProps {
  debt: Debt;
  order?: Order;
  purchase?: Purchase;
  customer?: Customer;
  supplier?: Supplier;
  employeeName?: string | null;
  onDownloadPdf?: () => Promise<void>;
}

export function DebtDetailActions({
  debt,
  order,
  purchase,
  customer,
  supplier,
  employeeName,
  onDownloadPdf,
}: DebtDetailActionsProps) {
  const { duplicate: duplicateSale } = useDuplicateSaleOrder();
  const { duplicate: duplicatePurchase } = useDuplicatePurchaseOrder();

  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const reference = order ?? purchase;
  if (!reference) return null;

  const isCollect = debt.kind === "collect";
  const detailHref = order
    ? `/ordenes/${order.id}`
    : `/compras/ordenes/${purchase!.id}`;

  async function buildReceipt() {
    const businessName = getBusiness().name;

    if (order) {
      return orderToReceiptDocument(order, businessName, {
        party: customer,
        employeeName,
        debt,
      });
    }

    return purchaseToReceiptDocument(purchase!, businessName, {
      party: supplier,
      employeeName,
      debt,
    });
  }

  async function handleShare() {
    setSharing(true);
    setShareError(null);

    try {
      const receipt = await buildReceipt();
      await shareReceiptPdf(receipt);
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
        return;
      }

      const receipt = await buildReceipt();
      await downloadReceiptPdf(receipt);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "No se pudo descargar el PDF.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const moreItems = [
    {
      icon: orderMoreIcons.download,
      label: downloading ? "Descargando…" : "Descargar PDF",
      onClick: () => void handleDownload(),
    },
    {
      icon: orderMoreIcons.quote,
      label: isCollect ? "Ver detalle de orden" : "Ver detalle de compra",
      href: detailHref,
      onClick: () => setMoreOpen(false),
    },
    {
      icon: orderMoreIcons.duplicate,
      label: isCollect ? "Duplicar venta" : "Duplicar compra",
      onClick: () => {
        if (order) duplicateSale(order);
        else if (purchase) duplicatePurchase(purchase);
      },
    },
  ];

  return (
    <>
      <Card className="gap-0 !py-0">
        <CardContent className="grid grid-cols-2 !justify-between gap-1 !px-2 !py-1">
          <ActionButton
            icon={Share2}
            label={sharing ? "…" : "Compartir"}
            disabled={sharing || downloading}
            onClick={handleShare}
          />
          <ActionButton
            icon={MoreHorizontal}
            label="Más"
            disabled={downloading}
            onClick={() => setMoreOpen(true)}
          />
        </CardContent>
      </Card>

      {shareError && (
        <p className="text-center text-xs text-destructive">{shareError}</p>
      )}

      <OrderMoreDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={moreItems}
      />
    </>
  );
}
