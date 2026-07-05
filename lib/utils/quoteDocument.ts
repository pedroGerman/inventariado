import type { Order, Purchase } from "@/lib/types/database";

export interface QuoteLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuoteDocument {
  kind: "sale" | "purchase";
  id: string;
  number: string;
  date: string;
  createdAt: string;
  partyName: string | null;
  partyPhone: string | null;
  partyLabel: string;
  employeeName: string | null;
  businessName: string;
  items: QuoteLineItem[];
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  total: number;
}

export function orderToQuoteDocument(
  order: Order,
  businessName: string,
  party?: { name: string; phone?: string | null } | null,
  employeeName?: string | null,
): QuoteDocument {
  return {
    kind: "sale",
    id: order.id,
    number: order.order_number,
    date: order.date,
    createdAt: order.created_at,
    partyName: party?.name ?? null,
    partyPhone: party?.phone ?? null,
    partyLabel: "Cliente",
    employeeName: employeeName ?? null,
    businessName,
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
  };
}

export function purchaseToQuoteDocument(
  purchase: Purchase,
  businessName: string,
  party?: { name: string; phone?: string | null } | null,
  employeeName?: string | null,
): QuoteDocument {
  return {
    kind: "purchase",
    id: purchase.id,
    number: purchase.purchase_number,
    date: purchase.date,
    createdAt: purchase.created_at,
    partyName: party?.name ?? null,
    partyPhone: party?.phone ?? null,
    partyLabel: "Proveedor",
    employeeName: employeeName ?? null,
    businessName,
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
  };
}

export function quotePdfFileName(number: string): string {
  const safe = number.replace(/[^\w-]+/g, "-");
  return `cotizacion-${safe}.pdf`;
}
