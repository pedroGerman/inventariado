"use client";

import { AppDialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useCartReplaceConfirmStore } from "@/lib/store/cartReplaceConfirm";

export function CartReplaceConfirmDialog() {
  const open = useCartReplaceConfirmStore((s) => s.open);
  const title = useCartReplaceConfirmStore((s) => s.title);
  const description = useCartReplaceConfirmStore((s) => s.description);
  const confirmLabel = useCartReplaceConfirmStore((s) => s.confirmLabel);
  const onConfirm = useCartReplaceConfirmStore((s) => s.onConfirm);
  const close = useCartReplaceConfirmStore((s) => s.close);

  return (
    <AppDialog
      open={open}
      onClose={close}
      title={title}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={close}>
            Cancelar
          </Button>
          <Button
            variant="default"
            fullWidth
            onClick={() => {
              onConfirm?.();
              close();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{description}</p>
    </AppDialog>
  );
}
