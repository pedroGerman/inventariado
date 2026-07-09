"use client";

import { useEffect, useRef, useState } from "react";
import { Calculator } from "@/components/ui/Calculator";
import { AmountDisplayField } from "@/components/ui/AmountDisplayField";
import { Button } from "@/components/ui/Button";
import { AppDrawer } from "@/components/ui/Drawer";
import { TextField } from "@/components/ui/Input";
import { SelectField, SelectItem } from "@/components/ui/Select";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { uid } from "@/lib/mock/db";

interface QuickSaleModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "sale" | "purchase";
}

export function QuickSaleModal({ open, onClose, mode = "sale" }: QuickSaleModalProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [applyTax, setApplyTax] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setDescriptionFocused(false);
    }
  }, [open]);

  function getFinalAmount() {
    const base = parseFloat(amount) || 0;
    return applyTax ? base * 1.18 : base;
  }

  function buildItem(chargeNow = false) {
    const finalAmount = getFinalAmount();
    if (finalAmount <= 0) return;

    addItem(
      {
        id: uid("ci"),
        product_id: null,
        name: description || (mode === "sale" ? "Venta libre" : "Compra libre"),
        quantity: 1,
        unit_price: finalAmount,
        total_price: finalAmount,
        type: mode === "sale" ? "quick_sale" : "quick_purchase",
      },
      mode,
    );

    setDescription("");
    setAmount("");
    onClose();

    if (chargeNow) {
      router.push(mode === "sale" ? "/ventas/caja" : "/ventas/caja?tab=purchase");
    }
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={mode === "sale" ? "Venta Rápida" : "Compra Rápida"}
      fitContent={descriptionFocused}
      snapPoint={0.95}
      repositionInputs={false}
      scrollFocusedInputs={false}
    >
      <div className="space-y-4">
        <SelectField
          id="quick-sale-iva"
          label="¿Aplicar IVA?"
          fullWidth={false}
          value={applyTax ? "18" : "0"}
          onValueChange={(value) => setApplyTax(value === "18")}
          triggerClassName="w-auto min-w-[9rem] shrink-0"
        >
          <SelectItem value="0">Sin impuesto</SelectItem>
          <SelectItem value="18">18%</SelectItem>
        </SelectField>
        <TextField
          ref={descriptionRef}
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción opcional"
          enterKeyHint="done"
          autoComplete="off"
          onFocus={() => {
            setDescriptionFocused(true);
            requestAnimationFrame(() => {
              window.setTimeout(() => {
                descriptionRef.current?.scrollIntoView({
                  block: "center",
                  behavior: "smooth",
                });
              }, 150);
            });
          }}
          onBlur={() => setDescriptionFocused(false)}
        />
        <AmountDisplayField
          label="Monto"
          value={amount}
          active
          prefix="RD$"
          onActivate={() => descriptionRef.current?.blur()}
        />
        {applyTax ? (
          <p className="text-right text-sm text-muted-foreground">
            Con IVA (18%):{" "}
            <span className="font-semibold text-card-foreground">
              RD$ {getFinalAmount().toLocaleString("es-DO")}
            </span>
          </p>
        ) : null}
        {!descriptionFocused ? (
          <>
            <Calculator value={amount} onChange={setAmount} showDisplay={false} />
            <div className="flex gap-3 pb-5">
              <Button variant="secondary" fullWidth onClick={() => buildItem(false)}>
                AGREGAR
              </Button>
              <Button
                fullWidth
                iconRight={<ArrowRight className="h-4 w-4" />}
                onClick={() => buildItem(true)}
              >
                {mode === "sale" ? "COBRAR" : "REGISTRAR"}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </AppDrawer>
  );
}
