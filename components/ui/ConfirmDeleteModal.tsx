"use client";

import { AppDialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel = "Sí, eliminar",
  loadingLabel = "Eliminando…",
}: ConfirmDeleteModalProps) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-muted-foreground">{description}</div>
    </AppDialog>
  );
}
