"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { SelectField, SelectItem } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { savePayment, newEntityId } from "@/lib/mock/db";

import type { DebtKind } from "@/lib/types/database";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  debtId: string;
  amount: number;
  mode: "full" | "partial";
  flow?: DebtKind;
  onSuccess: () => void;
}

export function PaymentModal({
  open,
  onClose,
  debtId,
  amount,
  mode,
  flow = "collect",
  onSuccess,
}: PaymentModalProps) {
  const isPayable = flow === "pay";
  const [method, setMethod] = useState("cash");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [partialAmount, setPartialAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const payAmount = mode === "full" ? amount : parseFloat(partialAmount) || 0;
  const valid = payAmount > 0 && payAmount <= amount;

  useEffect(() => {
    if (!open) setPartialAmount("");
  }, [open]);

  async function handleAccept() {
    if (!valid || saving) return;

    setSaving(true);
    try {
      await savePayment({
        id: newEntityId(),
        debt_id: debtId,
        amount: payAmount,
        method,
        created_at: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[PaymentModal]", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "full"
          ? isPayable
            ? "Pagar Todo"
            : "Cobrar Todo"
          : "Abonar"
      }
    >
      <div className="space-y-4">
        {mode === "full" && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="text-sm">
              {isPayable
                ? "Se pagará el saldo completo de la deuda."
                : "Se cobrará el saldo completo de la deuda."}
            </span>
          </div>
        )}

        <Toggle
          label="Imprimir comprobante"
          checked={printReceipt}
          onChange={setPrintReceipt}
        />

        <SelectField
          label="Método de pago"
          value={method}
          onValueChange={setMethod}
        >
          <SelectItem value="cash">Efectivo</SelectItem>
          <SelectItem value="transfer">Transferencia</SelectItem>
          <SelectItem value="debit_card">Tarjeta débito</SelectItem>
          <SelectItem value="credit_card">Tarjeta crédito</SelectItem>
          <SelectItem value="other">Otros</SelectItem>
        </SelectField>

        <div className="flex items-center justify-between py-3 text-center">
          <p className="text-sm text-slate-500">Saldo</p>
          <p className="text-lg font-bold">{formatCurrency(amount)}</p>
        </div>

        {mode === "partial" && (
          <TextField
            label={isPayable ? "Pagas" : "Abonas"}
            type="number"
            inputMode="decimal"
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            placeholder="0"
            className="text-lg font-bold"
            error={
              !valid && partialAmount
                ? "El monto debe ser mayor a 0 y menor o igual al saldo"
                : undefined
            }
          />
        )}

        <div className="flex gap-3">
          <Button
            size="sm"
            className="!rounded-lg !py-5"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="!rounded-lg !py-5"
            fullWidth
            disabled={!valid || saving}
            onClick={() => void handleAccept()}
          >
            {saving ? "Guardando…" : "Aceptar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
