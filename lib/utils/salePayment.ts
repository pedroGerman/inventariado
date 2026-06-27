import type { DebtStatus, PaymentMethod, PaymentType } from "@/lib/types/database";

export interface SalePaymentAmounts {
  amountApplied: number;
  cashReceived: number | undefined;
  change: number;
  balanceDue: number;
}

export function debtStatusFromAmounts(total: number, paid: number): DebtStatus {
  const remaining = Math.max(total - paid, 0);
  if (remaining <= 0) return "paid";
  if (paid > 0) return "partial";
  return "pending";
}

export function computeSalePaymentAmounts(
  total: number,
  paymentType: PaymentType,
  paymentMethod: PaymentMethod,
  toPay: number,
  amountReceived?: number,
): SalePaymentAmounts {
  const safeTotal = Math.max(total, 0);
  const isCash = paymentMethod === "cash";

  if (paymentType === "pay_later") {
    const received =
      amountReceived != null && amountReceived > 0 ? amountReceived : undefined;
    const amountApplied = received ? Math.min(received, safeTotal) : 0;
    return {
      amountApplied,
      cashReceived: isCash ? received : undefined,
      change:
        isCash && received ? Math.max(received - amountApplied, 0) : 0,
      balanceDue: safeTotal - amountApplied,
    };
  }

  if (paymentType === "deposit" || paymentType === "split") {
    const amountApplied = Math.min(Math.max(0, toPay), safeTotal);
    if (isCash) {
      const received = amountReceived ?? amountApplied;
      return {
        amountApplied,
        cashReceived: received,
        change: Math.max(received - amountApplied, 0),
        balanceDue: safeTotal - amountApplied,
      };
    }
    return {
      amountApplied,
      cashReceived: undefined,
      change: 0,
      balanceDue: safeTotal - amountApplied,
    };
  }

  const amountApplied =
    amountReceived != null && amountReceived > 0
      ? Math.min(amountReceived, safeTotal)
      : Math.min(Math.max(0, toPay), safeTotal);
  const received = amountReceived ?? amountApplied;

  if (isCash) {
    return {
      amountApplied,
      cashReceived: received,
      change: Math.max(received - amountApplied, 0),
      balanceDue: safeTotal - amountApplied,
    };
  }

  return {
    amountApplied,
    cashReceived: undefined,
    change: 0,
    balanceDue: safeTotal - amountApplied,
  };
}

export function saleCreatesDebt(amounts: SalePaymentAmounts): boolean {
  return amounts.balanceDue > 0;
}
