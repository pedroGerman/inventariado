export type DiscountType = "percent" | "fixed";

export function computeDiscountAmount(
  subtotal: number,
  type: DiscountType,
  value: number,
): number {
  if (value <= 0 || subtotal <= 0) return 0;

  if (type === "percent") {
    const percent = Math.min(value, 100);
    return Math.round((subtotal * percent) / 100);
  }

  return Math.min(subtotal, value);
}
