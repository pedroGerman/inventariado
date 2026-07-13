import type { Product } from "@/lib/types/database";

export const DEFAULT_MIN_STOCK = 5;

export function getMinStock(product: Pick<Product, "min_stock">): number {
  const value = product.min_stock;
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_MIN_STOCK;
}

/** Out of stock or already sold into negatives. */
export function isOutOfStock(product: Pick<Product, "stock">): boolean {
  return product.stock <= 0;
}

/** Positive stock at or below the product's configured minimum. */
export function isLowStock(
  product: Pick<Product, "stock" | "min_stock">,
): boolean {
  return product.stock > 0 && product.stock <= getMinStock(product);
}
