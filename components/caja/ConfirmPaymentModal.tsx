"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { NumericKeyboard } from "@/components/ui/NumericKeyboard";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface ConfirmPaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (paid: number, received: number) => void;
}

export function ConfirmPaymentModal({
  open,
  onClose,
  total,
  onConfirm,
}: ConfirmPaymentModalProps) {
  const [tab, setTab] = useState<"shortcuts" | "keyboard">("keyboard");
  const [toPay, setToPay] = useState(String(total));
  const [received, setReceived] = useState("");

  const toPayNum = parseFloat(toPay) || 0;
  const receivedNum = parseFloat(received) || 0;
  const change = Math.max(receivedNum - toPayNum, 0);

  return (
    <Modal open={open} onClose={onClose} title="Confirmar pago">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">Total a pagar</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">A pagar</label>
            <input
              value={toPay}
              onChange={(e) => setToPay(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg font-bold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Recibes</label>
            <input
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg font-bold"
            />
          </div>
        </div>
        {receivedNum > 0 && (
          <p className="text-center text-sm text-slate-600">
            Cambio: <span className="font-bold">{formatCurrency(change)}</span>
          </p>
        )}
        <div className="flex gap-2">
          {(["shortcuts", "keyboard"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                tab === t ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t === "shortcuts" ? "Atajos" : "Teclado"}
            </button>
          ))}
        </div>
        {tab === "keyboard" ? (
          <NumericKeyboard value={received} onChange={setReceived} />
        ) : (
          <NumericKeyboard
            value={received}
            onChange={setReceived}
            shortcuts={[total, 100, 200, 500, 1000, 2000]}
            onShortcut={(amount) => setReceived(String(amount))}
          />
        )}
        <Button
          fullWidth
          onClick={() => onConfirm(toPayNum, receivedNum || toPayNum)}
          disabled={toPayNum <= 0}
        >
          FINALIZAR
        </Button>
      </div>
    </Modal>
  );
}
