"use client";

import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface DeletePendingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  documentNumber: string;
  kind?: "sale" | "purchase";
  pendingLabel?: string;
}

export function DeletePendingModal({
  open,
  onClose,
  onConfirm,
  loading,
  documentNumber,
  kind = "sale",
  pendingLabel = "orden pendiente",
}: DeletePendingModalProps) {
  const entity = kind === "sale" ? "orden" : "compra";

  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title={`Eliminar ${pendingLabel}`}
      confirmLabel={`Sí, eliminar ${entity}`}
      description={
        <>
          ¿Eliminar {pendingLabel}{" "}
          <span className="font-semibold text-card-foreground">{documentNumber}</span>?
          Se quitará de tu lista de pendientes y no podrás recuperarla.
        </>
      }
    />
  );
}
