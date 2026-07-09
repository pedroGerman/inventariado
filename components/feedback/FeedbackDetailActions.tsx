"use client";

import { useState } from "react";
import { MoreHorizontal, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { OrderMoreDrawer, orderMoreIcons } from "@/components/ordenes/OrderMoreDrawer";
import { getBusiness } from "@/lib/mock/db";
import { feedbackToDocument } from "@/lib/utils/feedbackDocument";
import { downloadFeedbackPdf, shareFeedbackPdf } from "@/lib/utils/feedbackPdf";
import { cn } from "@/lib/utils/cn";
import type { UserFeedback } from "@/lib/types/database";

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

interface FeedbackDetailActionsProps {
  item: UserFeedback;
}

export function FeedbackDetailActions({ item }: FeedbackDetailActionsProps) {
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  function buildDocument() {
    return feedbackToDocument(item, getBusiness().name);
  }

  async function handleShare() {
    setSharing(true);
    setShareError(null);

    try {
      await shareFeedbackPdf(buildDocument());
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "No se pudo compartir el documento.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setShareError(null);

    try {
      await downloadFeedbackPdf(buildDocument());
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
  ];

  return (
    <>
      <Card className="gap-0 !py-0">
        <CardContent className="grid !justify-between gap-1 !px-2 !py-1 grid-cols-2">
          <ActionButton
            icon={Share2}
            label={sharing ? "…" : "Compartir"}
            disabled={sharing || downloading}
            onClick={() => void handleShare()}
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

export function useFeedbackDownloadPdf(item: UserFeedback | null) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadPdf() {
    if (!item) {
      throw new Error("Comentario no encontrado.");
    }

    setDownloading(true);
    setError(null);

    try {
      await downloadFeedbackPdf(
        feedbackToDocument(item, getBusiness().name),
      );
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
