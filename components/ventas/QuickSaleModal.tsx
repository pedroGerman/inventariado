"use client";

import { useEffect, useState } from "react";
import { Calculator } from "@/components/ui/Calculator";
import { AmountDisplayField } from "@/components/ui/AmountDisplayField";
import { Button } from "@/components/ui/Button";
import { AppDrawer } from "@/components/ui/Drawer";
import { AppDialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Input";
import { SelectField, SelectItem } from "@/components/ui/Select";
import { ArrowRight, Pencil } from "lucide-react";
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
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  useEffect(() => {
    if (!open) {
      setDescriptionOpen(false);
    }
  }, [open]);

  function openDescriptionDialog() {
    setDescriptionDraft(description);
    setDescriptionOpen(true);
  }

  function closeDescriptionDialog() {
    window.setTimeout(() => setDescriptionOpen(false), 0);
  }

  function saveDescription() {
    setDescription(descriptionDraft.trim());
    closeDescriptionDialog();
  }

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
    <>
      <AppDrawer
        open={open}
        onClose={onClose}
        title={mode === "sale" ? "Venta Rápida" : "Compra Rápida"}
        snapPoint={0.95}
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

          {description ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-700">Descripción</p>
              <div className="flex items-start gap-2 rounded-md bg-input-surface px-3 py-2.5 shadow-input-edge">
                <p className="min-w-0 flex-1 text-sm text-card-foreground">
                  {description}
                </p>
                <button
                  type="button"
                  onClick={openDescriptionDialog}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={openDescriptionDialog}
            >
              Agregar descripción
            </Button>
          )}

          <AmountDisplayField label="Monto" value={amount} active prefix="RD$" />
          {applyTax ? (
            <p className="text-right text-sm text-muted-foreground">
              Con IVA (18%):{" "}
              <span className="font-semibold text-card-foreground">
                RD$ {getFinalAmount().toLocaleString("es-DO")}
              </span>
            </p>
          ) : null}
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
        </div>

        <AppDialog
          open={descriptionOpen}
          onClose={closeDescriptionDialog}
          title="Descripción"
          description="Opcional. Describe el producto o servicio."
          modal={false}
          className="z-[60]"
          overlayClassName="z-[60]"
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={closeDescriptionDialog}
              >
                Cancelar
              </Button>
              <Button type="button" fullWidth onClick={saveDescription}>
                Guardar
              </Button>
            </>
          }
        >
          <Textarea
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            placeholder="Ej. Un saco de papa"
            rows={4}
            autoFocus
            enterKeyHint="done"
            autoComplete="off"
          />
        </AppDialog>
      </AppDrawer>
    </>
  );
}
