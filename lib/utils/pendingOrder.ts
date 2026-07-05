import type { Order, Purchase } from "@/lib/types/database";

export function isQuoteNumber(number: string): boolean {
  return number.startsWith("COT-");
}

export function isQuoteOrder(order: Order): boolean {
  return isQuoteNumber(order.order_number);
}

export function isQuotePurchase(purchase: Purchase): boolean {
  return isQuoteNumber(purchase.purchase_number);
}

export function toQuoteNumber(number: string): string {
  return isQuoteNumber(number) ? number : `COT-${number}`;
}

export function toSavedNumber(number: string): string {
  return isQuoteNumber(number) ? number.slice(4) : number;
}

export function getPendingKindLabel(
  entity: Order | Purchase,
  type: "sale" | "purchase",
): string {
  const isQuote =
    type === "sale"
      ? isQuoteOrder(entity as Order)
      : isQuotePurchase(entity as Purchase);
  return isQuote ? "Cotización" : "Guardada";
}
