import type { Debt, Order, Purchase } from "@/lib/types/database";
import type { QuoteLineItem } from "@/lib/utils/quoteDocument";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";

export interface ReceiptDocument {
  kind: "sale" | "purchase";
  id: string;
  number: string;
  date: string;
  createdAt: string;
  title: string;
  partyName: string | null;
  partyPhone: string | null;
  partyLabel: string;
  employeeName: string | null;
  businessName: string;
  paymentMethodLabel: string | null;
  items: QuoteLineItem[];
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  total: number;
  amountPaid: number | null;
  balanceDue: number | null;
  change: number | null;
}

export function receiptPdfFileName(number: string): string {
  const safe = number.replace(/[^\w-]+/g, "-");
  return `recibo-${safe}.pdf`;
}

function receiptPaidAndBalance(
  total: number,
  amountPaid: number | null,
): Pick<ReceiptDocument, "amountPaid" | "balanceDue"> {
  if (amountPaid == null) {
    return { amountPaid: null, balanceDue: null };
  }

  const applied = Math.min(Math.max(0, amountPaid), total);
  return {
    amountPaid: applied,
    balanceDue: Math.max(0, total - applied),
  };
}

function saleAmountPaid(
  order: Order,
  debt: Debt | undefined,
  isPending: boolean,
): number | null {
  if (isPending) return null;
  if (debt) return debt.paid;
  if (order.payment_type === "pay_later") return 0;
  return order.cash_received ?? order.total;
}

function purchaseAmountPaid(
  purchase: Purchase,
  debt: Debt | undefined,
  isPending: boolean,
): number | null {
  if (isPending) return null;
  if (debt) return debt.paid;
  if (purchase.payment_type === "pay_later") return 0;
  return purchase.cash_paid ?? purchase.total;
}

export function orderToReceiptDocument(
  order: Order,
  businessName: string,
  options: {
    party?: { name: string; phone?: string | null } | null;
    employeeName?: string | null;
    debt?: Debt;
    title?: string;
  } = {},
): ReceiptDocument {
  const debt = options.debt;
  const isPending = order.status === "pending";
  const settlement = receiptPaidAndBalance(
    order.total,
    saleAmountPaid(order, debt, isPending),
  );

  return {
    kind: "sale",
    id: order.id,
    number: order.order_number,
    date: order.date,
    createdAt: order.created_at,
    title: options.title ?? (isPending ? "PRE-ORDEN" : "RECIBO DE VENTA"),
    partyName: options.party?.name ?? null,
    partyPhone: options.party?.phone ?? null,
    partyLabel: "Cliente",
    employeeName: options.employeeName ?? null,
    businessName,
    paymentMethodLabel: isPending ? null : getPaymentMethodLabel(order.payment_method),
    items: (order.items ?? []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    service: order.service,
    discount: order.discount,
    total: order.total,
    amountPaid: settlement.amountPaid,
    balanceDue: settlement.balanceDue,
    change: isPending ? null : order.change ?? null,
  };
}

export function purchaseToReceiptDocument(
  purchase: Purchase,
  businessName: string,
  options: {
    party?: { name: string; phone?: string | null } | null;
    employeeName?: string | null;
    debt?: Debt;
    title?: string;
  } = {},
): ReceiptDocument {
  const debt = options.debt;
  const isPending = purchase.status === "pending";
  const settlement = receiptPaidAndBalance(
    purchase.total,
    purchaseAmountPaid(purchase, debt, isPending),
  );

  return {
    kind: "purchase",
    id: purchase.id,
    number: purchase.purchase_number,
    date: purchase.date,
    createdAt: purchase.created_at,
    title: options.title ?? (isPending ? "PRE-ORDEN DE COMPRA" : "RECIBO DE COMPRA"),
    partyName: options.party?.name ?? null,
    partyPhone: options.party?.phone ?? null,
    partyLabel: "Proveedor",
    employeeName: options.employeeName ?? null,
    businessName,
    paymentMethodLabel: isPending ? null : getPaymentMethodLabel(purchase.payment_method),
    items: (purchase.items ?? []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
    subtotal: purchase.subtotal,
    tax: purchase.tax,
    service: 0,
    discount: purchase.discount,
    total: purchase.total,
    amountPaid: settlement.amountPaid,
    balanceDue: settlement.balanceDue,
    change: isPending ? null : purchase.change ?? null,
  };
}
