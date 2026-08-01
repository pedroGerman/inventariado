import type {
  BuiltinPaymentMethod,
  PaymentMethod,
} from "@/lib/types/database";

export type PaymentMethodCategory = "cash" | "transfer" | "card" | "other" | "custom";
export type CardType = "debit" | "credit";

const BUILTIN_PAYMENT_METHODS: readonly BuiltinPaymentMethod[] = [
  "cash",
  "transfer",
  "credit_card",
  "debit_card",
  "other",
] as const;

const RESERVED_PAYMENT_METHOD_NAMES = new Set([
  ...BUILTIN_PAYMENT_METHODS,
  "efectivo",
  "transferencia",
  "tarjeta",
  "tarjeta credito",
  "tarjeta crédito",
  "tarjeta debito",
  "tarjeta débito",
  "otros",
  "card",
  "debit",
  "credit",
]);

export function isBuiltinPaymentMethod(
  method: string,
): method is BuiltinPaymentMethod {
  return (BUILTIN_PAYMENT_METHODS as readonly string[]).includes(method);
}

export function isReservedPaymentMethodName(name: string): boolean {
  return RESERVED_PAYMENT_METHOD_NAMES.has(name.trim().toLowerCase());
}

export function getPaymentMethodCategory(
  method: PaymentMethod,
): PaymentMethodCategory {
  if (method === "credit_card" || method === "debit_card") return "card";
  if (method === "transfer") return "transfer";
  if (method === "other") return "other";
  if (method === "cash") return "cash";
  return "custom";
}

export function getCardType(method: PaymentMethod): CardType {
  return method === "credit_card" ? "credit" : "debit";
}

export function resolvePaymentMethod(
  category: Exclude<PaymentMethodCategory, "custom">,
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
      return method.trim() || "Otros";
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
