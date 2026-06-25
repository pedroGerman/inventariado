"use client";

import { formatCurrency } from "@/lib/utils/formatCurrency";

interface CheckoutSummaryProps {
  subtotal: number;
  tax?: number;
  service?: number;
  discount?: number;
  total: number;
}

export function CheckoutSummary({
  subtotal,
  tax = 0,
  service = 0,
  discount = 0,
  total,
}: CheckoutSummaryProps) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>Subtotal</span>
        <span className="shrink-0 text-xs font-medium tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      {tax > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>IVA</span>
          <span className="shrink-0 text-xs font-medium tabular-nums">{formatCurrency(tax)}</span>
        </div>
      )}
      {service > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>Servicio/Propina</span>
          <span className="shrink-0 text-xs font-medium tabular-nums">{formatCurrency(service)}</span>
        </div>
      )}
      {discount > 0 && (
        <div className="flex justify-between text-danger">
          <span>Descuento</span>
          <span className="shrink-0 text-xs font-medium tabular-nums">- {formatCurrency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
        <span>Total</span>
        <span className="text-neutral-800 shrink-0 text-base font-bold tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
