"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FeedbackDetailActions,
  useFeedbackDownloadPdf,
} from "@/components/feedback/FeedbackDetailActions";
import {
  getFeedbackById,
  updateFeedbackStatus,
} from "@/lib/feedback/actions";
import { hydrateDataStore } from "@/lib/data/store";
import { formatDateTime } from "@/lib/utils/date";
import { getFeedbackStatusLabel } from "@/lib/utils/feedbackStatusFilter";
import type { FeedbackStatus, UserFeedback } from "@/lib/types/database";

export default function FeedbackAdminDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<UserFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { downloadPdf, downloading: downloadingPdf } = useFeedbackDownloadPdf(item);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      await hydrateDataStore();
      const result = await getFeedbackById(params.id);
      if (cancelled) return;

      if (result.error) {
        setError(result.error);
        if (result.error.includes("permiso")) {
          router.replace("/opciones");
        }
      } else {
        setItem(result.item ?? null);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  async function handleStatus(status: FeedbackStatus) {
    if (!item) return;
    setUpdating(true);
    const result = await updateFeedbackStatus(item.id, status);
    setUpdating(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.item) setItem(result.item);
  }

  return (
    <>
      <Header
        title="Detalle del comentario"
        showBack
        backHref="/opciones/feedback/admin"
        right={
          item ? (
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

      <div className="flex flex-col gap-5 px-3 py-4 pb-8">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cargando...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-danger">{error}</p>
        ) : item ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-card-foreground">
                  {item.sender_name?.trim() ||
                    item.sender_email?.trim() ||
                    "Usuario anónimo"}
                </p>
                {item.sender_email?.trim() && item.sender_name?.trim() && (
                  <p className="text-xs text-muted-foreground">
                    {item.sender_email}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <Badge
                  className="w-fit"
                  variant={
                    item.status === "pending"
                      ? "warning"
                      : item.status === "read"
                        ? "primary"
                        : "neutral"
                  }
                >
                  {getFeedbackStatusLabel(item.status)}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-ff-surface-2 p-3 shadow-ff-surface-2">
              <p className="whitespace-pre-wrap text-sm text-card-foreground">
                {item.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {item.status === "pending" && (
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  loading={updating}
                  disabled={updating}
                  onClick={() => void handleStatus("read")}
                >
                  Marcar como leído
                </Button>
              )}

              {item.status !== "resolved" && (
                <Button
                  type="button"
                  variant="success"
                  fullWidth
                  loading={updating}
                  disabled={updating}
                  onClick={() => void handleStatus("resolved")}
                >
                  Marcar como resuelto
                </Button>
              )}
            </div>

            <FeedbackDetailActions item={item} />
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Comentario no encontrado.
          </p>
        )}
      </div>
    </>
  );
}
