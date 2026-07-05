"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileText, Play, Trash2 } from "lucide-react";
import { DeletePendingModal } from "@/components/ordenes/DeletePendingModal";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { downloadQuotePdf } from "@/lib/utils/quotePdf";
import type { QuoteDocument } from "@/lib/utils/quoteDocument";

interface QuoteDetailViewProps {
  quote: QuoteDocument;
  backHref: string;
  detailHref: string;
  onResume: () => void;
  onDelete: () => Promise<void>;
  pendingLabel?: string;
  deleteKind?: "sale" | "purchase";
}

export function QuoteDetailView({
  quote,
  backHref,
  detailHref,
  onResume,
  onDelete,
  pendingLabel = "cotización",
  deleteKind = "sale",
}: QuoteDetailViewProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadQuotePdf(quote);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "No se pudo generar el PDF.",
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDownloadError(null);
    try {
      await onDelete();
      setDeleteOpen(false);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "No se pudo eliminar.",
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Header title="Cotización" subtitle={quote.number} showBack backHref={backHref} />

      <div className="flex flex-col gap-6 px-3 py-4 pb-8">
        <Card className="gap-0 overflow-hidden border-orange-100 bg-orange-50/40">
          <CardContent className="space-y-3 !p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-warning">
                  {quote.businessName}
                </p>
                <h1 className="mt-1 text-lg font-bold text-card-foreground">
                  {quote.number}
                </h1>
              </div>
              <Badge variant="warning">Cotización</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium text-card-foreground">
                  {formatDateGroup(quote.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="font-medium text-card-foreground">
                  {formatTime(quote.createdAt)}
                </p>
              </div>
            </div>

            {quote.partyName && (
              <div className="py-2.5">
                <p className="text-xs text-muted-foreground">{quote.partyLabel}</p>
                <p className="font-medium text-card-foreground">{quote.partyName}</p>
                {quote.partyPhone && (
                  <p className="text-xs text-muted-foreground">
                    {formatPhoneDisplay(quote.partyPhone)}
                  </p>
                )}
              </div>
            )}

            {quote.employeeName && (
              <p className="text-xs text-muted-foreground">
                Elaborada por {quote.employeeName}
              </p>
            )}
          </CardContent>
        </Card>

        <section className="flex flex-col gap-2 px-1">
          <h2 className="text-base font-semibold text-card-foreground">
            Productos
          </h2>
          <div className="divide-y divide-border/40">
            {quote.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="text-card-foreground">
                  {item.name}{" "}
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 px-1 py-4">
          <CheckoutSummary
            subtotal={quote.subtotal}
            tax={quote.tax}
            service={quote.service}
            discount={quote.discount}
            total={quote.total}
          />
        </div>

        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          Esta cotización no confirma la venta. Los precios pueden cambiar según
          disponibilidad de inventario.
        </p>

        <div className="flex flex-col gap-3 pt-2">

          <Button
            asChild
            fullWidth
            variant="secondary"
            iconLeft={<FileText className="h-4 w-4" />}
          >
            <Link href={detailHref}>Ver detalle de orden</Link>
          </Button>

          <Button
            fullWidth
            variant="default"
            iconLeft={<Download className="h-4 w-4" />}
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? "Generando PDF…" : "Descargar PDF"}
          </Button>

          <Button
            fullWidth
            variant="success"
            iconLeft={<Play className="h-4 w-4" />}
            onClick={onResume}
          >
            Retomar {quote.kind === "sale" ? "venta" : "compra"}
          </Button>



          <Button
            fullWidth
            variant="danger"
            iconLeft={<Trash2 className="h-4 w-4" />}
            onClick={() => setDeleteOpen(true)}
          >
            Eliminar {pendingLabel}
          </Button>
        </div>

        {downloadError && (
          <p className="text-center text-xs text-destructive">{downloadError}</p>
        )}

        <DeletePendingModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={deleting}
          documentNumber={quote.number}
          kind={deleteKind}
          pendingLabel={pendingLabel}
        />
      </div>
    </>
  );
}
