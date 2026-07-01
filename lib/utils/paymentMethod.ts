import type { PaymentMethod } from "@/lib/types/database";

export type PaymentMethodCategory = "cash" | "transfer" | "card" | "other";
export type CardType = "debit" | "credit";

export function getPaymentMethodCategory(
  method: PaymentMethod,
): PaymentMethodCategory {
  if (method === "credit_card" || method === "debit_card") return "card";
  if (method === "transfer") return "transfer";
  if (method === "other") return "other";
  return "cash";
}

export function getCardType(method: PaymentMethod): CardType {
  return method === "credit_card" ? "credit" : "debit";
}

export function resolvePaymentMethod(
  category: PaymentMethodCategory,
  cardType: CardType = "debit",
): PaymentMethod {
  switch (category) {
    case "cash":
      return "cash";
    case "transfer":
      return "transfer";
    case "card":
      return cardType === "credit" ? "credit_card" : "debit_card";
    case "other":
      return "other";
  }
}

export function getPaymentMethodLabel(method: PaymentMethod | string): string {
  switch (method) {
    case "cash":
      return "Efectivo";
    case "transfer":
      return "Transferencia";
    case "credit_card":
      return "Tarjeta crédito";
    case "debit_card":
      return "Tarjeta débito";
    case "other":
      return "Otros";
    default:
      return method.replace(/_/g, " ");
  }
}

export function paymentMethodUsesNumericKeyboard(method: PaymentMethod): boolean {
  return method !== "other";
}

export type PaymentFlow = "sale" | "purchase";

export function paymentMethodReceivedLabel(
  method: PaymentMethod,
  flow: PaymentFlow = "sale",
): string {
  if (flow === "purchase") {
    if (method === "cash") return "Entregas";
    if (method === "transfer") return "Transferido";
    return "Pagado";
  }
  if (method === "cash") return "Recibes";
  if (method === "transfer") return "Transferido";
  return "Cobrado";
}
