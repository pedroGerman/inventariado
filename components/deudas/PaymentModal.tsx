"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { savePayment, uid } from "@/lib/mock/db";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  debtId: string;
  amount: number;
  mode: "full" | "partial";
  onSuccess: () => void;
}

export function PaymentModal({
  open,
  onClose,
  debtId,
  amount,
  mode,
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState("cash");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [partialAmount, setPartialAmount] = useState("");

  const payAmount = mode === "full" ? amount : parseFloat(partialAmount) || 0;
  const valid = payAmount > 0 && payAmount <= amount;

  function handleAccept() {
    if (!valid) return;
    savePayment({
      id: uid("pay"),
      debt_id: debtId,
      amount: payAmount,
      method,
      created_at: new Date().toISOString(),
    });
    onSuccess();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "full" ? "Cobrar Todo" : "Abonar"}
    >
      <div className="space-y-4">
        {mode === "full" && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="text-sm">Se cobrará el saldo completo de la deuda.</span>
          </div>
        )}

        <Toggle
          label="Imprimir comprobante"
          checked={printReceipt}
          onChange={setPrintReceipt}
        />

        <Select
          label="Método de pago"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="cash">Efectivo</option>
          <option value="credit_card">Tarjeta crédito</option>
          <option value="debit_card">Tarjeta débito</option>
        </Select>

        <div className="flex items-center justify-between py-3 text-center">
          <p className="text-sm text-slate-500">Saldo</p>
          <p className="text-lg font-bold">{formatCurrency(amount)}</p>
        </div>

        {mode === "partial" && (
          <div>
            <label className="mb-1 block text-sm text-slate-600">Abonas</label>
            <input
              type="number"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
              placeholder="0"
            />
            {!valid && partialAmount && (
              <p className="mt-1 text-xs text-danger">
                El monto debe ser mayor a 0 y menor o igual al saldo
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth disabled={!valid} onClick={handleAccept}>
            ACEPTAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}
