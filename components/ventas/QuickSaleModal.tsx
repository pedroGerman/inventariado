"use client";

import { useState } from "react";
import { Calculator } from "@/components/ui/Calculator";
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
  const setMode = useCartStore((s) => s.setMode);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [applyTax, setApplyTax] = useState(false);

  function getFinalAmount() {
    const base = parseFloat(amount) || 0;
    return applyTax ? base * 1.18 : base;
  }

  function buildItem(chargeNow = false) {
    const finalAmount = getFinalAmount();
    if (finalAmount <= 0) return;

    setMode(mode);
    addItem({
      id: uid("ci"),
      product_id: null,
      name: description || (mode === "sale" ? "Venta libre" : "Compra libre"),
      quantity: 1,
      unit_price: finalAmount,
      total_price: finalAmount,
      type: mode === "sale" ? "quick_sale" : "quick_purchase",
    });

    setDescription("");
    setAmount("");
    onClose();

    if (chargeNow) {
      router.push(mode === "sale" ? "/ventas/caja" : "/compras/caja");
    }
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={mode === "sale" ? "Venta Rápida" : "Compra Rápida"}
      fitContent
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
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción opcional"
        />
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right text-2xl font-bold">
          RD$ {getFinalAmount().toLocaleString("es-DO")}
        </div>
        <Calculator value={amount} onChange={setAmount} />
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
      </div>
    </AppDrawer>
  );
}
