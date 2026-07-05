"use client";

import { useEffect, useState } from "react";
import { AppDialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { DiscountTypeSelector } from "@/components/caja/DiscountTypeSelector";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  computeDiscountAmount,
  type DiscountType,
} from "@/lib/utils/discount";

interface DiscountModalProps {
  open: boolean;
  subtotal: number;
  initialType?: DiscountType;
  initialValue?: number;
  onClose: () => void;
  onApply: (type: DiscountType, value: number) => void;
}

export function DiscountModal({
  open,
  subtotal,
  initialType = "percent",
  initialValue = 0,
  onClose,
  onApply,
}: DiscountModalProps) {
  const [type, setType] = useState<DiscountType>(initialType);
  const [value, setValue] = useState(
    initialValue > 0 ? String(initialValue) : "",
  );

  useEffect(() => {
    if (!open) return;
    setType(initialType);
    setValue(initialValue > 0 ? String(initialValue) : "");
  }, [open, initialType, initialValue]);

  const numericValue = parseFloat(value) || 0;
  const discountAmount = computeDiscountAmount(subtotal, type, numericValue);
  const isPercent = type === "percent";
  const isValid =
    numericValue > 0 &&
    (isPercent ? numericValue <= 100 : numericValue <= subtotal);

  function handleApply() {
    if (!isValid) return;
    onApply(type, numericValue);
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Aplicar descuento"
      description="Elige si el descuento es un porcentaje o un monto fijo."
      footer={
        <>
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            fullWidth
            disabled={!isValid}
            onClick={handleApply}
          >
            Aplicar descuento
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <DiscountTypeSelector value={type} onChange={setType} />

        <TextField
          type="number"
          inputMode="decimal"
          min={0}
          max={isPercent ? 100 : subtotal}
          step={isPercent ? 1 : 0.01}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          label={isPercent ? "Porcentaje" : "Monto"}
          placeholder={isPercent ? "Ej. 10" : "Ej. 500"}
          rightElement={
            isPercent ? (
              <span className="text-sm text-muted-foreground">%</span>
            ) : undefined
          }
        />

        {numericValue > 0 && (
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-danger">
              <span>Descuento</span>
              <span className="font-medium tabular-nums">
                - {formatCurrency(discountAmount)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/50 pt-2 font-semibold text-card-foreground">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(Math.max(0, subtotal - discountAmount))}
              </span>
            </div>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
