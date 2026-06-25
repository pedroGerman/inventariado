const SALE_PREFIXES = ["AIQ", "WOT", "POS", "VTA"] as const;
const PURCHASE_PREFIXES = ["CMP", "COM", "PRV"] as const;

type OrderType = "sale" | "purchase";

function randomSuffix(max = 999): number {
  return Math.floor(Math.random() * max) + 1;
}

export function generateOrderNumber(
  type: OrderType,
  customPrefix?: string,
): string {
  const prefixes = type === "sale" ? SALE_PREFIXES : PURCHASE_PREFIXES;
  const prefix =
    customPrefix ?? prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}-${randomSuffix()}`;
}
