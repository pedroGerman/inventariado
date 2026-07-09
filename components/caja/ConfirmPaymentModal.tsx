"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AmountDisplayField } from "@/components/ui/AmountDisplayField";
import { NumericKeyboard } from "@/components/ui/NumericKeyboard";
import type { PaymentMethod, PaymentType } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  paymentMethodReceivedLabel,
  paymentMethodUsesNumericKeyboard,
  type PaymentFlow,
} from "@/lib/utils/paymentMethod";
import {
  computeSalePaymentAmounts,
  saleCreatesDebt,
} from "@/lib/utils/salePayment";

interface ConfirmPaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  flow?: PaymentFlow;
  customerName?: string | null;
  submitting?: boolean;
  error?: string | null;
  onConfirm: (toPay: number, received: number) => void | Promise<void>;
  onRequireCustomer?: () => void;
}

export function ConfirmPaymentModal({
  open,
  onClose,
  total,
  paymentType,
  paymentMethod,
  flow = "sale",
  customerName,
  submitting = false,
  error,
  onConfirm,
  onRequireCustomer,
}: ConfirmPaymentModalProps) {
  const isPurchase = flow === "purchase";
  const [toPay, setToPay] = useState(String(total));
  const [received, setReceived] = useState("");
  const [activeField, setActiveField] = useState<"toPay" | "received">(
    "received",
  );

  const isCash = paymentMethod === "cash";
  const isPayLater = paymentType === "pay_later";
  const isPartialMode = paymentType === "deposit" || paymentType === "split";
  const usesKeyboard = paymentMethodUsesNumericKeyboard(paymentMethod);

  useEffect(() => {
    if (!open) return;
    if (isPayLater) {
      setToPay("");
      setReceived("");
      return;
    }
    setToPay(isPartialMode ? "" : String(total));
    setReceived(paymentType === "pay_all" ? String(total) : "");
    setActiveField(isPartialMode || !usesKeyboard ? "toPay" : "received");
  }, [open, total, isPartialMode, isPayLater, paymentType, paymentMethod, usesKeyboard]);

  const toPayNum = parseFloat(toPay) || 0;
  const receivedNum = parseFloat(received) || 0;
  const amounts = computeSalePaymentAmounts(
    total,
    paymentType,
    paymentMethod,
    isPartialMode ? toPayNum : isPayLater ? 0 : toPayNum,
    isPartialMode
      ? undefined
      : isPayLater
        ? undefined
        : receivedNum > 0
          ? receivedNum
          : undefined,
  );
  const createsDebt = saleCreatesDebt(amounts);
  const needsParty = !customerName;
  const canSubmit =
    !submitting &&
    (isPayLater ||
      (isPartialMode ? toPayNum > 0 : toPayNum > 0 || receivedNum > 0));

  function handleConfirm() {
    if (submitting) return;
    if (needsParty) {
      onRequireCustomer?.();
      return;
    }
    if (!canSubmit) return;
    if (isPayLater) {
      void onConfirm(0, 0);
      return;
    }
    const paidNow = isPartialMode ? toPayNum : toPayNum || total;
    const amountIn = isPartialMode ? toPayNum : receivedNum || paidNow;
    void onConfirm(paidNow, amountIn);
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirmar pago" fitContent>
      <div className="flex flex-col gap-6 pb-4 pt-2">
        <section className="flex flex-col gap-3">
          <div className="text-center flex items-center justify-between">
            <p className="text-sm text-slate-500">Total a pagar:</p>
            <p className="text-base font-bold tabular-nums text-card-foreground">{formatCurrency(total)}</p>
          </div>

          {createsDebt && (
            // <p className="text-center text-sm ">
            //   Saldo pendiente:{" "}
            //   <span className="font-bold">{formatCurrency(amounts.balanceDue)}</span>
            // </p>
            <div className="text-center flex items-center justify-between text-warning">
              <p className="text-sm">Saldo pendiente:</p>
              <p className="text-base font-bold tabular-nums text-warning">{formatCurrency(amounts.balanceDue)}</p>
            </div>
          )}
        </section>

        {isPayLater ? (
          <p className="rounded-xl bg-surface-2 px-4 py-3 text-center text-sm text-muted-foreground">
            {isPurchase ? (
              <>
                La compra quedará registrada con saldo pendiente de{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(total)}
                </span>
                .
              </>
            ) : (
              <>
                La venta quedará registrada como fiado por{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(total)}
                </span>
                .
              </>
            )}
          </p>
        ) : isPartialMode ? (
          <AmountDisplayField
            label={isPurchase ? "Pagas ahora" : "Abonas ahora"}
            value={toPay}
            active
            prefix="RD$"
            onActivate={() => setActiveField("toPay")}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AmountDisplayField
              label="A pagar"
              value={toPay}
              active={activeField === "toPay"}
              onActivate={() => setActiveField("toPay")}
            />
            {usesKeyboard ? (
              <AmountDisplayField
                label={paymentMethodReceivedLabel(paymentMethod, flow)}
                value={received}
                active={activeField === "received"}
                onActivate={() => setActiveField("received")}
              />
            ) : (
              <div className="flex flex-col justify-end pb-1">
                <p className="mb-1.5 text-xs font-medium text-slate-700">
                  Método
                </p>
                <p className="rounded-md bg-input-surface px-3 py-2 text-base font-medium shadow-input-edge">
                  Otros
                </p>
              </div>
            )}
          </div>
        )}

        {isCash && amounts.change > 0 && (
          <p className="text-center text-sm text-slate-600">
            Cambio:{" "}
            <span className="font-bold">{formatCurrency(amounts.change)}</span>
          </p>
        )}



        {needsParty && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">
              {isPurchase ? (
                <>
                  Agrega un proveedor para finalizar la compra
                  {createsDebt ? (
                    <>
                      {" "}
                      y registrar el saldo en{" "}
                      <span className="font-medium">Deudas</span>
                    </>
                  ) : null}
                  .
                </>
              ) : (
                <>
                  Agrega un cliente para finalizar la venta
                  {createsDebt ? (
                    <>
                      {" "}
                      y registrar la deuda en{" "}
                      <span className="font-medium">Deudas</span>
                    </>
                  ) : null}
                  .
                </>
              )}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-red-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isPayLater && (
          <NumericKeyboard
            value={activeField === "toPay" ? toPay : received}
            onChange={activeField === "toPay" ? setToPay : setReceived}
          />
        )}

        <Button
          fullWidth
          onClick={handleConfirm}
          disabled={submitting || (!needsParty && !canSubmit)}
        >
          {submitting
            ? "Finalizando…"
            : needsParty
              ? isPurchase
                ? "AGREGAR PROVEEDOR"
                : "AGREGAR CLIENTE"
              : "FINALIZAR"}
        </Button>
      </div>
    </Modal>
  );
}
