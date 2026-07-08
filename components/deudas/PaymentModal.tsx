"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AmountDisplayField } from "@/components/ui/AmountDisplayField";
import { NumericKeyboard } from "@/components/ui/NumericKeyboard";
import { SelectField, SelectItem } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  getBusiness,
  getCustomers,
  getDebt,
  getOrder,
  getPurchase,
  getSuppliers,
  savePayment,
  newEntityId,
} from "@/lib/mock/db";
import {
  orderToReceiptDocument,
  purchaseToReceiptDocument,
} from "@/lib/utils/receiptDocument";
import { downloadReceiptPdf } from "@/lib/utils/receiptPdf";

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
  const [printReceipt, setPrintReceipt] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payAmount = mode === "full" ? amount : parseFloat(partialAmount) || 0;
  const valid = payAmount > 0 && payAmount <= amount;

  useEffect(() => {
    if (!open) {
      setPartialAmount("");
      setPrintReceipt(false);
      setError(null);
    }
  }, [open]);

  async function maybeDownloadReceipt() {
    if (!printReceipt) return;

    const debt = getDebt(debtId);
    if (!debt) return;

    const businessName = getBusiness().name;

    if (debt.order_id) {
      const order = getOrder(debt.order_id);
      const customer = debt.customer_id
        ? getCustomers().find((c) => c.id === debt.customer_id)
        : undefined;

      if (order) {
        await downloadReceiptPdf(
          orderToReceiptDocument(order, businessName, {
            party: customer,
            debt,
            title: "COMPROBANTE DE PAGO",
          }),
        );
      }
      return;
    }

    if (debt.purchase_id) {
      const purchase = getPurchase(debt.purchase_id);
      const supplier = debt.supplier_id
        ? getSuppliers().find((s) => s.id === debt.supplier_id)
        : undefined;

      if (purchase) {
        await downloadReceiptPdf(
          purchaseToReceiptDocument(purchase, businessName, {
            party: supplier,
            debt,
            title: "COMPROBANTE DE PAGO",
          }),
        );
      }
    }
  }

  async function handleAccept() {
    if (!valid || saving) return;

    setSaving(true);
    setError(null);
    try {
      await savePayment({
        id: newEntityId(),
        debt_id: debtId,
        amount: payAmount,
        method,
        created_at: new Date().toISOString(),
      });
      await maybeDownloadReceipt();
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el pago.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      fitContent
      title={
        mode === "full"
          ? isPayable
            ? "Pagar Todo"
            : "Cobrar Todo"
          : "Abonar"
      }
    >
      <div className="space-y-4 pb-5">
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
          label="Descargar comprobante"
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
          <>
            <AmountDisplayField
              label={isPayable ? "Pagas" : "Abonas"}
              value={partialAmount}
              active
              prefix="RD$"
              error={
                !valid && partialAmount
                  ? "El monto debe ser mayor a 0 y menor o igual al saldo"
                  : undefined
              }
            />
            <NumericKeyboard
              value={partialAmount}
              onChange={setPartialAmount}
            />
          </>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
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
