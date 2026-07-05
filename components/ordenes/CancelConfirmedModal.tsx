"use client";

import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface CancelConfirmedModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  documentNumber: string;
  kind?: "sale" | "purchase";
  hasOpenDebt?: boolean;
}

export function CancelConfirmedModal({
  open,
  onClose,
  onConfirm,
  loading,
  documentNumber,
  kind = "sale",
  hasOpenDebt,
}: CancelConfirmedModalProps) {
  const entity = kind === "sale" ? "venta" : "compra";

  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title={`Anular ${entity}`}
      confirmLabel={`Sí, anular ${entity}`}
      loadingLabel="Anulando…"
      description={
        <>
          ¿Anular {entity}{" "}
          <span className="font-semibold text-card-foreground">{documentNumber}</span>?
          Se revertirá el inventario
          {hasOpenDebt ? " y se cerrará el saldo pendiente" : ""}. Esta acción no se puede
          deshacer.
        </>
      }
    />
  );
}
